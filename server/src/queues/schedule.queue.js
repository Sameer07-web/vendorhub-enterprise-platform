const { Queue } = require('bullmq');
const connection = require('./connection');

const scheduleQueue = new Queue('vendorhub-scheduled-report', { connection });

module.exports = scheduleQueue;
