const app = require('./app');

const PORT = require('./config');

app.listen(8000, () => {
  console.log(`Server listening at http://localhost:8000`);
});
