# Product Requirements Document (PRD)
## Project: Frictionless Office Attendance Tracker (60% Mandate)

### 1. Objective & Overview
Many corporate offices require a mandatory 60% in-office presence per quarter, allowing 40% Work-From-Home (WFH). Manually calculating this across varying quarter lengths and missing days is tedious. 

This application allows users to frictionlessly track their in-office days and instantly know the **minimum remaining days** they must attend to satisfy their 60% mandate. 

### 2. Core Problem & Frictionless Identity
*   **The Account Barrier:** Users do not want to create yet another account, remember passwords, or verify emails just to track attendance.
*   **The Solution:** A **Unique Access URL Model**. Upon first landing, a user gets a secure token (UUID) embedded in their URL. They bookmark this URL to return to their private dashboard.

### 3. Core Features (Scope)
*   **Anonymous Onboarding:** One-click generation of a distinct workspace URL.
*   **Frictionless Auto-Redirect:** Subsequent visits to the root domain (`/`) automatically detect the user's stored identity in `localStorage` and redirect them to their dashboard.
*   **One-Tap Logger:** A prominent button on the dashboard to quickly log "I am in the office today."
*   **Attendance Ledger (Interactive Calendar):** A calendar overview showing the current quarter. Users can click any day (Monday to Friday) to toggle its status (Office vs WFH vs Holiday).
*   **The Metric Dashboard:**
    *   Total working days in the quarter (excluding weekends).
    *   Total office days logged.
    *   **Crucial Metric:** Minimum number of office days remaining to meet the 60% threshold.

### 4. Out of Scope (For Phase 1)
*   Multi-device native synchronization via mobile app stores.
*   Manager/Admin dashboards or department-wide tracking.
*   Official biometric or WiFi-based check-in integrations.