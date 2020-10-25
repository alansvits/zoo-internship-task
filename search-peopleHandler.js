const axios = require('axios')
const Keyv = require('keyv')
const KeyvFile = require('keyv-file').KeyvFile

const SWAPI_PEOPLE = 'https://swapi.dev/api/people/';

//(Planet url/planet name) pairs
const planetsKeyv = new Keyv({
  store: new KeyvFile({
    filename: `./planets.json`, // the file path to store the data
    writeDelay: 100, // ms, batch write to disk in a specific duration, enhance write performance.
    encode: JSON.stringify, // serialize function
    decode: JSON.parse // deserialize function
  })
})

//(Search query name/matched people records) pairs
const peopleKeyv = new Keyv( {
  store: new KeyvFile({
    filename: `./people.json`,
    writeDelay: 100,
    encode: JSON.stringify,
    decode: JSON.parse
  })
})

module.exports = async (req, res) => {
  let searchName = req.query.name.toLowerCase()

  if (searchName === '') {
    return res.json([])
  }

  //Check if name has already been requested
  let cachedNameRequest = await peopleKeyv.get(searchName)
  if (cachedNameRequest) {
    console.log(`cached response for ?name=${searchName}`, cachedNameRequest)
    return res.json(cachedNameRequest)
  } else {
    try {
      let response = await axios.get(SWAPI_PEOPLE, {
        params: {
          search: searchName
        }
      })

      let requestedPeople = await getPeopleFromPeopleData(response.data, searchName)
      res.json(requestedPeople)

    } catch (err) {
      res.status(500).send('Internal server error')
    }
  }
}

const getPeopleFromPeopleData = async (data, requestedName) => {
  if (data.count === 0) {
    return []
  } else {
    let records = getPeopleRecords(data.results)
    let planets = await getPlanetNames(records.map( el => el.homeworld))
    let resolvedRecords = resolveHomeworlds(records, planets)

    //Cache people record for requestedName
    peopleKeyv.set(requestedName, resolvedRecords)

    return resolvedRecords
  }
}

const getPeopleRecords = (arr) => {
  let records = arr.reduce((acc, cur) => {
    let record = {}
    record.name = cur.name
    record.gender = cur.gender
    record.homeworld = cur.homeworld
    acc.push(record)
    return acc
  }, [])
  return records
}

const getPlanetNames = async (urls) => {
  let planets = []
  let SWAPIAPlanetAxiosGetPromises = []

  let planetsKeyvGetPromises = urls.map( url => {
    return planetsKeyv.get(url)
  })

  try {
    let resolvedPlanetsGetPromises = await Promise.all(planetsKeyvGetPromises)
    resolvedPlanetsGetPromises.forEach( (el, index) => {
      if (el) {
        console.log('planet from planetsKeyv', el)
        planets.push({
          name: el,
          homeworldURL: urls[index]
        })
      } else {
        SWAPIAPlanetAxiosGetPromises.push(axios.get(urls[index]))
      }
    }, [])
  } catch (err) {
    return []
  }

  try {
    let rawPlanetsData = await Promise.all(SWAPIAPlanetAxiosGetPromises)
    let planetKeyvSetPromises = []
    let fetchedPlanets = rawPlanetsData.map((el) => {
      console.log('planet from SWAPI PLANET', el.data.name)
      planetKeyvSetPromises.push(planetsKeyv.set(el.data.url, el.data.name))
      return {
        name: el.data.name,
        homeworldURL: el.data.url
      }
    })
    await Promise.all(planetKeyvSetPromises)
    return planets.concat(fetchedPlanets)
  } catch (err) {
    return []
  }
}

const resolveHomeworlds = (records, planets) => {
  let resolved = records.map(record => {
    record.homeworld = planets.find( planet => planet.homeworldURL === record.homeworld).name
    return record
  })
  return resolved
}

