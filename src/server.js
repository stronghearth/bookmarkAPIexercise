const app = require('./app');
const knex = require('knex');
const PORT = process.env.PORT || 8000
const DB_URL = process.env.DB_URL || "postgresql://dunder_mifflin@localhost/bookmarks"


const db = knex({
  client: 'pg',
  connection: DB_URL,
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
