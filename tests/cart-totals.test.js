const assert = require("assert");
const { computeTotals } = require("../cart-totals");

function testBasicTotals() {
  const items = [
    { price: 25, quantity: 2 },
    { price: 10, quantity: 1 },
  ];
  const totals = computeTotals(items, null);
  assert.strictEqual(totals.subtotal.toFixed(2), "60.00");
  assert.strictEqual(totals.shipping.toFixed(2), "5.00");
  assert.strictEqual(totals.tax.toFixed(2), "4.80");
  assert.strictEqual(totals.total.toFixed(2), "69.80");
}

function testPercentPromo() {
  const items = [{ price: 50, quantity: 1 }];
  const totals = computeTotals(items, "SAVE10");
  assert.strictEqual(totals.discount.toFixed(2), "5.00");
  assert.strictEqual(totals.shipping.toFixed(2), "5.00");
}

function testFreeShipPromo() {
  const items = [{ price: 20, quantity: 1 }];
  const totals = computeTotals(items, "FREESHIP");
  assert.strictEqual(totals.shipping.toFixed(2), "0.00");
}

function testProductShape() {
  const items = [{ product: { price: 19.99 }, quantity: 2 }];
  const totals = computeTotals(items, null);
  assert.strictEqual(totals.subtotal.toFixed(2), "39.98");
}

function run() {
  testBasicTotals();
  testPercentPromo();
  testFreeShipPromo();
  testProductShape();
  console.log("cart-totals tests passed");
}

run();
