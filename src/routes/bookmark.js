require('dotenv').config
const express = require('express');
const xss = require('xss');
const bookmarkRouter = express.Router();
const logger = require('../helpers/logger');
const path = require('path')
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

      const { title, url, description=false, rating } = req.body
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
                  error: { message: 'URL needs to begin with http or https'}
                })
      }

      if(rating) {
        const ratingNum = parseInt(rating)
        if (ratingNum < 1 || ratingNum > 5) {
          logger.error('Rating needs to be between 1 and 5')
          return res
                  .status(400)
                  .json({
                    error: { message: 'Rating needs to be between 1 and 5' }
                  })
        }
      }

      BookmarksService.insertBookmark(knexInstance, newBookmark)
          .then(bookmark => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
              .json(serializeBookmarks(bookmark))
          })
          .catch(next)
    })

bookmarkRouter
    .route('/:id')
    .all((req, res, next) => {
      const { id } = req.params;
      const knexInstance = req.app.get('db');

      BookmarksService.getById(knexInstance, id)
        .then(bookmark => {
          if (!bookmark) {
              logger.error(`Bookmark with id ${id} not found`)
              return res  
                      .status(404)
                      .json({
                        error: { message: 'Bookmark not found'}
                      })
            }
            res.bookmark = bookmark
            next()
            }) 
            .catch(next)
          })
    .get((req, res) => {
        res.json(serializeBookmarks(res.bookmark))
      })
 
    .delete((req, res, next) => {
      const knexInstance = req.app.get('db')
      const { id } = req.params
    
        BookmarksService.deleteBookmark(knexInstance, id)
            .then(numRowsAffected => {
              logger.info(`Bookmark with id ${id} deleted`)
              res.status(204).end()
            })
            .catch(next)
    
      })
      .patch(bodyParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { title, url, description=false, rating } = req.body;
        const { id } = req.params;
        const bookmarkToUpdate = { title, url, description, rating};
  
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
          if (numberOfValues === 0) {
            return res.status(400).json({
              error: {
                message: `Request body must include either 'title', 'url', 'description' or 'rating'`
              }
            })
          };

        BookmarksService.updateBookmark(
          knexInstance,
          id,
          bookmarkToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
    



module.exports = bookmarkRouter;
