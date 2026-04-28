# SURGE - College Event Management System

A premium, modern, and centralized platform to manage college events, participants, clubs, venues, and finances. Built with a focus on robust database management and futuristic UI.

## 🚀 Key Features
- **Centralized Management**: One platform for events, participants, clubs, and venues.
- **Modern UI**: Dark mode glassmorphism theme with responsive grid layouts.
- **Financial Tracking**: Module for sponsor contributions and budget allocation.
- **Role-based Insights**: Dashboard for organizers and registration portal for participants.
- **DBMS Evaluation Ready**: Includes advanced SQL concepts like joins, views, and procedures.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL (using `mysql2` pool)
- **Theme**: Deep Navy & Charcoal with Lavender, Cyan, and Pink accents.

## 📂 Project Structure
- `public/`: Frontend assets and HTML pages.
- `server/`: Backend logic.
  - `routes/`: API endpoints for events, participants, auth, etc.
  - `db.js`: MySQL connection pool.
  - `schema.sql`: Database schema and sample data.

## 📊 DBMS Concepts Included
- **Relational Integrity**: Proper foreign key constraints across 11+ tables.
- **Complex Joins**: Reporting module utilizes multi-table joins and aggregate functions.
- **Many-to-Many Relationships**: Implemented via a `registrations` junction table.
- **Data Consistency**: Transaction-based budget updates for expense tracking.

## 🚦 How to Run
1. **Database Setup**:
   - Create a database named `surge_db`.
   - Run the code in `server/schema.sql` in your MySQL environment.
2. **Environment Configuration**:
   - Configure `.env` with your DB credentials (HOST, USER, PASS, NAME).
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Start the Server**:
   ```bash
   npm start
   ```
5. Access the app at `http://localhost:3000`.

## 🔑 Demo Accounts
- **Admin**: `admin@surge.com` / `admin123`
- **Organizer**: `john@surge.com` / `pass123`

---
Built for DBMS Course Project Evaluation.
