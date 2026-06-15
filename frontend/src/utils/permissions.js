import { USER_ROLES } from "./constants";

export const PERMISSIONS = {
  // Invoice permissions
  CREATE_INVOICE: "create_invoice",
  EDIT_INVOICE: "edit_invoice",
  DELETE_INVOICE: "delete_invoice",
  VIEW_INVOICE: "view_invoice",
  DUPLICATE_INVOICE: "duplicate_invoice",

  // Client permissions
  CREATE_CLIENT: "create_client",
  EDIT_CLIENT: "edit_client",
  DELETE_CLIENT: "delete_client",
  VIEW_CLIENT: "view_client",

  // User management permissions
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",

  // Settings permissions
  MANAGE_SETTINGS: "manage_settings",
  VIEW_SETTINGS: "view_settings",

  // Report permissions
  VIEW_REPORTS: "view_reports",
  EXPORT_DATA: "export_data",

  // Audit permissions
  VIEW_AUDIT_LOGS: "view_audit_logs",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // View-only permissions for invoices and clients
    PERMISSIONS.VIEW_INVOICE,
    PERMISSIONS.VIEW_CLIENT,

    // Full user management
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,

    // Full settings management
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_SETTINGS,

    // Reports and exports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,

    // Audit logs
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  [USER_ROLES.ACCOUNTANT]: [
    // Full invoice management
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.EDIT_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    PERMISSIONS.VIEW_INVOICE,
    PERMISSIONS.DUPLICATE_INVOICE,

    // Full client management
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.VIEW_CLIENT,

    // Reports and exports
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,

    // Can view settings but not modify
    PERMISSIONS.VIEW_SETTINGS,
  ],
};

export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (userRole, permissionList) => {
  return permissionList.some((permission) =>
    hasPermission(userRole, permission),
  );
};

// Helper functions for specific permissions
export const canCreateInvoice = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.CREATE_INVOICE);
};

export const canEditInvoice = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.EDIT_INVOICE);
};

export const canDeleteInvoice = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.DELETE_INVOICE);
};

export const canSendInvoice = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.SEND_INVOICE);
};

export const canCreateClient = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.CREATE_CLIENT);
};

export const canEditClient = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.EDIT_CLIENT);
};

export const canDeleteClient = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.DELETE_CLIENT);
};

export const canManageUsers = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_USERS);
};

export const canManageSettings = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_SETTINGS);
};

export const canViewAuditLogs = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.VIEW_AUDIT_LOGS);
};

export const canExportData = (userRole) => {
  return hasPermission(userRole, PERMISSIONS.EXPORT_DATA);
};
