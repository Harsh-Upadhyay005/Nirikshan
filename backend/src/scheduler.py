from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from .database import SessionLocal
from . import models, crud
from .email_service import email_service

logger = logging.getLogger(__name__)

# Store previous alerts to detect changes
previous_alerts = {}


def check_and_notify_alerts():
    """
    Scheduled job to check for new/worsening alerts and create notifications.
    Runs every 15 minutes.
    """
    logger.info("[Scheduler] Checking for new alerts...")
    
    db = SessionLocal()
    try:
        # Get all current alerts
        alerts = crud.get_alerts(db, limit=200)
        
        # Get all users with subscriptions
        users_with_subs = db.query(models.User).join(models.Subscription).distinct().all()
        
        for user in users_with_subs:
            # Get user's subscriptions
            subscriptions = db.query(models.Subscription).filter(
                models.Subscription.user_id == user.id
            ).all()
            
            # Filter alerts based on role and subscriptions
            relevant_alerts = []
            for alert in alerts:
                # Ministry officer filtering
                if user.role == "ministry_officer" and user.ministry_name:
                    if not (alert.project and alert.project.ministry and 
                            alert.project.ministry.name == user.ministry_name):
                        continue
                
                # Subscription filtering
                matches_sub = False
                for sub in subscriptions:
                    if sub.ministry_filter and alert.project and alert.project.ministry:
                        if alert.project.ministry.name != sub.ministry_filter:
                            continue
                    if sub.min_risk_score and float(alert.risk_score) < float(sub.min_risk_score):
                        continue
                    matches_sub = True
                    break
                
                if matches_sub:
                    relevant_alerts.append(alert)
            
            # Check for new or worsening alerts
            for alert in relevant_alerts:
                project_code = alert.project.project_code
                current_risk = float(alert.risk_score)
                
                # Check if this is a new alert or risk has increased
                previous_risk = previous_alerts.get((user.id, project_code))
                
                if previous_risk is None:
                    # New alert
                    message = (
                        f"New high-risk project detected: {alert.project.project_name} "
                        f"({alert.project.ministry.name if alert.project.ministry else 'Unknown'}). "
                        f"Risk Score: {alert.risk_score:.2f}, Segment: {alert.risk_segment}"
                    )
                    
                    notification = models.Notification(
                        user_id=user.id,
                        project_code=project_code,
                        message=message,
                    )
                    db.add(notification)
                    logger.info(f"[Scheduler] New alert notification for user {user.email}, project {project_code}")
                    
                    # Send email notification
                    try:
                        email_service.send_alert_notification(
                            to_email=user.email,
                            to_name=user.full_name or user.email.split("@")[0],
                            project_name=alert.project.project_name,
                            project_code=project_code,
                            risk_segment=alert.risk_segment,
                            risk_score=float(alert.risk_score),
                            delay_probability=float(alert.delay_probability or 0),
                            cost_overrun_probability=float(alert.cost_overrun_probability or 0)
                        )
                    except Exception as e:
                        logger.warning(f"Failed to send email to {user.email}: {e}")
                    
                elif current_risk > previous_risk * 1.1:  # 10% increase threshold
                    # Risk increased significantly
                    message = (
                        f"Risk increased for project: {alert.project.project_name}. "
                        f"Previous: {previous_risk:.2f}, Current: {current_risk:.2f}. "
                        f"Segment: {alert.risk_segment}"
                    )
                    
                    notification = models.Notification(
                        user_id=user.id,
                        project_code=project_code,
                        message=message,
                    )
                    db.add(notification)
                    logger.info(f"[Scheduler] Risk increase notification for user {user.email}, project {project_code}")
                
                # Update previous alerts
                previous_alerts[(user.id, project_code)] = current_risk
        
        db.commit()
        logger.info(f"[Scheduler] Alert check completed. Processed {len(alerts)} alerts")
        
    except Exception as e:
        logger.error(f"[Scheduler] Error checking alerts: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler."""
    scheduler = BackgroundScheduler()
    
    # Run alert check every 15 minutes
    scheduler.add_job(
        func=check_and_notify_alerts,
        trigger=IntervalTrigger(minutes=15),
        id='check_alerts_job',
        name='Check for new/worsening alerts',
        replace_existing=True,
    )
    
    scheduler.start()
    logger.info("[Scheduler] Background scheduler started. Alert check runs every 15 minutes.")
