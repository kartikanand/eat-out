import { getPosition } from './geo.js';
import { formatDistance, radiusOptions, usesMiles } from './units.js';
import { findPlaces } from './places.js';
import { shuffle } from './random.js';

const $ = (id) => document.getElementById(id);
const els = {
  start: $('start'),
  again: $('again'),
  status: $('status'),
  card: $('card'),
  name: $('name'),
  chips: $('chips'),
  details: $('details'),
  form: $('form'),
  links: $('links'),
  radius: $('radius'),
};

const imperial = usesMiles();
let queue = [];

// default to the middle option (1.5 km or 1 mile)
const options = radiusOptions({ imperial });
els.radius.replaceChildren(
  ...options.map(({ metres, label }, i) => new Option(label, String(metres), false, i === 2)),
);

function setStatus(message) {
  els.status.textContent = message;
  els.status.hidden = !message;
}

function link(href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function show(place) {
  els.name.textContent = place.name;

  const li = (text) => Object.assign(document.createElement('li'), { textContent: text });
  els.chips.replaceChildren(
    ...[place.kind?.replaceAll('_', ' '), ...place.cuisines, `${formatDistance(place.distance, { imperial })} away`]
      .filter(Boolean)
      .map(li),
  );
  els.details.replaceChildren(
    ...[place.address, place.openingHours && `Hours: ${place.openingHours}`, place.phone && `Phone: ${place.phone}`]
      .filter(Boolean)
      .map(li),
  );

  const links = [
    link(`https://www.openstreetmap.org/directions?to=${place.lat}%2C${place.lon}`, 'Directions'),
    link(`https://www.openstreetmap.org/${place.id}`, 'View on OSM'),
  ];
  if (place.website) links.unshift(link(place.website, 'Website'));
  els.links.replaceChildren(...links);

  els.card.hidden = false;
  els.again.hidden = queue.length === 0;
}

function next() {
  const place = queue.shift();
  if (place) show(place);
}

async function start() {
  els.start.disabled = true;
  els.card.hidden = true;
  els.again.hidden = true;
  try {
    setStatus('Finding your location…');
    const origin = await getPosition();
    setStatus('Looking for places nearby…');
    const places = await findPlaces(origin, Number(els.radius.value));
    if (places.length === 0) {
      setStatus('No restaurants found nearby. Try a larger radius.');
      return;
    }
    queue = shuffle(places);
    setStatus('');
    next();
  } catch (err) {
    setStatus(err.message);
  } finally {
    els.start.disabled = false;
  }
}

els.form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  start();
});
els.again.addEventListener('click', next);
