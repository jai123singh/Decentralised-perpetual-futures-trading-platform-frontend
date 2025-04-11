import React from "react";
import { useRef, useEffect } from "react";
import "./TradingChart.css";
import { CandlestickSeries, createChart, ColorType } from "lightweight-charts";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useWatchContractEvent } from "wagmi";
import { contractABI } from "../../../contractABI";
import { useAccount } from "wagmi";
import { useConfig } from "wagmi";
import { useTrade } from "../Background/TradeContext";
import { toast } from "sonner";

// following function is used to get data from backend

async function getDataForChartFromBackend(x, y) {
  const REQUEST_URL = import.meta.env.VITE_BACKEND_URL_TO_GET_PERP_PRICES;
  try {
    let response = await axios.get(REQUEST_URL, {
      params: { x, y },
    });
    return response;
  } catch {
    return null;
  }
}

// this function is used to convert array of dataPoints that are in string format (when backend sends them) to Number format
function fromStringToNumber(data) {
  let correctFormatData = data.map((dataPoint) => {
    let val = new BigNumber(dataPoint.perp_price);
    let correctFormatTime = Number(dataPoint.timestamp);
    let correctFormatValue = Number(val.dividedBy("1e18"));
    return {
      value: correctFormatValue,
      time: correctFormatTime,
    };
  });
  return correctFormatData;
}

// following function is used to update lastCandleStick with one dataPoint
function updateLastCandleStickWithOneDataPoint(dataPoint, lastCandleStick) {
  let newTime = Math.floor(dataPoint.time / 3600) * 3600;
  if (newTime === lastCandleStick.current.time) {
    lastCandleStick.current.high = Math.max(
      lastCandleStick.current.high,
      dataPoint.value
    );
    lastCandleStick.current.low = Math.min(
      lastCandleStick.current.low,
      dataPoint.value
    );
    lastCandleStick.current.close = dataPoint.value;
  } else {
    lastCandleStick.current.open = dataPoint.value;
    lastCandleStick.current.high = dataPoint.value;
    lastCandleStick.current.low = dataPoint.value;
    lastCandleStick.current.close = dataPoint.value;
    lastCandleStick.current.time = newTime;
  }
}
// following function is used to convert an array to candlestick format array
function convertToCandleStickFormat(data, lastCandleStick) {
  let localLastCandleStick = {
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    time: 0,
  };

  let candleStickFormatData = [];

  for (let dataPoint of data) {
    let newTime = Math.floor(dataPoint.time / 3600) * 3600;

    if (newTime === localLastCandleStick.time) {
      localLastCandleStick.high = Math.max(
        localLastCandleStick.high,
        dataPoint.value
      );
      localLastCandleStick.low = Math.min(
        localLastCandleStick.low,
        dataPoint.value
      );
      localLastCandleStick.close = dataPoint.value;
    } else {
      // Push the previous candle if it's valid
      if (localLastCandleStick.time !== 0) {
        candleStickFormatData.push({ ...localLastCandleStick });
      }

      localLastCandleStick.open = dataPoint.value;
      localLastCandleStick.high = dataPoint.value;
      localLastCandleStick.low = dataPoint.value;
      localLastCandleStick.close = dataPoint.value;
      localLastCandleStick.time = newTime;
    }
  }

  // Push the last candle
  if (localLastCandleStick.time !== 0) {
    candleStickFormatData.push({ ...localLastCandleStick });
  }

  lastCandleStick.current = localLastCandleStick;

  return candleStickFormatData;
}

export default function TradingChart() {
  const tradingChartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const { address } = useAccount();

  let { currentPerpPrice, getLatestData } = useTrade();
  let correspondingTimestampAsNumber = useRef(0);
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  let lastCandleStick = useRef({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    time: 0,
  });
  let initialData;
  let intialX = 500;
  let intialY = 0;
  let currentPerpPriceAsNumber;
  if (currentPerpPrice) {
    currentPerpPriceAsNumber = Number(
      new BigNumber(currentPerpPrice.toString()).dividedBy(
        new BigNumber("1e18")
      )
    );
  }

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    eventName: "PerpPriceUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        getLatestData();
        correspondingTimestampAsNumber.current = Number(log.args.timestamp);
      });
    },
  });

  useEffect(() => {
    // following function runs only one time, ie when chart element is mounted
    async function putInitialDataInChart() {
      let response = await getDataForChartFromBackend(intialX, intialY);

      if (response == null) {
        toast.error("Error fetching price history.");
      } else {
        let rawDataSet = fromStringToNumber(response.data.dataPoints);
        rawDataSet = rawDataSet.reverse();

        let candleStickFormatDataSet = convertToCandleStickFormat(
          rawDataSet,
          lastCandleStick
        );
        candlestickSeriesRef.current.setData(candleStickFormatDataSet);

        chartRef.current.timeScale().fitContent(); // Fit X-axis to show all candles
        chartRef.current.priceScale("right").resetAutoScale(); // Ensure Y-axis fits initial data
      }
    }

    chartRef.current = createChart(tradingChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "black" },
        textColor: "white",
      },

      width: tradingChartContainerRef.current.clientWidth,
      height: tradingChartContainerRef.current.clientHeight,
      grid: {
        vertLines: {
          color: "rgba(180, 180, 180, 0.5)", // brighter gray
          style: 1,
          width: 1,
        },
        horzLines: {
          color: "rgba(180, 180, 180, 0.5)", // brighter gray
          style: 1,
          width: 1,
        },
      },
    });

    chartRef.current.priceScale("right").applyOptions({
      visible: true,
      borderColor: "#888",
      autoScale: true,
      scaleMargins: {
        top: 0.2,
        bottom: 0.1,
      },
    });

    chartRef.current.timeScale().applyOptions({
      visible: true,
      borderColor: "#888",
      timeVisible: true,
      secondsVisible: true,
    });

    candlestickSeriesRef.current = chartRef.current.addSeries(
      CandlestickSeries,
      {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
        priceFormat: {
          type: "price",
          precision: 8, // show up to 8 digits after decimal for very small values
          minMove: 0.00000001,
        },
      }
    );

    candlestickSeriesRef.current.setData([]);

    chartRef.current.timeScale().fitContent();

    const handleResize = () => {
      chartRef.current.applyOptions({
        width: tradingChartContainerRef.current.clientWidth,
        height: tradingChartContainerRef.current.clientHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    putInitialDataInChart();

    return () => {
      window.removeEventListener("resize", handleResize);

      chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (currentPerpPriceAsNumber && correspondingTimestampAsNumber.current) {
      let dataPoint = {
        value: currentPerpPriceAsNumber,
        time: correspondingTimestampAsNumber.current,
      };

      updateLastCandleStickWithOneDataPoint(dataPoint, lastCandleStick);
      candlestickSeriesRef.current.update(lastCandleStick.current);
      chartRef.current.priceScale("right").resetAutoScale();
    }
  }, [currentPerpPriceAsNumber, correspondingTimestampAsNumber.current]);

  return <div className="trading-chart" ref={tradingChartContainerRef}></div>;
}
