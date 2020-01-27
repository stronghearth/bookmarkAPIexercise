const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('../helpers/logger');
const STORE = require('../store');

bookmarkRouter
    .route('/')
    .get((req, res) => {
      res.json(STORE)
    });

bookmarkRouter
    .route('/:id')
    .get((req, res) => {
      const { id } = req.params;
      const bookmark = STORE.bookmarks.find(b => b.id === id);

      if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found`);
          return res  
                  .status(404)
                  .send('Bookmark Not Found');
      }
    
    res.json(bookmark);
});

module.exports = bookmarkRouter;
