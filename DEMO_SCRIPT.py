# ╔══════════════════════════════════════════════════════════════════════════╗
# ║            NIRIKSHAN — LIVE DEMO PRESENTATION SCRIPT                    ║
# ║       Smart India Hackathon 2026 · Problem Statement: IPMD/MoSPI       ║
# ╚══════════════════════════════════════════════════════════════════════════╝
#
# Instructions for the presenter:
#   - Lines starting with 🎤 are SPOKEN narration (read aloud)
#   - Lines starting with 👆 are ACTIONS to perform on screen
#   - Lines starting with 📌 are NOTES / talking points
#
# Estimated demo time: 8–10 minutes
#
# ═══════════════════════════════════════════════════════════════════════════


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 1 — OPENING                                                  │
# └──────────────────────────────────────────────────────────────────────┘

# 🎤 "Let's see NIRIKSHAN in action."

# 👆 Open browser → http://localhost:3000  (Landing Page visible)

# 🎤 "Nirikshan — meaning 'Inspection' in Hindi — is an AI-powered early
#     warning system built for MoSPI's Infrastructure & Project Monitoring
#     Division. It monitors over 1,600 Central Sector projects worth
#     ₹22 lakh crore and predicts which ones are headed for trouble —
#     before the trouble actually hits."

# 📌 Pause briefly. Let the landing page animations play.


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 2 — THE PROBLEM                                              │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Scroll down to the "Problem" section on the landing page

# 🎤 "Today, IPMD officers manually review monthly PAIMANA Flash Reports
#     — PDF after PDF, 1,600+ rows — trying to spot which projects are
#     drifting off track. It's reactive, time-consuming, and by the time
#     a project is flagged, the damage is already done."

# 🎤 "Nirikshan flips this from reactive to proactive. Six ML models
#     continuously predict delay risk, cost overrun, and slippage months
#     — so officers can intervene early, not after the overrun."

# 👆 Scroll past the Solution Overview and Tech Stack sections briefly


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 3 — LOGIN & ROLE-BASED ACCESS                                │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Click "Get Started" or navigate to /login

# 🎤 "Let's log in. Nirikshan supports three roles — Admin, Ministry
#     Officer, and Auditor — each with different levels of access.
#     I'm logging in as an Admin, which gives full access to all
#     ministries and all features."

# 👆 Enter credentials:
#     Email:    admin@nirikshan.gov.in
#     Password: SecurePassword123!
#     Click Login

# 🎤 "We also support Google OAuth for quick sign-in, and every
#     password is hashed with bcrypt — no plaintext anywhere."

# 📌 After login, the dashboard loads automatically.


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 4 — DASHBOARD OVERVIEW                                       │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Dashboard is now visible at /dashboard

# 🎤 "This is the Nirikshan dashboard. At a glance, we can see the total
#     number of monitored projects, cumulative expenditure, the count of
#     high-risk projects, and how many are currently delayed."

# 👆 Point to each KPI card as you mention it

# 🎤 "On the right, we have the risk distribution — a breakdown of how
#     many projects fall into Low, Medium, High, and Critical risk
#     segments. This is powered by our K-Means clustering model."

# 👆 Point to the risk distribution donut chart

# 🎤 "And below, the interactive India map shows state-wise project
#     distribution. States with more projects — like Uttar Pradesh and
#     Maharashtra — are highlighted in red."

# 👆 Hover over a few states on the map to show tooltips

# 🎤 "The recent alerts panel on the side shows the latest ML-flagged
#     warnings — projects where our models detected a significant risk
#     of time overrun or cost escalation."

# 👆 Point to the alerts panel


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 5 — RISK PREDICTION (LIVE ML INFERENCE)                      │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /risk (Risk Warnings page) from sidebar

# 🎤 "Now let's take a real project and run it through our ML pipeline."

# 🎤 "Let's say we have a new National Highway project under MoRTH,
#     located in Maharashtra, with an original cost of ₹850 crore,
#     started in June 2024, and currently at 22% physical progress."

# 👆 Open the API docs (http://localhost:8000/docs) or use the Risk
#     Prediction form if available in the UI.
#     POST to /api/v1/predict with the project data

# 🎤 "The system takes this project's features — ministry, cost, age,
#     progress — and runs them through our trained LightGBM models in
#     real time."

# 👆 Show the prediction result

# 🎤 "And here's the result: a 72% probability of delay, expected
#     slippage of 5.4 months, 48% chance of cost overrun, and an
#     estimated overrun of ₹28 crore. The system classifies this as
#     'High Risk' and flags it for immediate attention."

# 🎤 "This prediction took under 500 milliseconds — it's not a batch
#     job, it's real-time inference."

# 📌 Key point: Emphasize this is not a rule-based system — it's trained
#     on 1,632 real PAIMANA projects with 16 engineered features.


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 6 — PROJECT PORTFOLIO & EXPLORER                             │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /portfolio (Project Portfolio page)

# 🎤 "Moving to the Project Portfolio, we can see all monitored projects
#     as cards with their risk indicators, ministry, cost, and physical
#     progress."

# 👆 Scroll through a few project cards

# 🎤 "We can filter by ministry, risk level, or state — and sort by
#     cost, risk score, or progress percentage."

# 👆 Apply a filter (e.g., filter by "Critical" risk)

# 🎤 "Selecting a project gives us its complete profile — including
#     cost history, timeline, progress tracking, and all past ML
#     predictions."

# 👆 Navigate to /explorer (Project Explorer page)

# 🎤 "The Project Explorer provides a searchable, sortable table view
#     for officers who prefer working with structured data."


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 7 — COST OVERRUN ANALYSIS                                    │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /cost (Cost Overrun page)

