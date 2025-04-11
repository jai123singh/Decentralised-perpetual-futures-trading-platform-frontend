import React, { useState } from "react";
import "./NumberInput.css";

// note- The isValid function must true or false based on wether number entered is correct or not. This function would accept value as input argument

// note - findError function must return a string describing what is the error. That error would be displayed as error message. This function will accept value as argument

// onCorrectInput function would perform some action \ , if input is valid. similarly we have onIncorrectInput button

// U can pass additional classes to className prop if u want additional classes on top of default classes
export default function NumberInput({
  placeholder,
  isValid = () => {
    return true;
  },
  findError = () => {
    return "";
  },
  onCorrectInput = () => {},
  onIncorrectInput = () => {},
  className = "",
}) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const defaultClasses = "number-input-container-style";
  const combinedClasses = `${defaultClasses} ${className}`.trim();

  let validity = false;

  function handleInputChange(e) {
    const value = e.target.value;
    setInputValue(value);

    validity = isValid(value);

    if (validity) {
      setError("");
      onCorrectInput(value);
    } else {
      let errorMessage = findError(value);
      setError(errorMessage);
      onIncorrectInput(value);
    }
  }

  return (
    <div className="number-input-container-style">
      <div className="number-input-top-section-style">
        <input
          type="text" // Use text to allow custom validation
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`
          number-input-input-area-style          
          ${
            error
              ? "number-input-error-border-style"
              : "number-input-normal-border-style"
          }          
        `}
        />
      </div>
      <div className="number-input-bottom-section-style">
        <p>{error}</p>
      </div>
    </div>
  );
}
