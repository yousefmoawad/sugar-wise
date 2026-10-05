import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Trash2,
  User,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useOutletContext} from "react-router-dom";
import useMyPatients from "../../hooks/useMyPatients";
import useLabTests from "../../hooks/useLabTests";
import useDiabetesMonitorings from "../../hooks/useDiabetesMonitorings";
import AddPatient from "./AddPatient";
import MyPatientView from "./MyPatientView";

const calcAgeFromBirthday = (birthday) => {
  if (!birthday) return 0;
  const dob = new Date(birthday);
  if (Number.isNaN(dob.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
};

const MyPatient = () => {
  // Always call hooks unconditionally
  const outletContext = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const { t: tHook } = useTranslation();

  // Use context t if available, otherwise fallback to hook t
  const t = outletContext?.t || tHook;
  const { items, loading, error, fetchAll, createItem, deleteItem } =
    useMyPatients();
  const { items: labTests, fetchAll: fetchAllLabTests } = useLabTests();
  const { items: monitorings, fetchAll: fetchAllMonitorings } =
    useDiabetesMonitorings();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false); // NEW: State for Add Patient popup
  const [feedback, setFeedback] = useState("");

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
    fetchAllLabTests().catch(() => {});
    fetchAllMonitorings().catch(() => {});
  }, [fetchAll, fetchAllLabTests, fetchAllMonitorings]);

  useEffect(() => {
    const mapped = (items || [])
      .map((patient) => {
      const profile = patient.patientProfile || null;
      if (!profile?._id) return null;

      const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      const patientTests = (labTests || []).filter(
        (test) => String(test?.Patient_Id || "") === String(profile?.Patient_Id || ""),
      );
      const patientMonitorings = (monitorings || []).filter(
        (entry) => String(entry?.patient || "") === String(profile?._id || ""),
      );
      const latestMonitoring = patientMonitorings
        .slice()
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))[0];
      return {
        id: patient._id,
        name: fullName || "Unknown",
        age: calcAgeFromBirthday(profile?.birthday),
        photo: profile?.profileImage || null,
        lastTest:
          latestMonitoring?.level != null
            ? `${latestMonitoring.level} ${latestMonitoring.unit || ""}`.trim()
            : "-",
        testDate: latestMonitoring?.date || "-",
        testTime: latestMonitoring?.time
          ? latestMonitoring.time
          : latestMonitoring?.createdAt
          ? new Date(latestMonitoring.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        insulin:
          latestMonitoring?.insulinUnit != null && Number(latestMonitoring.insulinUnit) > 0
            ? `${latestMonitoring.insulinUnit} Units`
            : profile?.insulinPrimaryDosage || "-",
        insulinType:
          Array.isArray(latestMonitoring?.insulin) && latestMonitoring.insulin.length > 0
            ? latestMonitoring.insulin[0]
            : profile?.insulinPrimary || "-",
        analysesAdded: String(
          patientTests.filter((test) => {
            const createdAt = new Date(test?.createdAt || 0);
            const now = new Date();
            return (
              createdAt.getFullYear() === now.getFullYear() &&
              createdAt.getMonth() === now.getMonth()
            );
          }).length || 0,
        ),
        status: patient.status || "Normal",
        raw: patient,
      };
    })
      .filter(Boolean);
    setPatients(mapped);
  }, [items, labTests, monitorings]);

  const openPatientChat = useCallback((patient) => {
    const patientUserId = patient?.raw?.patientUser;
    const patientProfileId = patient?.raw?.patientProfile?._id;
    const targetId = patientUserId || patientProfileId;
    if (!targetId) return;

    const params = new URLSearchParams();
    params.set("recipient", String(targetId));
    params.set("recipientName", patient.name || "Patient");
    navigate(`/messages?${params.toString()}`);
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedPatientId = params.get("patient");
    const requestedFocus = params.get("focus");
    if (!requestedPatientId || !patients.length) return;

    const matchedPatient = patients.find((patient) => {
      const profileId = patient.raw?.patientProfile?._id;
      return String(profileId || "") === String(requestedPatientId);
    });

    if (matchedPatient) {
      if (requestedFocus === "chat") {
        openPatientChat(matchedPatient);
      } else {
        setViewingPatient(matchedPatient);
      }
    }
  }, [location.search, openPatientChat, patients]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        t("AllPatient.AlertDelete") ||
          "Are you sure you want to delete this patient?",
      )
    ) {
      try {
        await deleteItem(id);
        setPatients((prev) => prev.filter((p) => p.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    try {
      await createItem({
        name: selectedPatient.name,
        age: selectedPatient.age,
        lastTest: selectedPatient.lastTest,
        insulin: selectedPatient.insulin,
        status: selectedPatient.status,
        feedback,
      });
      alert(
        `${t("AllPatient.AlertFeedbackSent") || "Feedback sent to"} ${selectedPatient.name}: ${feedback}`,
      );
      setSelectedPatient(null);
      setFeedback("");
    } catch (sendError) {
      console.error(sendError);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-6">
      {/* [BRAND DESIGN]: Header with dominant Primary Blue for clinical clarity */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight uppercase">
            {t("AllPatient.PageTitle") || "My Patients"}
          </h1>
          <p className="text-base font-medium text-gray-500 dark:text-gray-400 transition-colors mt-1">
            {t("AllPatient.PageSubtitle") ||
              "Manage and monitor your patients' health status with precision."}
          </p>
        </div>
        <button 
          onClick={() => setShowAddPatient(true)}
          className="bg-[#2DA1D7] text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-[#2DA1D7]/20 hover:bg-[#2DA1D7]/90 transition-all hover:-translate-y-0.5 uppercase tracking-widest text-base"
        >
          <i className="fas fa-plus"></i> {t("AllPatient.BtnAddNew") || "Add New Patient"}
        </button>
      </div>

      {/* Patient Cards Grid */}
      {loading && <p className="text-sm text-blue-600">Loading patients...</p>}
      {error && <p className="text-sm text-red-600">Failed to load patients</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition duration-300 relative group"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {patient.photo ? (
                  <img
                    src={patient.photo}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-50"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors shrink-0">
                    <User size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 transition-colors">
                    {patient.age}{" "}
                    {t("AllPatient.LabelAgeSuffix") || "Years Old"}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(patient.id);
                }}
                className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition ml-2"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewingPatient(patient)}
                className="flex-1 bg-[#2DA1D7]/10 text-[#2DA1D7] font-black py-4 rounded-2xl hover:bg-[#2DA1D7]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-base"
              >
                <Eye size={18} /> {t("AllPatient.BtnView") || "Open Record"}
              </button>
              <button
                onClick={() => openPatientChat(patient)}
                className="w-14 h-14 rounded-2xl bg-[#8EC641]/10 text-[#8EC641] hover:bg-[#8EC641]/20 transition-all flex items-center justify-center"
                title="Message patient"
              >
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in border dark:border-gray-700 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              {t("AllPatient.ModalTitle") || "Send Feedback to"}{" "}
              {selectedPatient.name}
            </h2>
            <textarea
              rows="4"
              className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              placeholder={
                t("AllPatient.PlaceholderFeedback") || "Write your feedback..."
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendFeedback}
                className="w-full bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white py-4 rounded-2xl font-black text-xl hover:shadow-2xl transition-all active:scale-[0.99] shadow-xl shadow-[#2DA1D7]/20 uppercase tracking-widest"
              >
                {t("AllPatient.BtnSend") || "Send"}
              </button>
              <button
                onClick={() => setSelectedPatient(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t("AllPatient.BtnCancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Conditional rendering for AddPatient popup */}
      {showAddPatient && (
        <AddPatient
          onClose={() => setShowAddPatient(false)}
          onAdded={() => {
            fetchAll().catch(() => {});
          }}
        />
      )}

      {/* View Patient Details Modal */}
      <MyPatientView
        viewingPatient={viewingPatient}
        setViewingPatient={setViewingPatient}
        setSelectedPatient={setSelectedPatient}
        onOpenPatientChat={openPatientChat}
        labTests={labTests}
        monitorings={monitorings}
        t={t}
      />
    </div>
  );
};

export default MyPatient;
