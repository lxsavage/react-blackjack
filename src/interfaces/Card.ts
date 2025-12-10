import type { CardSuit } from "../types/CardSuit";
import type { CardValue } from "../types/CardValue";

export interface Card {
  value: CardValue,
  suit: CardSuit
}