# 🎤 "The Cost Overrun page focuses specifically on budget risks. Here
#     we can see which projects are predicted to exceed their sanctioned
#     costs, by how much, and which ministries are most affected."

# 👆 Point to the overrun trend chart and ministry breakdown

# 🎤 "For context — in this dataset, the total expected overrun value
#     across flagged projects runs into thousands of crores. Early
#     detection here directly saves taxpayer money."


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 8 — TIME OVERRUN ANALYSIS                                    │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /time (Time Overrun page)

# 🎤 "Similarly, the Time Overrun page shows projects predicted to
#     miss their completion deadlines. We can see delay probability,
#     expected slippage in months, and the primary bottleneck for each
#     project."

# 🎤 "For example, the Parbati Hydroelectric project has been delayed
#     by 198 months — that's over 16 years — with a 185% cost overrun.
#     Our model correctly identifies it as Critical Risk."


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 9 — ANALYTICS & STATE DISTRIBUTION                           │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /analytics (Analytics page)

# 🎤 "The Analytics page gives us cross-cutting insights — sector-wise
#     distribution, state-wise heatmaps, and risk segment clustering
#     across the entire portfolio."

# 👆 Point to the sector breakdown chart

# 🎤 "Transport & Logistics accounts for 20% of all projects, followed
#     by Energy at 15%. Each sector has its own risk profile that the
#     models learn from."


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 10 — AUTOMATED ALERTS & NOTIFICATIONS                        │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate to /settings (Settings page — Notification Preferences)

# 🎤 "Now, officers don't need to check the dashboard every day.
#     Nirikshan runs a background scheduler every 15 minutes that
#     checks for new or worsening risks."

# 🎤 "Officers can subscribe to specific ministries or set a minimum
#     risk score threshold. When a subscribed project crosses the
#     threshold, they get both an in-app notification and an email
#     alert — automatically."

# 👆 Show the subscription creation form

# 🎤 "The email notifications are sent via the Brevo API and include
#     the project name, risk score, delay probability, and recommended
#     actions — all in a clean, actionable format."

# 📌 If Brevo is configured, show a sample email. Otherwise, describe it.


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 11 — ROLE-BASED ACCESS CONTROL (RBAC)                        │
# └──────────────────────────────────────────────────────────────────────┘

# 🎤 "Let me quickly show how role-based access works."

# 👆 Log out. Log in as a Ministry Officer:
#     Email:    officer@railways.gov.in
#     Password: OfficerPass123!

# 🎤 "I'm now logged in as a Ministry of Railways officer. Notice that
#     the dashboard now only shows Railway projects — not the full
#     portfolio. The officer can't see other ministries' data, and
#     they can't create new projects or manage users."

# 👆 Show the filtered dashboard — only Railway projects visible

# 🎤 "This is enforced at the API level, not just the UI — even if
#     someone tries to call the API directly, the backend will deny
#     access to projects outside their ministry."

# 📌 Three roles: Admin (full access), Ministry Officer (own ministry
#     only), Auditor (read-only access to everything)


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 12 — SECURITY & API DOCUMENTATION                            │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Open http://localhost:8000/docs (Swagger UI)

# 🎤 "Under the hood, the entire backend is a FastAPI application with
#     25+ documented endpoints. Every request is authenticated with
#     JWT tokens, rate-limited to prevent abuse, and logged for audit
#     purposes."

# 👆 Scroll through the Swagger docs briefly

# 🎤 "We have endpoints for authentication, projects, predictions,
#     alerts, notifications, subscriptions, and dashboard summaries —
#     all production-ready with input validation and error handling."


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 13 — ML PIPELINE BEHIND THE SCENES                           │
# └──────────────────────────────────────────────────────────────────────┘

# 🎤 "Let me briefly explain what's powering these predictions."

# 📌 You can show the architecture diagram from the landing page or README

# 🎤 "We extract data from PAIMANA Flash Report PDFs, engineer 16
#     leakage-safe features, and train six models:
#     — A delay classifier with 85% accuracy and 0.90 AUC
#     — A cost overrun classifier with 82% accuracy and 0.87 AUC
#     — Two regressors for slippage months and overrun percentage
#     — A K-Means clustering model for risk segmentation
#     — And a composite risk scoring algorithm."

# 🎤 "The key innovation is that we only use features available at
#     prediction time — no data leakage. If a new project comes in
#     tomorrow that the model has never seen, it handles it gracefully
#     through frequency encoding and fallback values."

# 📌 Mention: 45+ automated tests, 75% code coverage, CI/CD with
#     GitHub Actions, security scanning with Trivy


# ┌──────────────────────────────────────────────────────────────────────┐
# │  SCENE 14 — CLOSING                                                  │
# └──────────────────────────────────────────────────────────────────────┘

# 👆 Navigate back to the dashboard

# 🎤 "So, instead of manually scanning through 1,600 projects in PDFs
#     every month, Nirikshan does the heavy lifting — it predicts risk,
#     alerts stakeholders, filters by role, and keeps everything
#     connected in one platform."

# 🎤 "The result? Earlier intervention, less taxpayer money wasted,
#     and data-driven decisions for ministry officers — exactly what
#     IPMD needs to move from reactive monitoring to proactive risk
#     management."

# 🎤 "That's Nirikshan — निरीक्षण — Monitoring Infrastructure,
#     Predicting Futures, Saving Resources."

# 📌 Pause for questions.


# ═══════════════════════════════════════════════════════════════════════
# END OF DEMO SCRIPT
# ═══════════════════════════════════════════════════════════════════════
