export const PENDING_CART_KEY = 'sugarwise_pending_cart';
export const PENDING_CHECKOUT_KEY = 'sugarwise_pending_checkout';

/** @param {string} returnPath pathname + search */
export function setPendingAddToCart(returnPath, product) {
  try {
    sessionStorage.setItem(
      PENDING_CART_KEY,
      JSON.stringify({ returnPath, product, action: 'addCart' })
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/** @returns {{ returnPath: string, product: object, action: string } | null} */
export function consumePendingAddToCart() {
  try {
    const raw = sessionStorage.getItem(PENDING_CART_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_CART_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Guest clicked checkout — after login/register, resume payment with same totals.
 * @param {string} returnPath e.g. "/payment"
 * @param {object} state react-router location.state payload for Payment
 */
export function setPendingCheckout(returnPath, state) {
  try {
    sessionStorage.setItem(
      PENDING_CHECKOUT_KEY,
      JSON.stringify({ returnPath, state: state || {} })
    );
  } catch {
    /* ignore */
  }
}

/** @returns {{ returnPath: string, state: object } | null} */
export function consumePendingCheckout() {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
