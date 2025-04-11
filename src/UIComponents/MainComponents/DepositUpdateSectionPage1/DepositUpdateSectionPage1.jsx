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
  let { deposit, maxWithdrawableDeposit } = useTrade();
  return (
    <>
      <div className="deposit-update-section-page1-para">
        Total depsoit: {depositInEth.toString()} ETH
      </div>
      <div className="deposit-update-section-page1-para">
        Withdrawable deposit: {maxWithdrawableDepositInEth.toString()} ETH
      </div>
      <div className="deposit-update-section-page1-bottom">
        <Button onClick={goToPageTwo}>Deposit ETH</Button>
        <Button onClick={goToPageThree}>Withdraw ETH</Button>
      </div>
    </>
  );
}
