const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('my_bookmarks');
    },

    getById(knex, id) {
        return knex.from('my_bookmarks').select('*').where('id', id).first();
    },

    insertBookmark(knex, newBookmark) {
        return knex
          .insert(newBookmark)
          .into('my_bookmarks')
          .returning('*')
          .then(rows => {
            return rows[0]
          })
    },

    deleteBookmark(knex, id) {
        return knex('my_bookmarks')
          .where({ id })
          .delete()
    },

    updateBookmark(knex, id, newBookmarkFields) {
        return knex('my_bookmarks')
          .where({ id })
          .update(newBookmarkFields)
    },
}

module.exports = {
    BookmarksService
}