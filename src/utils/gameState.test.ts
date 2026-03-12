import test from 'node:test'
import assert from 'node:assert/strict'

import type { CharacterType, Faction } from '../types/gameTypes.ts'
import { getClientGamePhase, getPlayerRoundKey } from './gameState.ts'

test('maps waiting server phase to setup on the client', () => {
  assert.equal(getClientGamePhase('waiting'), 'setup')
  assert.equal(getClientGamePhase(undefined), 'setup')
})

test('preserves playing and ended phases on the client', () => {
  assert.equal(getClientGamePhase('playing'), 'playing')
  assert.equal(getClientGamePhase('ended'), 'ended')
})

test('uses access code in the player round key so a new round resets local UI state', () => {
  const previousRoundKey = getPlayerRoundKey({
    id: 3,
    accessCode: 'round-one',
    characterType: 10 as CharacterType,
    faction: 'neutral' as Faction,
    rank: 10,
  })

  const nextRoundKey = getPlayerRoundKey({
    id: 3,
    accessCode: 'round-two',
    characterType: 10 as CharacterType,
    faction: 'neutral' as Faction,
    rank: 10,
  })

  assert.notEqual(previousRoundKey, nextRoundKey)
})
