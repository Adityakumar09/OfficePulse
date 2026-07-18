## 📁 `rules.md` (AI Coding Instructions)

```markdown
# Global Rules & AI Behavior Guidelines

### 1. Code Quality & Philosophy
*   **Write Clean, Explicit Code:** Avoid clever or overly compressed abstractions. Write code that an intermediate developer can understand at a single glance.
*   **Fail Gracefully:** Wrap all database operations and network interactions in standard `try/catch` blocks. Implement clear error messages.
*   **Robust Date Management:** All calendar dates sent between the frontend and backend must strictly use the `YYYY-MM-DD` string format to prevent local machine time zones from shifting the logged day.

### 2. Security Protocols
*   **Input Cleansing:** Ensure the `uuid` format is explicitly validated as an alphanumeric string configuration before hitting MongoDB queries.
*   **CORS Safeguards:** Constrain the Express API server to only accept requests originating from the designated Frontend Web URL.

### 3. UI/UX Rules
*   **Zero Glitch Form Factor:** Every interactive element must display distinct hover and disabled states. 
*   **Frictionless Redirect Handling:** When reading a local identity token, resolve the route seamlessly without flashing empty unauthenticated placeholder states.