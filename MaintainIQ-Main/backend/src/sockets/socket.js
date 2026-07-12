const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] New client connected: ${socket.id}`);

    // Join room based on user role (for targeted broadcasts)
    socket.on('join_role_room', (role) => {
      if (['Admin', 'Technician'].includes(role)) {
        socket.join(role);
        console.log(`[Socket.io] Socket ${socket.id} joined room: ${role}`);
      }
    });

    // Join individual technician room to receive personal assignments
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`[Socket.io] Socket ${socket.id} joined personal room: ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};

// Broadcasting triggers
const notifyIssueAssigned = (technicianId, issue) => {
  if (!io) return;
  // Send notification to the specific technician
  io.to(technicianId.toString()).emit('issue_assigned', {
    message: `You have been assigned a new issue: ${issue.title} (${issue.issueNumber})`,
    issue
  });

  // Also notify admins
  io.to('Admin').emit('admin_notification', {
    message: `Issue ${issue.issueNumber} assigned to technician`,
    issue
  });
};

const notifyStatusUpdated = (issue) => {
  if (!io) return;
  // Broadcast to admins and technicians
  io.emit('status_updated', {
    message: `Issue ${issue.issueNumber} status updated to: ${issue.status}`,
    issue
  });
};

const notifyMaintenanceCompleted = (issue, asset) => {
  if (!io) return;
  io.emit('maintenance_completed', {
    message: `Maintenance completed for Asset ${asset.assetCode} on issue ${issue.issueNumber}`,
    issue,
    asset
  });
};

module.exports = {
  initSocket,
  getIo,
  notifyIssueAssigned,
  notifyStatusUpdated,
  notifyMaintenanceCompleted
};
