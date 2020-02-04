const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures');

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
        context('given an XSS attack bookmark', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

            beforeEach('insert malicious article', () => {
                return db
                    .into('my_bookmarks')
                    .insert([maliciousBookmark]);
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                        .get('/bookmarks')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body[0].title).to.eql(expectedBookmark.title)
                            expect(res.body[0].description).to.eql(expectedBookmark.description)
                        })
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
        context('given an XSS attack bookmark', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()

            beforeEach('insert malicious article', () => {
                return db
                    .into('my_bookmarks')
                    .insert([ maliciousBookmark ])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                        .get(`/bookmarks/${maliciousBookmark.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.title).to.eql(expectedBookmark.title)
                            expect(res.body.description).to.eql(expectedBookmark.description)
                        })
            })
        })
    })
    describe.only('DELETE /bookmarks/:bookmarkId', () => {
        context('given no authorization', () => {
            it('returns a 401 error when no authorization passed', () => {
                return supertest(app)
                        .delete('/bookmarks/:bookmarkId')
                        .expect(401, { error: 'Unauthorized request' })
            })
        })
        context('Given no bookmarks', () => {
            it('responds with a 404', () => {
                return supertest(app)
                        .delete(`/bookmarks/543215`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, { error: {message: 'Bookmark not found' } })
            })
        })
        context('given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('my_bookmarks')
                    .insert(testBookmarks)
            })

            it('removes the bookmark by id from the database', () => {
                const testId = 2
                const expectedBookmarks = testBookmarks.filter(bm => bm.id !== testId)
                return supertest(app)
                        .delete(`/bookmarks/${testId}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(204)
                        .then(() => 
                            supertest(app)
                                .get('/bookmarks')
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(expectedBookmarks))
            })
        })
    })
    describe('POST /bookmarks', () => {
        it('creates an bookmark, responds with 201 and the new article', () => {
            const newBookmark = {
                title: 'Test new website',
                url: 'https://www.awesomesite.com',
                description: 'This test website rules!',
                rating: '3'
            }
            return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(newBookmark.title)
                        expect(res.body.url).to.eql(newBookmark.url)
                        expect(res.body.description).to.eql(newBookmark.description)
                        expect(res.body.rating).to.eql(newBookmark.rating)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                    })
        })
        const requiredFields = ['title', 'url', 'rating'];
            requiredFields.forEach(field => {
                const newBookmark = {
                    title: 'Test new website',
                    url: 'https://www.awesomesite.com',
                    rating: '3'
                }
            
            it(`responds with 400 error and message when the ${field} is missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                        .post('/bookmarks')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(newBookmark)
                        .expect(400, {
                            error: {message: `Missing '${field} in request body`}
                        })
            })
         })

        it(`responds with 400 error and error message when url doesn't start with http or https`, () => {
            const badURLBookmark = {
                title: 'Test new website',
                url: 'www.awesomesite.com',
                rating: '3'
            }
            return supertest(app)
                        .post('/bookmarks')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(badURLBookmark)
                        .expect(400, {
                            error: {message: `URL needs to begin with http or https`}
                        })

        })
        it('responds with 400 error and error message when rating is between 1 and 5', () => {
            const badRatingBookmark = {
                title: 'Test new website',
                url: 'https://www.awesomesite.com',
                rating: '6'
            }
            return supertest(app)
                        .post('/bookmarks')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(badRatingBookmark)
                        .expect(400, {
                            error: {message: `Rating needs to be between 1 and 5`}
                        })

        }) 
        it('removes XSS attack content from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();

            return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(maliciousBookmark)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedBookmark.title)
                        expect(res.body.description).to.eql(expectedBookmark.description)
                    })
        })
    })
    
})