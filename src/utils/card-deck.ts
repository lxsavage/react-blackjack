import type { Card } from "../interfaces/Card";
import { Suit, type CardSuit } from "../types/CardSuit";
import { Value, type CardValue } from "../types/CardValue";

export function initializeDeck(): Card[] {
  const deck: Card[] = [];

  // Populate
  for (const suit of Object.values(Suit) as CardSuit[]) {
    for (const value of Object.values(Value) as CardValue[]) {
      const newCard: Card = { suit, value };
      deck.push(newCard);
    }
  }

  // Shuffle
  let currentPos = deck.length;
  while (currentPos > 0) {
    const randomPos = Math.floor(Math.random() * currentPos--);
    const temp = deck[currentPos];
    deck[currentPos] = deck[randomPos];
    deck[randomPos] = temp;
  }

  return deck;
}

export function dealCards(
  deck: Card[],
  count: number,
): {
  newDeck: Card[];
  dealtCards: Card[];
} {
  const newDeck = [...deck];
  const dealtCards = [];

  for (let _ = 0; _ < count; _++) {
    const card = newDeck.pop();
    if (!card) break;
    dealtCards.push(card);
  }

  return { newDeck, dealtCards };
}
