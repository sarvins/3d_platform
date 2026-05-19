export default {
  "data_version": "0.1.0-placeholder",
  "_note": "Indicatieve waarden — verificatie met team vereist voor adviesgebruik.",
  "base": {
    "business_as_usual": {
      "verwarming": 15.0, "koeling": 5.0, "ventilatie": 6.0,
      "verlichting": 8.0, "warmtapwater": 7.0, "lift": 2.0, "gebruikers": 2.0
    },
    "high_tech": {
      "verwarming": 8.0, "koeling": 4.0, "ventilatie": 4.0,
      "verlichting": 5.0, "warmtapwater": 5.0, "lift": 2.0, "gebruikers": 2.0
    },
    "natuurlijk": {
      "verwarming": 5.0, "koeling": 3.0, "ventilatie": 8.0,
      "verlichting": 4.0, "warmtapwater": 3.0, "lift": 1.0, "gebruikers": 1.0
    }
  },
  "lift_scale": {
    "below_9": 0.5,
    "9_to_27": 1.0,
    "28_to_37": 1.3,
    "above_38": 1.6
  },
  "adjustments": {
    "zonwering": {
      "extern":         { "koeling": 0.70 },
      "intern":         { "koeling": 0.90 },
      "zonwerend_glas": { "koeling": 0.85 }
    },
    "balkons": {
      "buiten":    { "verwarming": 0.97 },
      "binnen":    { "verwarming": 1.00 },
      "gevellijn": { "verwarming": 0.99 }
    },
    "raamOppervlak": {
      "30": { "verwarming": 0.80, "koeling": 0.70 },
      "40": { "verwarming": 0.88, "koeling": 0.80 },
      "50": {},
      "60": { "verwarming": 1.10, "koeling": 1.15 },
      "70": { "verwarming": 1.20, "koeling": 1.28 },
      "80": { "verwarming": 1.30, "koeling": 1.40 }
    },
    "isolatieRc": {
      "3": { "verwarming": 1.30 },
      "4": { "verwarming": 1.15 },
      "5": {},
      "6": { "verwarming": 0.90 },
      "7": { "verwarming": 0.80 },
      "8": { "verwarming": 0.70 }
    },
    "luchtdichtheid": {
      "0": { "ventilatie": 0.85 },
      "1": { "ventilatie": 0.89 },
      "2": { "ventilatie": 0.92 },
      "3": { "ventilatie": 0.96 },
      "4": {}
    },
    "liftEfficiency": {
      "0": { "lift": 0.60 },
      "1": { "lift": 0.70 },
      "2": { "lift": 0.80 },
      "3": { "lift": 0.90 },
      "4": {}
    }
  }
};
