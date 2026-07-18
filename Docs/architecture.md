# System Architecture Document

### 1. Tech Stack Selection
*   **Frontend:** React (Vite-based spa boilerplate for rapid, responsive rendering).
*   **Backend:** Node.js with Express.js (Rest API architecture).
*   **Database:** MongoDB via Mongoose ODM (Ideal for document-based, flexible scheduling data).

### 2. Data Models & Schemas

#### User Schema (`models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});