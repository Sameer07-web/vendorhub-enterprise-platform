const PERMISSION_SCHEMA_VERSION = 1;

const Permissions = {
  // Vendor Permissions
  VENDORS_VIEW: 'vendors:view',
  VENDORS_CREATE: 'vendors:create',
  VENDORS_EDIT: 'vendors:edit',
  VENDORS_DELETE: 'vendors:delete',

  // PR Permissions
  PR_VIEW: 'pr:view',
  PR_CREATE: 'pr:create',
  PR_EDIT: 'pr:edit',
  PR_DELETE: 'pr:delete',

  // RFQ Permissions
  RFQ_VIEW: 'rfq:view',
  RFQ_CREATE: 'rfq:create',
  RFQ_EDIT: 'rfq:edit',
  RFQ_DELETE: 'rfq:delete',

  // Quotation Permissions
  QUOTATIONS_VIEW: 'quotations:view',
  QUOTATIONS_CREATE: 'quotations:create',
  QUOTATIONS_EDIT: 'quotations:edit',
  QUOTATIONS_DELETE: 'quotations:delete',

  // Workflow Permissions
  WORKFLOW_VIEW: 'workflow:view',
  WORKFLOW_MANAGE: 'workflow:manage',

  // Analytics Permissions
  ANALYTICS_VIEW: 'analytics:view',

  // Reports Permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_MANAGE: 'reports:manage',

  // Exports Permissions
  EXPORTS_RUN: 'exports:run',

  // Dashboard Permissions
  DASHBOARD_VIEW: 'dashboard:view',

  // Notifications Permissions
  NOTIFICATIONS_VIEW: 'notifications:view',

  // AI Permissions
  AI_VIEW: 'ai:view',

  // Settings & Management Permissions
  SETTINGS_EDIT: 'settings:edit',
  USER_MANAGE: 'user:manage',
};

const PermissionDefinitions = [
  { key: Permissions.VENDORS_VIEW, displayName: 'View Vendors', module: 'Vendor Management', description: 'Permission to view vendor list and details.' },
  { key: Permissions.VENDORS_CREATE, displayName: 'Create Vendor', module: 'Vendor Management', description: 'Permission to create new vendor profiles.' },
  { key: Permissions.VENDORS_EDIT, displayName: 'Edit Vendor', module: 'Vendor Management', description: 'Permission to update existing vendor profiles.' },
  { key: Permissions.VENDORS_DELETE, displayName: 'Delete Vendor', module: 'Vendor Management', description: 'Permission to archive or delete vendor profiles.' },

  { key: Permissions.PR_VIEW, displayName: 'View Purchase Requests', module: 'Purchase Management', description: 'Permission to view purchase requests.' },
  { key: Permissions.PR_CREATE, displayName: 'Create Purchase Request', module: 'Purchase Management', description: 'Permission to draft and submit purchase requests.' },
  { key: Permissions.PR_EDIT, displayName: 'Edit Purchase Request', module: 'Purchase Management', description: 'Permission to modify purchase requests.' },
  { key: Permissions.PR_DELETE, displayName: 'Delete Purchase Request', module: 'Purchase Management', description: 'Permission to delete or cancel purchase requests.' },

  { key: Permissions.RFQ_VIEW, displayName: 'View RFQs', module: 'Workflow', description: 'Permission to view requests for quotations.' },
  { key: Permissions.RFQ_CREATE, displayName: 'Create RFQ', module: 'Workflow', description: 'Permission to create new RFQs.' },
  { key: Permissions.RFQ_EDIT, displayName: 'Edit RFQ', module: 'Workflow', description: 'Permission to modify existing RFQs.' },
  { key: Permissions.RFQ_DELETE, displayName: 'Delete RFQ', module: 'Workflow', description: 'Permission to cancel RFQs.' },

  { key: Permissions.QUOTATIONS_VIEW, displayName: 'View Quotations', module: 'Workflow', description: 'Permission to view quotations.' },
  { key: Permissions.QUOTATIONS_CREATE, displayName: 'Create Quotation', module: 'Workflow', description: 'Permission to submit quotations.' },
  { key: Permissions.QUOTATIONS_EDIT, displayName: 'Edit Quotation', module: 'Workflow', description: 'Permission to modify quotations.' },
  { key: Permissions.QUOTATIONS_DELETE, displayName: 'Delete Quotation', module: 'Workflow', description: 'Permission to cancel or discard quotations.' },

  { key: Permissions.WORKFLOW_VIEW, displayName: 'View Workflows', module: 'Workflow', description: 'Permission to view approval processes and delegations.' },
  { key: Permissions.WORKFLOW_MANAGE, displayName: 'Manage Workflows', module: 'Workflow', description: 'Permission to design workflow rules and configure approval logic.' },

  { key: Permissions.ANALYTICS_VIEW, displayName: 'View Analytics', module: 'Analytics', description: 'Permission to view system spend data metrics.' },

  { key: Permissions.REPORTS_VIEW, displayName: 'View Reports', module: 'Reports', description: 'Permission to view saved reports and query dashboards.' },
  { key: Permissions.REPORTS_MANAGE, displayName: 'Manage Reports', module: 'Reports', description: 'Permission to create, update, and manage report definitions.' },

  { key: Permissions.EXPORTS_RUN, displayName: 'Run Exports', module: 'Exports', description: 'Permission to initiate and download bulk CSV/Excel exports.' },

  { key: Permissions.DASHBOARD_VIEW, displayName: 'View Dashboard', module: 'Administration', description: 'Permission to access the default work queue and alerts view.' },

  { key: Permissions.NOTIFICATIONS_VIEW, displayName: 'View Notifications', module: 'Notifications', description: 'Permission to view and manage notification streams.' },

  { key: Permissions.AI_VIEW, displayName: 'Access AI Copilot', module: 'AI', description: 'Permission to communicate with AI Copilot for advice and recommendations.' },

  { key: Permissions.SETTINGS_EDIT, displayName: 'Edit Organization Settings', module: 'Organization Management', description: 'Permission to update currency, profile settings, and system branding.' },
  { key: Permissions.USER_MANAGE, displayName: 'Manage Users & Roles', module: 'Organization Management', description: 'Permission to invite members, suspend users, and modify custom roles.' },
];

