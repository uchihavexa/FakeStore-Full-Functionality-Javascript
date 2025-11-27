(() => {
  const PROMO_CODES = {
    SAVE10: { type: "percent", value: 10 },
    TAKE15: { type: "flat", value: 15 },
    FREESHIP: { type: "shipping", value: 0 },
  };

  const TAX_RATE = 0.08;
  const BASE_SHIPPING = 5;
  const FREE_SHIPPING_THRESHOLD = 100;

  function normalizeCode(code) {
    return (code || "").trim().toUpperCase();
  }

  function getPromo(code) {
    const normalized = normalizeCode(code);
    const promo = PROMO_CODES[normalized];
    if (!promo) return null;
    return { ...promo, code: normalized };
  }

  function computeTotals(rawItems, promoCode) {
    const items = Array.isArray(rawItems) ? rawItems : [];
    const subtotal = items.reduce((sum, item) => {
      const price = Number(
        item.price ?? (item.product ? item.product.price : 0) ?? 0
      );
      const qty = Number(item.quantity ?? 0);
      return sum + price * qty;
    }, 0);

    const appliedPromo = getPromo(promoCode);
    let shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : BASE_SHIPPING;
    let discount = 0;

    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        discount = subtotal * (appliedPromo.value / 100);
      } else if (appliedPromo.type === "flat") {
        discount = appliedPromo.value;
      } else if (appliedPromo.type === "shipping") {
        shipping = 0;
      }
    }

    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * TAX_RATE;
    const total = Math.max(0, taxable + shipping + tax);

    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
      appliedPromo,
    };
  }

  const api = {
    computeTotals,
    getPromo,
    PROMO_CODES,
  };

  if (typeof window !== "undefined") {
    window.CartTotals = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})();
