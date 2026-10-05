import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSellings from "../../hooks/useSellings";
import {
  Search,
  Filter,
  Download,
  CircleDollarSign,
  Package,
  Truck,
  Clock,
  MoreVertical,
} from "lucide-react";
import SellingExport from "./SellingExport";

const STATUS_OPTIONS = [
  { label: "Not yet shipped", value: "not yet shipped", apiValue: "Not yet shipping" },
  { label: "On its way", value: "on its way", apiValue: "on the Way" },
  { label: "Arrived", value: "arrived", apiValue: "Arrived" },
];

const SellingDashboard = () => {
  const { i18n } = useTranslation();
  const { items, loading, error, fetchAll, updateItem } = useSellings();
  const [searchTerm, setSearchTerm] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [orders, setOrders] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const isRtl = i18n.language === "ar";

  useEffect(() => {
    const handleCloseMenu = () => setOpenMenuId(null);
    const handleEsc = (event) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("click", handleCloseMenu);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleCloseMenu);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const statusMap = {
      Arrived: "arrived",
      "on the Way": "on its way",
      "Not yet shipping": "not yet shipped",
    };

    const normalized = (items || []).map((order) => {
      const priceValue = Number(order.price || 0);
      return {
        mongoId: order._id,
        id: order.orderId
          ? `${order.orderId}`
          : `#${String(order._id).slice(-6).toUpperCase()}`,
        user: order.fullName || "Unknown",
        product: order.name || "Product",
        price: `$${priceValue}`,
        priceValue,
        status: statusMap[order.status] || "not yet shipped",
        date: order.Date ? new Date(order.Date).toISOString().slice(0, 10) : "-",
        method: order.paymentMethod || "N/A",
      };
    });

    setOrders(normalized);
  }, [items]);

  const filteredOrders = orders.filter(
    (o) =>
      o.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, order) => acc + (order.priceValue || 0), 0);
    const transit = orders.filter((order) => order.status === "on its way").length;
    const pending = orders.filter((order) => order.status === "not yet shipped").length;
    return {
      revenue,
      totalOrders: orders.length,
      transit,
      pending,
    };
  }, [orders]);

  const getStatusStyle = (s) => {
    /* [STATUS CUSTOMIZATION]: Maps order states to brand-aligned color tokens */
    const styles = {
      arrived: "bg-[#8EC641]/10 text-[#8EC641] border-[#8EC641]/20",
      "on its way": "bg-[#2DA1D7]/10 text-[#2DA1D7] border-[#2DA1D7]/20",
      "not yet shipped": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    return styles[s] || "bg-gray-500/10 text-gray-600";
  };

  const handleStatusChange = async (order, nextStatus) => {
    if (!order?.mongoId) return;
    setUpdatingOrderId(order.mongoId);
    try {
      await updateItem(order.mongoId, { status: nextStatus.apiValue });
      setOrders((prev) =>
        prev.map((entry) =>
          entry.mongoId === order.mongoId
            ? { ...entry, status: nextStatus.value }
            : entry,
        ),
      );
      setOpenMenuId(null);
    } catch (updateError) {
      console.error(updateError);
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-4 lg:p-8 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<CircleDollarSign />}
          label={isRtl ? "Revenue" : "Revenue"}
          value={`$${stats.revenue.toLocaleString()}`}
          color="from-[#2DA1D7] to-[#1a5f7f]"
        />
        <StatCard
          icon={<Package />}
          label={isRtl ? "Orders" : "Orders"}
          value={String(stats.totalOrders)}
          color="from-[#8EC641] to-[#4d6a23]"
        />
        <StatCard
          icon={<Truck />}
          label={isRtl ? "Transit" : "Transit"}
          value={String(stats.transit)}
          color="from-[#2DA1D7] to-[#8EC641]"
        />
        <StatCard
          icon={<Clock />}
          label={isRtl ? "Pending" : "Pending"}
          value={String(stats.pending)}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {loading && <p className="text-sm text-blue-600">Loading selling data...</p>}
      {error && <p className="text-sm text-red-600">Failed to load selling data</p>}

      <div className="flex flex-col lg:flex-row gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-xl border dark:border-gray-700">
        <div className="relative flex-1">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? "right-5" : "left-5"}`}
            size={20}
          />
          <input
            type="text"
            placeholder={isRtl ? "Search..." : "Search orders..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isRtl ? "pr-14" : "pl-14"}`}
          />
        </div>
        <div className="flex gap-3">
          <button className="px-8 py-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-2xl font-bold text-base flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter size={20} /> Filter
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-8 py-4 bg-[#2DA1D7] text-white rounded-2xl font-black text-base shadow-lg flex items-center gap-2 hover:bg-[#1a5f7f] transition-all"
          >
            <Download size={20} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[3rem] border dark:border-gray-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left" dir={isRtl ? "rtl" : "ltr"}>
            {/* [SELLING TABLE HEADER]: Consistent brand uppercase tracking with upscaled fonts */}
            <thead className="bg-[#2DA1D7]/5 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <tr>
                {["ID", "Customer", "Product", "Price/Date", "Status", ""].map((h, i) => (
                  <th key={i} className="p-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#2DA1D7]/10 dark:hover:bg-[#2DA1D7]/20 transition-colors">
                  <td className="p-6 font-mono text-[#2DA1D7] font-bold text-base">{o.id}</td>
                  <td className="p-6">
                    <div className="text-lg font-bold dark:text-white">{o.user}</div>
                    <div className="text-sm text-gray-400 font-bold">{o.method}</div>
                  </td>
                  <td className="p-6 text-gray-700 dark:text-gray-300 font-bold text-base">{o.product}</td>
                  <td className="p-6">
                    <div className="font-black dark:text-white">{o.price}</div>
                    <div className="text-xs text-gray-400">{o.date}</div>
                  </td>
                  <td className="p-6 relative">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase ${getStatusStyle(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-6 relative">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((prev) => (prev === o.mongoId ? null : o.mongoId));
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                    >
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {openMenuId === o.mongoId && (
                      <div
                        className="absolute right-6 top-16 z-20 min-w-[180px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#2DA1D7] dark:border-gray-700">
                          Change Status
                        </div>
                        {STATUS_OPTIONS.map((statusOption) => (
                          <button
                            key={statusOption.value}
                            type="button"
                            disabled={updatingOrderId === o.mongoId}
                            onClick={() => handleStatusChange(o, statusOption)}
                            className={`block w-full border-0 px-4 py-3 text-left text-sm font-bold transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              o.status === statusOption.value
                                ? "bg-[#2DA1D7]/5 text-[#2DA1D7]"
                                : "text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {statusOption.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SellingExport isOpen={showExport} onClose={() => setShowExport(false)} orders={orders} />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  /* [ANALYTICS CARD]: High-contrast metric display with brand-aligned gradients */
  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 shadow-xl flex items-center gap-6 group hover:-translate-y-2 transition-all">
    <div className={`bg-gradient-to-br ${color} p-5 rounded-2xl text-white shadow-xl group-hover:rotate-6 transition-transform`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black dark:text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

export default SellingDashboard;
