# Contract: store.js

**File**: `js/store.js`
**Role**: Central State Store. Single source of truth for all parametric input state. All UI components read from and write to this module only — never to each other.

---

## API

### getState() → TowerConfiguration

Returns a shallow copy of the current state object. Always safe to read; never mutate the returned object directly.

```javascript
getState() → {
  floors:          number,   // integer 2–71
  bouwmethodiek:   string,   // one of four bouwmethodiek keys
  installatie:     string,   // 'business_as_usual' in Material module
}
```

### setState(updates) → void

Merges `updates` into the current state and synchronously notifies all subscribers.

```javascript
setState({ floors: 12 })
setState({ bouwmethodiek: 'hoogwaardig_hybride' })
setState({ floors: 15, bouwmethodiek: 'max_innovatief' })  // batch update
```

- Clamps `floors` to [2, 71] before storing.
- Validates `bouwmethodiek` against the four valid keys; ignores invalid values.
- Calls all subscriber callbacks synchronously in insertion order.

### subscribe(fn) → unsubscribeFn

Registers a callback that fires on every `setState` call. The callback receives the new state and the previous state.

```javascript
const unsubscribe = subscribe((newState, prevState) => {
  const impact = getImpact(625, newState.floors * 3.5, newState.bouwmethodiek, ...);
  // update UI
});

// To stop listening:
unsubscribe();
```

- The callback is called **immediately** on subscription with the current state (so components can initialise without a separate call).
- `prevState` is `null` on the immediate initial call.

---

## Default state

```javascript
{
  floors:        10,
  bouwmethodiek: 'business_as_usual',
  installatie:   'business_as_usual',
}
```

---

## Constraints

- `store.js` is the **only** file that holds parametric state. UI components MUST NOT maintain their own copy of floors or bouwmethodiek.
- `viewer/`, `charts/`, and `ui/` files subscribe to `store.js` — they NEVER import from each other.
- `store.js` MUST NOT import from `getImpact.js` or any data file — it holds only the user's input, not computed results.
