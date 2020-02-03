const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('my_bookmarks');
    },

    getById(knex, id) {
        return knex.from('my_bookmarks').select('*').where('id', id).first();
    }
}

module.exports = {
    BookmarksService
}