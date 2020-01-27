const express = require('express');
const bookmarkRouter = express.Router();
const STORE = require('../store');

bookmarkRouter.get('/bookmarks', (req, res) => {
  res.status(200).send(STORE);
});

module.exports = bookmarkRouter;
