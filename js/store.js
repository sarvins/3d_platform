const VALID_BOUWMETHODIEK = new Set([
  'business_as_usual',
  'hoogwaardig_hybride',
  'best_practice_biobased',
  'max_innovatief',
]);

const _state = {
  floors: 10,
  bouwmethodiek: 'business_as_usual',
  installatie: 'business_as_usual',
};

const _listeners = new Set();

export function getState() {
  return { ..._state };
}

export function setState(updates) {
  const prev = { ..._state };
  if (updates.floors !== undefined) {
    _state.floors = Math.max(2, Math.min(71, Math.round(updates.floors)));
  }
  if (updates.bouwmethodiek !== undefined && VALID_BOUWMETHODIEK.has(updates.bouwmethodiek)) {
    _state.bouwmethodiek = updates.bouwmethodiek;
  }
  if (updates.installatie !== undefined) {
    _state.installatie = updates.installatie;
  }
  _listeners.forEach(fn => fn({ ..._state }, prev));
}

export function subscribe(fn) {
  _listeners.add(fn);
  fn({ ..._state }, null);
  return () => _listeners.delete(fn);
}
