import React, { useMemo, useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useOutletContext } from "react-router-dom"; // Link with MyHealthFrame
import useDiabetesMonitorings from "../../hooks/useDiabetesMonitorings";
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png";
import {
  Plus,
  Clock,
  Droplet,
  Utensils,
  Activity,
  ArrowUp,
  ArrowDown,
  Syringe,
  Calendar,
  X,
  FileDown,
  Edit2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const toValidDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return d;
  // Support YYYY-MM-DD fallback.
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d2 = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  return Number.isNaN(d2.getTime()) ? null : d2;
};

const toDayKey = (value) => {
  const d = toValidDate(value);
  if (!d) return null;
  return d.toISOString().slice(0, 10);
};

const parseTimeToMinutes = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  const hm = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const ampm = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!ampm) return null;
  let h = Number(ampm[1]);
  const min = Number(ampm[2]);
  const mer = String(ampm[3]).toUpperCase();
  if (h === 12) h = 0;
  if (mer === "PM") h += 12;
  return h * 60 + min;
};

const formatMinutesToLabel = (minutes) => {
  if (minutes == null) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// --- MODAL COMPONENT (PORTAL) ---
const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 transition-colors duration-300">
        {children}
      </div>
    </div>,
    document.body,
  );
};

const DiabetesMonitoring = () => {
  // Use context from MyHealthFrame to get translation function t
  const { t } = useOutletContext(); 
  const {
    items,
    loading,
    error,
    fetchAll,
    createItem,
    updateItem,
  } = useDiabetesMonitorings();
  const [filter, setFilter] = useState("Day");
  const [showModal, setShowModal] = useState(false);
  const graphRef = useRef(null);

  const [editingId, setEditingId] = useState(null);

  // --- LISTS ---
  const COMMON_INSULINS = [
    "Lantus", "Novorapid", "Humalog", "Levemir", "Tresiba",
    "Actrapid", "Apidra", "Toujeo", "Basaglar", "Fiasp",
  ];
  const DEFAULT_FOODS = [
    "Oatmeal", "Boiled Eggs", "Whole Wheat Toast", "Grilled Chicken",
    "Green Salad", "Brown Rice", "Grilled Fish", "Apple", "Banana",
    "Greek Yogurt", "Almonds", "Lentil Soup", "Steamed Veggies",
  ];
  const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Extra"];

  const [formData, setFormData] = useState({
    level: "",
    unit: "mg/dL",
    date: new Date().toISOString().split("T")[0],
    time: "",
    mealType: "Breakfast",
    customFoodInput: "",
    selectedFoods: [],
    customInsulinInput: "",
    selectedInsulins: [],
    insulinUnit: "", // New Field
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mappedLogs = (items || []).map((record) => ({
      id: record._id,
      date: record.date,
      time: record.time,
      level: record.level,
      unit: record.unit || "mg/dL",
      mealType: record.mealType || "Breakfast",
      foods: Array.isArray(record.foods) ? record.foods : [],
      insulin: Array.isArray(record.insulin) ? record.insulin : [],
      insulinUnit: record.insulinUnit || 0, // New Field
    }));
    setLogs(mappedLogs);
  }, [items]);

  const chartData = useMemo(() => {
    if (!logs.length) return [];

    // Use newest date as the anchor.
    const newest = logs
      .map((l) => toValidDate(l.date))
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const anchor = newest || new Date();
    const anchorMs = anchor.getTime();

    const withinDays = (d, days) => {
      const ms = d.getTime();
      return ms <= anchorMs && ms >= anchorMs - days * 24 * 60 * 60 * 1000;
    };

    const enriched = logs
      .map((l) => {
        const d = toValidDate(l.date);
        const dayKey = toDayKey(l.date);
        const mins = parseTimeToMinutes(l.time);
        return { ...l, _dateObj: d, _dayKey: dayKey, _mins: mins };
      })
      .filter((l) => l._dateObj && l._dayKey && Number.isFinite(Number(l.level)));

    if (filter === "Day") {
      const sameDayKey = toDayKey(anchor);
      const dayItems = enriched
        .filter((l) => l._dayKey === sameDayKey)
        .sort((a, b) => (a._mins ?? 1e9) - (b._mins ?? 1e9))
        .slice(-12); // keep chart readable
      return dayItems.map((l) => ({
        time: l._mins != null ? formatMinutesToLabel(l._mins) : String(l.time || ""),
        level: Number(l.level),
      }));
    }

    if (filter === "Week") {
      const weekItems = enriched.filter((l) => withinDays(l._dateObj, 7));
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const byDay = new Map();
      for (const item of weekItems) {
        const key = days[item._dateObj.getDay()];
        const agg = byDay.get(key) || { sum: 0, count: 0 };
        agg.sum += Number(item.level);
        agg.count += 1;
        byDay.set(key, agg);
      }
      // Keep natural week order Mon..Sun for readability.
      const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return order
        .filter((k) => byDay.has(k))
        .map((k) => ({ time: k, level: Number((byDay.get(k).sum / byDay.get(k).count).toFixed(1)) }));
    }

    // Month
    const monthItems = enriched.filter((l) => withinDays(l._dateObj, 30));
    const byWeek = new Map();
    for (const item of monthItems) {
      const dayOfMonth = item._dateObj.getDate();
      const wk = Math.min(5, Math.max(1, Math.ceil(dayOfMonth / 7)));
      const key = `Week ${wk}`;
      const agg = byWeek.get(key) || { sum: 0, count: 0 };
      agg.sum += Number(item.level);
      agg.count += 1;
      byWeek.set(key, agg);
    }
    const order = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
    return order
      .filter((k) => byWeek.has(k))
      .map((k) => ({ time: k, level: Number((byWeek.get(k).sum / byWeek.get(k).count).toFixed(1)) }));
  }, [logs, filter]);

  const getStatus = (level) => {
    if (level > 140)
      return {
        text: t("DiabetesMonitoring.StatusHigh"),
        color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
        icon: <ArrowUp size={14} />,
      };
    if (level < 70)
      return {
        text: t("DiabetesMonitoring.StatusLow"),
        color:
          "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <ArrowDown size={14} />,
      };
    return {
      text: t("DiabetesMonitoring.StatusNormal"),
      color:
        "text-green-600 bg-green-50 dark:bg-[#8EC641]/10 dark:text-[#8EC641] border border-[#8EC641]/20",
      icon: <Activity size={14} />,
    };
  };

  const handleSelectInsulin = (e) => {
    const value = e.target.value;
    if (value && !formData.selectedInsulins.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        selectedInsulins: [...prev.selectedInsulins, value],
      }));
    }
    e.target.value = "";
  };

  const removeInsulin = (insulinName) => {
    setFormData((prev) => ({
      ...prev,
      selectedInsulins: prev.selectedInsulins.filter((i) => i !== insulinName),
    }));
  };

  const handleSelectFood = (e) => {
    const value = e.target.value;
    if (value && !formData.selectedFoods.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        selectedFoods: [...prev.selectedFoods, value],
      }));
    }
    e.target.value = "";
  };

  const addCustomFood = () => {
    const val = formData.customFoodInput.trim();
    if (val && !formData.selectedFoods.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        selectedFoods: [...prev.selectedFoods, val],
        customFoodInput: "",
      }));
    }
  };

  const removeFood = (foodName) => {
    setFormData((prev) => ({
      ...prev,
      selectedFoods: prev.selectedFoods.filter((f) => f !== foodName),
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      level: "",
      unit: "mg/dL",
      date: new Date().toISOString().split("T")[0],
      time: "",
      mealType: "Breakfast",
      customFoodInput: "",
      selectedFoods: [],
      selectedInsulins: [],
      insulinUnit: "", // Reset field
    });
    setShowModal(true);
  };

  const openEditModal = (log) => {
    setEditingId(log.id);
    setFormData({
      level: log.level,
      unit: log.unit,
      date: log.date,
      time: log.time,
      mealType: log.mealType,
      selectedFoods: log.foods,
      selectedInsulins: log.insulin,
      insulinUnit: log.insulinUnit || "", // Fill Field
      customFoodInput: "",
      customInsulinInput: "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const entryData = {
      date: formData.date,
      time: formData.time,
      level: Number(formData.level),
      unit: formData.unit,
      mealType: formData.mealType,
      insulinUnit: Number(formData.insulinUnit) || 0, // New Field
      foods:
        formData.selectedFoods.length > 0
          ? formData.selectedFoods
          : [t("DiabetesMonitoring.NoFood")],
      insulin:
        formData.selectedInsulins.length > 0
          ? formData.selectedInsulins
          : [t("DiabetesMonitoring.None")],
    };

    try {
      if (editingId) {
        await updateItem(editingId, entryData);
      } else {
        await createItem(entryData);
      }
      await fetchAll();
      setShowModal(false);
    } catch (saveError) {
      console.error(saveError);
    }
  };

  const handleDownloadPDF = async () => {
    const element = graphRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`Glucose_Report_${filter}.pdf`);
  };

  const renderChart = () => {
    const commonProps = { margin: { top: 20, right: 10, left: 10, bottom: 0 } };
    const axisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fill: "#9ca3af", fontSize: 12 },
    };
    const labelProps = {
      position: "top",
      offset: 10,
      fill: "#6b7280",
      fontSize: 12,
      fontWeight: "bold",
    };
    const gridProps = {
      strokeDasharray: "3 3",
      vertical: false,
      stroke: "#e5e7eb",
    };

    if (filter === "Day") {
      return (
        <AreaChart data={chartData} {...commonProps}>
          <defs>
            <linearGradient id="colorDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis hide domain={[0, 220]} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          {/* [CHART DESIGN]: Primary line using Brand Green for an eye-friendly, calm visual flow */}
          <Area
            type="monotone"
            dataKey="level"
            stroke="#8EC641"
            strokeWidth={4}
            fill="url(#colorDay)"
          >
            <LabelList dataKey="level" {...labelProps} />
          </Area>
        </AreaChart>
      );
    } else if (filter === "Week") {
      return (
        <BarChart data={chartData} {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis hide domain={[0, 220]} />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          {/* [CHART DESIGN]: Bars using brand green accent */}
          <Bar
            dataKey="level"
            fill="#8EC641"
            radius={[6, 6, 0, 0]}
            barSize={40}
          >
            <LabelList dataKey="level" {...labelProps} />
          </Bar>
        </BarChart>
      );
    } else {
      return (
        <LineChart data={chartData} {...commonProps}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis hide domain={[0, 220]} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          {/* [CHART DESIGN]: Contrast line for multi-week trends favoring Brand Green accents */}
          <Line
            type="monotone"
            dataKey="level"
            stroke="#8EC641"
            strokeWidth={4}
            dot={{ r: 6, fill: "#fff", strokeWidth: 3, stroke: "#8EC641" }}
            activeDot={{ r: 8, stroke: "#2DA1D7", strokeWidth: 2 }}
          >
            <LabelList dataKey="level" {...labelProps} />
          </Line>
        </LineChart>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* [TYPOGRAPHY]: Upscaled font-black heading for primary visibility */}
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">
            {t("DiabetesMonitoring.PageTitle")}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 transition-colors font-medium">
            {t("DiabetesMonitoring.PageSubtitle")}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          {/* [COLORS]: Transition from Primary Blue to Brand Green */}
          <Plus size={20} /> {t("DiabetesMonitoring.BtnAddTest")}
        </button>
      </div>

      {loading && (
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Loading data...
        </div>
      )}
      {error && (
        <div className="text-sm font-medium text-red-600 dark:text-red-400">
          Failed to load data from API
        </div>
      )}

      <div
        ref={graphRef}
        className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative transition-colors duration-300"
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-700 border dark:border-gray-600 p-1 rounded-lg text-white">
              <img className="w-10" src={Logo_Cycle} alt="Logo" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                {t("DiabetesMonitoring.BrandName")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                {t("DiabetesMonitoring.ReportType")}
              </p>
            </div>
          </div>
          <div className="text-right" data-html2canvas-ignore>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg transition"
            >
              <FileDown size={16} /> {t("DiabetesMonitoring.BtnSavePDF")}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-6">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors">
            <Activity className="text-[#8EC641]" />{" "}
            {t("DiabetesMonitoring.ChartTitle")} (
            {t(`DiabetesMonitoring.Filter${filter}`)})
          </h3>
          <div className="flex items-center gap-4" data-html2canvas-ignore>
            <button
              onClick={() => setFilter("Day")}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${filter === "Day" ? "bg-[#8EC641] text-white scale-110 ring-4 ring-[#8EC641]/10" : "bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-650"}`}
            >
              {t("DiabetesMonitoring.FilterDay")}
            </button>
            <button
              onClick={() => setFilter("Week")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm ${filter === "Week" ? "bg-[#8EC641] text-white scale-110 ring-4 ring-[#8EC641]/10" : "bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-650"}`}
            >
              {t("DiabetesMonitoring.FilterWeek")}
            </button>
            <button
              onClick={() => setFilter("Month")}
              className={`w-10 h-10 transform rotate-45 flex items-center justify-center text-xs font-bold transition-all shadow-sm m-2 ${filter === "Month" ? "bg-[#8EC641] text-white scale-110 ring-4 ring-[#8EC641]/10" : "bg-gray-100 dark:bg-gray-750 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-650"}`}
            >
              <span className="-rotate-45 block">
                {t("DiabetesMonitoring.FilterMonth")}
              </span>
            </button>
          </div>
        </div>
        <div className="h-80 w-full">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No saved glucose readings yet.
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {t("DiabetesMonitoring.GeneratedOn")}{" "}
          {new Date().toLocaleDateString()}
          <h2 className="mt-1">{t("DiabetesMonitoring.Copyright")}</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* [TYPOGRAPHY]: Using higher contrast markers for column headers */}
            <thead className="bg-[#2DA1D7]/5 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase font-black tracking-widest border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColTime")}
                </th>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColReading")}
                </th>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColStatus")}
                </th>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColFood")}
                </th>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColInsulin")}
                </th>
                <th className="px-6 py-4">
                  {t("DiabetesMonitoring.TableColInsulinUnit") || "Insulin Units"}
                </th>
                <th className="px-6 py-4 text-right">
                  {t("DiabetesMonitoring.TableColEdit")}
                </th>
              </tr>
            </thead>
              {/* [DATA ROW]: Upscaled font size and brand hover state */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-base">
              {logs.map((log) => {
                const status = getStatus(log.level);
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg transition-colors">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white transition-colors">
                            {log.time}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">
                            {log.date}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors">
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {log.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition-colors ${status.color}`}
                      >
                        {status.icon} {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase mb-1 transition-colors">
                          {t(`DiabetesMonitoring.Meal${log.mealType}`)}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {log.foods.map((food, i) => (
                            <span
                              key={i}
                              className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 transition-colors"
                            >
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {log.insulin.map((ins, i) => (
                          <span
                            key={i}
                            className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded border border-purple-100 dark:border-purple-800 transition-colors"
                          >
                            {ins}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* [BRAND COLOR]: Highlighting insulin dosage with brand purple or blue accent */}
                      <span className="font-extrabold text-[#2DA1D7]">
                        {log.insulinUnit} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(log)}
                        className="text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full transition"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
              {editingId
                ? t("DiabetesMonitoring.ModalEditTitle")
                : t("DiabetesMonitoring.ModalAddTitle")}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 transition-colors duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block transition-colors">
                  {t("DiabetesMonitoring.FieldGlucose")}
                </label>
                <div className="relative">
                  <Droplet
                    className="absolute left-3 top-3 text-blue-500 dark:text-blue-400"
                    size={18}
                  />
                  <input
                    type="number"
                    required
                    placeholder="e.g. 120"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block transition-colors">
                  {t("DiabetesMonitoring.FieldUnit")}
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                >
                  <option>mg/dL</option>
                  <option>mmol/L</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block transition-colors">
                  {t("DiabetesMonitoring.FieldDate")}
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block transition-colors">
                  {t("DiabetesMonitoring.FieldTime")}
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                    size={18}
                  />
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 transition-colors">
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                <Utensils size={16} />{" "}
                {t("DiabetesMonitoring.FoodSectionTitle")}
              </h3>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, mealType: type })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${formData.mealType === type ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-orange-100 dark:hover:bg-orange-900/30"}`}
                  >
                    {t(`DiabetesMonitoring.Meal${type}`)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <select
                  onChange={handleSelectFood}
                  className="flex-1 p-2.5 border border-orange-200 dark:border-orange-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-300 outline-none text-sm cursor-pointer transition-colors"
                >
                  <option value="">
                    {t("DiabetesMonitoring.PlaceholderFoodSelect")}
                  </option>
                  {DEFAULT_FOODS.map((food) => (
                    <option
                      key={food}
                      value={food}
                      disabled={formData.selectedFoods.includes(food)}
                    >
                      {food}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1 w-1/2">
                  <input
                    type="text"
                    placeholder={t("DiabetesMonitoring.PlaceholderFoodCustom")}
                    value={formData.customFoodInput}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFoodInput: e.target.value,
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCustomFood())
                    }
                    className="w-full p-2.5 border border-orange-200 dark:border-orange-800 rounded-xl focus:ring-2 focus:ring-orange-300 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={addCustomFood}
                    className="bg-orange-500 text-white px-3 rounded-xl font-bold text-xs"
                  >
                    {t("DiabetesMonitoring.BtnAdd")}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[30px] bg-white dark:bg-gray-800/50 p-2 rounded-xl border border-orange-100 dark:border-orange-900/30 transition-colors">
                {formData.selectedFoods.length > 0 ? (
                  formData.selectedFoods.map((food, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800 transition-colors"
                    >
                      {food}
                      <button
                        type="button"
                        onClick={() => removeFood(food)}
                        className="hover:text-red-500 ml-1 bg-white dark:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic pl-1">
                    {t("DiabetesMonitoring.NoFoodSelected")}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Syringe size={16} />{" "}
                  {t("DiabetesMonitoring.InsulinSectionTitle")}
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-purple-700 dark:text-purple-400">
                    Units:
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.insulinUnit}
                    onChange={(e) => setFormData({ ...formData, insulinUnit: e.target.value })}
                    className="w-16 p-1 text-center border border-purple-200 dark:border-purple-800 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-300 outline-none text-xs font-bold transition-colors"
                  />
                </div>
              </div>
              <div className="mb-3">
                <select
                  onChange={handleSelectInsulin}
                  className="w-full p-2.5 border border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-300 outline-none text-sm cursor-pointer transition-colors"
                >
                  <option value="">
                    {t("DiabetesMonitoring.PlaceholderInsulinSelect")}
                  </option>
                  {COMMON_INSULINS.map((ins) => (
                    <option
                      key={ins}
                      value={ins}
                      disabled={formData.selectedInsulins.includes(ins)}
                    >
                      {ins}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[30px] bg-white dark:bg-gray-800/50 p-2 rounded-xl border border-purple-100 dark:border-purple-900/30 transition-colors">
                {formData.selectedInsulins.length > 0 ? (
                  formData.selectedInsulins.map((ins, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors"
                    >
                      {ins}
                      <button
                        type="button"
                        onClick={() => removeInsulin(ins)}
                        className="hover:text-red-500 ml-1 bg-white dark:bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic pl-1">
                    {t("DiabetesMonitoring.NoInsulinSelected")}
                  </span>
                )}
              </div>
            </div>

            {/* [BRAND CTA]: Using green for success/save actions with high-contrast weight */}
            <button
              type="submit"
              className="w-full bg-[#8EC641] text-white py-4 rounded-2xl font-black text-xl hover:bg-[#8EC641]/90 shadow-xl shadow-[#8EC641]/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                {editingId ? t("DiabetesMonitoring.BtnUpdate") : t("DiabetesMonitoring.BtnSave")}
              </div>
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DiabetesMonitoring;
