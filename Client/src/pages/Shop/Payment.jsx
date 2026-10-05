import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import usePayments from '../../hooks/usePayments';
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { 
  CreditCard, 
  Wallet, 
  Apple, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Package, 
  Clock 
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Payment
 * Purpose: Secure checkout processing for pharmaceutical orders and medical bookings.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Green (#8EC641).
 */
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createItem } = usePayments();

  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const defaultOrderData = React.useMemo(() => ({
    cartItems: [
      { id: 1, name: 'Smart Glucose Monitor Pro', price: 110.49, quantity: 1 },
      { id: 2, name: 'Insulin Pen Starter Kit', price: 89.99, quantity: 2 },
    ],
    orderType: 'shop',
    subtotal: 290.47,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 290.47,
  }), []);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const state = location.state || {};

    if (state.orderData) {
      setOrderData(state.orderData);
    } else if (state.product) {
      const p = state.product;
      const price = Number(p.price) || 0;
      setOrderData({
        cartItems: [{ id: p._id || p.id, name: p.name, price, quantity: 1 }],
        orderType: 'shop',
        productId: p._id || null,
        subtotal: price,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: price,
      });
    } else if (state.doctor && state.clinic) {
      const fees = Number(state.fees) || 0;
      setOrderData({
        cartItems: [{ id: state.bookingId || 'apt', name: `Clinic Appointment: ${state.doctor.name}`, price: fees, quantity: 1 }],
        orderType: 'appointment',
        bookingId: state.bookingId,
        subtotal: fees,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: fees,
      });
    } else if (typeof state.total === 'number') {
      setOrderData({
        cartItems: [{ id: 'cart', name: 'Pharmacology Cart', price: state.total, quantity: 1 }],
        orderType: 'shop',
        subtotal: state.total,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: state.total,
      });
    } else {
      setOrderData(defaultOrderData);
    }
  }, [location, defaultOrderData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiryDate = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validateForm = () => {
    if (paymentMethod === 'creditCard') {
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) return 'Invalid Card Number';
      if (!formData.cardName.trim()) return 'Name on Card Required';
      if (!formData.expiryDate.includes('/') || formData.expiryDate.length < 5) return 'Invalid Expiry';
      if (formData.cvv.length < 3) return 'Invalid CVV';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const err = validateForm();
    if (err) { setPaymentError(err); return; }

    setLoading(true);
    try {
      const mappedMethod = paymentMethod === 'creditCard' ? 'Visa' : 'Wallet';
      await createItem({
        paymentMethod: mappedMethod,
        cardholderName: formData.cardName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
        cvvCvc: formData.cvv,
        product: orderData?.productId,
        amount: Number(orderData?.total || 0),
        name:
          orderData?.cartItems?.length === 1
            ? orderData.cartItems[0].name
            : orderData?.orderType === 'shop'
            ? 'Shop Cart Purchase'
            : 'Medical Payment',
      });
      setOrderComplete(true);
    } catch (error) {
      setPaymentError('Clinical transmission failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) return null;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white dark:bg-gray-900 border-2 border-gray-50 dark:border-gray-800 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#8EC641]/5 rounded-full blur-3xl"></div>
            <div className="w-24 h-24 bg-[#8EC641]/10 text-[#8EC641] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner scale-125">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-6">Payment Confirmed</h1>
            <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">Your medical transaction has been securely processed. Our pharmacy team is preparing your shipment.</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-[2rem] p-8 mb-12 text-left space-y-4 border border-gray-100 dark:border-gray-700 shadow-inner">
               <div className="flex justify-between items-center"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Resolved</span><span className="text-2xl font-black text-[#2DA1D7]">${orderData.total.toFixed(2)}</span></div>
               <div className="flex justify-between items-center"><span className="text-xs font-black text-gray-400 uppercase tracking-widest">Method</span><span className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">{paymentMethod}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/shop" className="bg-[#2DA1D7] hover:bg-[#1e7ca8] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95">Marketplace</Link>
              <Link to="/orders" className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-500 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-gray-50">View Registry</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        
        {/* BACK ACTION */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-gray-400 hover:text-[#2DA1D7] mb-12 transition-all font-black uppercase tracking-widest text-xs"
          data-aos="fade-right"
        >
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-[#2DA1D7] group-hover:text-white transition-all shadow-inner">
            <ArrowLeft size={16} />
          </div>
          Return to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          
          {/* PAYMENT OPTIONS AREA */}
          <div className="lg:col-span-2 space-y-12">
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Secure Gateway</h1>
               <p className="text-lg text-gray-500 font-medium max-w-xl">All medical transactions are encrypted with clinical-grade 256-bit protocols.</p>
            </div>

            <div className="bg-white dark:bg-gray-900/40 rounded-[3rem] p-10 border-2 border-gray-50 dark:border-gray-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-4 h-40 bg-[#2DA1D7] rounded-bl-full opacity-5"></div>
              
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-10 flex items-center gap-4">
                <div className="w-1.5 h-6 bg-[#2DA1D7] rounded-full"></div> Payment Instrument
              </h2>

              {paymentError && <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 flex items-center gap-3"><CheckCircle2 className="rotate-180" size={18}/> {paymentError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { id: 'creditCard', label: 'Bank Card', icon: CreditCard, color: '#2DA1D7' },
                  { id: 'wallet', label: 'E-Wallet', icon: Wallet, color: '#8EC641' },
                  { id: 'applePay', label: 'Apple Pay', icon: Apple, color: '#000' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-4 transition-all duration-300 group ${
                      paymentMethod === m.id 
                      ? "bg-[#2DA1D7]/5 border-[#2DA1D7] shadow-xl shadow-[#2DA1D7]/5" 
                      : "bg-gray-50 dark:bg-gray-800 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner transition-colors ${
                      paymentMethod === m.id ? "bg-[#2DA1D7] text-white" : "bg-white dark:bg-gray-900 text-gray-400 group-hover:text-[#2DA1D7]"
                    }`}>
                      <m.icon size={28} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'creditCard' ? (
                <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Instrument Number</label>
                    <div className="relative">
                       <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       <input type="text" name="cardNumber" value={formData.cardNumber} onChange={(e) => setFormData(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))} placeholder="0000 0000 0000 0000" className="w-full py-5 pl-16 pr-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[1.5rem] text-gray-900 dark:text-white font-bold outline-none transition-all tracking-[0.2em] placeholder-gray-300" maxLength="19" required />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Cardholder Legal Name</label>
                    <input type="text" name="cardName" value={formData.cardName} onChange={handleInputChange} placeholder="As printed on instrument" className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[1.5rem] text-gray-900 dark:text-white font-bold outline-none transition-all uppercase placeholder-gray-300" required />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Expiration</label>
                      <input type="text" name="expiryDate" value={formData.expiryDate} onChange={(e) => setFormData(p => ({ ...p, expiryDate: formatExpiryDate(e.target.value) }))} placeholder="MM / YY" className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[1.5rem] text-gray-900 dark:text-white font-bold outline-none transition-all text-center placeholder-gray-300" maxLength="5" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">CVV / CVC</label>
                      <input type="password" name="cvv" value={formData.cvv} onChange={handleInputChange} placeholder="•••" className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[1.5rem] text-gray-900 dark:text-white font-bold outline-none transition-all text-center placeholder-gray-300" maxLength="4" required />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="py-10 text-center bg-gray-50 dark:bg-gray-800/80 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 mb-8 select-none">
                   <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"><Clock size={28} className="text-[#2DA1D7] animate-pulse" /></div>
                   <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Connect to {paymentMethod} API</p>
                </div>
              )}
            </div>
          </div>

          {/* SIDE SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50/50 dark:bg-gray-900/60 rounded-[3.5rem] p-10 border-2 border-gray-50 dark:border-gray-800 sticky top-32 shadow-xl">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-10 pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
                <Package size={24} className="text-[#2DA1D7]"/> Summary
              </h2>
              
              <div className="space-y-6 mb-12 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                {orderData.cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start group">
                    <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight mb-1">{item.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[#2DA1D7]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10 py-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span><span className="text-sm font-black text-gray-800 dark:text-white">${orderData.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Ship</span><span className="text-sm font-black text-[#8EC641]">FREE</span></div>
                <div className="pt-8 border-t-4 border-gray-100 dark:border-gray-800 flex justify-between items-end">
                  <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Total</span>
                  <span className="text-4xl font-black text-[#2DA1D7] tracking-tighter">${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                  loading 
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-[#8EC641] hover:bg-[#6a9431] text-white shadow-[#8EC641]/30 hover:shadow-[#8EC641]/50 hover:-translate-y-1"
                }`}
              >
                {loading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div> : <><ShieldCheck size={24} /> Resolve Payment</>}
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 text-gray-300">
                  <i className="fa-brands fa-cc-visa text-xl"></i>
                  <i className="fa-brands fa-cc-mastercard text-xl"></i>
                  <i className="fa-brands fa-cc-stripe text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment;
