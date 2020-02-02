const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('my_bookmarks');
    }
}

module.exports = {
    BookmarksService
}