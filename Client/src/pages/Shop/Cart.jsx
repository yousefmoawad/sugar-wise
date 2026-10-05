import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { setPendingCheckout } from "../../utils/pendingCart";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  Tag,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Cart
 * Purpose: Digital shopping cart for managing medical supplies and monitoring tools.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Green (#8EC641).
 */
const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { items, loading, fetchAll, updateItem, deleteItem } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 100 });
    fetchAll().catch(() => {});
  }, [fetchAll]);

  /**
   * [LOGIC]: Cart Synchronization
   * Syncs backend cart data with localized state for immediate UI feedback.
   */
  useEffect(() => {
    const mapped = (items || []).map((item) => ({
      id: item._id,
      name: item.name || item.product?.name || "Product",
      price: item.product?.price || 0,
      quantity: item.quantity || 1,
      deliveryTime: "2-4 days",
      image: item.image1 || item.product?.image1 || "https://placehold.co/150",
      source: "api",
    }));
    setCartItems(mapped);
  }, [items]);

  useEffect(() => {
    if (location.state?.newItem && !items?.length) {
      const incoming = location.state.newItem;
      setCartItems([{
        id: incoming.id || `local-${Date.now()}`,
        name: incoming.name || "Product",
        price: incoming.price || 0,
        quantity: 1,
        deliveryTime: incoming.deliveryTime || "2-4 days",
        image: incoming.images?.[0] || incoming.image1 || "https://placehold.co/150",
        source: "local",
      }]);
    }
  }, [location.state, items]);

  const updateQuantity = async (id, change) => {
    const target = cartItems.find((item) => item.id === id);
    if (!target) return;
    const nextQty = Math.max(1, target.quantity + change);
    try {
      if (target.source === "api") await updateItem(id, { quantity: nextQty });
      setCartItems((prev) => prev.map((it) => it.id === id ? { ...it, quantity: nextQty } : it));
    } catch (e) {}
  };

  const removeItem = async (id) => {
    const target = cartItems.find((item) => item.id === id);
    try {
      if (target?.source === "api") await deleteItem(id);
      setCartItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {}
  };

  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "DIABETES10") {
      setDiscount(0.1);
      setPromoMessage("Success! 10% Off applied.");
    } else if (code === "SAVE20") {
      setDiscount(0.2);
      setPromoMessage("Success! 20% Off applied.");
    } else {
      setDiscount(0);
      setPromoMessage("Invalid code.");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6" data-aos="fade-down">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-3xl flex items-center justify-center shadow-inner">
               <ShoppingBag size={32} />
            </div>
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Shopping Bag</h1>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{cartItems.length} medical items selected</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#2DA1D7] group transition-all"
          >
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-[#2DA1D7] group-hover:text-white transition-all shadow-inner">
              <ArrowLeft size={16} />
            </div>
            Continue Purchasing
          </button>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* ITEMS LIST */}
            <div className="lg:col-span-2 space-y-8">
              {loading && <p className="text-xs font-black text-[#2DA1D7] animate-pulse">Syncing with clinical database...</p>}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-900/40 rounded-[3rem] p-8 flex flex-col sm:flex-row items-center gap-10 border-2 border-gray-50 dark:border-gray-800 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-500"
                  data-aos="fade-up"
                >
                  <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center p-6 shadow-inner group-hover:bg-[#2DA1D7]/5 transition-colors">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                      <span className="text-[#2DA1D7] font-black text-lg">${item.price}</span>
                      <span className="w-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full"></span>
                      <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Row Total: ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                       <span className="px-3 py-1 bg-[#8EC641]/10 text-[#8EC641] text-[9px] font-black uppercase rounded-full tracking-widest border border-[#8EC641]/20">In Stock</span>
                    </div>
                  </div>
                  
                  {/* CONTROLS */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-1 shadow-inner">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><Minus size={18} /></button>
                      <span className="w-10 text-center font-black text-gray-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"><Plus size={18} /></button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-12 h-12 bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1" data-aos="fade-left">
              <div className="bg-gray-50/50 dark:bg-gray-900/60 rounded-[3.5rem] p-10 border-2 border-gray-50 dark:border-gray-800 sticky top-32 shadow-xl">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                  Secure Checkout
                </h2>

                {/* PROMO BOX */}
                <div className="mb-10">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                    <Tag size={12} /> Institutional Discount
                  </label>
                  <div className="flex gap-3 bg-white dark:bg-gray-800 p-2 rounded-[1.5rem] shadow-inner">
                    <input
                      type="text"
                      placeholder="DIABETES10"
                      className="flex-grow bg-transparent text-gray-900 dark:text-white px-4 py-3 text-sm font-bold outline-none uppercase placeholder-gray-300"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      onClick={applyPromo}
                      className="bg-[#2DA1D7] text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1e7ca8] transition-all shadow-lg active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[10px] mt-3 font-black uppercase tracking-widest px-4 ${discount > 0 ? "text-[#8EC641]" : "text-red-500"}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="space-y-4 mb-10 py-6">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-lg font-black text-gray-700 dark:text-gray-300">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center px-2">
                      <span className="text-sm font-black text-[#8EC641] uppercase tracking-widest">Clinic Discount</span>
                      <span className="text-lg font-black text-[#8EC641]">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Express Ship</span>
                    <span className="text-sm font-black text-[#8EC641] uppercase tracking-widest italic">Free</span>
                  </div>
                  <div className="pt-8 border-t-4 border-gray-100 dark:border-gray-800 flex justify-between items-end px-2">
                    <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Total</span>
                    <span className="text-4xl font-black text-[#2DA1D7] tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setPendingCheckout("/payment", { total });
                      navigate("/login", { state: { from: location } });
                      return;
                    }
                    navigate("/payment", { state: { total } });
                  }}
                  className="w-full bg-[#8EC641] hover:bg-[#6a9431] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#8EC641]/30 hover:shadow-[#8EC641]/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  Confirm Purchase <ArrowRight size={24} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-gray-50/50 dark:bg-gray-900/30 rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-gray-800 text-center" data-aos="zoom-in">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center shadow-xl mb-8 transform -rotate-6 transition-transform hover:rotate-0">
               <ShoppingBag size={48} className="text-gray-200" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Inventory is empty</h2>
            <p className="text-lg text-gray-500 font-medium max-w-sm mb-10 mx-auto">Your medical selection is currently vacant. Browse our pharmacy catalog to begin.</p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-[#2DA1D7] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Enter Market
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
