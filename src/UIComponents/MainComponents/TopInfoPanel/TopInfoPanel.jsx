import React, { useState, useEffect } from "react";
import "./TopInfoPanel.css";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

function getTimeLeftForNextFundingRound(lastFundingTime) {
  const EIGHT_HOURS_IN_SECONDS = 8n * 60n * 60n; // 28800n
  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000)); // Current timestamp in seconds

  const nextFundingTimestamp = lastFundingTime + EIGHT_HOURS_IN_SECONDS;

  // If we're past the 8-hour mark, return zero
  if (nowInSeconds >= nextFundingTimestamp) {
    return { hours: 0n, minutes: 0n, seconds: 0n };
  }

  const secondsLeft = nextFundingTimestamp - nowInSeconds;

  const hours = secondsLeft / 3600n;
  const minutes = (secondsLeft % 3600n) / 60n;
  const seconds = secondsLeft % 60n;

  return { hours, minutes, seconds };
}

export default function TopInfoPanel() {
  let {
    lastFundingRate,
    lastFundingTime,
    oraclePriceOfUnderlyingAsset,
    currentPerpPrice,
  } = useTrade();
  const [hoursLeftAsString, setHoursLeftAsString] = useState("");
  const [minutesLeftAsString, setMinutesLeftAsString] = useState("");
  const [secondsLeftAsString, setSecondsLeftAsString] = useState("");
  let lastFundingRateInPercentage = new BigNumber("0");
  let lastFundingRateInPercentageAsString = "0";
  let WEI = new BigNumber("1e18");
  let currentPerpPriceinEthAsString = "";
  let oraclePriceOfUnderlyingAssetInEthAsString = "";

  if (currentPerpPrice !== undefined) {
    currentPerpPriceinEthAsString = new BigNumber(currentPerpPrice.toString())
      .dividedBy(WEI)
      .toString();
  }

  if (oraclePriceOfUnderlyingAsset !== undefined) {
    oraclePriceOfUnderlyingAssetInEthAsString = new BigNumber(
      oraclePriceOfUnderlyingAsset.toString()
    )
      .dividedBy(WEI)
      .toString();
  }

  if (lastFundingRate) {
    lastFundingRateInPercentage = new BigNumber(
      lastFundingRate.toString()
    ).dividedBy("1e22");

    lastFundingRateInPercentageAsString =
      lastFundingRateInPercentage.toString();

    if (lastFundingRateInPercentage.isGreaterThan("0")) {
      lastFundingRateInPercentageAsString =
        "+" + lastFundingRateInPercentageAsString;
    }
  }

  useEffect(() => {
    if (!lastFundingTime) return;

    const interval = setInterval(() => {
      const { hours, minutes, seconds } =
        getTimeLeftForNextFundingRound(lastFundingTime);

      setHoursLeftAsString(hours.toString().padStart(2, "0"));
      setMinutesLeftAsString(minutes.toString().padStart(2, "0"));
      setSecondsLeftAsString(seconds.toString().padStart(2, "0"));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFundingTime]);

  return (
    <div className="top-info-panel-container">
      <div className="top-info-panel-one-element-box">
        <img
          src="https://assets.coingecko.com/coins/images/3406/small/SNX.png"
          alt=""
          width={32}
          height={32}
        />
        SNX-ETH
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Perp Price
        </div>
        <div className="top-info-panel-two-element-box-second-element">
          {currentPerpPrice !== undefined
            ? `${currentPerpPriceinEthAsString} ETH`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Oracle Price
        </div>
        <div className="top-info-panel-two-element-box-second-element">
          {oraclePriceOfUnderlyingAsset !== undefined
            ? `${oraclePriceOfUnderlyingAssetInEthAsString} ETH`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Last Funding Rate
        </div>
        <div
          className={`top-info-panel-two-element-box-second-element ${
            lastFundingRate !== undefined && lastFundingRate >= 0
              ? "top-info-panel-text-color-green"
              : lastFundingRate !== undefined
              ? "top-info-panel-text-color-red"
              : ""
          }`}
        >
          {lastFundingRate !== undefined
            ? `${lastFundingRateInPercentageAsString} %`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Next Funding In
        </div>
        <div
          className={`top-info-panel-two-element-box-second-element ${
            lastFundingTime !== undefined &&
            hoursLeftAsString !== "" &&
            minutesLeftAsString !== "" &&
            secondsLeftAsString !== ""
              ? "top-info-panel-text-color-red"
              : ""
          }`}
        >
          {lastFundingTime !== undefined &&
          hoursLeftAsString !== "" &&
          minutesLeftAsString !== "" &&
          secondsLeftAsString !== ""
            ? `${hoursLeftAsString}:${minutesLeftAsString}:${secondsLeftAsString}`
            : "fetching..."}
        </div>
      </div>
    </div>
  );
}
