import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X,
  FileDown,
  Download,
  Search,
  CheckCircle2,
  User,
  Settings2,
  FileText
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SellingExport = ({ isOpen, onClose, orders }) => {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [fileName, setFileName] = useState(`Sales_Report_${new Date().toLocaleDateString()}`);
  
  const isRtl = i18n.language === "ar";

  // Reset selection when opening
  useEffect(() => {
    if (isOpen) setSelectedOrders([]);
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const handleExport = (e) => {
    e.preventDefault();
    const dataToExport = orders.filter((o) => selectedOrders.includes(o.id));
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    // [PDF BRANDING]: Using Brand Blue (#2DA1D7) for report typography
    doc.setTextColor(45, 161, 215); 
    doc.text("Sugar Wise - Sales Report", 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Customer', 'Product', 'Status', 'Price', 'Date']],
      body: dataToExport.map(o => [o.id, o.user, o.product, o.status, o.price, o.date]),
      // [PDF THEME]: Using Brand Blue for table headers
      headStyles: { fillStyle: [45, 161, 215] },
    });
    doc.save(`${fileName}.pdf`);
    onClose();
  };

  const filteredOrders = orders.filter((o) =>
    o.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="absolute inset-0 w-full h-full" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* [EXPORT HEADER]: Brand-aligned multi-color gradient and upscaled typography */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#2DA1D7] to-[#8EC641] rounded-2xl text-white shadow-xl transform rotate-2">
              <FileDown size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {isRtl ? "تصدير البيانات" : "Export Center"}
              </h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                {isRtl ? "تخصيص ملف التقارير" : "Customize your professional report"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleExport} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* File Name Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {isRtl ? "اسم الملف" : "Report Name"}
              </label>
              <div className="relative group">
                <Settings2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2DA1D7] group-focus-within:text-[#2DA1D7] transition-colors" size={20} />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/50 rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 transition-all text-gray-900 dark:text-gray-100 font-bold outline-none text-xl"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>

            {/* Selection Counter Card */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {isRtl ? "المحددة" : "Selected Items"}
              </label>
              <div className="flex items-center gap-3 py-5 px-8 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-2xl border-2 border-[#2DA1D7]/20 dark:border-[#2DA1D7]/30">
                <FileText size={22} className="text-[#2DA1D7]" />
                <span className="font-black text-[#2DA1D7] text-lg">
                   {selectedOrders.length} {isRtl ? "عناصر" : "Orders Selected"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            {/* [SELECTION LOGIC]: Use these classes to modify theme-specific selection highlights */}
            <div className="flex justify-between items-end">
              <label className="text-base font-black text-[#2DA1D7] uppercase tracking-widest leading-none">
                {isRtl ? "اختر الطلبات للتصدير" : "Select Orders to Export"}
              </label>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-black text-gray-400 uppercase hover:text-[#2DA1D7] transition-all"
              >
                {selectedOrders.length === orders.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors" size={20} />
              <input
                type="text"
                placeholder={isRtl ? "بحث..." : "Search orders..."}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#2DA1D7]/30 rounded-2xl text-lg outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Scrollable Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrders.includes(order.id);
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                        : "border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-indigo-500 transition-all">
                      <User size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-base font-black truncate ${isSelected ? "text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-900 dark:text-white"}`}>
                        {order.user}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 font-mono">{order.id}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={24} className="text-[#2DA1D7] animate-in zoom-in duration-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={selectedOrders.length === 0}
            className="w-full bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] hover:from-[#1a5f7f] hover:to-[#4d6a23] disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-widest text-lg flex items-center justify-center gap-3"
          >
            <Download size={28} />
            {isRtl ? "تحميل التقرير" : "Generate Professional Report"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SellingExport;