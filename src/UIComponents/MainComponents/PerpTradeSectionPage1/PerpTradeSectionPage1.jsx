import React from "react";
import Button from "../../HelperComponents/Button/Button";
import NumberInput from "../../HelperComponents/NumberInput/NumberInput";
import LeverageRadioButtonGroup from "../../HelperComponents/LeverageRadioButtonGroup/LeverageRadioButtonGroup";
import "./PerpTradeSectionPage1.css";
import { useState, useEffect } from "react";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { contractABI } from "../../../contractABI";
import { parseEther } from "viem";
import { toast } from "sonner";

function extractMainError(error) {
  if (!error) return null;

  console.log(error);

  const mainErrorMatch = error.message?.match(/^([^:\.]+)/);
  if (mainErrorMatch) {
    return mainErrorMatch[0];
  }

  if (error.message?.includes("User rejected the request")) {
    return "Transaction rejected by user";
  }

  if (error.message?.includes("Contract reverted")) {
    return "Contract execution reverted";
  }

  // Fallback
  return "Transaction failed";
}

export default function PerpTradeSectionPage1({ goToPageTwo }) {
  const [page, setPage] = useState("tradingPage");
  const [textForConfirmationPage, setTextForConfirmationPage] = useState("");
  const [selectedButton, setSelectedButton] = useState("");
  const [quantity, setQuantity] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("");
  const [leverage, setLeverage] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const { address } = useAccount();
  const {
    data: hash,
    error: writeError,
    isPending,
    writeContract,
    reset,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransactionReceipt({
    hash,
  });
  let { maxNumberOfTradeablePerp, currentPerpPrice, deposit, getLatestData } =
    useTrade();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  // for long, short button
  function handleClickOnLongButton() {
    setSelectedButton("long");
  }
  function handleClickOnShortButton() {
    setSelectedButton("short");
  }
  // for quantity of perp
  let placeholderForQuantity = "Number of perp";

  function isValidForQuantity(value) {
    if (value === "") return true;

    let num = Number(value);
    if (isNaN(num) || num <= 0) return false;

    if (!Number.isInteger(num)) return false;

    let numAsBigInt = BigInt(num);
    if (maxNumberOfTradeablePerp && numAsBigInt > maxNumberOfTradeablePerp)
      return false;

    return true;
  }

  function findErrorForQuantity(value) {
    let error = "";
    let num = Number(value);

    if (isNaN(num)) {
      error = "It must be a valid number";
    } else if (num <= 0) {
      error = "It must be greater than 0";
    } else if (!Number.isInteger(num)) {
      error = "It must be an integer";
    } else {
      let numAsBigInt = BigInt(num);
      if (maxNumberOfTradeablePerp && numAsBigInt > maxNumberOfTradeablePerp) {
        error = `It cannot be more than ${maxNumberOfTradeablePerp}`;
      }
    }
    return error;
  }

  function onCorrectInputForQuantity(value) {
    if (value !== "") {
      setQuantity(value);
    }
  }

  function onIncorrectInputForQuantity(value) {
    setQuantity("");
  }

  // for slippage tolerance
  let placeholderForSlippage = "Slippage tolerance % (0.00 - 100.00)";

  function isValidForSlippage(value) {
    if (value === "") return true;

    let num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) return false;

    let parts = value.split(".");
    if (parts.length === 2 && parts[1].length > 2) return false;

    return true;
  }

  function findErrorForSlippage(value) {
    let error = "";
    let num = Number(value);

    if (isNaN(num)) {
      error = "It must be a valid number";
    } else if (num < 0 || num > 100) {
      error = "It must be between 0.00 and 100.00";
    } else {
      let parts = value.split(".");
      if (parts.length === 2 && parts[1].length > 2) {
        error = "It cannot have more than 2 digits after decimal";
      }
    }
    return error;
  }

  function onCorrectInputForSlippage(value) {
    if (value !== "") {
      let slippage = Number(value) * 100;
      setSlippageTolerance(slippage.toString());
    }
  }

  function onIncorrectInputForSlippage(value) {
    setSlippageTolerance("");
  }

  // for leverage
  function onLeverageChange(leverage) {
    setLeverage(leverage.toString());
  }

  // for expected margin and for platform fee
  // 0.05 percent of the position size is the platform fee
  let marginAsBigNumber = new BigNumber("0");
  let platformFeeAsBigNumber = new BigNumber("0");
  if (currentPerpPrice && quantity != "" && leverage != "") {
    let WEI = new BigNumber("1e18");
    let currentPerpPriceAsBigNumber = new BigNumber(
      currentPerpPrice.toString()
    );
    let quantityAsBigNumber = new BigNumber(quantity);
    let leverageAsBigNumber = new BigNumber(leverage);
    marginAsBigNumber = currentPerpPriceAsBigNumber
      .multipliedBy(quantityAsBigNumber)
      .dividedBy(leverageAsBigNumber)
      .dividedBy(WEI);
    platformFeeAsBigNumber = currentPerpPriceAsBigNumber
      .multipliedBy(quantityAsBigNumber)
      .multipliedBy(new BigNumber("0.0005"))
      .dividedBy(WEI);
  }

  // below we are enabling and disabling the trade button
  function checkAndChangeAvailablityOfTradeButton() {
    if (
      selectedButton !== "" &&
      quantity !== "" &&
      slippageTolerance !== "" &&
      leverage !== ""
    ) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }

  useEffect(() => {
    checkAndChangeAvailablityOfTradeButton();
  }, [selectedButton, quantity, slippageTolerance, leverage]);

  // below we are handling trade button click
  function handleClick() {
    if (deposit !== undefined && deposit <= 0n) {
      toast.warning("A deposit greater than 0 ETH is required to trade.");
    } else {
      let functionName = "";
      if (selectedButton === "long") {
        functionName = "buy";
      } else if (selectedButton === "short") {
        functionName = "sell";
      }

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: functionName,
        args: [
          address,
          BigInt(quantity),
          BigInt(leverage),
          currentPerpPrice,
          BigInt(slippageTolerance),
        ],
      });
    }
  }

  // below we are reacting on changes happening to various variables give by useWriteContract and useWaitForTransactionReceipt

  useEffect(() => {
    if (isPending) {
      setPage("confirmationPage");
      setTextForConfirmationPage("Please sign the transaction");
      setSelectedButton("");
      setQuantity("");
      setSlippageTolerance("");
      setLeverage("");
      setIsDisabled("");
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      setPage("confirmationPage");
      setTextForConfirmationPage("Confirming the transaction");
      setSelectedButton("");
      setQuantity("");
      setSlippageTolerance("");
      setLeverage("");
      setIsDisabled("");
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Trade executed successfully! Your position is now open.");
      reset();
      goToPageTwo();
      setSelectedButton("");
      setQuantity("");
      setSlippageTolerance("");
      setLeverage("");
      setIsDisabled("");
      getLatestData();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      const mainError = extractMainError(writeError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      setPage("tradingPage");
      setSelectedButton("");
      setQuantity("");
      setSlippageTolerance("");
      setLeverage("");
      setIsDisabled("");
    }
    if (waitError) {
      const mainError = extractMainError(waitError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      setPage("tradingPage");
      setSelectedButton("");
      setQuantity("");
      setSlippageTolerance("");
      setLeverage("");
      setIsDisabled("");
    }
  }, [writeError, waitError]);

  return (
    <div className="perp-trade-section-page1">
      {(() => {
        if (page === "tradingPage") {
          return (
            <>
              <div className="perp-trade-section-page1-buy-sell-section">
                <Button
                  className={
                    selectedButton == "long" ? "long-button-selected" : ""
                  }
                  onClick={handleClickOnLongButton}
                >
                  Long
                </Button>
                <Button
                  className={
                    selectedButton == "short" ? "short-button-selected" : ""
                  }
                  onClick={handleClickOnShortButton}
                >
                  Short
                </Button>
              </div>
              <div className="perp-trade-section-page1-quantity-section">
                <NumberInput
                  placeholder={placeholderForQuantity}
                  isValid={isValidForQuantity}
                  findError={findErrorForQuantity}
                  onCorrectInput={onCorrectInputForQuantity}
                  onIncorrectInput={onIncorrectInputForQuantity}
                />
              </div>
              <div className="perp-trade-section-page1-slippage-tolerance-section">
                <NumberInput
                  placeholder={placeholderForSlippage}
                  isValid={isValidForSlippage}
                  findError={findErrorForSlippage}
                  onCorrectInput={onCorrectInputForSlippage}
                  onIncorrectInput={onIncorrectInputForSlippage}
                />
              </div>
              <div className="perp-trade-section-page1-leverage-section">
                <LeverageRadioButtonGroup onLeverageChange={onLeverageChange} />
              </div>
              <div className="perp-trade-section-page1-para-section">
                <div>
                  {marginAsBigNumber.isGreaterThan(0)
                    ? `Expected margin: ${marginAsBigNumber
                        .toFixed(8)
                        .toString()} ETH`
                    : `Expected margin:`}
                </div>
                <div>
                  {platformFeeAsBigNumber.isGreaterThan(0)
                    ? `Expected platform fee: ${platformFeeAsBigNumber
                        .toFixed(8)
                        .toString()} ETH`
                    : `Expected platform fee:`}
                </div>
              </div>
              <div className="perp-trade-section-page1-trade-button-section">
                <Button
                  className={isDisabled ? "trade-button-disable-style" : ""}
                  disabled={isDisabled}
                  onClick={handleClick}
                >
                  Trade
                </Button>
              </div>
            </>
          );
        } else if (page === "confirmationPage") {
          return <ConfirmationPage textToBeShown={textForConfirmationPage} />;
        }
      })()}
    </div>
  );
}
