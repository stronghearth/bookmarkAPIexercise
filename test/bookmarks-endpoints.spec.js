const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const store = require('../src/store')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only ('Bookmark Endpoints', () => {
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