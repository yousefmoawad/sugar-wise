const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const PromoCode = require('../../models/PromoCode');

async function createCartItem(data) {
  const { product, promoCode } = data;

  if (product) {
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
  }

  if (promoCode) {
    const existingPromoCode = await PromoCode.findById(promoCode);
    if (!existingPromoCode) {
      const err = new Error('PromoCode not found');
      err.statusCode = 404;
      throw err;
    }
  }

  const cartItem = await Cart.create(data);
  return cartItem;
}

async function getCartItems(filter = {}) {
  return Cart.find(filter).populate('product').populate('promoCode');
}

async function getCartItemById(id) {
  const cartItem = await Cart.findById(id).populate('product').populate('promoCode');
  if (!cartItem) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }
  return cartItem;
}

async function updateCartItem(id, updates) {
  const cartItem = await Cart.findById(id);
  if (!cartItem) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }

  if (updates.product !== undefined) {
    const existingProduct = await Product.findById(updates.product);
    if (!existingProduct) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    cartItem.product = updates.product;
  }

  if (updates.promoCode !== undefined) {
    const existingPromoCode = await PromoCode.findById(updates.promoCode);
    if (!existingPromoCode) {
      const err = new Error('PromoCode not found');
      err.statusCode = 404;
      throw err;
    }
    cartItem.promoCode = updates.promoCode;
  }

  if (updates.quantity !== undefined) cartItem.quantity = updates.quantity;

  await cartItem.save();
  return cartItem;
}

async function deleteCartItem(id) {
  const cartItem = await Cart.findByIdAndDelete(id);
  if (!cartItem) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }
  return cartItem;
}

module.exports = {
  createCartItem,
  getCartItems,
  getCartItemById,
  updateCartItem,
  deleteCartItem,
};
