const express = require('express');
const membersRouter = require('./routes/members.routes');

const app = express();
app.use(express.json());

app.use('/members', membersRouter);

module.exports = app;
