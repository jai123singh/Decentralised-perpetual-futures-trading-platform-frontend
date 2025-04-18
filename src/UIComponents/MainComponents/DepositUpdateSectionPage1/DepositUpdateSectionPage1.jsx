import React from "react";
import "./DepositUpdateSectionPage1.css";
import Button from "../../HelperComponents/Button/Button";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

export default function DepositUpdateSectionPage1({
  goToPageTwo,
  goToPageThree,
  depositInEth,
  maxWithdrawableDepositInEth,
}) {
  return (
    <>
      <div className="deposit-update-section-page1-para">
        <div className="deposit-update-section-page1-para-left-section">
          Total Depsoit
        </div>
        <div className="deposit-update-section-page1-para-right-section">
          {depositInEth.toString()} ETH
        </div>
      </div>
      <div className="deposit-update-section-page1-para">
        <div className="deposit-update-section-page1-para-left-section">
          Withdrawable Deposit
        </div>
        <div className="deposit-update-section-page1-para-right-section">
          {maxWithdrawableDepositInEth.toString()} ETH
        </div>
      </div>

      <div className="deposit-update-section-page1-bottom">
        <Button
          className="deposit-update-section-page1-button"
          onClick={goToPageTwo}
        >
          Deposit ETH
        </Button>
        <Button
          className="deposit-update-section-page1-button"
          onClick={goToPageThree}
        >
          Withdraw ETH
        </Button>
      </div>
    </>
  );
}
