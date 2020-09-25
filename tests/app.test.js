const assert = require("assert");
const request = require("supertest");
const { app } = require("../index");

describe("/search-people", () => {
  const testInput = [
    {
      input: ["Luke Skywalker", "luke skywalker", "luke skyw"],
      expected: {
        homeworld: "Tatooine",
        name: "Luke Skywalker",
        gender: "male",
      },
    },
    {
      input: ["Darth Vader", "darth vade", "darth Vader"],
      expected: {
        homeworld: "Tatooine",
        name: "Darth Vader",
        gender: "male",
      },
    },
    {
      input: ["Leia Organa", "leia organa", "leia Org"],
      expected: {
        homeworld: "Alderaan",
        name: "Leia Organa",
        gender: "female",
      },
    },
  ];

  testInput.forEach(({ input, expected }) => {
    input.forEach((name) => {
      it(`should find list with matched people and their homeworlds by name ("${name}")`, (done) => {
        request(app)
          .get(`/search-people?name=${name}`)
          .expect("Content-Type", /json/)
          .expect(200)
          .then((res) => {
            assert.deepStrictEqual(res.body[0], expected);
          })
          .then(done);
      });
    });
  });

  it("should return empty list for non-StarWars people", (done) => {
    request(app)
      .get(`/search-people?name=Keanu%20Reeves`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        assert.deepStrictEqual(res.body, []);
      })
      .then(done);
  });
});
