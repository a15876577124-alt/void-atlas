export const scenes = [
  { id: 'galaxy', name: 'Spiral Galaxy', kicker: '01 / THE ORIGIN', title: 'A little closer<br>to <em>infinity.</em>', description: 'Somewhere between silence and a billion stars.<br>A small invitation to lose your sense of scale.', coordinate: 'RA 00h 42m / DEC +41°' },
  { id: 'horizon', name: 'Event Horizon', kicker: '02 / THE COLLAPSE', title: 'At the edge<br>of <em>everything.</em>', description: 'Where light bends, and time forgets its way.<br>There is beauty in the things we cannot see.', coordinate: 'RA 17h 45m / DEC −29°' },
  { id: 'nebula', name: 'Cosmic Nebula', kicker: '03 / THE REBIRTH', title: 'From dust,<br>new <em>beginnings.</em>', description: 'A thousand colours in the quiet of the dark.<br>From the dust of old stars, something new.', coordinate: 'RA 05h 35m / DEC −05°' },
];

export function sceneFromHash(hash) {
  const index = scenes.findIndex(scene => `#${scene.id}` === hash);
  return index < 0 ? 0 : index;
}
