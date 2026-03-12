import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlayerNameMap, mergePlayerNames } from './playerNameUtils.js';

test('preserves custom names when a new game is started by the host', () => {
  const roomPlayerIdentities = [
    { id: 1, name: 'Alice' },
    { id: 2 },
    { id: 3, name: 'Charlie' }
  ];

  const currentGamePlayers = [
    { id: 2, name: 'Bobby' },
    { id: 4, name: 'Dana' }
  ];

  const regeneratedPlayers = [
    { id: 1, characterType: 1 },
    { id: 2, characterType: 2 },
    { id: 3, characterType: 3 },
    { id: 4, characterType: 4 }
  ];

  const previousNames = buildPlayerNameMap(roomPlayerIdentities, currentGamePlayers);
  const mergedPlayers = mergePlayerNames(regeneratedPlayers, previousNames);

  assert.deepEqual(mergedPlayers, [
    { id: 1, characterType: 1, name: 'Alice' },
    { id: 2, characterType: 2, name: 'Bobby' },
    { id: 3, characterType: 3, name: 'Charlie' },
    { id: 4, characterType: 4, name: 'Dana' }
  ]);
});

test('ignores players without custom names and handles invalid collections', () => {
  const previousNames = buildPlayerNameMap(
    undefined,
    [{ id: 1 }, { id: 2, name: 'Eva' }]
  );

  const regeneratedPlayers = [
    { id: 1, characterType: 5 },
    { id: 2, characterType: 6 },
    { id: 3, characterType: 7 }
  ];

  const mergedPlayers = mergePlayerNames(regeneratedPlayers, previousNames);

  assert.deepEqual(mergedPlayers, [
    { id: 1, characterType: 5 },
    { id: 2, characterType: 6, name: 'Eva' },
    { id: 3, characterType: 7 }
  ]);
});
