import React from "react";
import "./DisconnectWalletSection.css";
import { Account } from "../../../account";

export default function DisconnectWalletSection({
  changeStateForModalToFalse,
}) {
  return (
    <div className="disconnectWalletSection">
      <Account changeStateForModalToFalse={changeStateForModalToFalse} />
    </div>
  );
}
