import React from "react";
import Button from "../../HelperComponents/Button/Button";
import "./PerpTradeSectionPage2.css";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

export default function PerpTradeSectionPage2({ goToPageThree, goToPageFour }) {
  let {
    position,
    leverage = 0,
    numberOfPerpInOpenPosition = 0,
    perpPriceAtWhichTraderEnteredTheTrade = 0,
    margin = 0,
    maintenanceMargin = 0,
    effectiveMargin = 0,
    triggerPrice = 0,
    pnl = 0,
    platformFeeCollectedToOpenThePosition = 0,
    currentPerpPrice = 0,
  } = useTrade();

  let WEI = new BigNumber("1e18");

  let entryPrice = new BigNumber(
    perpPriceAtWhichTraderEnteredTheTrade.toString()
  ).dividedBy(WEI);

  let platformFeeCollectedToOpenThePositionInEth = new BigNumber(
    platformFeeCollectedToOpenThePosition.toString()
  ).dividedBy(WEI);

  let marginInEth = new BigNumber(margin.toString()).dividedBy(WEI);

  let maintenanceMarginInEth = new BigNumber(
    maintenanceMargin.toString()
  ).dividedBy(WEI);

  let effectiveMarginInEth = new BigNumber(
    effectiveMargin.toString()
  ).dividedBy(WEI);

  let currentPerpPriceInEth = new BigNumber(
    currentPerpPrice.toString()
  ).dividedBy(WEI);

  let pnlInEth = new BigNumber(pnl.toString()).dividedBy(WEI);
  let pnlInEthAsString = pnlInEth.toString();
  if (pnlInEth.isGreaterThan("0")) {
    pnlInEthAsString = "+" + pnlInEthAsString;
  }

  let triggerPriceInEth = new BigNumber(triggerPrice.toString()).dividedBy(WEI);
  return (
    <div className="perp-trade-section-page2">
      <div className="perp-trade-section-page2-subsection">
        {(() => {
          if (position == 1) {
            return <b>Open Long Position Summary</b>;
          } else {
            return <b>Open Short Position Summary</b>;
          }
        })()}
      </div>
      <div className="perp-trade-section-page2-subsection">{`Platform Fee: ${platformFeeCollectedToOpenThePositionInEth.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`Number of Perp: ${numberOfPerpInOpenPosition.toString()}`}</div>
      <div className="perp-trade-section-page2-subsection">{`Entry Price: ${entryPrice.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`Leverage: ${leverage.toString()}`}</div>
      <div className="perp-trade-section-page2-subsection">{`Margin: ${marginInEth.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`Maintenance Margin: ${maintenanceMarginInEth.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`Effective Margin: ${effectiveMarginInEth.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`Current Price: ${currentPerpPriceInEth.toString()} ETH`}</div>
      <div className="perp-trade-section-page2-subsection">{`PnL: ${pnlInEthAsString} ETH`}</div>
      <div className="perp-trade-section-page2-warning-section">
        ⚠️ Your open position will be automatically liquidated if your effective
        margin falls below your maintenance margin. This will occur when the
        current perp price drops below {triggerPriceInEth.toString()}.
      </div>
      <div className="perp-trade-section-page2-button-section">
        <Button onClick={goToPageFour}>Add more margin</Button>
        <Button onClick={goToPageThree}>Close position</Button>
      </div>
    </div>
  );
}
