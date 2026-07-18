# Project Phases & Implementation Strategy

### Phase 1: Environment & Server Setup (Monolithic Initialization)
*   **Step 1.1:** Initialize the backend infrastructure with `npm init`, setup Express, connect mongoose to MongoDB local/Atlas instance.
*   **Step 1.2:** Build and manually verify the `/api/user/setup` route using a client framework or a simple browser fetch.
*   **Step 1.3:** Complete the internal date logic utilities responsible for calculating the number of workdays (Mon-Fri) inside any given quarter.

### Phase 2: Core Data Services (API Core Buildout)
*   **Step 2.1:** Code the data processing controllers inside the Express framework to handle writing and removing logged attendance days.
*   **Step 2.2:** Verify database constraints, ensuring double-logging to the same calendar date updates existing records rather than producing duplicates.

### Phase 3: Frontend Infrastructure & Dynamic Routing
*   **Step 3.1:** Scaffold out the React shell app utilizing Vite. Setup TailwindCSS if styling frameworks are preferred.
*   **Step 3.2:** Build out the structural routing layout. If no active `localStorage` user key exists, render the generation screen; otherwise, advance straight to the unique URL dashboard page.

### Phase 4: Frontend State Engine & Complete System Integration
*   **Step 4.1:** Hook up interactive state handlers where pressing calendar day tiles dynamically fires network requests to backend update endpoints.
*   **Step 4.2:** Complete high-impact data visualization dashboards showing users the precise threshold calculations to secure their 60% requirement.