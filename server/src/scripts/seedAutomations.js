require('dotenv').config();
const mongoose = require('mongoose');
const WorkflowRule = require('../models/WorkflowRule');
const AutomationRule = require('../models/AutomationRule');
const User = require('../models/User');

const seedAutomations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const systemUser = await User.findOne({ role: 'SYSTEM' });
    const systemUserId = systemUser ? systemUser._id : null;

    // 1. Seed Workflow Templates
    const templates = [
      {
        name: 'Standard IT Procurement Template',
        entityType: 'PurchaseRequest',
        isTemplate: true,
        version: 1,
        category: 'IT',
        description: 'Standard 2-level approval for IT hardware and software.',
        isPublished: true,
        conditions: { minAmount: 1000 },
        levels: [
          { sequence: 1, approverRole: 'Manager', slaHours: 24, canDelegate: true, requireComments: true },
          { sequence: 2, approverRole: 'Director', slaHours: 48, canDelegate: true, requireComments: false }
        ]
      },
      {
        name: 'Emergency Office Supplies',
        entityType: 'PurchaseRequest',
        isTemplate: true,
        version: 1,
        category: 'Facilities',
        description: 'Auto-approves low-value office supplies.',
        isPublished: true,
        conditions: { maxAmount: 500 },
        levels: [
          { sequence: 1, approverRole: 'Manager', autoApprove: true, slaHours: 12 }
        ]
      }
    ];

    for (const template of templates) {
      const existing = await WorkflowRule.findOne({ name: template.name });
      if (!existing) {
        await WorkflowRule.create(template);
        console.log(`Seeded Template: ${template.name}`);
      }
    }

    // 2. Seed Default Automations
    const automations = [
      {
        name: 'Automatic RFQ Creation',
        description: 'Creates a DRAFT RFQ automatically when a Purchase Request is fully approved.',
        trigger: 'WORKFLOW_APPROVED',
        priority: 10,
        stopAfterMatch: false,
        conditions: { entityType: 'PurchaseRequest' },
        isActive: true,
        createdBy: systemUserId,
        actions: [{ type: 'CREATE_RFQ' }]
      },
      {
        name: 'SLA Reminder Notifications',
        description: 'Sends a reminder email when an SLA warning is triggered.',
        trigger: 'SLA_WARNING',
        priority: 50,
        stopAfterMatch: false,
        isActive: true,
        createdBy: systemUserId,
        actions: [{ 
          type: 'SEND_REMINDER',
          payload: { subject: 'Urgent: Approval Required', message: 'A pending approval is nearing its SLA deadline.' }
        }]
      },
      {
        name: 'Monthly Compliance Check',
        description: 'Scheduled job to trigger compliance checks every 1st of the month.',
        trigger: 'SCHEDULED_TRIGGER',
        schedule: '0 0 1 * *', // 1st day of the month at midnight
        priority: 100,
        isActive: true,
        createdBy: systemUserId,
        actions: [{ type: 'CREATE_TASK', payload: { title: 'Review Monthly Vendor Compliance' } }]
      }
    ];

    for (const auto of automations) {
      const existing = await AutomationRule.findOne({ name: auto.name });
      if (!existing) {
        await AutomationRule.create(auto);
        console.log(`Seeded Automation: ${auto.name}`);
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding automations:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAutomations();
