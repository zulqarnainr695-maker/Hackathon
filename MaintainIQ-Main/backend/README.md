# MaintainIQ Backend

**AI-Powered QR Maintenance & Asset History Platform Backend**

MaintainIQ is a production-ready Express.js and MongoDB backend featuring role-based authentication, QR code generation, real-time communications, Gemini triage assistance, and file upload services.

---

## Key Features

1. **Clean MVC Architecture**: Divided into controllers, routes, models, services, validation schemas, and middlewares.
2. **JWT Authentication**: Short-lived access tokens (via header) + secure HttpOnly cookies rotation for refresh tokens.
3. **QR Lifecycle Automation**: Dynamic QR generation pointing to public views on asset registration; automatic Cloudinary uploads.
4. **AI Triage (Gemini API)**: Triage classifier identifying category, priority, and possible causes with deterministic rules-based fallbacks.
5. **Real-time Notifications**: Socket.io alerts for assignments and maintenance updates.
6. **Strict Security Policies**: Helmet headers, CORS filters, rate-limiting blocks, input validators, and NoSQL injection defenses.
7. **Complete Documentation**: Interactive Swagger specs under `/api-docs` + Postman Collection file for staging.

---

## Folder Structure

```
backend/
├── docs/                             # Collections and documentation resources
│   └── MaintainIQ.postman_collection.json
├── src/
│   ├── config/                       # DB and Cloudinary client initializations
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── constants/                    # Constant strings (roles, statuses)
│   │   ├── roles.js
│   │   └── status.js
│   ├── controllers/                  # Express controller route handlers
│   ├── docs/                         # Swagger OpenAPI specifications configurations
│   │   ├── swagger.js
│   │   └── swagger-routes.swagger.js
│   ├── helpers/                      # Token signers and encoders helpers
│   ├── middleware/                   # Request filters (auth, uploads, error handling)
│   ├── models/                       # Mongoose Database schemas
│   ├── routes/                       # Express router mappings
│   ├── services/                     # External APIs (Gemini, Cloudinary, QR codes)
│   ├── sockets/                      # Socket.io notification dispatchers
│   ├── utils/                        # Response utility formats
│   ├── validations/                  # express-validator payload rules
│   ├── app.js                        # App setup mapping middlewares
│   └── server.js                     # Main entry port startup
├── .env                              # Environment variable configurations
├── .env.example                      # Configuration template
├── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running instance or MongoDB Atlas Connection string)

### 1. Install Dependencies
Navigate into the `backend/` directory and install the packages:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` root directory based on the `.env.example` template:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017/maintainiq

JWT_SECRET=4f9bc26d03d3f9b2cbbe9d5045a1532f143d22cfc1b5eaef03fa910f135b546e
JWT_REFRESH_SECRET=7f82dc92b9be1cf354aa09b307049df3b680c2f35fe4e91bcbf8f4ba6efde0c1
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Optional Integration Keys (Leave as is for automatic mock fallback mode)
GEMINI_API_KEY=gemini_test_key_placeholder
CLOUDINARY_NAME=cloudinary_test_name
CLOUDINARY_KEY=cloudinary_test_key
CLOUDINARY_SECRET=cloudinary_test_secret
```
> **Note on Mock Fallback Mode:** To make this platform immediately testable without requiring premium keys, the uploader and AI triage service will automatically fall back to generating clean mock responses if placeholder key definitions are detected.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Build
```bash
npm start
```

---

## API Documentation (OpenAPI / Swagger)

Once the server is running, visit **`http://localhost:5000/api-docs`** in your browser to inspect the interactive Swagger API documentation.

### Core Endpoints summary:
- **Auth (`/api/auth`)**:
  - `POST /register`: Signup user
  - `POST /login`: Log in user (returns token + sets httpOnly secure cookie)
  - `POST /refresh`: Refresh session
  - `POST /logout`: Sign out
  - `GET /me`: Profile lookups
- **Assets (`/api/assets`)**:
  - `GET /`: Search, paginate and filter assets
  - `POST /`: Create asset + auto-generate QR (Admin only)
  - `GET /:id`: Retrieve asset by ID
  - `PUT /:id`: Update asset properties
  - `DELETE /:id`: Delete asset
  - `GET /public/:id`: Public safe details view (No authentication required)
  - `GET /public/:id/history`: Public safe audit log timeline (No authentication required)
- **Issues (`/api/issues`)**:
  - `POST /`: Submit issue ticket (Open to public scans/logged-in users)
  - `GET /`: Retrieve issues list (technicians restricted to assigned tickets)
  - `PUT /:id/assign`: Assign technician to issue (Admin only)
  - `PUT /:id/inspect`: Start ticket inspection (Assigned Tech only)
  - `PUT /:id/resolve`: Submit completion logs + parts used + cost (Assigned Tech only)
- **AI Triage (`/api/ai`)**:
  - `POST /triage`: Get Gemini-powered category & priority triage recommendation
- **Uploads (`/api/uploads`)**:
  - `POST /`: Upload attachments to Cloudinary (image/video/PDF up to 10MB)

---

## Testing with Postman
1. Import the Postman Collection located at `docs/MaintainIQ.postman_collection.json` into your Postman client.
2. In your Postman environment settings, define `baseUrl = http://localhost:5000/api`.
3. Running the **Login** request will automatically extract the JWT token from the response and save it as `accessToken` environment variable for subsequent secured requests.

---

## Deployment Checklist

1. **Set Production Node Env**: Set `NODE_ENV=production`.
2. **Setup SSL/HTTPS**: Ensure your reverse proxy (Nginx/Cloudflare) enforces HTTPS so secure flags on cookies work.
3. **Change Encryption Secrets**: Update `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random strings in the production host environment.
4. **Update Client URL**: Set `CLIENT_URL` to point to the production frontend domain (e.g. `https://maintainiq.com`) to allow Socket.io connections.
5. **Load Real Keys**: Populated actual `GEMINI_API_KEY` and `CLOUDINARY_*` values for live uploads and triage.
