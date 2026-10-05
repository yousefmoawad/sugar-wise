import React, { useState, useRef, useEffect } from "react";
import { CreditCard, Plus, X,  Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import useBillings from "../../hooks/useBillings";
import { useTranslation } from "react-i18next";
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png"
import Logo from "../../Images/BrandLogo/Suger_Wise_Logo.png"
/**
 * [COMPONENT]: BillingSettings
 * Purpose: Manages payment methods and provides downloadable transaction history.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) for administrative reliability.
 */
const BillingSettings = () => {
  const { t } = useTranslation();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const invoiceRef = useRef(null);
  const { i18n } = useTranslation();
  const { items,  fetchAll, createItem, deleteItem } = useBillings();

  const [cards, setCards] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);

  const [newCard, setNewCard] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    type: "Unknown",
  });

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  /**
   * [LOGIC]: Data Transformation
   * Maps server-side billing data to UI-friendly card and history objects.
   */
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) return;

    const mappedCards = items.map((billing, index) => ({
      id: billing._id || `card-${index}`,
      type: detectCardType(billing.cardNumber || "") || "Visa",
      last4: (billing.cardNumber || "").replace(/\D/g, "").slice(-4) || "0000",
      expires: billing.expiryDate || "MM/YY",
      isPrimary: false,
    }));

    const mappedHistory = items.map((billing, index) => {
      const createdAt = billing.createdAt ? new Date(billing.createdAt) : null;
      const date = createdAt
        ? createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A";
      const dateFile = createdAt ? createdAt.toISOString().slice(0, 10) : `record-${index}`;

      return {
        id: billing._id || `history-${index}`,
        date,
        dateFile,
        desc: billing.cardholderName
          ? `Card payment - ${billing.cardholderName}`
          : "Card payment",
        amount: "$0.00",
        status: "Paid",
      };
    });

    setCards(mappedCards);
    setBillingHistory(mappedHistory);
  }, [items]);

  /**
   * [EXPORT]: PDF Invoice Generation
   * Captures the hidden HTML template and renders it to a high-quality PDF.
   */
  const handleDownloadInvoice = async (transaction) => {
    const input = invoiceRef.current;
    const canvas = await html2canvas(input, {
      scale: 3,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${transaction.date}.pdf`);
  };

  const detectCardType = (number) => {
    const cleanNum = number.replace(/\D/g, "");
    const patterns = {
      Visa: /^4/,
      Mastercard: /^5[1-5]/,
      Amex: /^3[47]/,
      Discover: /^6(?:011|5)/,
    };
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNum)) return type;
    }
    return "Unknown";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let detectedType = newCard.type;

    if (name === "cardNumber") {
      const rawValue = value.replace(/\D/g, "");
      detectedType = detectCardType(rawValue);
      formattedValue = rawValue.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    } else if (name === "expiry") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{1,2})/, "$1/$2");
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setNewCard({
      ...newCard,
      [name]: formattedValue,
      type: name === "cardNumber" ? detectedType : newCard.type,
    });
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    try {
      await createItem({
        cardholderName: newCard.cardName,
        cardNumber: newCard.cardNumber.replace(/\s/g, ""),
        expiryDate: newCard.expiry,
        cvvCvc: newCard.cvv,
      });
      await fetchAll();
      setShowAddCardModal(false);
      setNewCard({ cardName: "", cardNumber: "", expiry: "", cvv: "", type: "Unknown" });
    } catch (saveError) {}
  };

  const handleDeleteCard = async (id) => {
    try {
      await deleteItem(id);
      await fetchAll();
    } catch (err) {}
  };

  return (
    <div className="animate-fade-in pb-10">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#2DA1D7]/10 flex items-center justify-center text-[#2DA1D7] shadow-inner">
          <CreditCard size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
            {t("billing.title")}
          </h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      {/* PAYMENT METHODS CAROUSEL-GRID */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#2DA1D7] rounded-full"></div>
            {t("billing.payment_method")}
          </h4>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center gap-2 bg-[#2DA1D7]/10 text-[#2DA1D7] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2DA1D7] hover:text-white transition-all shadow-sm"
          >
            <Plus size={16} /> {t("billing.add_method")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group"
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#2DA1D7]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                   {card.type === "Visa" ? (
                      <span className="text-blue-800 dark:text-blue-400 font-black italic text-xl">VISA</span>
                   ) : card.type === "Mastercard" ? (
                      <div className="flex -space-x-2"><div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div><div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80"></div></div>
                   ) : <CreditCard className="text-gray-400" />}
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-2xl font-black text-gray-900 dark:text-white tracking-[0.3em] mb-8 font-mono">
                •••• •••• •••• {card.last4}
              </p>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                  <p className="text-sm font-black text-gray-700 dark:text-gray-300">{card.expires}</p>
                </div>
                <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[9px] font-black uppercase text-gray-500">
                  {card.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BILLING HISTORY TABLE */}
      <div className="bg-white dark:bg-gray-900/50 rounded-[3rem] p-10 border-2 border-gray-50 dark:border-gray-800 shadow-xl overflow-hidden">
        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">
          {t("billing.billing_history")}
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b-2 border-gray-50 dark:border-gray-800">
                <th className="pb-6 px-4">{t("billing.date")}</th>
                <th className="pb-6 px-4">Description</th>
                <th className="pb-6 px-4">{t("billing.amount")}</th>
                <th className="pb-6 px-4">{t("billing.status")}</th>
                <th className="pb-6 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((transaction) => (
                <tr key={transaction.id} className="group hover:bg-[#2DA1D7]/5 transition-colors">
                  <td className="py-6 px-4 text-sm font-bold text-gray-500">{transaction.date}</td>
                  <td className="py-6 px-4 text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">{transaction.desc}</td>
                  <td className="py-6 px-4 text-sm font-black text-gray-700 dark:text-gray-300">{transaction.amount}</td>
                  <td className="py-6 px-4">
                    <span className="px-4 py-1 bg-[#8EC641]/10 text-[#8EC641] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#8EC641]/20">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right">
                    <button
                      onClick={() => handleDownloadInvoice({ date: transaction.dateFile, desc: transaction.desc, amount: transaction.amount })}
                      className="inline-flex items-center gap-2 text-[#2DA1D7] hover:text-[#1e7ca8] font-black text-xs uppercase tracking-widest group-hover:underline"
                    >
                      <Download size={14} /> {t("billing.download")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {billingHistory.length === 0 && <p className="text-center py-12 text-gray-400 font-bold italic">{t("billing.no_history") || "No transaction history as of now."}</p>}
        </div>
      </div>

      {/* --- HIDDEN INVOICE TEMPLATE (Print-optimized) --- */}
      <div style={{ position: "fixed", top: "-10000px", left: "-10000px" }}>
        <div ref={invoiceRef} className="w-[800px] p-16 bg-white text-gray-900 font-sans" dir={i18n.dir()}>
          <div className="flex justify-between items-center border-b-4 border-gray-100 pb-12 mb-12">
            <div className="flex items-center gap-4">
               <img src={Logo_Cycle} alt="" className="w-20 h-20" />
               <span className="text-2xl font-black uppercase tracking-widest"><img className=" h-20" src={Logo} alt="" /></span>
            </div>
            <div className={`text-${i18n.dir() === "rtl" ? "left" : "right"}`}>
              <h1 className="text-4xl font-black text-[#2DA1D7] uppercase mb-2">{t("billing.invoice")}</h1>
              <p className="text-sm font-bold text-gray-400">#SW-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-20 mb-20">
             <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#2DA1D7] mb-4">Patient Information</p>
                <p className="text-xl font-black">Jane Doe</p>
                <p className="text-gray-500 font-medium">jane.doe@example.com</p>
             </div>
             <div className={`text-${i18n.dir() === "rtl" ? "left" : "right"}`}>
                <p className="text-xs font-black uppercase tracking-widest text-[#2DA1D7] mb-4">Date Issued</p>
                <p className="text-xl font-black">{new Date().toLocaleDateString()}</p>
             </div>
          </div>
          <table className="w-full mb-20">
             <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                   <th className="p-6 text-left">{t("billing.description")}</th>
                   <th className="p-6 text-right">{t("billing.amount")}</th>
                </tr>
             </thead>
             <tbody>
                <tr className="border-b border-gray-100">
                   <td className="p-6 text-lg font-black uppercase tracking-tight">Premium Health Plan - Monthly Subscription</td>
                   <td className="p-6 text-right text-lg font-black">$50.00</td>
                </tr>
             </tbody>
          </table>
          <div className="flex justify-end">
             <div className="w-1/3 bg-gray-50 p-8 rounded-3xl">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Paid</span>
                   <span className="text-2xl font-black">$50.00</span>
                </div>
             </div>
          </div>
          <p className="mt-20 text-center text-xs font-bold text-gray-300 uppercase tracking-widest">Thank you for choosing Sugar Wise 4</p>
        </div>
      </div>

      {/* ADD CARD MODAL */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setShowAddCardModal(false)}></div>
          <div className="relative bg-white dark:bg-gray-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
             <div className="p-10 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Add New Card</h3>
                <button onClick={() => setShowAddCardModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><X size={20}/></button>
             </div>
             <form onSubmit={handleSaveCard} className="p-10 space-y-8">
                <div className="space-y-3">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Cardholder Name</label>
                   <input type="text" name="cardName" value={newCard.cardName} onChange={handleInputChange} className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all" required />
                </div>
                <div className="space-y-3">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Card Number</label>
                   <div className="relative">
                      <input type="text" name="cardNumber" value={newCard.cardNumber} onChange={handleInputChange} className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all tracking-[0.2em]" required maxLength="19" />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-[#2DA1D7] uppercase">{newCard.type !== "Unknown" && newCard.type}</div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Expiry</label>
                      <input type="text" name="expiry" value={newCard.expiry} onChange={handleInputChange} className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all text-center" placeholder="MM/YY" required maxLength="5" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">CVV</label>
                      <input type="password" name="cvv" value={newCard.cvv} onChange={handleInputChange} className="w-full py-5 px-8 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-[2rem] text-gray-900 dark:text-white font-bold outline-none transition-all text-center" placeholder="•••" required maxLength="3" />
                   </div>
                </div>
                <button type="submit" className="w-full py-6 bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#2DA1D7]/30 hover:shadow-[#2DA1D7]/50 hover:-translate-y-1 transition-all active:scale-95">Verify & Save Card</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSettings;
