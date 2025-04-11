import React, { useState, useEffect } from "react";
import "./TradingChartArea.css";
import TradingChart from "../TradingChart/TradingChart";
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

export default function TradingChartArea() {
  let { lastFundingRate, lastFundingTime } = useTrade();
  const [hoursLeftAsString, setHoursLeftAsString] = useState("");
  const [minutesLeftAsString, setMinutesLeftAsString] = useState("");
  const [secondsLeftAsString, setSecondsLeftAsString] = useState("");
  let lastFundingRateInPercentage = new BigNumber("0");
  let lastFundingRateInPercentageAsString = "0";

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
    <div className="tradingchart-area">
      <div className="tradingchart-area-chart-section">
        <TradingChart />
      </div>
      <div className="tradingchart-area-bottom-section">
        <div className="tradingchart-area-bottom-section-subsection">
          <div>Underlying Asset: SNX</div>
          <div>Y-axis: SNX perp price in terms of ETH</div>
          <div>X-axis: time</div>
        </div>
        <div className="tradingchart-area-bottom-section-subsection">
          <div>
            {lastFundingRate
              ? `Last funding rate: ${lastFundingRateInPercentageAsString}%`
              : "Last funding rate: fetching..."}
          </div>
          <div>
            {lastFundingTime && hoursLeftAsString !== ""
              ? `Next funding in: ${hoursLeftAsString}:${minutesLeftAsString}:${secondsLeftAsString}`
              : "Next funding in: fetching..."}
          </div>
        </div>
      </div>
    </div>
  );
}
