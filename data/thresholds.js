export default {
  "data_version": "0.1.0-placeholder",
  "thresholds": [
    {
      "floors": 9, "height_m": 31.5, "gfa_m2": 625, "effect": "elevator_1",
      "threshold_reached": "1e lift vereist",
      "label": "Voorbij 9 verdiepingen is een lift verplicht. Dit verhoogt de CO₂-voetafdruk aanzienlijk door extra constructie en liftinstallatie.",
      "confirmed": true
    },
    {
      "floors": 16, "height_m": 56.0, "gfa_m2": 625, "effect": "elevator_2",
      "threshold_reached": "2e lift vereist",
      "label": "Boven 16 verdiepingen is een tweede lift noodzakelijk voor de vlucht- en gebruikscapaciteit.",
      "confirmed": true
    },
    {
      "floors": 28, "height_m": 98.0, "gfa_m2": 625, "effect": "elevator_3",
      "threshold_reached": "3e lift vereist",
      "label": "Boven 28 verdiepingen vereist de verkeersintensiteit een derde lift. De CO₂-piek is zichtbaar in de grafiek.",
      "confirmed": true
    },
    {
      "floors": 38, "height_m": 133.0, "gfa_m2": 625, "effect": "elevator_4",
      "threshold_reached": "4e lift vereist",
      "label": "Boven 38 verdiepingen is een vierde lift noodzakelijk. Stabiliteit via schilconstructie.",
      "confirmed": true
    },
    {
      "floors": 71, "height_m": 248.5, "gfa_m2": 625, "effect": "elevator_5",
      "threshold_reached": "5e lift vereist — maximale hoogte",
      "label": "Op 71 verdiepingen is de maximale hoogte bereikt. Vijf liften vereist. Volledige schilstabiliteit is het dominante structuursysteem.",
      "confirmed": true
    }
  ]
};
