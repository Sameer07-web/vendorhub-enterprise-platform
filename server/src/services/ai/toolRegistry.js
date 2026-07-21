/**
 * Central registry of all LLM-callable functions.
 * Includes schema for the LLM and RBAC metadata for the ToolExecutor.
 * Organized by logical domains: Information, Workflow, Analytics, Documents.
 */

const toolRegistry = [
  // ==========================================
  // INFORMATION DOMAIN
  // ==========================================
  {
    declaration: {
      name: 'getPendingApprovals',
      description: 'Fetches a list of pending approvals that require action. Can optionally filter by department.',
      parameters: {
        type: 'OBJECT',
        properties: {
          department: {
            type: 'STRING',
            description: 'Optional department name to filter by (e.g. "IT", "Finance").'
          }
        }
      }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'getOverdueApprovals',
      description: 'Fetches a list of approvals that have breached their SLA timeline. Typically used by Admins or Managers.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    rbac: { roles: ['Admin', 'Manager'] }
  },
  {
    declaration: {
      name: 'getPendingRFQs',
      description: 'Fetches a list of RFQs (Requests for Quotation) that are pending vendor responses or evaluation.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'getDashboardKPIs',
      description: 'Fetches high-level procurement metrics (total spend, active vendors, RFQs, etc.) for the executive dashboard.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    rbac: { roles: ['Admin', 'Manager'] }
  },
  {
    declaration: {
      name: 'getVendorSummary',
      description: 'Fetches a summary of active vendors.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'getPurchaseRequestSummary',
      description: 'Fetches a summary of pending purchase requests.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },

  // ==========================================
  // WORKFLOW DOMAIN
  // ==========================================
  {
    declaration: {
      name: 'draftPurchaseRequest',
      description: 'Drafts a new Purchase Request based on the user intent and saves it. Returns the draftId to pre-fill the form.',
      parameters: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Title of the purchase request.' },
          department: { type: 'STRING', description: 'Department requesting the purchase (e.g. "IT", "HR").' },
          items: {
            type: 'ARRAY',
            description: 'Array of items to purchase.',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                quantity: { type: 'NUMBER' },
                estimatedUnitPrice: { type: 'NUMBER' }
              }
            }
          }
        },
        required: ['title', 'department', 'items']
      }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'draftRFQ',
      description: 'Drafts a new RFQ (Request for Quotation) based on user intent and saves it. Returns the draftId.',
      parameters: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Title of the RFQ.' },
          description: { type: 'STRING', description: 'Detailed description of the RFQ.' },
          items: {
            type: 'ARRAY',
            description: 'Array of items required in the RFQ.',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                quantity: { type: 'NUMBER' }
              }
            }
          }
        },
        required: ['title', 'description', 'items']
      }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'explainApprovalPath',
      description: 'Traces an ApprovalProcess to explain where a document (Purchase Request, RFQ, etc.) is currently blocked, who needs to approve it, and its SLA status.',
      parameters: {
        type: 'OBJECT',
        properties: {
          entityId: { type: 'STRING', description: 'The entity ID or request number (e.g. PR-1002).' }
        },
        required: ['entityId']
      }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  },
  {
    declaration: {
      name: 'recommendAction',
      description: 'Analyzes an entity (like an overdue approval) and returns structured recommendations for the user to take (e.g. SEND_REMINDER, ESCALATE).',
      parameters: {
        type: 'OBJECT',
        properties: {
          entityId: { type: 'STRING', description: 'The entity ID or request number to recommend actions for.' },
          context: { type: 'STRING', description: 'Optional context (e.g., "overdue approval").' }
        },
        required: ['entityId']
      }
    },
    rbac: { roles: ['Admin', 'Manager', 'Employee'] }
  }
];

module.exports = toolRegistry;
