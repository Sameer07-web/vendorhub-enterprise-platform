const { Queue } = require('bullmq');
const connection = require('./connection');

const automationQueue = new Queue('vendorhub-automation', { connection });

module.exports = automationQueue;
