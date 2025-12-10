import { State, type GameState } from "../types/GameState";

import './StatusBar.scss';

export default function StatusBar(props: {
  money: number,
  bet: number,
  round: number,
  roundResult: number,
  gameState: GameState
}) {
  return (
    <ul className="status-bar">
      <li>
        Money: ${props.money}
        {props.roundResult !== 0 && (
          <>
            &nbsp;
            <span className={'money-display ' +
              (props.roundResult < 0
                ? 'loss'
                : 'gain')
            }>
              {Math.abs(props.roundResult)}
            </span>
          </>
        )}
      </li>
      <li className={!props.bet || props.gameState !== State.PLAY
        ? 'inactive'
        : ''
      }>
        Current Bet: ${props.gameState === State.PLAY
          ? props.bet
          : '0'
        }
      </li>
      {props.round > 0 && (
        <li>Hand #{props.round}</li>
      )}
    </ul>
  );
}
