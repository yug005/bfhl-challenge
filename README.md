# BFHL Backend — Chitkara 2026 Round 1

REST API that accepts an array of node strings (`X->Y`), processes hierarchical relationships, and returns structured insights. Built for the Chitkara Full Stack Engineering Challenge.

## Overview

This backend exposes a POST `/bfhl` endpoint that:
1. Validates edge format (`X->Y`).
2. Deduplicates repeating edges.
3. Resolves multi-parent conflicts (first parent wins).
4. Detects disconnected tree components and pure cycle groups.
5. Computes depths for trees and handles cycles gracefully.

## Tech Stack
- **Node.js**
- **Express.js** (Web framework)
- **CORS** (Enabled for frontend integration)
- **Dotenv** (Environment variable management)

## Project Structure
```
src/
├── index.js                    # Express entry point
├── config/env.js               # Environment variables
├── routes/bfhl.routes.js       # GET + POST /bfhl
├── controllers/bfhl.controller.js  # Pipeline orchestrator
├── services/                   # Business logic (7 isolated modules)
├── middleware/                 # Validation & error handling
└── utils/                      # Constants & Union-Find
```

## API Documentation

### `GET /bfhl`
Health check endpoint.
- **Response**: `{ "operation_code": 1 }`
- **Status**: 200 OK

### `POST /bfhl`
Main processing endpoint.

**Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Expected Response**:
```json
{
  "user_id": "fullname_ddmmyyyy",
  "email_id": "your@college.edu",
  "college_roll_number": "XXXXXXXXXX",
  "hierarchies": [
    {
      "root": "A",
      "tree": {
        "A": {
          "B": {
            "D": {}
          },
          "C": {}
        }
      },
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file based on the template:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your details:
   ```env
   PORT=3000
   USER_ID=your_fullname_ddmmyyyy
   EMAIL_ID=your@college.edu
   COLLEGE_ROLL_NUMBER=XXXXXXXXXX
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000/bfhl`

## Deployment Checklist (Render)

This project is fully ready to be deployed on Render as a Web Service.

1. Connect your GitHub repository to Render.
2. Select **Web Service**.
3. Use the following configuration:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the Render dashboard, add the following Environment Variables:
   - `USER_ID`
   - `EMAIL_ID`
   - `COLLEGE_ROLL_NUMBER`
5. Render automatically handles the `PORT` variable.
