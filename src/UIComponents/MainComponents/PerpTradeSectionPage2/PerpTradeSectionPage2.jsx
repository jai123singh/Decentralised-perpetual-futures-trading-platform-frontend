import React from "react";
import Button from "../../HelperComponents/Button/Button";
import "./PerpTradeSectionPage2.css";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";
import { useRef, useEffect } from "react";

export default function PerpTradeSectionPage2({ goToPageThree, goToPageFour }) {
  // Creating a ref for the scrollable div
  const scrollContainerRef = useRef(null);

  // Using useEffect to scroll to bottom when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }, 50);
    }
  }, []);

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
      <div className="perp-trade-section-page2-heading">
        {(() => {
          if (position == 1) {
            return <b>Long Position Details</b>;
          } else {
            return <b>Short Position Details</b>;
          }
        })()}
      </div>

      <div
        className="perp-trade-section-page2-info-abt-open-trade-section"
        ref={scrollContainerRef}
      >
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Platform Fee
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {platformFeeCollectedToOpenThePositionInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Perpetual Amount
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {numberOfPerpInOpenPosition.toString()}
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Entry Price
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {entryPrice.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Leverage
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {leverage.toString()}x
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Current Price
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {currentPerpPriceInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Margin
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {marginInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Maintenance Margin
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {maintenanceMarginInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Effective Margin
          </div>
          <div
            className={`perp-trade-section-page2-subsection-right-section ${
              maintenanceMarginInEth.isGreaterThan("0") &&
              maintenanceMarginInEth
                .multipliedBy("1.5")
                .isGreaterThanOrEqualTo(effectiveMarginInEth)
                ? "perp-trade-section-page2-text-red"
                : "perp-trade-section-page2-text-green"
            }`}
          >
            {effectiveMarginInEth.toString()} ETH
          </div>
        </div>

        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            PnL
          </div>
          <div
            className={`perp-trade-section-page2-subsection-right-section ${
              pnlInEth.isGreaterThan("0")
                ? "perp-trade-section-page2-text-green"
                : pnlInEth.isLessThan("0")
                ? "perp-trade-section-page2-text-red"
                : ""
            }`}
          >
            {pnlInEthAsString} ETH
          </div>
        </div>
      </div>
      <div className="perp-trade-section-page2-warning-section">
        ⚠️ Liquidation Risk: If the perp price falls below{" "}
        {triggerPriceInEth.toString()}, your position will be liquidated due to
        insufficient effective margin.
      </div>
      <div className="perp-trade-section-page2-button-section">
        <Button
          className="perp-trade-section-page2-button"
          onClick={goToPageFour}
        >
          Add more margin
        </Button>
        <Button
          className="perp-trade-section-page2-button"
          onClick={goToPageThree}
        >
          Close position
        </Button>
      </div>
    </div>
  );
}
