export const blockedPlayerNames = new Set([
  '皇阿玛',
  '太上皇',
  '皇爸玛',
  '我爹',
  '爹',
  '我大爷'
]);

export const isPlayerNameAllowed = name => {
  if (typeof name !== 'string') {
    return false;
  }

  return !blockedPlayerNames.has(name.trim());
};

export const buildPlayerNameMap = (...playerCollections) => {
  const nameMap = new Map();

  playerCollections
    .filter(Boolean)
    .forEach(collection => {
      collection
        .filter(player => player && typeof player.id === 'number' && player.name)
        .forEach(player => {
          nameMap.set(player.id, player.name);
        });
    });

  return nameMap;
};

export const mergePlayerNames = (players, nameMap) => {
  if (!Array.isArray(players) || !(nameMap instanceof Map)) {
    return players;
  }

  return players.map(player => {
    if (!player || typeof player.id !== 'number') {
      return player;
    }

    const preservedName = nameMap.get(player.id);
    return preservedName ? { ...player, name: preservedName } : player;
  });
};
