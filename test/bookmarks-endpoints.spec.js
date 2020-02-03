const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints', () => {
    let db;

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from database', () => db.destroy())

    before('clean the table', () => db('my_bookmarks').truncate())

    afterEach('cleanup table', () => db('my_bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context('given no authorization', () => {
            it('returns a 401 error when no authorization passed', () => {
                return supertest(app)
                        .get('/bookmarks')
                        .expect(401, { error: 'Unauthorized request' })
            })
        })
        context('given there are no bookmarks', () => {
            it('GET /bookmarks returns 200 with empty array', () => { 
            return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })
        context('given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks', () => {
                return db
                    .into('my_bookmarks')
                    .insert(testBookmarks)
            })
            it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })
    }) 
    describe('GET /bookmarks/:bookmarkId', () => {
        context('given no authorization', () => {
            it('returns a 401 error when no authorization passed', () => {
                bookmarkId = 2
                return supertest(app)
                        .get(`/bookmarks/${bookmarkId}`)
                        .expect(401, { error: 'Unauthorized request' })
            })
        })
        context('given there are no bookmarks in the database with the id', () => {
            it('responds with a 404', () => {
            const bookmarkId = 123456;
            return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {error: {message: 'Bookmark not found' }})
            })    
        })
        context('given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
            beforeEach('insert bookmarks', () => {
                return db
                    .into('my_bookmarks')
                    .insert(testBookmarks)
            })
            it('GET /bookmarks/:bookmarkid returns 200 response and particular bookmark', () => {
                const bookmarkId = 2;
                const expectedBookmark = testBookmarks[bookmarkId - 1];
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })
    })
})