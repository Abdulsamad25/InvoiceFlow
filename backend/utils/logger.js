import AuditLog from '../models/auditLog.js';

export const logAction = async (userId, action, resourceType, resourceId = null, details = null, ipAddress = null) => {
  try {
    await AuditLog.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Logging error:', error);
  }
};