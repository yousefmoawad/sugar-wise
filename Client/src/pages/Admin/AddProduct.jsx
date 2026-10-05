import React, { useState } from "react";
import ReactDOM from "react-dom";
/* [ICONS]: Form-specific iconography */
import {
  X,
  Upload,
  DollarSign,
  Package,
  FileText,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Grid,
} from "lucide-react";

const PRODUCT_CATEGORIES = [
  { id: "meters", label: "Glucose Meters" },
  { id: "pens", label: "Glucose Pens" },
  { id: "insulin", label: "Insulin" },
  { id: "supplies", label: "Diabetes Supplies" },
];

const AddProduct = ({ isOpen, onClose, onAdd, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "", // New Field
    quantity: "",
    wholesalePrice: "",
    profit: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  React.useEffect(() => {
    if (productToEdit) {
      const matchedCategory = PRODUCT_CATEGORIES.find(
        (cat) => cat.label === productToEdit.category,
      );
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || "",
        category: matchedCategory?.id || "",
        quantity: productToEdit.stock,
        wholesalePrice: productToEdit.wholesalePrice,
        profit: productToEdit.sellPrice - productToEdit.wholesalePrice,
        image: productToEdit.image,
      });
      setImagePreview(productToEdit.image);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        quantity: "",
        wholesalePrice: "",
        profit: "",
        image: null,
      });
      setImagePreview(null);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const sellingPrice = Number(formData.wholesalePrice) + Number(formData.profit);
    onAdd({ ...formData, sellingPrice });
  };

  const estimatedSellingPrice = Number(formData.wholesalePrice) + Number(formData.profit);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-hidden">
      <div className="absolute inset-0 w-full h-full" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[95vh]">
        {/* [MODAL HEADER]: Refined brand header for the product form */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-800/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl text-white shadow-lg transform group transition-transform ${productToEdit ? "bg-amber-500" : "bg-gradient-to-br from-[#2DA1D7] to-[#8EC641]"}`}>
              <PlusCircle size={24} className={productToEdit ? "rotate-45" : "group-hover:rotate-90 transition-transform"} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {productToEdit ? "Update Pharmacy Item" : "List New Medical Supply"}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {productToEdit ? "Modify existing inventory data" : "Add a new product to the shop"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* 1. Image Upload Area - Professional Framing */}
          <div className="flex flex-col items-center justify-center">
            <label className="w-full h-56 flex flex-col items-center justify-center border-4 border-dashed border-[#2DA1D7]/10 dark:border-[#2DA1D7]/20 rounded-[2.5rem] cursor-pointer hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10 hover:border-[#2DA1D7]/40 transition-all relative overflow-hidden group">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={48} className="mb-3 group-hover:text-[#2DA1D7] transition-all group-hover:scale-110" />
                  <span className="text-sm font-black uppercase tracking-widest text-[#2DA1D7]">Upload Product Image</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          {/* 2. Category Selection [New Feature] - Brand Themed */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-3">
              <Grid size={18} className="text-[#2DA1D7]" /> Select System Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 text-xs font-black rounded-2xl border-2 transition-all shadow-sm ${
                    formData.category === cat.id
                      ? "border-[#2DA1D7] bg-[#2DA1D7] text-white shadow-[#2DA1D7]/20 scale-105"
                      : "border-gray-100 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800 hover:border-[#2DA1D7]/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="e.g. Accu-Chek Guide"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-gray-100 font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Stock Level */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Package size={16} className="text-[#2DA1D7]" /> Stock Level
              </label>
              <input
                required
                type="number"
                placeholder="0"
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7]/30 transition-all text-gray-900 dark:text-gray-100 font-bold text-lg outline-none shadow-inner"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Product Details</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-400" size={18} />
              <textarea
                rows="2"
                placeholder="Specifications, size, or expiration details..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-gray-900 dark:text-gray-100 font-medium"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wholesale Price */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Wholesale Cost (EGP)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-gray-100 font-medium"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                />
              </div>
            </div>

            {/* Profit Margin */}
            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Profit Markup (EGP)</label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2DA1D7]" size={22} />
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-[#2DA1D7]/10 focus:border-[#2DA1D7]/30 transition-all text-gray-900 dark:text-gray-100 font-bold text-lg outline-none shadow-inner"
                  value={formData.profit}
                  onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* [CALCULATION SUMMARY]: Refined brand box for real-time price monitoring */}
          {(formData.wholesalePrice || formData.profit) && (
            <div className="p-5 bg-gradient-to-r from-[#2DA1D7]/10 to-[#8EC641]/10 dark:from-[#2DA1D7]/5 dark:to-[#8EC641]/5 rounded-2xl border-2 border-[#2DA1D7]/10 flex justify-between items-center animate-fade-in shadow-lg">
              <span className="text-base font-black text-[#2DA1D7] uppercase tracking-widest">Market Listing Price:</span>
              <span className="text-2xl font-black text-[#2DA1D7] drop-shadow-sm">
                {estimatedSellingPrice || 0} EGP
              </span>
            </div>
          )}

          <button
            type="submit"
            className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] text-lg uppercase tracking-widest flex items-center justify-center gap-2 ${
              productToEdit
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-gradient-to-r from-[#2DA1D7] to-[#8EC641]"
            }`}
          >
            <CheckCircle2 size={24} />
            {productToEdit ? "Confirm Updates" : "Publish to Pharmacy"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddProduct;
