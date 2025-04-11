import React from "react";
import { useState } from "react";
import "./TraderInteractionArea.css";
import ConnectWalletButton from "../ConnectWalletButton/ConnectWalletButton";
import ModalToConnectWallet from "../ModalToConnectWallet/ModalToConnectWallet";
import DisconnectWalletSection from "../DisconnectWalletSection/DisconnectWalletSection";
import DepositUpdateSection from "../DepositUpdateSection/DepositUpdateSection";
import PerpTradeSection from "../PerpTradeSection/PerpTradeSection";
import { useAccount } from "wagmi";

export default function TraderInteractionArea() {
  const { isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function changeStateForModalToTrue() {
    setIsModalOpen(true);
  }

  function changeStateForModalToFalse() {
    setIsModalOpen(false);
  }

  return (
    <div className="trading-interface">
      {(() => {
        if (!isConnected) {
          return (
            <>
              <ConnectWalletButton onClick={changeStateForModalToTrue} />

              <ModalToConnectWallet
                isOpen={isModalOpen}
                changeStateForModalToFalse={changeStateForModalToFalse}
              />
            </>
          );
        } else {
          return (
            <>
              <DisconnectWalletSection
                changeStateForModalToFalse={changeStateForModalToFalse}
              />

              <DepositUpdateSection />

              <PerpTradeSection />
            </>
          );
        }
      })()}
    </div>
  );
}
