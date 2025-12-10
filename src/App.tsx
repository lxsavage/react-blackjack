import { useState } from "react";
import { Suit, type CardSuit } from './types/CardSuit';
import { Value, type CardValue } from './types/CardValue';
import { State, type GameState } from './types/GameState';

import { LogPanel } from "./LogPanel";
import type { Card } from "./interfaces/Card";
import CardDisplay from "./CardDisplay";

import './App.scss';

function initializeDeck(): Card[] {
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
    const randomPos = Math.floor(Math.random() * currentPos);
    --currentPos;

    const temp = deck[currentPos];
    deck[currentPos] = deck[randomPos];
    deck[randomPos] = temp;
  }

  return deck;
}

function dealCards(deck: Card[], count: number): {
  newDeck: Card[],
  dealtCards: Card[]
} {
  const newDeck = [...deck];
  const dealtCards = [];

  for (let i = 0; i < count; i++) {
    const card = newDeck.pop();
    if (!card) break;
    dealtCards.push(card);
  }

  return { newDeck, dealtCards };
}

function calculateScore(hand: Card[]): number {
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

function calculateHandResult(playerScore: number, dealerScore: number, playerBet: number): number {
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

function dealerTurn(deck: Card[], dealerHand: Card[], dealerScore: number): {
  newDealerHand: Card[],
  newDealerScore: number
} {
  const newDealerHand = [...dealerHand];

  let newDealerScore = dealerScore;
  let turnDeck = [...deck];

  while (newDealerScore < 17) {
    // Hit
    const { newDeck, dealtCards } = dealCards(turnDeck, 1);
    turnDeck = newDeck;

    newDealerHand.push(...dealtCards);
    newDealerScore = calculateScore(newDealerHand);
  }

  return { newDealerHand, newDealerScore };
}

function App() {
  const [handNumber, setHandNumber] = useState(0);

  const [logsCollapsed, setLogsCollapsed] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const [playerMoney, setPlayerMoney] = useState(0);

  const [state, setState] = useState<GameState>(State.OUT_OF_MONEY)
  const [deck, setDeck] = useState<Card[]>([]);

  const [playerBet, setPlayerBet] = useState(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [dealerScore, setDealerScore] = useState<number>(0);

  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  function log(message: string) {
    const newLogs = [...logs];
    console.log(message);
    newLogs.unshift(message);
    setLogs(newLogs);
  }

  function nextRound() {
    const deck = initializeDeck();
    const newHandCount = handNumber + 1;
    log('Started hand #' + newHandCount);

    const { newDeck, dealtCards } = dealCards(deck, 3);
    const dealerCard = dealtCards[0];
    const playerCards = dealtCards.slice(1);

    setPlayerScore(0);
    setDealerScore(0);

    setDeck(newDeck);

    setPlayerHand(dealtCards.slice(1));
    setPlayerScore(calculateScore(playerCards));

    setDealerHand(dealtCards.slice(0, 1));
    setDealerScore(calculateScore([dealerCard]))

    setHandNumber(newHandCount);
    setState(State.PLACE_BET);
  }

  function newGame() {
    setPlayerMoney(200);
    setState(State.PLACE_BET);
    nextRound();
  }

  function stand(handScore: number) {
    setState(State.STAND);

    const { newDealerHand, newDealerScore } = dealerTurn(deck, dealerHand, dealerScore);
    if (newDealerScore > 21) log('Dealer bust!');

    const betResult = calculateHandResult(handScore, newDealerScore, playerBet);

    if (betResult > 0) log('Player wins');
    else if (betResult < 0) log('Dealer wins');
    else log('Draw');

    const newPlayerMoney = playerMoney + betResult;

    setDealerHand(newDealerHand);
    setDealerScore(newDealerScore);
    setPlayerMoney(newPlayerMoney);
    setPlayerBet(0);

    if (newPlayerMoney <= 0) {
      setState(State.OUT_OF_MONEY);
      return;
    }
  }

  function hit() {
    const { newDeck, dealtCards } = dealCards(deck, 1);
    const newPlayerHand = [...playerHand, ...dealtCards];
    const newPlayerScore = calculateScore(newPlayerHand);

    log(`Player hit, receiving a ${dealtCards[0].value} of ${dealtCards[0].suit}.`)

    setPlayerHand(newPlayerHand);
    setPlayerScore(newPlayerScore);
    setDeck(newDeck);

    if (newPlayerScore > 21) {
      log('Player bust!');
      stand(newPlayerScore);
    }
  }

  function placeBet() {
    log('Player placed bet of $' + playerBet);
    setState(State.PLAY)
  }

  return (
    <>
      <div>
        <ul>
          <li>
            Money: ${playerMoney}
            {state === State.PLAY && (
              <ul>
                <li>Bet: ${playerBet}</li>
              </ul>
            )}
          </li>
          {handNumber > 0 && (
            <li>Hand #{handNumber}</li>
          )}
        </ul>
      </div>
      <hr />
      {playerMoney === 0 && (
        <>
          <p>You are out of money!</p>
          <button onClick={newGame}>New game</button>
        </>
      )}
      {playerMoney > 0 && (
        <>
          {state === State.PLACE_BET && (
            <>
              <input type="number" placeholder="Bet amount" name="f_bet" onChange={(e) => setPlayerBet(Number(e.target.value))} />
              <button onClick={placeBet} disabled={playerBet <= 0 || playerBet > playerMoney}>Place bet</button>
            </>
          )}

          {(state === State.PLAY || state === State.STAND) && (
            <>
              <button onClick={nextRound} disabled={state != State.STAND}>Next hand</button>
              <button onClick={hit} disabled={state === State.STAND}>Hit</button>
              <button onClick={() => stand(playerScore)} disabled={state === State.STAND}>Stand</button>

              <hr />
              <h3>
                Player hand ({playerScore}){playerScore > 21 ? <span className="hand-bust"> !BUST!</span> : ''}
              </h3>
              <div className="hand-display">
                {playerHand.map((card) =>
                  <CardDisplay card={card} />
                )}
              </div>
              <hr />
              <h3>Dealer hand ({state === State.STAND ? dealerScore : '???'}){state === State.STAND && dealerScore > 21 ? <span className="hand-bust"> !BUST!</span> : ''}</h3>
              <div className="hand-display">
                {state !== State.STAND && (
                  dealerHand.map(() =>
                    <CardDisplay />
                  )
                )}
                {state === State.STAND && (
                  !dealerHand.length
                    ? <li>No cards</li>
                    : dealerHand.map((card) =>
                      <CardDisplay card={card} />
                    )
                )}
              </div>
            </>
          )}
        </>
      )}
      <hr />
      <button onClick={() => setLogsCollapsed(!logsCollapsed)}>
        {logsCollapsed ? 'Expand' : 'Collapse'} Logs
      </button>
      {!logsCollapsed &&
        <>
          <button onClick={() => setLogs([])}>Clear Logs</button>
          <LogPanel logs={logs} />
        </>
      }
    </>
  )
}

export default App
