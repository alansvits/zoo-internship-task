const express = require("express");

const app = express();

app.get("/search-people", (req, res) => {
  res.json([
    {
      homeworld: "Tatooine",
      name: "Luke Skywalker",
      gender: "male",
    },
  ]);
});

exports.app = app;

if (process.env.NODE_ENV !== "test") {
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}
