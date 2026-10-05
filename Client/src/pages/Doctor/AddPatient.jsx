import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import {
  Search,
  Send,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  X,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { userAPI } from "../../services/api";
import useMessages from "../../hooks/useMessages";
import useMyPatients from "../../hooks/useMyPatients";

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const calcAge = (birthday) => {
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

const mapUserToPatientDirectoryEntry = (user) => {
  const patientProfile =
    user?.patient && typeof user.patient === "object" ? user.patient : null;
  const firstName = String(patientProfile?.firstName || "").trim();
  const lastName = String(patientProfile?.lastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...user,
    name: fullName || String(user?.name || "").trim() || "Unknown",
    email: patientProfile?.email || user?.email || "",
    image: patientProfile?.profileImage || user?.image || "",
    patientProfile,
    patientProfileId:
      patientProfile?._id ||
      (typeof user?.patient === "string" ? user.patient : null) ||
      user?.patientProfileId ||
      null,
    patientUserId: user?._id || null,
    patientFirstName: firstName,
    patientLastName: lastName,
    patientCode: patientProfile?.Patient_Id || "",
    age: calcAge(patientProfile?.birthday) || Number(user?.age) || 0,
  };
};

const AddPatient = ({ onClose, onAdded }) => {
  const { t } = useTranslation();
  const { createItem: sendMessage, loading: messageLoading } = useMessages();
  const { createItem: createMyPatient, loading: addLoading } =
    useMyPatients();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [allPatients, setAllPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchPatientsFromDatabase = async () => {
      setPatientsLoading(true);
      setPatientsError("");

      try {
        const response = await userAPI.getAllUsers();
        const rawUsers = response.data?.data ?? response.data ?? [];
        const patientUsers = Array.isArray(rawUsers)
          ? rawUsers.filter((user) => normalizeRole(user?.role) === "patient")
          : [];

        if (!isActive) return;
        setAllPatients(patientUsers.map(mapUserToPatientDirectoryEntry));
      } catch (error) {
        if (!isActive) return;
        setPatientsError(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to load patients from database",
        );
      } finally {
        if (isActive) {
          setPatientsLoading(false);
        }
      }
    };

    fetchPatientsFromDatabase();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allPatients.filter((patient) => {
      const searchText = [
        patient.name,
        patient.email,
        patient.patientFirstName,
        patient.patientLastName,
        patient.patientCode,
        patient.patientProfileId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [allPatients, searchQuery]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !messageText.trim()) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const senderId = currentUser._id || currentUser.id;

      if (!senderId) {
        throw new Error("User not logged in");
      }

      await sendMessage({
        senderId,
        receiverId: selectedPatient._id,
        messageText: messageText.trim(),
      });

      setStatus({
        type: "success",
        message: `Message sent to ${selectedPatient.name} successfully!`,
      });
      setMessageText("");
      setTimeout(() => {
        setSelectedPatient(null);
        setStatus({ type: "", message: "" });
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setStatus({ type: "", message: "" });
  };

  const handleAddPatient = async (patient) => {
    try {
      const created = await createMyPatient({
        patientUserId: patient.patientUserId || patient._id,
        patientProfileId: patient.patientProfileId,
        name: patient.name || "Unknown",
        email: patient.email || "",
        image: patient.image || patient.patient?.profileImage || "",
      });

      setStatus({
        type: "success",
        message: `${patient.name} added to your patients successfully!`,
      });
      onAdded?.(created);
      setTimeout(() => {
        setStatus({ type: "", message: "" });
        onClose?.();
      }, 900);
    } catch (error) {
      console.error("Failed to add patient:", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to add patient. Please try again.",
      });
    }
  };

  const modalRoot = document.body;
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-gray-100 dark:border-gray-800 mx-4">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2DA1D7] rounded-xl text-white shadow-xl shadow-[#2DA1D7]/30">
              <Users size={16} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {selectedPatient
                ? `Message ${selectedPatient.name}`
                : t("DoctorAddPatient.Title") || "Patient Reach"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-500 dark:text-gray-400 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          {status.message && !selectedPatient ? (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <p className="font-semibold text-sm">{status.message}</p>
            </div>
          ) : null}

          {!selectedPatient ? (
            <>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                  placeholder={
                    t("DoctorAddPatient.SearchPlaceholder") ||
                    "Search by name or email..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {patientsLoading && (
                  <div className="absolute inset-y-0 right-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              {patientsError && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  <p className="font-semibold text-sm">{patientsError}</p>
                </div>
              )}

              <div className="space-y-3 min-h-[300px]">
                {searchQuery &&
                  filteredPatients.length === 0 &&
                  !patientsLoading && (
                    <div className="text-center py-10 opacity-50">
                      <User className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm dark:text-gray-400">
                        No patients found matching your search.
                      </p>
                    </div>
                  )}

                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {patient.image ? (
                        <img
                          src={patient.image}
                          className="w-12 h-12 rounded-xl object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                          <User size={24} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center"
                        title="Message patient"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPatient(patient)}
                        disabled={addLoading}
                        className="w-10 h-10 rounded-xl bg-[#2DA1D7] text-white hover:bg-[#2DA1D7]/90 transition-all flex items-center justify-center shadow-lg shadow-[#2DA1D7]/20 disabled:opacity-60"
                        title="Add patient"
                      >
                        {addLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Plus size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {!searchQuery && (
                  <div className="text-center py-16 opacity-30">
                    <Search size={40} className="mx-auto mb-2 dark:text-white" />
                    <p className="text-sm font-medium dark:text-white">
                      Discover patients in the database
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {status.message && (
                <div
                  className={`p-4 rounded-2xl flex items-center gap-3 ${
                    status.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <p className="font-semibold text-sm">{status.message}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                    Recipient
                  </p>
                  <p className="font-bold dark:text-white">
                    {selectedPatient.name}
                  </p>
                </div>
              </div>

              <textarea
                rows="6"
                className="w-full p-5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Type your clinical assessment or instructions here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Back to list
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={messageLoading || !messageText.trim()}
                  className="flex-[2] py-4 bg-[#2DA1D7] text-white rounded-2xl font-black hover:bg-[#2DA1D7]/90 shadow-xl shadow-[#2DA1D7]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  {messageLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> Send Instructions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export default AddPatient;
