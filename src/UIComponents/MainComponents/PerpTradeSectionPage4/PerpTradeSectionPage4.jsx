import React from "react";
import { useState, useEffect } from "react";
import "./PerpTradeSectionPage4.css";
import Button from "../../HelperComponents/Button/Button";
import NumberInput from "../../HelperComponents/NumberInput/NumberInput";
import ReturnToPreviousPageButton from "../../HelperComponents/ReturnToPreviousPageButton/ReturnToPreviousPageButton";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { contractABI } from "../../../contractABI";
import BigNumber from "bignumber.js";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import { toast } from "sonner";
import { useTrade } from "../Background/TradeContext";

function extractMainError(error) {
  if (!error) return null;

  console.log(error);

  // if (error.message?.includes("Contract reverted")) {
  //   const mainErrorMatch = error.message?.match(/^([^:]+)/);
  //   if (mainErrorMatch) {
  //     return mainErrorMatch[0];
  //   }
  // }

  const mainErrorMatch = error.message?.match(/^([^\.]+)/);
  if (mainErrorMatch) {
    return mainErrorMatch[0];
  }

  // if (error.message?.includes("User rejected the request")) {
  //   return "Transaction rejected by user";
  // }

  // Fallback
  return "Transaction failed";
}

export default function PerpTradeSectionPage4({ goToPageTwo }) {
  const [page, setPage] = useState("addMargin");
  const [text, setText] = useState("");
  const [valueInNumberInputBox, setValueInNumberInputBox] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const { address } = useAccount();
  const { getLatestData, maxAmountThatCanBeAddedToMargin } = useTrade();

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
  let WEI = new BigNumber("1e18");
  let maxAmountThatCanBeAddedToMarginAsString = "";

  if (maxAmountThatCanBeAddedToMargin !== undefined) {
    maxAmountThatCanBeAddedToMarginAsString = new BigNumber(
      maxAmountThatCanBeAddedToMargin.toString()
    )
      .dividedBy(WEI)
      .toString();
  }

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  // below , we are doing stuff related to input box
  const placeholder = "Amount of ETH";

  function isValid(value) {
    if (value === "") return true;

    let num = new BigNumber(value);
    if (num.isNaN() || num.isLessThanOrEqualTo(new BigNumber(0))) return false;

    let parts = value.split(".");
    if (parts.length === 2 && parts[1].length > 18) return false;

    let valueAsBigNumber = new BigNumber(value);
    if (
      valueAsBigNumber.isGreaterThan(
        new BigNumber(maxAmountThatCanBeAddedToMarginAsString)
      )
    )
      return false;

    return true;
  }

  function findError(value) {
    let error = "";
    let valueAsBigNumber = new BigNumber(value);

    let num = new BigNumber(value);
    if (num.isNaN()) {
      error = "Amount must be a valid number";
    } else if (num.isLessThanOrEqualTo(new BigNumber(0))) {
      error = "Amount must be greater than 0";
    } else if (
      valueAsBigNumber.isGreaterThan(
        new BigNumber(maxAmountThatCanBeAddedToMarginAsString)
      )
    ) {
      error = `Amount cannot be more than ${maxAmountThatCanBeAddedToMarginAsString}`;
    } else {
      let parts = value.split(".");
      if (parts.length === 2 && parts[1].length > 18) {
        error = "Amount cannot have more than 18 digits after decimal";
      }
    }
    return error;
  }

  function onCorrectInput(value) {
    setValueInNumberInputBox(value);
    if (value !== "") {
      setIsDisabled(false);
    } else if (value === "") {
      setIsDisabled(true);
    }
  }

  function onIncorrectInput() {
    setValueInNumberInputBox("");
    setIsDisabled(true);
  }

  // here the handling of number input area is over.

  // below we handle the clicking of Withdraw button

  async function handleClick() {
    let value = valueInNumberInputBox;
    let valueInWei = new BigNumber(value).multipliedBy(WEI);
    let valueInWeiAsBigInt = BigInt(valueInWei.toString());

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "addMoreMarginToOpenPosition",
      args: [address, valueInWeiAsBigInt],
    });
  }
  // action of clicking the Withdraw button ends here

  // below we are reacting on changes happening to various variables given by useWriteContract and useWaitForTransactionReceipt

  useEffect(() => {
    if (isPending) {
      setPage("confirmationPage");
      setText("Please sign the transaction");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      setPage("confirmationPage");
      setText("Confirming the transaction");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        "More margin has been added to your open position, and an equivalent amount has been locked from your deposit."
      );
      reset();
      goToPageTwo();
      setValueInNumberInputBox("");
      setIsDisabled(true);
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
      setPage("addMargin");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
    if (waitError) {
      const mainError = extractMainError(waitError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      setPage("withdraw");
      setValueInNumberInputBox("");
      setIsDisabled(true);
    }
  }, [writeError, waitError]);

  return (
    <div className="perp-trade-section-page4-container">
      {(() => {
        if (page == "addMargin") {
          return (
            <>
              <ReturnToPreviousPageButton onClick={goToPageTwo} />
              <div className="perp-trade-section-page4-para">
                {`Max Additional Margin : 
                ${maxAmountThatCanBeAddedToMarginAsString} ETH`}
              </div>
              <div className="perp-trade-section-page4-add-margin-box">
                <div className="perp-trade-section-page4-number-input-area">
                  <NumberInput
                    placeholder={placeholder}
                    isValid={isValid}
                    findError={findError}
                    onCorrectInput={onCorrectInput}
                    onIncorrectInput={onIncorrectInput}
                  />
                </div>
                <Button
                  className={`perp-trade-section-page4-add-margin-button-style ${
                    isDisabled
                      ? "perp-trade-section-page4-disabled-button-style"
                      : ""
                  }`}
                  disabled={isDisabled}
                  onClick={handleClick}
                >
                  Add Margin
                </Button>
              </div>
            </>
          );
        } else if (page == "confirmationPage") {
          return <ConfirmationPage textToBeShown={text}></ConfirmationPage>;
        }
      })()}
    </div>
  );
}
