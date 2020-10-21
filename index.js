const express = require("express");
const axios = require("axios");
const { createRecords, getPlanetNames, resolveHomeworlds} = require('./util')
const app = express();

const SWAPI_PEOPLE = 'https://swapi.dev/api/people/';

const cache = {}

app.get("/search-people", (req, res) => {
  if (req.query.name === ''){
   return res.json([])
  }

  if (cache.hasOwnProperty(req.query.name)) {
    console.log('cached res')
    return res.json(cache[req.query.name])
  } else {
    axios.get(SWAPI_PEOPLE, {
      params: {
        search: req.query.name
      }
    })
      .then(async (response) => {
        if (response.data.count === 0) {
          return res.json([])
        }

        let records = createRecords(response.data.results)
        // console.log('records', records)
        let planets = await getPlanetNames(records.map( el => el.homeworld))
        let resolvedRecords = resolveHomeworlds(records, planets)
        // console.log('resolveHomeworlds', resolvedRecords)
        cache[req.query.name] = resolvedRecords
        res.json(resolvedRecords)
      })
      .catch(err => {
        console.log('err',err)
        res.json([])
      })
  }
});

exports.app = app;

if (process.env.NODE_ENV !== "test") {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}