const RolePermissions = {
  Owner: Object.values(Permissions),
  Admin: [
    Permissions.VENDORS_VIEW, Permissions.VENDORS_CREATE, Permissions.VENDORS_EDIT, Permissions.VENDORS_DELETE,
    Permissions.PR_VIEW, Permissions.PR_CREATE, Permissions.PR_EDIT, Permissions.PR_DELETE,
    Permissions.RFQ_VIEW, Permissions.RFQ_CREATE, Permissions.RFQ_EDIT, Permissions.RFQ_DELETE,
    Permissions.QUOTATIONS_VIEW, Permissions.QUOTATIONS_CREATE, Permissions.QUOTATIONS_EDIT, Permissions.QUOTATIONS_DELETE,
    Permissions.WORKFLOW_VIEW, Permissions.WORKFLOW_MANAGE,
    Permissions.ANALYTICS_VIEW,
    Permissions.REPORTS_VIEW, Permissions.REPORTS_MANAGE,
    Permissions.EXPORTS_RUN,
    Permissions.DASHBOARD_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
    Permissions.AI_VIEW,
    Permissions.SETTINGS_EDIT,
    Permissions.USER_MANAGE,
  ],
  Manager: [
    Permissions.VENDORS_VIEW, Permissions.VENDORS_CREATE, Permissions.VENDORS_EDIT,
    Permissions.PR_VIEW, Permissions.PR_CREATE, Permissions.PR_EDIT,
    Permissions.RFQ_VIEW, Permissions.RFQ_CREATE, Permissions.RFQ_EDIT,
    Permissions.QUOTATIONS_VIEW, Permissions.QUOTATIONS_CREATE, Permissions.QUOTATIONS_EDIT,
    Permissions.WORKFLOW_VIEW,
    Permissions.ANALYTICS_VIEW,
    Permissions.REPORTS_VIEW, Permissions.REPORTS_MANAGE,
    Permissions.EXPORTS_RUN,
    Permissions.DASHBOARD_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
    Permissions.AI_VIEW,
  ],
  Approver: [
    Permissions.VENDORS_VIEW,
    Permissions.PR_VIEW,
    Permissions.RFQ_VIEW,
    Permissions.QUOTATIONS_VIEW,
    Permissions.WORKFLOW_VIEW,
    Permissions.ANALYTICS_VIEW,
    Permissions.REPORTS_VIEW,
    Permissions.DASHBOARD_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
    Permissions.AI_VIEW,
  ],
  Buyer: [
    Permissions.VENDORS_VIEW, Permissions.VENDORS_CREATE,
    Permissions.PR_VIEW, Permissions.PR_CREATE, Permissions.PR_EDIT,
    Permissions.RFQ_VIEW, Permissions.RFQ_CREATE, Permissions.RFQ_EDIT,
    Permissions.QUOTATIONS_VIEW, Permissions.QUOTATIONS_CREATE,
    Permissions.DASHBOARD_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
  ],
  Viewer: [
    Permissions.VENDORS_VIEW,
    Permissions.PR_VIEW,
    Permissions.RFQ_VIEW,
    Permissions.QUOTATIONS_VIEW,
    Permissions.DASHBOARD_VIEW,
    Permissions.NOTIFICATIONS_VIEW,
  ],
};

module.exports = {
  PERMISSION_SCHEMA_VERSION,
  Permissions,
  PermissionDefinitions,
  RolePermissions,
};
