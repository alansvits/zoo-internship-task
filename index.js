const express = require("express");
const path = require('path')

const searchPeopleHandler = require('./search-peopleHandler')

const app = express();

app.get('/', (req, res) => res.redirect('/search'))

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'))
});

app.get('/search-people', searchPeopleHandler)

app.use(function (req, res, next) {
  res.status(404).send("404 page not found")
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('500 internal server error')
})

exports.app = app;

if (process.env.NODE_ENV !== "test") {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}