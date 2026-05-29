import { Division } from './division.js';

export const CITY_NAMES = [
  'Bruckental',
  'Eisenfeldt',
  'Kronwiese',
  'Waldbrücke',
  'Hohenfelsau',
  'Rabenhorstheim',
  'Lindenhafen',
  'Steinmarken',
  'Falkenrode',
  'Dornwacht',
  'Grünewelden',
  'Kesselbrück',
  'Auerhafen',
  'Wolfsriedt',
  'Morgenfeldt',
  'Novargrad',
  'Volchinsk',
  'Mirovsk',
  'Karskaya',
  'Drovograd',
  'Belosk',
  'Veyrensk',
  'Zalinsk',
  'Ostrovgrad',
  'Severinsk',
  'Dunavsk',
  'Morozgrad',
  'Petroven',
  'Lugovsk',
  'Starenburg',
];

function createStartingTeams() {
  return [
    { id: 1, name: 'Blue Company', cash: 100.0, manpower: 50.0 },
    { id: 2, name: 'Red Company', cash: 100.0, manpower: 50.0 },
    { id: 3, name: 'Green Company', cash: 100.0, manpower: 50.0 },
  ];
}

function createCitySeeds(canvasWidth, canvasHeight) {
  const cityLayouts = [
    { team: 1, name: CITY_NAMES[0], x: 0.18, y: 0.16 },
    { team: 1, name: CITY_NAMES[1], x: 0.26, y: 0.34 },
    { team: 1, name: CITY_NAMES[2], x: 0.15, y: 0.56 },
    { team: 1, name: CITY_NAMES[3], x: 0.30, y: 0.72 },
    { team: 2, name: CITY_NAMES[4], x: 0.78, y: 0.18 },
    { team: 2, name: CITY_NAMES[5], x: 0.70, y: 0.42 },
    { team: 2, name: CITY_NAMES[6], x: 0.84, y: 0.68 },
    { team: 3, name: CITY_NAMES[7], x: 0.48, y: 0.62 },
    { team: 3, name: CITY_NAMES[8], x: 0.55, y: 0.76 },
    { team: 3, name: CITY_NAMES[9], x: 0.47, y: 0.90 },
  ];

  return cityLayouts.map((city) => ({
    ...city,
    x: city.x * canvasWidth,
    y: city.y * canvasHeight,
  }));
}

export function createBasicScenario(canvasWidth, canvasHeight) {
  const midX = canvasWidth / 2;
  const midY = canvasHeight / 2;
  const horizontalOffset = 260;
  const verticalOffset = 120;
  const greenStartY = canvasHeight * 0.78;
  const greenHorizontalOffset = 110;
  const greenVerticalOffset = 85;

  return {
    teams: createStartingTeams(),
    citySeeds: createCitySeeds(canvasWidth, canvasHeight),
    divisions: [
      new Division({
        team: 1,
        type: 'infantry',
        position: { x: midX - horizontalOffset, y: midY - verticalOffset },
        targetPosition: { x: midX - horizontalOffset, y: midY - verticalOffset },
        speed: 40,
      }),
      new Division({
        team: 1,
        type: 'cavalry',
        position: { x: midX - horizontalOffset, y: midY + verticalOffset },
        targetPosition: { x: midX - horizontalOffset, y: midY + verticalOffset },
        speed: 65,
      }),
      new Division({
        team: 2,
        type: 'infantry',
        position: { x: midX + horizontalOffset, y: midY - verticalOffset },
        targetPosition: { x: midX + horizontalOffset, y: midY - verticalOffset },
        speed: 40,
      }),
      new Division({
        team: 2,
        type: 'cavalry',
        position: { x: midX + horizontalOffset, y: midY + verticalOffset },
        targetPosition: { x: midX + horizontalOffset, y: midY + verticalOffset },
        speed: 65,
      }),
      new Division({
        team: 3,
        type: 'infantry',
        position: {
          x: midX - greenHorizontalOffset,
          y: greenStartY - greenVerticalOffset,
        },
        targetPosition: {
          x: midX - greenHorizontalOffset,
          y: greenStartY - greenVerticalOffset,
        },
        speed: 40,
      }),
      new Division({
        team: 3,
        type: 'cavalry',
        position: {
          x: midX + greenHorizontalOffset,
          y: greenStartY + greenVerticalOffset,
        },
        targetPosition: {
          x: midX + greenHorizontalOffset,
          y: greenStartY + greenVerticalOffset,
        },
        speed: 65,
      }),
    ],
  };
}
