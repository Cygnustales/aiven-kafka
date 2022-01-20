const createError = require('http-errors');
const express = require('express');
const indexRouter = require('./routes/index');
const cors = require('cors');

require('events').EventEmitter.defaultMaxListeners = Infinity; 

const app = express();

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb',extended: false }));
app.use('/', indexRouter);
process.setMaxListeners(11);
app.get('/config', (req, res) => {
  res.json(global.gConfig);
});

app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;