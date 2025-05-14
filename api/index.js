const serverless = require('serverless-http');
const app = require('../server'); // لو اسمه server.js

module.exports = serverless(app);