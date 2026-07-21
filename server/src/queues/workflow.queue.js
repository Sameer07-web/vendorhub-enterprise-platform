const { Queue } = require('bullmq');
const connection = require('./connection');

const workflowQueue = new Queue('vendorhub-workflow', { connection });

module.exports = workflowQueue;
