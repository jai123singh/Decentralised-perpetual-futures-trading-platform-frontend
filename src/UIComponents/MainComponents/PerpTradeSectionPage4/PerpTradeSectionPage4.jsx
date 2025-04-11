import React from "react";
import { useState } from "react";
import NumberInput from "../../HelperComponents/NumberInput/NumberInput";
import Button from "../../HelperComponents/Button/Button";
import "./PerpTradeSectionPage4.css";

export default function PerpTradeSectionPage4() {
  const [isDisabled, setIsDisabled] = useState(true);

  let label = "Amount :";
  let placeholder = "Amount of Eth";

  function isValid(value) {
    if (Number(value) > 0 && Number(value) < 100) {
      return true;
    }
    return false;
  }

  function findError(value) {
    if (Number(value) <= 0 || value === "a") {
      return "Amount must be greater than 0";
    } else {
      return "";
    }
  }

  function onCorrectInput() {
    setIsDisabled(false);
  }

  function onIncorrectInput() {
    setIsDisabled(true);
  }
  return (
    <div className="perp-trade-section-page4-container">
      <div>Maximum additional margin allowed : abc Eth</div>
      <div className="perp-trade-section-page4-number-input-area">
        <NumberInput
          label={label}
          placeholder={placeholder}
          isValid={isValid}
          findError={findError}
          onCorrectInput={onCorrectInput}
          onIncorrectInput={onIncorrectInput}
        />
      </div>
      <Button
        className={
          isDisabled ? "perp-trade-section-page4-disabled-button-style" : ""
        }
        disabled={isDisabled}
      >
        Add to margin
      </Button>
    </div>
  );
}
