import React from "react";
import "./TradingChartArea.css";
import TradingChart from "../TradingChart/TradingChart";

export default function TradingChartArea() {
  return (
    <div className="tradingchart-area">
      <div className="tradingchart-area-section">
        <TradingChart />
      </div>
      <div className="tradingchart-area-bottom-section">
        <div className="tradingchart-area-bottom-section-subsection">
          <div>Underlying Asset : SNX</div>
          <div>Y - axis : SNX perp price in terms of Eth</div>
          <div>X - axis : time</div>
        </div>
        <div className="tradingchart-area-bottom-section-subsection">
          <div>Last funding rate : xyz %</div>
          <div>Next funding rate mechanism happening in : t time</div>
        </div>
      </div>
    </div>
  );
}
