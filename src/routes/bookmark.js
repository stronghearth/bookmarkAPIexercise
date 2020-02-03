require('dotenv').config
const express = require('express');
const xss = require('xss');
const bookmarkRouter = express.Router();
const logger = require('../helpers/logger');
const STORE = require('../store');
const uuid = require('uuid/v4')
const bodyParser = express.json();
const { BookmarksService } = require('../../services/BookmarksService')

const serializeBookmarks = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  rating: bookmark.rating,
  description: xss(bookmark.description)
})

bookmarkRouter
    .route('/')
    .get((req, res, next) => {
      const knexInstance = req.app.get('db');

      BookmarksService.getAllBookmarks(knexInstance)
        .then(bookmarks => {
          res.json(bookmarks.map(serializeBookmarks))
        })
        .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
      const knexInstance = req.app.get('db');

      const { title, url, description=false, rating} = req.body
      const newBookmark = {title, url, description, rating}

      for (const [key, value] of Object.entries(newBookmark)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key} in request body` }
          })
        }
      }

      if (!url.startsWith('http' || 'https')) {
        logger.error('URL needs to begin with http or https')
        return res
                .status(400)
                .json({
                  error: { message: 'URL needs to begin with http or https'}})
      }

      if(rating) {
        const ratingNum = parseInt(rating)
        if (ratingNum < 1 || ratingNum > 5) {
          logger.error('Rating needs to be between 1 and 5')
          return res
                  .status(400)
                  .json({
                    error: { message: 'Rating needs to be between 1 and 5'}})
        }
      }

      BookmarksService.insertBookmark(knexInstance, newBookmark)
          .then(bookmark => {
            res
              .status(201)
              .location(`/bookmarks/${bookmark.id}`)
              .json(serializeBookmarks(bookmark))
          })
          .catch(next)
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
                  .json({
                    error: { message: 'Bookmark not found'}
                  })
        }
        res.json(serializeBookmarks(bookmark))
      })
        .catch(next)
  })
    



module.exports = bookmarkRouter;
