import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom"; // Link with MyHealthFrame
import useOrders from "../../hooks/useOrders";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ShoppingBag,
  DollarSign,
  Trash2,
  FileText,
} from "lucide-react";

import { useTranslation } from "react-i18next";

const MyOrders = () => {
  // Access shared context safely
  const outletContext = useOutletContext();
  const { t: tHook } = useTranslation();
  const t = outletContext?.t || tHook;
  const { items, loading, error, fetchAll, deleteItem } = useOrders();

  // --- State for Orders ---
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mapped = (items || []).map((order) => ({
      id: order._id,
      orderNo: order.trackingNumber || `#ORD-${String(order._id).slice(-4)}`,
      date: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "-",
      total: Number(order.totalPrice || 0).toFixed(2),
      status:
        order.status === "delivered"
          ? "Delivered"
          : order.status === "shipped"
            ? "Shipped"
            : "Processing",
      items:
        Array.isArray(order.items) && order.items.length > 0
          ? order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")
          : "Order Items",
      image:
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=200",
    }));
    setOrders(mapped);
  }, [items]);

  // --- Delete Handler ---
  const handleDelete = async (id) => {
    // Note: t() used for the confirmation message
    if (
      window.confirm(
        t("MyOrders.ConfirmDelete") ||
          "Are you sure you want to remove this order from your history?",
      )
    ) {
      try {
        await deleteItem(id);
        setOrders((prev) => prev.filter((order) => order.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  // --- Helper for Status Colors ---
  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return {
          badge: "bg-[#8EC641]/10 text-[#8EC641] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center transition-colors",
          icon: <CheckCircle size={14} className="mr-1" />,
          border: "border-white dark:border-gray-800 shadow-xl shadow-[#8EC641]/5",
        };
      case "Shipped":
        return {
          badge: "bg-[#2DA1D7]/10 text-[#2DA1D7] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center transition-colors",
          icon: <Truck size={14} className="mr-1" />,
          border: "border-white dark:border-gray-800 shadow-xl shadow-[#2DA1D7]/5",
        };
      case "Processing":
        return {
          badge: "bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center transition-colors",
          icon: <Clock size={14} className="mr-1" />,
          border: "border-white dark:border-gray-800 shadow-xl shadow-orange-100/50",
        };
      default:
        return {
          badge:
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
          icon: null,
          border: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in relative pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* [BRAND ACTION]: Primary Green clinical header */}
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight transition-colors">
            {t("MyOrders.PageTitle") || "My Orders"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 transition-colors">
            {t("MyOrders.PageSubtitle") || "Track and manage your medical supplies."}
          </p>
        </div>
        <div className="bg-[#8EC641]/10 text-[#8EC641] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-colors border border-[#8EC641]/10">
          <ShoppingBag size={18} />{" "}
          {t("MyOrders.TotalOrders") || "Total Orders"}: {orders.length}
        </div>
      </div>

      {/* Orders Grid */}
      {loading && <p className="text-sm text-blue-600">Loading orders...</p>}
      {error && <p className="text-sm text-red-600">Failed to load orders</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => {
            const style = getStatusStyle(order.status);

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border shadow-xl transition-all duration-500 group relative overflow-hidden ${style.border}`}
              >
                {/* Card Top: ID & Status */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
                      {order.orderNo}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1 transition-colors">
                      <Clock size={12} />{" "}
                      {t("MyOrders.OrderedOn") || "Ordered on"} {order.date}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center transition-colors ${style.badge}`}
                  >
                    {style.icon}{" "}
                    {t(`MyOrders.Status${order.status}`) || order.status}
                  </span>
                </div>

                {/* Card Body: Image & Details */}
                <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700/50 rounded-3xl flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
                    <img
                      src={order.image}
                      alt="Product"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-black text-gray-800 dark:text-gray-200 text-sm line-clamp-2 transition-colors uppercase tracking-tight">
                      {order.items}
                    </h4>
                    <p className="text-[#2DA1D7] font-black mt-3 flex items-center transition-colors text-lg">
                      <DollarSign size={16} strokeWidth={3} /> {order.total}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Actions */}
                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-700/50 flex gap-4 transition-colors">
                  <button className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                    <FileText size={16} />{" "}
                    {t("MyOrders.BtnInvoice") || "Invoice"}
                  </button>

                  {order.status === "Delivered" ? (
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="flex-1 bg-rose-50 text-rose-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />{" "}
                      {t("MyOrders.BtnDelete") || "Delete Order"}
                    </button>
                  ) : (
                    <button className="flex-1 bg-[#2DA1D7] text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#2DA1D7]/20 hover:bg-[#2DA1D7]/90 transition-all active:scale-95 flex items-center justify-center gap-2">
                      <MapPin size={16} />{" "}
                      {t("MyOrders.BtnTrack") || "Track Order"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 dark:text-gray-500 transition-colors bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-100 dark:border-gray-700">
            <Package size={64} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">{t("MyOrders.NoOrders") || "No orders found."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
