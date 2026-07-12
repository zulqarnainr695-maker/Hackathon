/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Auth operations for register, login, refresh, logout, self lookup
 *   - name: Assets
 *     description: Machinery and equipment assets lifecycle and QR codes
 *   - name: Issues
 *     description: Asset maintenance requests, tickets, inspections, resolutions
 *   - name: Users
 *     description: Administrative User CRUD endpoints
 *   - name: AI Integration
 *     description: OpenAI Powered issues analysis and triage
 *   - name: Maintenance History
 *     description: Audit trail of all actions logged in the platform
 *   - name: Uploads
 *     description: Cloudinary image, video, and PDF uploads
 *   - name: Dashboard
 *     description: Operational metrics aggregates and telemetry charts
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new system account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Marcus Vance" }
 *               email: { type: string, example: "tech@maintainiq.com" }
 *               password: { type: string, example: "password123" }
 *               role: { type: string, enum: [Admin, Technician], example: "Technician" }
 *               phone: { type: string, example: "+15551221" }
 *     responses:
 *       201:
 *         description: Account successfully registered
 *       400:
 *         description: Validation failed or duplicate email
 *
 * /auth/login:
 *   post:
 *     summary: Authenticate user & return token + cookies
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@maintainiq.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Token successfully generated
 *       401:
 *         description: Invalid email or password
 *
 * /auth/refresh:
 *   post:
 *     summary: Rotate access token using HTTP-only cookies
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Expired or inactive refresh token
 *
 * /auth/logout:
 *   post:
 *     summary: Clear cookies and revoke refresh token sessions
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *
 * /auth/me:
 *   get:
 *     summary: Get profile of logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details returned
 *       401:
 *         description: Unauthorized token missing or invalid
 */

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: List machinery assets with filters & search
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *         description: Keyword matching name, code, description
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Paginated assets list
 *   post:
 *     summary: Register a new industrial asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetCode, name, category, location]
 *             properties:
 *               assetCode: { type: string, example: "QR-HVAC-MC-001" }
 *               name: { type: string, example: "Carrier Main HVAC Compressor" }
 *               category: { type: string, example: "HVAC Systems" }
 *               location: { type: string, example: "Building A, Rooftop Section 4" }
 *     responses:
 *       201:
 *         description: Asset created and QR generated
 *
 * /assets/public/{id}:
 *   get:
 *     summary: Sanity-checked asset details for public page scans (No Auth)
 *     tags: [Assets]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Asset ObjectId or unique assetCode
 *     responses:
 *       200:
 *         description: Exposes safe fields (Name, Status, QR, Description) only
 *
 * /assets/public/{id}/history:
 *   get:
 *     summary: Get public audit logs for an asset (No Auth)
 *     tags: [Assets]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Safe history details only (excludes technician comments/costs)
 */

/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Retrieve issues timeline (filtered to technician if requested)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: myIssues
 *         in: query
 *         schema: { type: string, enum: ["true", "false"] }
 *         description: Returns only assigned items for current technician
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of tickets
 *   post:
 *     summary: Submit a new issue report (Public/Authenticated)
 *     tags: [Issues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset, title, description, category, reporterName, reporterEmail]
 *             properties:
 *               asset: { type: string, example: "60d07f61f7734a001594918f" }
 *               title: { type: string, example: "Water leakage from pipe connector" }
 *               description: { type: string, example: "Water dripping from the main HVAC condensate outlet line." }
 *               category: { type: string, example: "HVAC" }
 *               reporterName: { type: string, example: " Elena Rostova" }
 *               reporterEmail: { type: string, example: "admin@maintainiq.com" }
 *     responses:
 *       201:
 *         description: Issue ticket created
 *
 * /issues/{id}/assign:
 *   put:
 *     summary: Assign a technician to a ticket (Admin Only)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTechnician]
 *             properties:
 *               assignedTechnician: { type: string, example: "60d07f61f7734a001594918e" }
 *     responses:
 *       200:
 *         description: Technician assigned, status changed
 *
 * /issues/{id}/inspect:
 *   put:
 *     summary: Mark issue inspection start (Assigned Technician Only)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue status updated to Inspection Started, Asset updated
 *
 * /issues/{id}/resolve:
 *   put:
 *     summary: Resolve issue ticket (Assigned Technician Only)
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [maintenanceNotes]
 *             properties:
 *               maintenanceNotes: { type: string, example: "Cleaned filter, tightened belt mounts." }
 *               maintenanceCost: { type: number, example: 120.00 }
 *               partsUsed: { type: array, items: { type: string }, example: ["Air Filter B2", "Industrial belt 4"] }
 *               nextServiceDate: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Issue resolved, asset status restored to Operational
 */

/**
 * @swagger
 * /ai/triage:
 *   post:
 *     summary: Run OpenAI diagnostic triage on machine complaint (Rate limited)
 *     tags: [AI Integration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assetId, complaint]
 *             properties:
 *               assetId: { type: string, example: "60d07f61f7734a001594918f" }
 *               complaint: { type: string, example: "Unit is overheating and shaking loudly when powered on." }
 *     responses:
 *       200:
 *         description: Triage JSON returned containing title, causes, checklist
 *
 * /ai/triage/save:
 *   post:
 *     summary: Record AI triage analysis edits against an issue
 *     tags: [AI Integration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Record saved successfully
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload media or document evidence (Capped at 10MB)
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful, returns secure Cloudinary URL
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retrieve aggregate telemetry & stats metrics (Admin Only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats payload
 *
 * /maintenance/timeline:
 *   get:
 *     summary: Get complete history audit timeline log
 *     tags: [Maintenance History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logs history list
 */
