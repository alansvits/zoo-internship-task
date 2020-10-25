const express = require("express");
const axios = require("axios");
const { createRecords, getPlanetNames, resolveHomeworlds} = require('./util')
const path = require('path')

const app = express();

const SWAPI_PEOPLE = 'https://swapi.dev/api/people/';

//In-memory cache :)
const cache = {}

app.get('/', (req, res) => res.redirect('/search'))

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'))
});

app.get("/search-people", (req, res) => {
  let searchName = req.query.name.toLowerCase()
  if (searchName === ''){
   return res.json([])
  }

  //Check cache for similar request
  if (cache.hasOwnProperty(searchName)) {
    console.log('cached resposne')
    return res.json(cache[searchName])
  } else {
    axios.get(SWAPI_PEOPLE, {
      params: {
        search: searchName
      }
    })
      .then(async (response) => {
        if (response.data.count === 0) {
          return res.json([])
        }

        let records = createRecords(response.data.results)
        let planets = await getPlanetNames(records.map( el => el.homeworld))
        let resolvedRecords = resolveHomeworlds(records, planets)

        //Cache result of request
        cache[searchName] = resolvedRecords

        res.json(resolvedRecords)
      })
      .catch(err => {
        console.log('err',err)
        res.json([])
      })
  }
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

exports.app = app;

if (process.env.NODE_ENV !== "test") {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
