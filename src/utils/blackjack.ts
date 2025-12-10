import type { Card } from "../interfaces/Card";
import { Value, type CardValue } from "../types/CardValue";
import * as CardDeck from "./card-deck";

export function calculateScore(hand: Card[]): number {
  let score = 0;

  for (const card of hand) {
    if (isNaN(Number(card.value))) {
      switch (card.value as CardValue) {
        case Value.JACK:
        case Value.QUEEN:
        case Value.KING:
          score += 10;
          break;
        case Value.ACE:
          score += 11;
          break;
        default:
          break;
      }
    } else {
      score += ~~card.value;
    }
  }

  return score;
}

export function calculateHandResult(playerScore: number, dealerScore: number, playerBet: number): number {
  let result = 0;
  if (playerScore > 21 || (dealerScore <= 21 && playerScore < dealerScore)) {
    // Dealer wins
    result = -playerBet;
  } else if (dealerScore > 21 || (playerScore <= 21 && playerScore > dealerScore)) {
    // Player wins
    result = playerBet
  }

  return result;
}

export function dealerTurn(deck: Card[], dealerHand: Card[], dealerScore: number): {
  newDealerHand: Card[],
  newDealerScore: number
} {
  const newDealerHand = [...dealerHand];

  let newDealerScore = dealerScore;
  let turnDeck = [...deck];

  while (newDealerScore < 17) {
    // Hit
    const { newDeck, dealtCards } = CardDeck.dealCards(turnDeck, 1);
    turnDeck = newDeck;

    newDealerHand.push(...dealtCards);
    newDealerScore = calculateScore(newDealerHand);
  }

  return { newDealerHand, newDealerScore };
}
