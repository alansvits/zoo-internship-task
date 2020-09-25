# Task #1

Using [SWAPI](https://swapi.dev/documentation#people) (The Star Wars API), build a service allowing search over `/people` resource by `name`.

Run `yarn test` to ensure your functionality works as expected.

Your `express` server needs to be exported from `index.js` as `app` in order for the tests to work

Keep in mind the rate limit of SWAPI - it only allows for 10000 requests per day - so you might want to optimize your server

# Task #2

Build front end application that uses `/search-people` API and provides typeahead functionality that implements the following scenario:

```
As a user
I visit http://localhost:4000/search
I type "Luke Skywal" in the "Search" input
I see the dropdown containing "Luke Skywalker"
I click on "Luke Skywalker"
"Search" input value is "Luke Skywalker (Tatooine)"
```
