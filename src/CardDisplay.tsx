import type { Card } from "./interfaces/Card";
import { Suit } from "./types/CardSuit";

import './CardDisplay.scss';

function CardDisplay(props: { card?: Card }) {
  return (
    <div className="card-body">
      <div className={
        (props.card && (props.card.suit === Suit.HEART || props.card.suit === Suit.DIAMOND))
          ? 'red'
          : ''
      }>
        <span className="card-suit">
          {props.card && (
            <>
              {props.card.suit === Suit.CLUB && <>&#9827;</>}
              {props.card.suit === Suit.SPADE && <>&#9824;</>}
              {props.card.suit === Suit.HEART && <>&#9829;</>}
              {props.card.suit === Suit.DIAMOND && <>&#9830;</>}
            </>
          )}
          {!props.card && <>&#9744;</>}
        </span>
        <span className="card-value">
          {props.card && props.card.value}
          {!props.card && '?'}
        </span>
      </div>
    </div >
  )
}
export default CardDisplay;
