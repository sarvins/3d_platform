const VALID_BOUWMETHODIEK = new Set([
  'business_as_usual', 'hoogwaardig_hybride', 'best_practice_biobased', 'max_innovatief',
]);

const VALID_STEP2 = {
  balkons:       new Set(['buiten', 'binnen', 'gevellijn']),
  zonwering:     new Set(['extern', 'intern', 'zonwerend_glas']),
  raamOppervlak: new Set([30, 40, 50, 60, 70, 80]),
  isolatieRc:    new Set([3, 4, 5, 6, 7, 8]),
  luchtdichtheid:new Set([0, 1, 2, 3, 4]),
  liftEfficiency:new Set([0, 1, 2, 3, 4]),
};

const DEFAULT_STEP2 = {
  balkons: 'buiten', zonwering: 'extern', raamOppervlak: 50,
  isolatieRc: 5, luchtdichtheid: 4, liftEfficiency: 4,
};

const _state = {
  floors: 10,
  bouwmethodiek: 'business_as_usual',
  installatie: 'business_as_usual',
  step2: { ...DEFAULT_STEP2 },
};

const _listeners = new Set();

export function getState() {
  return { ..._state, step2: { ..._state.step2 } };
}

export function setState(updates) {
  const prev = getState();
  if (updates.floors !== undefined) {
    _state.floors = Math.max(2, Math.min(71, Math.round(updates.floors)));
  }
  if (updates.bouwmethodiek !== undefined && VALID_BOUWMETHODIEK.has(updates.bouwmethodiek)) {
    _state.bouwmethodiek = updates.bouwmethodiek;
  }
  if (updates.installatie !== undefined) {
    _state.installatie = updates.installatie;
  }
  if (updates.step2 !== undefined) {
    const s2 = updates.step2;
    if (s2.balkons       !== undefined && VALID_STEP2.balkons.has(s2.balkons))             _state.step2.balkons = s2.balkons;
    if (s2.zonwering     !== undefined && VALID_STEP2.zonwering.has(s2.zonwering))         _state.step2.zonwering = s2.zonwering;
    if (s2.raamOppervlak !== undefined && VALID_STEP2.raamOppervlak.has(s2.raamOppervlak)) _state.step2.raamOppervlak = s2.raamOppervlak;
    if (s2.isolatieRc    !== undefined && VALID_STEP2.isolatieRc.has(s2.isolatieRc))       _state.step2.isolatieRc = s2.isolatieRc;
    if (s2.luchtdichtheid !== undefined && VALID_STEP2.luchtdichtheid.has(s2.luchtdichtheid)) _state.step2.luchtdichtheid = s2.luchtdichtheid;
    if (s2.liftEfficiency !== undefined && VALID_STEP2.liftEfficiency.has(s2.liftEfficiency)) _state.step2.liftEfficiency = s2.liftEfficiency;
  }
  _listeners.forEach(fn => fn(getState(), prev));
}

export function subscribe(fn) {
  _listeners.add(fn);
  fn(getState(), null);
  return () => _listeners.delete(fn);
}

export { DEFAULT_STEP2 };
