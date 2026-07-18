# System Design & Interface Blueprint

### 1. Design Token Foundations
*   **Visual Persona:** A clean, structural productivity tool. High contrast, sharp utilities, low cognitive fatigue.
*   **Primary Palette:** Deep Navy Slate (Structure), Soft Office Teal (Visual tracking/Logged days), Coral (Remaining mandated days).

### 2. Core Screen Context Layouts

#### Welcome Screen (`/`)
*   Centered, elevated layout card module.
*   Hook copy: "Track your 60% corporate mandate without an account."
*   Call to action: A massive button reading `[ Get Started Tracking ]`. Clicking this initiates their localized tracking profile.

#### The Workspace Dashboard (`/u/:uuid`)
*   **Header Section:** Displays the bookmarked status alert: *"⚠️ Save this private URL to return to your workspace."*
*   **Metric Grid Blocks:** Three responsive analytical block layout units:
    1.  `[ Total Workdays This Quarter ]`
    2.  `[ Office Days Checked ]`
    3.  `[ Mandatory Days Remaining ]`
*   **The Focus Action:** A prominent button reading: `[ 🏢 I'm In the Office Today ]`. Tapping this quickly registers the current date and increments metrics in real-time.
*   **The Control Grid:** A neat monthly layout view allowing users to quickly see a high-level picture of past performance and toggle individual dates.