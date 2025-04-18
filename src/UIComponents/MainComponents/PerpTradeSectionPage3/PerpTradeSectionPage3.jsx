import React from "react";
import Button from "../../HelperComponents/Button/Button";
import "./PerpTradeSectionPage3.css";
import { useTrade } from "../Background/TradeContext";
import { useState, useEffect } from "react";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import BigNumber from "bignumber.js";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
} from "wagmi";
import { contractABI } from "../../../contractABI";
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

export default function PerpTradeSectionPage3({ goToPageTwo, goToPageOne }) {
  const [page, setPage] = useState("closePositionPage");
  const [textForConfirmationPage, setTextForConfirmationPage] = useState("");
  const { address } = useAccount();
  const { getLatestData } = useTrade();
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
  let { pnl } = useTrade();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  // format pnl
  let pnlInEthAsString = "";
  let WEI = new BigNumber("1e18");
  if (pnl !== undefined) {
    let pnlInEth = new BigNumber(pnl.toString()).dividedBy(WEI);
    pnlInEthAsString = pnlInEth.toString();
    if (pnlInEth.isGreaterThan("0")) {
      pnlInEthAsString = "+" + pnlInEthAsString;
    }
  }

  // handle click on yes button
  function handleClickOnYesButton() {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "closeOpenPosition",
      args: [address],
    });
  }

  // below we are reacting on changes happening to various variables give by useWriteContract and useWaitForTransactionReceipt

  useEffect(() => {
    if (isPending) {
      setPage("confirmationPage");
      setTextForConfirmationPage("Please sign the transaction");
    }
  }, [isPending]);

  useEffect(() => {
    if (isConfirming) {
      setPage("confirmationPage");
      setTextForConfirmationPage("Confirming the transaction");
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Position closed successfully!");
      reset();
      goToPageOne();
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
      goToPageTwo();
    }
    if (waitError) {
      const mainError = extractMainError(waitError);
      if (mainError) {
        toast.error(mainError);
      }
      reset();
      goToPageTwo();
    }
  }, [writeError, waitError]);
  return (
    <div className="perp-trade-section-page3-container">
      {(() => {
        if (page === "closePositionPage") {
          return (
            <>
              <div
                className={
                  new BigNumber(pnlInEthAsString).isGreaterThan("0")
                    ? "perp-trade-section-page3-green-color-style"
                    : new BigNumber(pnlInEthAsString).isLessThan("0")
                    ? "perp-trade-section-page3-red-color-style"
                    : ""
                }
              >{`Expected PnL :  ${pnlInEthAsString} ETH`}</div>
              <div className="perp-trade-section-page3-confirmation-box">
                <div>Are you sure you want to close this position?</div>
                <div className="perp-trade-section-page3-confirmation-box-button-section">
                  <Button
                    className="perp-trade-section-page3-button-style"
                    onClick={handleClickOnYesButton}
                  >
                    Yes
                  </Button>
                  <Button
                    className="perp-trade-section-page3-button-style"
                    onClick={goToPageTwo}
                  >
                    No
                  </Button>
                </div>
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
