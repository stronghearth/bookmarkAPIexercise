require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bearerVaildator = require('./helpers/bearerValidator');
const errorHandler = require('./helpers/errorHandler');

const { NODE_ENV } = require('./config');


const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

const bookmarkRouter = require('./routes/bookmark');

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(bearerVaildator);

app.use('/bookmarks', bookmarkRouter);

app.use(errorHandler);

module.exports = app;
