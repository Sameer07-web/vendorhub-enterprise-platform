const { Queue } = require('bullmq');
const connection = require('./connection');

const exportQueue = new Queue('vendorhub-export', { connection });

module.exports = exportQueue;
