const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MaintainIQ API Documentation',
      version: '1.0.0',
      description: 'API Documentation for MaintainIQ (AI Powered QR Maintenance & Asset History Platform) backend. Includes models, authentications, asset management, and issue tracking.',
      contact: {
        name: 'MaintainIQ Engineering Support',
        email: 'support@maintainiq.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token here. Prefix with nothing, just the raw token string.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d07f61f7734a001594918e' },
            name: { type: 'string', example: 'Marcus Vance' },
            email: { type: 'string', format: 'email', example: 'tech@maintainiq.com' },
            role: { type: 'string', enum: ['Admin', 'Technician'], example: 'Technician' },
            avatar: { type: 'string', example: 'https://images.unsplash.com/.../avatar.png' },
            phone: { type: 'string', example: '+15550199' },
            status: { type: 'string', enum: ['Active', 'Inactive'], example: 'Active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Asset: {
          type: 'object',
          required: ['assetCode', 'name', 'category', 'location'],
          properties: {
            id: { type: 'string', example: '60d07f61f7734a001594918f' },
            assetCode: { type: 'string', example: 'QR-HVAC-MC-001' },
            name: { type: 'string', example: 'Carrier Main HVAC Compressor' },
            category: { type: 'string', example: 'HVAC Systems' },
            location: { type: 'string', example: 'Building A, Rooftop Section 4' },
            condition: { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor'], example: 'Good' },
            status: {
              type: 'string',
              enum: ['Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired'],
              example: 'Operational'
            },
            assignedTechnician: { $ref: '#/components/schemas/User' },
            lastServiceDate: { type: 'string', format: 'date', example: '2026-05-10', nullable: true },
            nextServiceDate: { type: 'string', format: 'date', example: '2026-07-20', nullable: true },
            qrCode: { type: 'string', example: 'https://cloudinary.com/.../qr.png' },
            publicUrl: { type: 'string', example: 'http://localhost:5173/public/assets/QR-HVAC-MC-001' },
            description: { type: 'string', example: 'Main Carrier rooftop AC unit' },
            createdBy: { type: 'string' }
          }
        },
        Issue: {
          type: 'object',
          required: ['asset', 'reporterName', 'reporterEmail', 'title', 'description', 'category'],
          properties: {
            id: { type: 'string', example: '60d07f61f7734a0015949190' },
            issueNumber: { type: 'string', example: 'ISSUE-1001' },
            asset: { type: 'string', description: 'Associated Asset MongoDB ObjectId' },
            reporterName: { type: 'string', example: 'Elena Rostova' },
            reporterEmail: { type: 'string', example: 'admin@maintainiq.com' },
            reporterPhone: { type: 'string', example: '+15550244' },
            title: { type: 'string', example: 'HVAC Vibration Anomaly Check' },
            description: { type: 'string', example: 'Vibration frequency deviation detected in the compressor' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Emergency'], example: 'High' },
            category: { type: 'string', example: 'HVAC' },
            status: {
              type: 'string',
              enum: ['Reported', 'Assigned', 'Inspection Started', 'Maintenance In Progress', 'Waiting for Parts', 'Resolved', 'Closed', 'Reopened'],
              example: 'Reported'
            },
            assignedTechnician: { type: 'string', description: 'Assigned User ObjectId' },
            attachments: { type: 'array', items: { type: 'string' } },
            maintenanceCost: { type: 'number', minimum: 0, example: 320 },
            inspectionNotes: { type: 'string' },
            maintenanceNotes: { type: 'string' },
            partsUsed: { type: 'array', items: { type: 'string' }, example: ['Fan belt', 'Grease'] },
            resolvedDate: { type: 'string', format: 'date-time' }
          }
        },
        MaintenanceHistory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            asset: { type: 'string' },
            issue: { type: 'string' },
            actor: { $ref: '#/components/schemas/User' },
            action: { type: 'string', example: 'Inspection Started' },
            description: { type: 'string', example: 'Technician Marcus started inspecting the unit.' },
            date: { type: 'string', format: 'date-time' }
          }
        },
        AITriage: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            issue: { type: 'string' },
            originalComplaint: { type: 'string' },
            aiTitle: { type: 'string' },
            aiCategory: { type: 'string' },
            aiPriority: { type: 'string' },
            possibleCauses: { type: 'array', items: { type: 'string' } },
            diagnosticChecks: { type: 'array', items: { type: 'string' } },
            editedByUser: { type: 'boolean' }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/docs/*.swagger.js' // We can put swagger spec annotations here or inside routes
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
