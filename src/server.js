const app = require('./app');
const knex = require('knex');
const { PORT, DB_URL } = process.env.PORT || 8000


const db = knex({
  client: 'pg',
  connection: DB_URL,
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
