"""
Email notification service using Brevo (formerly SendinBlue)
"""
import logging
from typing import List, Optional
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

from .config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service using Brevo API."""
    
    def __init__(self):
        if not settings.brevo_api_key:
            logger.warning("Brevo API key not configured. Email notifications disabled.")
            self.api_instance = None
            return
        
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.brevo_api_key
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
    
    def send_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send a single email via Brevo.
        
        Args:
            to_email: Recipient email address
            to_name: Recipient name
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text email body (optional)
        
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.api_instance:
            logger.error("Cannot send email: Brevo not configured")
            return False
        
        try:
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to_email, "name": to_name}],
                sender={
                    "email": settings.brevo_sender_email,
                    "name": settings.brevo_sender_name
                },
                subject=subject,
                html_content=html_content,
                text_content=text_content or html_content,
            )
            
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Email sent to {to_email}: {api_response.message_id}")
            return True
            
        except ApiException as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}")
            return False
    
    def send_alert_notification(
        self,
        to_email: str,
        to_name: str,
        project_name: str,
        project_code: int,
        risk_segment: str,
        risk_score: float,
        delay_probability: float,
        cost_overrun_probability: float
    ) -> bool:
        """
        Send risk alert notification email.
        """
        subject = f"🚨 High Risk Alert: {project_name}"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0; }}
                .content {{ background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px; }}
                .risk-card {{ background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #d32f2f; }}
                .metric {{ margin: 10px 0; }}
                .metric-label {{ font-weight: bold; color: #555; }}
                .metric-value {{ font-size: 1.2em; color: #d32f2f; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #1976d2; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px;
                    margin-top: 15px;
                }}
                .footer {{ margin-top: 20px; font-size: 0.9em; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🚨 High Risk Project Alert</h2>
                </div>
                <div class="content">
                    <p>Dear {to_name},</p>
                    
                    <p>A high-risk project has been detected that requires immediate attention:</p>
                    
                    <div class="risk-card">
                        <h3>{project_name}</h3>
                        <p><strong>Project Code:</strong> {project_code}</p>
                        
                        <div class="metric">
                            <span class="metric-label">Risk Segment:</span>
                            <span class="metric-value">{risk_segment}</span>
                        </div>
                        
                        <div class="metric">
                            <span class="metric-label">Overall Risk Score:</span>
                            <span class="metric-value">{risk_score:.2%}</span>
                        </div>
                        
                        <div class="metric">
                            <span class="metric-label">Delay Probability:</span>
                            <span class="metric-value">{delay_probability:.2%}</span>
                        </div>
                        
                        <div class="metric">
                            <span class="metric-label">Cost Overrun Probability:</span>
                            <span class="metric-value">{cost_overrun_probability:.2%}</span>
                        </div>
                    </div>
                    
                    <p><strong>Recommended Actions:</strong></p>
                    <ul>
                        <li>Review project execution status immediately</li>
                        <li>Conduct stakeholder meeting to address delays</li>
                        <li>Identify and mitigate cost escalation factors</li>
                        <li>Update project monitoring documentation</li>
                    </ul>
                    
                    <a href="{settings.frontend_url}/projects/{project_code}" class="button">
                        View Project Details →
                    </a>
                    
                    <div class="footer">
                        <p>This is an automated alert from Nirikshan Infrastructure Monitoring Platform.</p>
                        <p>You are receiving this because you subscribed to risk alerts.</p>
                        <p><a href="{settings.frontend_url}/settings/notifications">Manage notification preferences</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
High Risk Project Alert

Project: {project_name}
Code: {project_code}
Risk Segment: {risk_segment}
Risk Score: {risk_score:.2%}
Delay Probability: {delay_probability:.2%}
Cost Overrun Probability: {cost_overrun_probability:.2%}

Recommended Actions:
- Review project execution status immediately
- Conduct stakeholder meeting to address delays
- Identify and mitigate cost escalation factors
- Update project monitoring documentation

View details: {settings.frontend_url}/projects/{project_code}

---
Nirikshan Infrastructure Monitoring Platform
        """
        
        return self.send_email(
            to_email=to_email,
            to_name=to_name,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    def send_welcome_email(
        self,
        to_email: str,
        to_name: str,
        role: str
    ) -> bool:
        """Send welcome email to new user."""
        subject = "Welcome to Nirikshan Platform"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1976d2;">Welcome to Nirikshan! 🎉</h2>
                
                <p>Dear {to_name},</p>
                
                <p>Your account has been successfully created on the Nirikshan Infrastructure Risk Monitoring Platform.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Account Details:</strong></p>
                    <p>Email: {to_email}</p>
                    <p>Role: {role.replace('_', ' ').title()}</p>
                </div>
                
                <p><strong>Get Started:</strong></p>
                <ul>
                    <li>Explore the dashboard for real-time project insights</li>
                    <li>Set up alert notifications for projects in your domain</li>
                    <li>View ML-powered risk predictions</li>
                    <li>Monitor ongoing infrastructure projects</li>
                </ul>
                
                <a href="{settings.frontend_url}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px;">
                    Access Dashboard →
                </a>
                
                <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
                    Need help? Contact support or check our documentation.
                </p>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(
            to_email=to_email,
            to_name=to_name,
            subject=subject,
            html_content=html_content
        )


# Global instance
email_service = EmailService()
