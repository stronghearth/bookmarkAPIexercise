require('dotenv').config
const express = require('express');
const bookmarkRouter = express.Router();
const logger = require('../helpers/logger');
const STORE = require('../store');
const uuid = require('uuid/v4')
const bodyParser = express.json();
const { BookmarksService } = require('../../services/BookmarksService')


bookmarkRouter
    .route('/')
    .get((req, res, next) => {
      const knexInstance = req.app.get('db');
      BookmarksService.getAllBookmarks(knexInstance)
        .then(bookmarks => {
          res.json(bookmarks)
        })
        .catch(next)
    })
    .post(bodyParser, (req, res) => {
      const { title, url, description=false, rating=false } = req.body

      if (!title) {
        logger.error('Title is required');
        return res
                  .status(400)
                  .send('Title is required')
      }

      if (!url) {
        logger.error('URL is required');
        return res
                .status(400)
                .send('URL is required')
      }

      if (!url.startsWith('http' || 'https')) {
        logger.error('URL needs to begin with http or https')
        return res
                .status(400)
                .send('URL needs to begin with http or https')
      }

      if(rating) {
        const ratingNum = parseInt(rating)
        if (ratingNum < 1 || ratingNum > 5) {
          logger.error('Rating needs to be between 1 and 5')
          return res
                  .status(400)
                  .send('Rating needs to be between 1 and 5')
        }
      }

      const id = uuid()
      const newBookmark = {
        id,
        title,
        rating,
        url,
        description,
      }

      STORE.bookmarks.push(newBookmark);

      res.status(201)
          .location(`http://localhost:8000/bookmarks/${id}`)
          .json(newBookmark)
    })

bookmarkRouter
    .route('/:id')
    .get((req, res, next) => {
      const { id } = req.params;
      const knexInstance = req.app.get('db');
      BookmarksService.getById(knexInstance, id)
        .then(bookmark => {
      if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found`);
          return res  
                  .status(404)
                  .send('Bookmark Not Found');
        }
        res.json(bookmark)
      })
        .catch(next)
  })
    .delete((req, res) => {
      const {id} = req.params;

      const bookmarkIndex = STORE.bookmarks.findIndex(b => b.id === id);

      if(bookmarkIndex === -1) {
        logger.error(`Bookmark with id ${id} not found`);
        return res
                .status(404)
                .send('Not Found');
      }

      STORE.bookmarks.splice(bookmarkIndex, 1);

      logger.info(`Bookmark with id ${id} deleted.`);
      res
        .status(204)
        .end();
    })



module.exports = bookmarkRouter;
