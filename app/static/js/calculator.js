(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  root.CalculatorCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var OPERATOR_ADD = "add";
  var OPERATOR_SUBTRACT = "subtract";
  var OPERATOR_MULTIPLY = "multiply";
  var OPERATOR_DIVIDE = "divide";
  var ERROR_DISPLAY = "Error";
  var MAX_DISPLAY_LENGTH = 12;

  function createCalculatorState() {
    return {
      currentInput: "0",
      previousValue: null,
      pendingOperator: null,
      shouldResetInput: false,
      error: null,
    };
  }

  function add(left, right) {
    return left + right;
  }

  function subtract(left, right) {
    return left - right;
  }

  function multiply(left, right) {
    return left * right;
  }

  function divide(left, right) {
    if (right === 0) {
      throw new Error("Cannot divide by zero.");
    }

    return left / right;
  }

  function inputDigit(state, digit) {
    validateDigit(digit);

    if (hasError(state)) {
      return withCurrentInput(createCalculatorState(), digit);
    }

    if (state.shouldResetInput) {
      return withCurrentInput(state, digit);
    }

    if (state.currentInput === "0") {
      return withCurrentInput(state, digit);
    }

    return withCurrentInput(state, state.currentInput + digit);
  }

  function inputDecimal(state) {
    if (hasError(state)) {
      return withCurrentInput(createCalculatorState(), "0.");
    }

    if (state.shouldResetInput) {
      return withCurrentInput(state, "0.");
    }

    if (state.currentInput.indexOf(".") !== -1) {
      return state;
    }

    return withCurrentInput(state, state.currentInput + ".");
  }

  function setOperator(state, operator) {
    validateOperator(operator);

    if (hasError(state)) {
      return state;
    }

    if (state.pendingOperator !== null && state.shouldResetInput) {
      return state;
    }

    if (state.pendingOperator !== null && state.previousValue !== null && !state.shouldResetInput) {
      var nextValue = safelyEvaluateOperation(
        state.previousValue,
        state.pendingOperator,
        toNumber(state.currentInput)
      );

      if (nextValue.error) {
        return nextValue.state;
      }

      return {
        currentInput: formatNumber(nextValue.value),
        previousValue: nextValue.value,
        pendingOperator: operator,
        shouldResetInput: true,
        error: null,
      };
    }

    return {
      currentInput: state.currentInput,
      previousValue: toNumber(state.currentInput),
      pendingOperator: operator,
      shouldResetInput: true,
      error: null,
    };
  }

  function calculateResult(state) {
    if (hasError(state)) {
      return state;
    }

    if (state.pendingOperator === null || state.previousValue === null) {
      return state;
    }

    if (state.shouldResetInput) {
      return state;
    }

    var result = safelyEvaluateOperation(
      state.previousValue,
      state.pendingOperator,
      toNumber(state.currentInput)
    );

    if (result.error) {
      return result.state;
    }

    return {
      currentInput: formatNumber(result.value),
      previousValue: null,
      pendingOperator: null,
      shouldResetInput: true,
      error: null,
    };
  }

  function clearCalculatorState() {
    return createCalculatorState();
  }

  function applyButtonAction(state, action, value) {
    switch (action) {
      case "digit":
        return inputDigit(state, String(value));
      case "decimal":
        return inputDecimal(state);
      case "operator":
        return setOperator(state, String(value));
      case "equals":
        return calculateResult(state);
      case "clear":
        return clearCalculatorState();
      default:
        return state;
    }
  }

  function attachCalculator(rootNode) {
    var root = rootNode || document;
    var display = root.getElementById("calculator-display");
    var keypad = root.querySelector(".calculator-keypad");

    if (!display || !keypad || keypad.__calculatorBound) {
      return null;
    }

    var state = createCalculatorState();
    keypad.__calculatorBound = true;
    renderDisplay(display, state);

    keypad.addEventListener("click", function (event) {
      var button = getCalculatorButton(event.target);

      if (!button) {
        return;
      }

      state = applyButtonAction(state, button.dataset.action, button.dataset.value);
      renderDisplay(display, state);
    });

    return {
      getState: function () {
        return state;
      },
      render: function () {
        renderDisplay(display, state);
      },
    };
  }

  function evaluateOperation(left, operator, right) {
    switch (operator) {
      case OPERATOR_ADD:
        return add(left, right);
      case OPERATOR_SUBTRACT:
        return subtract(left, right);
      case OPERATOR_MULTIPLY:
        return multiply(left, right);
      case OPERATOR_DIVIDE:
        return divide(left, right);
      default:
        throw new Error("Unsupported operator: " + operator);
    }
  }

  function safelyEvaluateOperation(left, operator, right) {
    try {
      return {
        value: evaluateOperation(left, operator, right),
        error: null,
        state: null,
      };
    } catch (error) {
      return {
        value: null,
        error: error,
        state: createErrorState(),
      };
    }
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return ERROR_DISPLAY;
    }

    if (Object.is(value, -0)) {
      return "0";
    }

    var absoluteValue = Math.abs(value);

    if ((absoluteValue >= 1e11 || (absoluteValue > 0 && absoluteValue < 1e-9))) {
      return value.toExponential(6).replace(/\.?0+e/, "e");
    }

    var normalized = String(Number(value.toPrecision(MAX_DISPLAY_LENGTH)));

    if (normalized.length > MAX_DISPLAY_LENGTH) {
      return value.toExponential(6).replace(/\.?0+e/, "e");
    }

    return normalized;
  }

  function toNumber(value) {
    return Number(value);
  }

  function validateDigit(digit) {
    if (!/^[0-9]$/.test(digit)) {
      throw new Error("Digit input must be a single character from 0 to 9.");
    }
  }

  function validateOperator(operator) {
    if (
      operator !== OPERATOR_ADD &&
      operator !== OPERATOR_SUBTRACT &&
      operator !== OPERATOR_MULTIPLY &&
      operator !== OPERATOR_DIVIDE
    ) {
      throw new Error("Unsupported operator: " + operator);
    }
  }

  function withCurrentInput(state, currentInput) {
    return {
      currentInput: currentInput,
      previousValue: state.previousValue,
      pendingOperator: state.pendingOperator,
      shouldResetInput: false,
      error: null,
    };
  }

  function createErrorState() {
    return {
      currentInput: ERROR_DISPLAY,
      previousValue: null,
      pendingOperator: null,
      shouldResetInput: true,
      error: ERROR_DISPLAY,
    };
  }

  function hasError(state) {
    return state.error !== null;
  }

  function renderDisplay(display, state) {
    display.textContent = state.currentInput;

    if (display.dataset) {
      display.dataset.state = hasError(state) ? "error" : "ready";
    }
  }

  function getCalculatorButton(target) {
    if (!target || typeof target.closest !== "function") {
      return null;
    }

    return target.closest("button[data-action]");
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        attachCalculator(document);
      });
    } else {
      attachCalculator(document);
    }
  }

  return {
    OPERATOR_ADD: OPERATOR_ADD,
    OPERATOR_SUBTRACT: OPERATOR_SUBTRACT,
    OPERATOR_MULTIPLY: OPERATOR_MULTIPLY,
    OPERATOR_DIVIDE: OPERATOR_DIVIDE,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    createCalculatorState: createCalculatorState,
    inputDigit: inputDigit,
    inputDecimal: inputDecimal,
    setOperator: setOperator,
    calculateResult: calculateResult,
    clearCalculatorState: clearCalculatorState,
    applyButtonAction: applyButtonAction,
    attachCalculator: attachCalculator,
    evaluateOperation: evaluateOperation,
    formatNumber: formatNumber,
    hasError: hasError,
  };
});
