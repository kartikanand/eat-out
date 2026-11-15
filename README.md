# Eat Out

Can't decide where to eat? Eat Out picks a random restaurant, café or fast-food place near you.

Static site: plain HTML, CSS and ES modules. No framework, no build step, no backend, no API keys.

- **Places:** [OpenStreetMap](https://www.openstreetmap.org/copyright) via the Overpass API (data © OpenStreetMap contributors, ODbL)
- **Location:** browser Geolocation API
- **Distance:** straight-line (haversine), computed locally

## Run locally

```sh
npm start   # python3 -m http.server 8080, then open http://localhost:8080
npm test    # node --test
```

Geolocation needs `localhost` or HTTPS.

## License

MIT
