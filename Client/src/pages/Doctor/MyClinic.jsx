import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import useMyClinics from "../../hooks/useMyClinics";

import {
  Plus,
  MapPin,
  Clock,
  Phone,
  DollarSign,
  Navigation,
  Trash2,
} from "lucide-react";
import NewClinic from "./NewClinic"; // Import the new form component

const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-50 border border-gray-100 dark:border-gray-700 animate-scale-in">
        {children}
      </div>
    </div>,
    document.body,
  );
};

const MyClinic = () => {
  const context = useOutletContext();
  const { t: localT } = useTranslation();
  const t = context?.t || localT;
  const { items, loading, error, fetchAll, createItem, updateItem, deleteItem } =
    useMyClinics();

  const [showModal, setShowModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mapped = (items || []).map((clinic) => ({
      id: clinic._id,
      image: clinic.image || null,
      name: clinic.name || "Clinic",
      address: clinic.address || "-",
      hours: clinic.hours || "-",
      phone: clinic.phone || "-",
      price: clinic.price || "-",
      position: clinic.position
        ? [clinic.position.lat, clinic.position.lng]
        : [30.0444, 31.2357],
      raw: clinic,
    }));
    setClinics(mapped);
  }, [items]);

  const handleSaveClinic = async (newClinicData) => {
    try {
      const payload = {
        ...newClinicData,
        hours: `${newClinicData.startTime || '09:00'} - ${newClinicData.endTime || '17:00'}`,
        position: {
          lat: newClinicData.position?.[0] ?? 30.0444,
          lng: newClinicData.position?.[1] ?? 31.2357,
        },
      };

      if (editingClinic) {
        await updateItem(editingClinic._id, payload);
      } else {
        await createItem(payload);
      }

      await fetchAll();
      setShowModal(false);
      setEditingClinic(null);
    } catch (saveError) {
      console.error(saveError);
    }
  };

  const handleDeleteClinic = async (clinicId) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;
    try {
      await deleteItem(clinicId);
      setClinics((prev) => prev.filter((clinic) => clinic.id !== clinicId));
    } catch (deleteError) {
      console.error(deleteError);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="text-center md:text-left rtl:md:text-right space-y-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
            {t("MyClinic.PageTitle")}
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
            {t("MyClinic.PageSubtitle")}
          </p>
        </div>
        {clinics.length > 0 && (
          <button
            onClick={() => {
              setEditingClinic(null);
              setShowModal(true);
            }}
            className="group relative px-6 py-3 rounded-2xl bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white font-black shadow-xl shadow-[#2DA1D7]/20 hover:shadow-[#2DA1D7]/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden uppercase tracking-widest text-base"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center gap-2">
              <Plus size={22} strokeWidth={2.5} />
              <span>{t("MyClinic.BtnAddClinic")}</span>
            </div>
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {loading && <p className="text-sm text-blue-600">Loading clinics...</p>}
      {error && <p className="text-sm text-red-600">Failed to load clinics</p>}
      {clinics.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <MapPin size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            No Clinics Added
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            Add your first clinic location to get started. Your clinics will
            appear here.
          </p>
          <button
            onClick={() => {
              setEditingClinic(null);
              setShowModal(true);
            }}
            className="px-8 py-4 rounded-2xl bg-[#2DA1D7] text-white font-black shadow-xl shadow-[#2DA1D7]/20 hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-base"
          >
            {t("MyClinic.BtnAddClinic")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1"
            >
              <div className="h-48 w-full relative z-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={
                    clinic.image ||
                    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
                  }
                  alt={clinic.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${clinic.position[0]},${clinic.position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-400 z-[400] flex items-center gap-1.5 shadow-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors pointer-events-auto"
                >
                  <Navigation size={12} fill="currentColor" /> View Map
                </a>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {clinic.name}
                  </h2>
                </div>

                <div className="space-y-4 text-sm flex-1">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors duration-300">
                    <MapPin
                      size={18}
                      className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5"
                    />
                    <span className="font-medium line-clamp-2 text-gray-700 dark:text-gray-300">
                      {clinic.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 px-1">
                    <div className="flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-orange-500 dark:text-orange-400"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {clinic.hours}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-2">
                      <Phone
                        size={16}
                        className="text-purple-500 dark:text-purple-400"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {clinic.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg text-sm">
                    <DollarSign size={16} /> {clinic.price}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingClinic(clinic.raw);
                        setShowModal(true);
                      }}
                      className="text-sm font-bold text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDeleteClinic(clinic.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Clinic"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setEditingClinic(null);
          }}
        >
          <NewClinic
            t={t}
            onSave={handleSaveClinic}
            onClose={() => {
              setShowModal(false);
              setEditingClinic(null);
            }}
            initialData={editingClinic}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyClinic;
