const axios = require('axios')

exports.createRecords = (arr) => {
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

exports.getPlanetNames = async (urls) => {
  let requests = urls.map(function(url) {
    return axios.get(url)
  })
  try {
    let rawPlanets = await Promise.all(requests)
    let planets = rawPlanets.map((el) => {
      return {
        name: el.data.name,
        homeworld: el.data.url
      }
    })
    return planets
  } catch (err) {
    return []
  }
}

exports.resolveHomeworlds = (records, planets) => {
  let resolved = records.map(record => {
    record.homeworld = planets.find( planet => planet.homeworld === record.homeworld).name
    return record
  })
  return resolved
}
