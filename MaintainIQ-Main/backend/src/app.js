const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Require swagger specs
const swaggerSpec = require('./docs/swagger');

const app = express();

// 1. HTTP Security and Logging Headers
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Swagger docs styling compatibility
}));

// Morgan HTTP logger
app.use(morgan('dev'));

// CORS configuration: dynamically reflect requesting origin to prevent port mismatch blocks in dev
app.use(cors({
  origin: (origin, callback) => {
    // Reflect origin back to client (allow any local port or client url)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Response Compression (gzip)
app.use(compression());

// 2. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect root to api docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// 4. API Rate Limiting & Routing
app.use('/api', generalLimiter, routes);

// 5. Error Handler Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
