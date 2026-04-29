const test = require("node:test");
const assert = require("node:assert/strict");

const calculator = require("../app/static/js/calculator.js");

test("basic operation helpers return expected results", () => {
  assert.equal(calculator.add(4, 6), 10);
  assert.equal(calculator.subtract(10, 3), 7);
  assert.equal(calculator.multiply(7, 8), 56);
  assert.equal(calculator.divide(9, 3), 3);
});

test("state transitions evaluate left-to-right", () => {
  let state = calculator.createCalculatorState();

  state = calculator.inputDigit(state, "2");
  state = calculator.setOperator(state, calculator.OPERATOR_ADD);
  state = calculator.inputDigit(state, "3");
  state = calculator.setOperator(state, calculator.OPERATOR_MULTIPLY);

  assert.equal(state.currentInput, "5");
  assert.equal(state.previousValue, 5);
  assert.equal(state.pendingOperator, calculator.OPERATOR_MULTIPLY);

  state = calculator.inputDigit(state, "4");
  state = calculator.calculateResult(state);

  assert.equal(state.currentInput, "20");
  assert.equal(state.previousValue, null);
  assert.equal(state.pendingOperator, null);
});

test("multiple decimals are ignored within the same number", () => {
  let state = calculator.createCalculatorState();

  state = calculator.inputDigit(state, "1");
  state = calculator.inputDecimal(state);
  state = calculator.inputDecimal(state);
  state = calculator.inputDigit(state, "5");

  assert.equal(state.currentInput, "1.5");
});

test("divide-by-zero moves the calculator into error state", () => {
  let state = calculator.createCalculatorState();

  state = calculator.inputDigit(state, "8");
  state = calculator.setOperator(state, calculator.OPERATOR_DIVIDE);
  state = calculator.inputDigit(state, "0");
  state = calculator.calculateResult(state);

  assert.equal(state.currentInput, "Error");
  assert.equal(calculator.hasError(state), true);
});

test("error state recovers on the next valid digit input", () => {
  let state = calculator.createCalculatorState();

  state = calculator.inputDigit(state, "8");
  state = calculator.setOperator(state, calculator.OPERATOR_DIVIDE);
  state = calculator.inputDigit(state, "0");
  state = calculator.calculateResult(state);
  state = calculator.inputDigit(state, "7");

  assert.equal(state.currentInput, "7");
  assert.equal(calculator.hasError(state), false);
});

test("invalid operator sequences are ignored", () => {
  let state = calculator.createCalculatorState();

  state = calculator.inputDigit(state, "4");
  state = calculator.setOperator(state, calculator.OPERATOR_ADD);
  state = calculator.setOperator(state, calculator.OPERATOR_MULTIPLY);
  state = calculator.calculateResult(state);

  assert.equal(state.currentInput, "4");
  assert.equal(state.pendingOperator, calculator.OPERATOR_ADD);

  state = calculator.inputDigit(state, "2");
  state = calculator.calculateResult(state);

  assert.equal(state.currentInput, "6");
});

test("large and tiny numbers format into compact display values", () => {
  assert.match(calculator.formatNumber(999999999999), /e\+/);
  assert.match(calculator.formatNumber(0.0000000003), /e-/);
});
