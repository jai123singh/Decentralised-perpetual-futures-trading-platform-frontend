import React from "react";
import "./ReturnToPreviousPageButton.css";
import Button from "../Button/Button";

export default function ReturnToPreviousPageButton({ onClick }) {
  return (
    <Button onClick={onClick} className="return-to-previous-page-button">
      &lt;-
    </Button>
  );
}
