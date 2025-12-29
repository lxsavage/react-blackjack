import { useMemo, useState } from "react";
import { State, type GameState } from './types/GameState';

import type { Card } from "./interfaces/Card";

import LogPanel from "./components/LogPanel";
import CardDisplay from "./components/CardDisplay";

import './App.scss';
import StatusBar from "./components/StatusBar";

import * as BlackJack from "./utils/blackjack";
import * as CardDeck from './utils/card-deck';

export default function App() {
  const [round, setRound] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);

  const [playerMoney, setPlayerMoney] = useState(0);

  const [state, setState] = useState<GameState>(State.OUT_OF_MONEY);
  const [deck, setDeck] = useState<Card[]>([]);

  const [playerBet, setPlayerBet] = useState(0);
  const [roundResult, setRoundResult] = useState(0);

  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);

  const playerScore = useMemo(() => {
    return BlackJack.calculateScore(playerHand);
  }, [playerHand]);

  const dealerScore = useMemo(() => {
    return BlackJack.calculateScore(dealerHand);
  }, [dealerHand]);

  function log(message: string) {
    const newLogs = [...logs];
    newLogs.unshift(message);
    console.log(message);
    setLogs(newLogs);
  }

  function nextRound(money: number) {
    const deck = CardDeck.initializeDeck();
    const newRound = round + 1;
    log('Started hand #' + newRound);

    setRoundResult(0);
    setPlayerBet(0);

    const newPlayerMoney = money + roundResult;
    log(`New money: ${money} + ${roundResult} = ${newPlayerMoney}`);
    if (newPlayerMoney <= 0) {
      setPlayerMoney(0);
      setRound(0);
      setState(State.OUT_OF_MONEY);
      log('Player ran out of money');
      return;
    }

    const { newDeck, dealtCards } = CardDeck.dealCards(deck, 3);
    const dealerCard = dealtCards[0];
    const playerCards = dealtCards.slice(1);

    setDeck(newDeck);
    setPlayerHand(playerCards);
    setDealerHand([dealerCard]);

    setRound(newRound);
    setPlayerMoney(newPlayerMoney);
    setState(State.PLACE_BET);
  }

  function newGame() {
    const newPlayerMoney = 200;
    setPlayerMoney(newPlayerMoney);
    nextRound(newPlayerMoney);
  }

  function stand(handScore: number) {
    setState(State.STAND);

    const { newDealerHand, newDealerScore } = BlackJack.dealerTurn(deck, dealerHand, dealerScore);
    if (newDealerScore > 21) log('Dealer bust!');

    const betResult = BlackJack.calculateHandResult(handScore, newDealerScore, playerBet);

    if (betResult > 0) log('Player wins');
    else if (betResult < 0) log('Dealer wins');
    else log('Draw');

    setDealerHand(newDealerHand);
    setRoundResult(betResult);
  }

  function hit() {
    const { newDeck, dealtCards } = CardDeck.dealCards(deck, 1);
    const newPlayerHand = [...playerHand, ...dealtCards];
    const newPlayerScore = BlackJack.calculateScore(newPlayerHand);

    log(`Player hit, receiving a ${dealtCards[0].value} of ${dealtCards[0].suit}.`)

    setPlayerHand(newPlayerHand);
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
      <StatusBar
        money={playerMoney}
        bet={playerBet}
        roundResult={roundResult}
        round={round}
        gameState={state} />
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
              <button onClick={() => nextRound(playerMoney)} disabled={state != State.STAND}>Next hand</button>
              <button onClick={hit} disabled={state === State.STAND}>Hit</button>
              <button onClick={() => stand(playerScore)} disabled={state === State.STAND}>Stand</button>
              <hr />
              <h3>
                Player hand ({playerScore})
                {playerScore > 21
                  ? <span className="hand-bust">&nbsp;!BUST!</span>
                  : ''
                }
              </h3>
              <div className="hand-display">
                {playerHand.map((card) =>
                  <CardDisplay key={`pc_${card.suit}_${card.value}`} card={card} />
                )}
              </div>
              <hr />
              <h3>
                Dealer hand ({state === State.STAND ? dealerScore : '???'})
                {state === State.STAND && dealerScore > 21
                  ? <span className="hand-bust">&nbsp;!BUST!</span>
                  : ''
                }
              </h3>
              <div className="hand-display">
                {state !== State.STAND && (
                  dealerHand.map((_, index) =>
                    <CardDisplay key={`dc_unknown_${index}`} />
                  )
                )}
                {state === State.STAND && (
                  !dealerHand.length
                    ? <li>No cards</li>
                    : dealerHand.map((card) =>
                      <CardDisplay key={`dc_${card.suit}_${card.value}`} card={card} />
                    )
                )}
              </div>
            </>
          )}
        </>
      )}
      <hr />
      <LogPanel logs={logs} onClear={() => setLogs([])} />
    </>
  )
}
