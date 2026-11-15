# Eat Out

Can't decide where to eat? Eat Out picks a random restaurant, café or fast-food place near you.

**Live site: https://kartikanand.github.io/eat-out/**

Static site: plain HTML, CSS and ES modules. No framework, no build step, no backend, no API keys.

- **Places:** [OpenStreetMap](https://www.openstreetmap.org/copyright) data (© OpenStreetMap contributors, ODbL).
  Queried from the public Overpass instances `overpass-api.de` and `overpass.private.coffee` in parallel
  (first answer wins; both are listed on the [OSM wiki](https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances)). If they are all down or slow,
  it falls back to Nominatim, which returns up to 40 restaurants. Results are cached per session.
  These are free community services, so please keep usage light; see their usage policies on the wiki and for
  [Nominatim](https://operations.osmfoundation.org/policies/nominatim/).
- **Location:** browser Geolocation API
- **Distance:** straight-line (haversine), computed locally

## Run locally

```sh
npm start   # python3 -m http.server 8080, then open http://localhost:8080
npm test    # node --test
```

Geolocation needs `localhost` or HTTPS.

## Deployment

GitHub Actions (`.github/workflows/ci.yml`) runs the tests on every PR. Pushes to `main` deploy to GitHub Pages.

## License

MIT
