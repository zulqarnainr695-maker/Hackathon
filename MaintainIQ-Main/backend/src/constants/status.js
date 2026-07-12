const ASSET_STATUS = {
  OPERATIONAL: 'Operational',
  ISSUE_REPORTED: 'Issue Reported',
  UNDER_INSPECTION: 'Under Inspection',
  UNDER_MAINTENANCE: 'Under Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
  RETIRED: 'Retired'
};

const ISSUE_STATUS = {
  REPORTED: 'Reported',
  ASSIGNED: 'Assigned',
  INSPECTION_STARTED: 'Inspection Started',
  MAINTENANCE_IN_PROGRESS: 'Maintenance In Progress',
  WAITING_FOR_PARTS: 'Waiting for Parts',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened'
};

const CONDITION = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor'
};

module.exports = {
  ASSET_STATUS,
  ISSUE_STATUS,
  CONDITION
};
