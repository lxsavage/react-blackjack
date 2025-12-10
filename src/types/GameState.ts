export const State = {
  OUT_OF_MONEY: 'OutOfMoney',
  PLACE_BET: 'Bet',
  PLAY: 'Play',
  STAND: 'Stand'
} as const;
export type GameState = typeof State[keyof typeof State];
