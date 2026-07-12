// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Force IPv4 priority for DNS resolution to solve Windows querySrv Mongoose connection failures
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socket');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception Fatal Error]', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Establish database connection
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

const activeServer = server.listen(PORT, () => {
  console.log(`[Server] MaintainIQ Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[Server] API endpoints root: http://localhost:${PORT}/api`);
  console.log(`[Server] Documentation docs: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('[Unhandled Promise Rejection Alert]', err.name, err.message);
  console.error(err.stack);
  // Gracefully close server & exit process
  activeServer.close(() => process.exit(1));
});
