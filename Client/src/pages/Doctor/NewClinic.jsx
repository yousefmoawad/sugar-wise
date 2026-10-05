import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import {
  Clock,
  DollarSign,
  X,
  Search,
  Loader2,
  Users,
  Timer,
  Link as LinkIcon,
  Navigation,
  Camera, // Added for Image Input
  UploadCloud, // Added for Image Input
  Phone,
} from "lucide-react";
import L from "leaflet";

// Leaflet Icon Fixes
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const RecenterAutomatically = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

const InvalidateMapSize = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const NewClinic = ({ t, onSave, onClose, initialData = null }) => {
  const DEFAULT_POSITION = [30.0444, 31.2357];
  const [isSearching, setIsSearching] = useState(false);
  const [syncFlash, setSyncFlash] = useState(false);

  const weekDays = [
    { key: "sat", label: t("Days.Saturday") || "Saturday", short: "Sat" },
    { key: "sun", label: t("Days.Sunday") || "Sunday", short: "Sun" },
    { key: "mon", label: t("Days.Monday") || "Monday", short: "Mon" },
    { key: "tue", label: t("Days.Tuesday") || "Tuesday", short: "Tue" },
    { key: "wed", label: t("Days.Wednesday") || "Wednesday", short: "Wed" },
    { key: "thu", label: t("Days.Thursday") || "Thursday", short: "Thu" },
    { key: "fri", label: t("Days.Friday") || "Friday", short: "Fri" },
  ];

  const [formData, setFormData] = useState(
    initialData
      ? {
          name: initialData.name || "",
          address: initialData.address || "",
          mapsUrl: initialData.mapsUrl || "",
          phone: initialData.phone || "",
          price: initialData.price || "",
          position: initialData.position
            ? [initialData.position.lat, initialData.position.lng]
            : DEFAULT_POSITION,
          selectedDays: initialData.selectedDays || [],
          startTime: initialData.startTime || "09:00",
          endTime: initialData.endTime || "17:00",
          minutesPerPatient: initialData.minutesPerPatient || "20",
          maxCasesPerDay: initialData.maxCasesPerDay || "15",
          image: initialData.image || null,
        }
      : {
          name: "",
          address: "",
          mapsUrl: "",
          phone: "",
          price: "",
          position: DEFAULT_POSITION,
          selectedDays: [],
          startTime: "09:00",
          endTime: "17:00",
          minutesPerPatient: "20",
          maxCasesPerDay: "15",
          image: null, // NEW: Image field
        },
  );

  // NEW: Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- NEW: SYNC URL + AUTO-FILL ADDRESS ---
  const handleUrlFetch = async () => {
    const url = formData.mapsUrl;
    const coordMatch =
      url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);

      setIsSearching(true);
      try {
        // Reverse Geocoding: Convert coordinates to a real address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );
        const data = await response.json();
        const readableAddress = data.display_name || `${lat}, ${lon}`;

        setFormData((prev) => ({
          ...prev,
          position: [lat, lon],
          address: readableAddress, // This makes the location appear in the address field
        }));

        setSyncFlash(true);
        setTimeout(() => setSyncFlash(false), 1000);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        setFormData((prev) => ({ ...prev, position: [lat, lon] }));
      } finally {
        setIsSearching(false);
      }
    } else {
      alert(
        t("MyClinic.InvalidUrl") ||
          "Invalid URL. Ensure it contains coordinates.",
      );
    }
  };

  const toggleDay = (dayKey) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayKey)
        ? prev.selectedDays.filter((d) => d !== dayKey)
        : [...prev.selectedDays, dayKey],
    }));
  };

  const handleSearchLocation = async () => {
    if (!formData.address.trim()) {
      alert(t("MyClinic.AlertEmptyAddress"));
      return;
    }
    setIsSearching(true);
    try {
      const encodedAddress = encodeURIComponent(formData.address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`,
      );
      const data = await response.json();
      if (data?.[0]) {
        setFormData((prev) => ({
          ...prev,
          position: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
        }));
      } else {
        alert(t("MyClinic.AlertLocationNotFound"));
      }
    } catch (error) {
      alert(t("MyClinic.AlertSearchError"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.selectedDays.length === 0) {
      alert(t("MyClinic.ErrorNoDays") || "Please select at least one day.");
      return;
    }
    onSave(formData);
  };

  return (
    <>
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-t-3xl">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
          {t("MyClinic.ModalAddTitle")}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
        >
          <X size={22} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-7 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 rounded-b-3xl"
        style={{ maxHeight: "80vh" }}
      >
        {/* NEW: Clinic Image Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Camera size={14} />{" "}
            {t("MyClinic.LabelClinicImage") || "Clinic Photo"}
          </label>
          <div className="relative group flex justify-center">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageChange}
            />
            <div className="w-full h-44 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/40 overflow-hidden transition-all group-hover:border-blue-500/50">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-2">
                    <UploadCloud size={30} className="text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {t("MyClinic.ClickToUpload") ||
                      "Click to upload clinic image"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Clinic Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
            {t("MyClinic.LabelClinicName")}
          </label>
          <input
            required
            type="text"
            placeholder={t("MyClinic.PlaceholderClinicName")}
            className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm bg-gray-50 dark:bg-gray-800/40 dark:text-white font-medium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Phone size={14} /> {t("MyClinic.LabelPhone") || "Phone Number"}
          </label>
          <input
            required
            type="tel"
            placeholder={
              t("MyClinic.PlaceholderPhone") || "Enter clinic phone number"
            }
            className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm bg-gray-50 dark:bg-gray-800/40 dark:text-white font-medium"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* Sync from URL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <LinkIcon size={14} /> {t("MyClinic.LabelMapsUrl")}
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="Paste link and click Sync..."
              className="flex-1 p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.mapsUrl}
              onChange={(e) =>
                setFormData({ ...formData, mapsUrl: e.target.value })
              }
            />
            <button
              type="button"
              onClick={handleUrlFetch}
              disabled={isSearching}
              className="bg-[#2DA1D7] text-white px-6 rounded-2xl font-black hover:bg-[#2DA1D7]/90 transition-all flex items-center gap-2 disabled:opacity-50 uppercase tracking-tighter text-sm"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Navigation size={18} />
              )}
              <span>{t("MyClinic.BtnFetch") || "Sync"}</span>
            </button>
          </div>
        </div>

        {/* Address Field (Automatically filled by Sync) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
            {t("MyClinic.LabelAddress")}
          </label>
          <div className="flex gap-3">
            <input
              required
              type="text"
              placeholder={t("MyClinic.PlaceholderAddress")}
              className="flex-1 p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm bg-gray-50 dark:bg-gray-800/40 dark:text-white font-medium"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            <button
              type="button"
              onClick={handleSearchLocation}
              disabled={isSearching}
              className="bg-blue-600 text-white px-5 rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Map Preview */}
        <div
          className={`h-64 w-full rounded-[2rem] overflow-hidden border-4 transition-all duration-500 relative z-0 ${syncFlash ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-gray-100 dark:border-gray-800 shadow-sm"}`}
        >
          <MapContainer
            center={formData.position}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <RecenterAutomatically position={formData.position} />
            <InvalidateMapSize />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={formData.position} icon={DefaultIcon} />
          </MapContainer>
          {syncFlash && (
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse z-[400] flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl">
                Location Found!
              </div>
            </div>
          )}
        </div>

        {/* Working Days Grid */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
            {t("MyClinic.LabelWorkDays")}
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected = formData.selectedDays.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`relative flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-300 ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400"}`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold ${isSelected ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {day.short}
                  </span>
                  <div
                    className={`mt-1 w-1 h-1 rounded-full ${isSelected ? "bg-white animate-pulse" : "bg-transparent"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Times & Appointments */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
              <Clock size={14} className="inline mr-1" /> {t("MyClinic.From")}
            </label>
            <input
              required
              type="time"
              className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
              <Clock size={14} className="inline mr-1" /> {t("MyClinic.To")}
            </label>
            <input
              required
              type="time"
              className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
              <Timer size={14} className="inline mr-1" />{" "}
              {t("MyClinic.MinPerCase")}
            </label>
            <input
              required
              type="number"
              className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.minutesPerPatient}
              onChange={(e) =>
                setFormData({ ...formData, minutesPerPatient: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
              <Users size={14} className="inline mr-1" />{" "}
              {t("MyClinic.DailyLimit")}
            </label>
            <input
              required
              type="number"
              className="w-full p-4 border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.maxCasesPerDay}
              onChange={(e) =>
                setFormData({ ...formData, maxCasesPerDay: e.target.value })
              }
            />
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
            {t("MyClinic.LabelPrice")}
          </label>
          <div className="relative">
            <input
              required
              type="text"
              className="w-full p-4 pl-12 border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-gray-50 dark:bg-gray-800/40 dark:text-white"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <DollarSign
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white py-5 rounded-[2rem] font-black text-xl hover:shadow-2xl transition-all active:scale-[0.99] shadow-xl shadow-[#2DA1D7]/20 uppercase tracking-widest"
        >
          {t("MyClinic.BtnSaveClinic")}
        </button>
      </form>
    </>
  );
};

export default NewClinic;
