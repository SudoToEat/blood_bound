import type { Player } from '../types/gameTypes'

export type ClientGamePhase = 'setup' | 'playing' | 'ended'

type RoundKeyPlayer = Pick<Player, 'id' | 'accessCode' | 'characterType' | 'faction' | 'rank'>

export function getClientGamePhase(serverPhase?: string | null): ClientGamePhase {
  if (serverPhase === 'playing') {
    return 'playing'
  }

  if (serverPhase === 'ended') {
    return 'ended'
  }

  return 'setup'
}

export function getPlayerRoundKey(player?: Partial<RoundKeyPlayer> | null): string {
  if (!player) {
    return 'missing-player'
  }

  return [
    player.id ?? 'unknown-id',
    player.accessCode ?? 'missing-access-code',
    player.characterType ?? 'missing-character',
    player.faction ?? 'missing-faction',
    player.rank ?? 'missing-rank',
  ].join(':')
}
