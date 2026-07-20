const { Queue } = require('bullmq');
const connection = require('./connection');

const cleanupQueue = new Queue('vendorhub-cleanup', { connection });

module.exports = cleanupQueue;
