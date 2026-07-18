# Project Context & Memory Ledger
*Keep this ledger updated by modifying this file whenever code features or milestones change.*

### Current State
*   **Status:** Design and blueprinting phase completely locked down.
*   **Environment Status:** Awaiting local setup. No code blocks active yet.

### Tech Staging Environment Notes
*   Targeting Node.js LTS, Express router modules, and local/Atlas MongoDB server instances.
*   The primary interface engine will be built with React.

### Historical Decision Audit Trail
*   **2026-07-18:** Decision finalized to bypass typical username/password login barriers entirely. The app will rely on a dedicated URL-hash system for unique profile storage and retrieval. Local browser caching via `localStorage` will serve as a persistent user fallback.