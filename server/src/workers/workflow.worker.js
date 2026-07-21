const { Worker } = require('bullmq');
const connection = require('../queues/connection');
const slaProcessor = require('../processors/sla.processor');

// SLA processor handles timeouts for approvals. We run it on the workflow queue 
// or a dedicated SLA queue. We'll use workflow queue for simplicity and differentiate by job name,
// but for clarity, let's create a dedicated 'vendorhub-sla' queue if preferred.
// Wait, the user plan had 'sla.processor.js'. We can use the 'vendorhub-workflow' queue with different names,
// or a dedicated 'vendorhub-sla' queue. Let's use 'vendorhub-workflow' since that was the approved queue.

const worker = new Worker('vendorhub-workflow', async (job) => {
  if (job.name === 'sla-timer') {
    return slaProcessor(job);
  }
  
  if (job.name === 'workflow-action') {
    const workflowProcessor = require('../processors/workflow.processor');
    return workflowProcessor(job);
  }

  throw new Error(`Unknown job name: ${job.name}`);
}, {
  connection,
  concurrency: 5
});

worker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] Workflow job ${job.name} completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Workflow job ${job.name} failed:`, err.message);
});

module.exports = worker;
