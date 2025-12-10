export const Suit = {
  CLUB: 'Clubs',
  SPADE: 'Spades',
  HEART: 'Hearts',
  DIAMOND: 'Diamonds'
} as const;
export type CardSuit = typeof Suit[keyof typeof Suit];
