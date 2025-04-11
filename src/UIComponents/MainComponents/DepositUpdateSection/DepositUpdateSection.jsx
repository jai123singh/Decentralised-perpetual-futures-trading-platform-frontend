import React, { useEffect } from "react";
import { useState } from "react";
import "./DepositUpdateSection.css";
import DepositUpdateSectionPage1 from "../DepositUpdateSectionPage1/DepositUpdateSectionPage1";
import DepositUpdateSectionPage2 from "../DepositUpdateSectionPage2/DepositUpdateSectionPage2";
import DepositUpdateSectionPage3 from "../DepositUpdateSectionPage3/DepositUpdateSectionPage3";
import ConfirmationPage from "../../HelperComponents/ConfirmationPage/ConfirmationPage";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

export default function DepositUpdateSection() {
  const [pageNumber, setPageNumber] = useState(4);
  let { deposit, maxWithdrawableDeposit } = useTrade();

  useEffect(() => {
    if (deposit !== undefined) {
      setPageNumber(1);
    }
  }, [deposit]);

  let WEI = new BigNumber("1e18");
  let depositInEth = new BigNumber(0);
  let maxWithdrawableDepositInEth = new BigNumber(0);

  if (deposit) {
    depositInEth = new BigNumber(deposit.toString()).dividedBy(WEI);
    maxWithdrawableDepositInEth = new BigNumber(
      maxWithdrawableDeposit.toString()
    ).dividedBy(WEI);
  }

  function goToPageOne() {
    setPageNumber(1);
  }

  function goToPageTwo() {
    setPageNumber(2);
  }

  function goToPageThree() {
    setPageNumber(3);
  }

  return (
    <div className="deposit-section">
      {(() => {
        if (pageNumber == 1) {
          return (
            <DepositUpdateSectionPage1
              goToPageTwo={goToPageTwo}
              goToPageThree={goToPageThree}
              depositInEth={depositInEth}
              maxWithdrawableDepositInEth={maxWithdrawableDepositInEth}
            />
          );
        } else if (pageNumber == 2) {
          return <DepositUpdateSectionPage2 goToPageOne={goToPageOne} />;
        } else if (pageNumber == 3) {
          return (
            <DepositUpdateSectionPage3
              goToPageOne={goToPageOne}
              maxWithdrawableDepositInEth={maxWithdrawableDepositInEth}
            />
          );
        }
      })()}
    </div>
  );
}
