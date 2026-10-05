import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AddProduct from "./AddProduct";
import Chart from "react-apexcharts";
import useProducts from "../../hooks/useProducts";
/* [ICONS]: Brand-aligned iconography for shop management */
import {
  Package,
  Search,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  Trash2,
  Plus,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Pencil,
} from "lucide-react";

const Shopproductsdashboard = () => {
  const { items, loading, error, fetchAll, createItem, updateItem, deleteItem } = useProducts();
  const { user } = useAuth();
  const normalizeRole = (role) => {
    const value = String(role || "").trim().toLowerCase();
    if (value === "super admin" || value === "superadmin" || value === "subadmin") return "superAdmin";
    if (value === "admin") return "admin";
    return "guest";
  };
  const currentUserRole = normalizeRole(user?.role);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // State for editing
  const [activeView, setActiveView] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [saveError, setSaveError] = useState("");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const normalized = (items || []).map((p) => ({
      id: p._id,
      name: p.name,
      description: p.description || "",
      category: Array.isArray(p.category) ? p.category[0] || "" : "",
      sellPrice: p.price || 0,
      wholesalePrice: Math.max(0, (p.price || 0) - (p.ProfitMarkup || 0)),
      stock: p.quantity || 0,
      sold: 0,
      returns: 0,
      isHidden: p.status === "Out of Stock",
      status: p.quantity > 0 ? "active" : "pending",
      image: p.image1 || "https://placehold.co/150",
    }));
    setProducts(normalized);
  }, [items]);

  const handleSaveProduct = async (productData) => {
    setSaveError("");
    const categoryMap = {
      meters: "Glucose Meters",
      pens: "Glucose Pens",
      insulin: "Insulin",
      supplies: "Diabetes Supplies",
    };
    const resolvedCategory =
      categoryMap[productData.category] || productData.category || "Diabetes Supplies";

    const payload = {
      name: productData.name,
      price: Number(
        productData.sellingPrice || productData.sellPrice || productData.price || 0,
      ),
      quantity: Number(productData.stock || productData.quantity || 0),
      description: productData.description || "",
      category: [resolvedCategory],
      image1:
        productData.image instanceof File
          ? URL.createObjectURL(productData.image)
          : (productData.image || productData.image1 || ""),
      status: Number(productData.stock || productData.quantity || 0) > 0 ? "Available" : "Out of Stock",
      ProfitMarkup: 0,
    };
    payload.ProfitMarkup = Math.max(
      0,
      Number(
        productData.sellingPrice || productData.sellPrice || productData.price || 0,
      ) - Number(productData.wholesalePrice || 0),
    );

    try {
      if (editingProduct) {
        await updateItem(editingProduct.id, payload);
      } else {
        await createItem(payload);
      }
      await fetchAll();
      setIsAddProductOpen(false);
      setEditingProduct(null);
    } catch (saveError) {
      console.error(saveError);
      setSaveError(
        saveError?.response?.data?.error ||
          saveError?.message ||
          "Failed to save product",
      );
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsAddProductOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddProductOpen(true);
  };

  const handleAcceptProduct = async (id) => {
    try {
      await updateItem(id, { quantity: 1, status: "Available" });
      await fetchAll();
    } catch (acceptError) {
      console.error(acceptError);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product?",
      )
    ) {
      try {
        await deleteItem(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const toggleProductVisibility = async (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextHidden = !target.isHidden;
    try {
      await updateItem(id, {
        status: nextHidden ? "Out of Stock" : "Available",
        quantity: nextHidden ? 0 : Math.max(1, target.stock || 1),
      });
      await fetchAll();
    } catch (toggleError) {
      console.error(toggleError);
    }
  };

  // Calculations only count "Active" products for profit
  const activeProducts = products.filter((p) => p.status === "active");
  const totalProfit = activeProducts.reduce(
    (acc, p) => acc + (p.sellPrice - p.wholesalePrice) * p.sold,
    0,
  );
  const totalSold = activeProducts.reduce((acc, p) => acc + p.sold, 0);
  const totalReturns = activeProducts.reduce((acc, p) => acc + p.returns, 0);

  // --- APEXCHARTS CONFIG ---
  const chartOptions = {
    chart: {
      id: "sales-analytics",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#2DA1D7", "#8EC641"],
    plotOptions: { bar: { borderRadius: 8, columnWidth: "40%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
    stroke: { curve: "smooth", width: 3 },
    grid: { borderColor: "#f1f1f1" },
  };

  const chartSeries = [
    {
      name: "Profit (EGP)",
      type: "column",
      data: [4000, 5200, 4800, 7000, 6500, 9000, 12000],
    },
    {
      name: "Items Sold",
      type: "line",
      data: [120, 150, 140, 210, 190, 250, 320],
    },
  ];

  return (
    <div className="w-full p-4 md:p-10 space-y-8 animate-fade-in min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Sugar Wise Shop
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${currentUserRole === "superAdmin" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
            >
              {currentUserRole} View
            </span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Manage inventory and approvals.
            </p>
          </div>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveView("inventory")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-black transition-all ${activeView === "inventory" ? "bg-[#2DA1D7] text-white shadow-md" : "text-gray-500 hover:text-[#2DA1D7]"}`}
          >
            <Package size={18} /> Inventory
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-black transition-all ${activeView === "analytics" ? "bg-[#2DA1D7] text-white shadow-md" : "text-gray-500 hover:text-[#2DA1D7]"}`}
          >
            <BarChart3 size={18} /> Analytics
          </button>
        </div>
      </div>

      {activeView === "inventory" ? (
        <>
          {loading && <p className="text-sm text-blue-600">Loading products...</p>}
          {error && <p className="text-sm text-red-600">Failed to load products</p>}
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search medical products..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border-none rounded-2xl shadow-md focus:ring-2 focus:ring-[#2DA1D7] transition-all text-sm font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-[#2DA1D7] border border-[#2DA1D7]/20 dark:border-[#2DA1D7]/30 px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#2DA1D7]/5 transition-all shadow-md"
            >
              <Plus size={20} /> Add Product
            </button>
          </div>

          <AddProduct
            isOpen={isAddProductOpen}
            onClose={() => setIsAddProductOpen(false)}
            onAdd={handleSaveProduct}
            productToEdit={editingProduct}
          />

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#2DA1D7]/5 dark:bg-gray-800/50 border-b border-[#2DA1D7]/10">
                  <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                    Product
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                    Wholesale
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                    Selling Price
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((p) => (
                    <tr
                      key={p.id}
                      className={`group transition-all ${p.isHidden ? "opacity-50 grayscale-[0.5]" : "hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10"}`}
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-[#2DA1D7]/10 group-hover:border-[#2DA1D7]/30 transition-all">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">
                              {p.name}
                            </span>
                            {p.isHidden && (
                              <span className="text-[8px] font-black text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest mt-1 inline-block">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* --- STATUS COLUMN --- */}
                      <td className="px-8 py-6 text-center">
                        {p.status === "pending" ? (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200 shadow-sm transition-all">
                            <Clock size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">
                              Pending
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8EC641]/10 text-[#8EC641] rounded-full border border-[#8EC641]/20 shadow-sm transition-all">
                            <CheckCircle2 size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">
                              Active
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-8 py-4 font-bold text-gray-400 text-xs">
                        {p.wholesalePrice} EGP
                      </td>
                      <td className="px-8 py-4 font-black text-[#2DA1D7] text-lg">
                        {p.sellPrice} EGP
                      </td>

                      {/* --- ACTIONS COLUMN WITH ROLE CHECK --- */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {/* Super Admin Accept Button */}
                          {p.status === "pending" &&
                            currentUserRole === "superAdmin" && (
                              <button
                                onClick={() => handleAcceptProduct(p.id)}
                                className="p-3 bg-[#8EC641]/10 text-[#8EC641] rounded-2xl hover:bg-[#8EC641] hover:text-white transition-all shadow-md active:scale-90"
                                title="Accept Product"
                              >
                                <CheckCircle2 size={22} />
                              </button>
                            )}

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-3 text-gray-400 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/10 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            title="Edit Product"
                          >
                            <Pencil size={22} />
                          </button>

                          <button
                            onClick={() => toggleProductVisibility(p.id)}
                            className={`p-3 rounded-2xl transition-all shadow-sm hover:shadow-md ${p.isHidden ? "bg-amber-50 text-amber-600" : "text-gray-400 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/10"}`}
                            disabled={p.status === "pending"} // Cannot hide pending products
                          >
                            {p.isHidden ? (
                              <EyeOff size={22} />
                            ) : (
                              <Eye size={22} />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            title="Delete Product"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* [ANALYTICS VIEW]: Compact brand metrics with professional statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-lg">
                  <DollarSign size={20} />
                </div>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Total Profit</span>
              </div>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {totalProfit.toLocaleString()}
                </h2>
                <span className="text-sm font-black text-[#2DA1D7]">EGP</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#8EC641]/10 text-[#8EC641] rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Quantity Sold</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {totalSold}
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <RotateCcw size={20} />
                </div>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Returns</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {totalReturns}
              </h2>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shopproductsdashboard;


