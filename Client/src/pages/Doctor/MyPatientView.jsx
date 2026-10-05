import React, { useMemo } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Activity,
  Syringe,
  User,
  FileText,
  Download,
  ExternalLink,
  Send,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import { openFileWithAuth } from "../../utils/fileAccess";

const MyPatientView = ({
  viewingPatient,
  setViewingPatient,
  setSelectedPatient,
  onOpenPatientChat,
  labTests,
  monitorings,
  t,
}) => {
  const activePatient = viewingPatient || {};
  const profile = activePatient.raw?.patientProfile || null;
  const patientTests = useMemo(() => {
    const patientIds = [profile?._id, profile?.Patient_Id]
      .filter(Boolean)
      .map((value) => String(value));

    return (labTests || []).filter((test) => {
      const testPatientIds = [test?.Patient_Id, test?.patientId, test?.patient?._id]
        .filter(Boolean)
        .map((value) => String(value));

      return testPatientIds.some((id) => patientIds.includes(id));
    });
  }, [labTests, profile]);
  const patientMonitorings = useMemo(() => {
    return (monitorings || [])
      .filter((entry) => String(entry?.patient || "") === String(profile?._id || ""))
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }, [monitorings, profile]);

  const displayName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    "Unknown";
  const displayAge = activePatient.age || 0;
  const displayPhoto = profile?.profileImage || "";
  const latestMonitoring = patientMonitorings[0];
  const displayInsulinUnits =
    latestMonitoring?.insulinUnit != null && Number(latestMonitoring.insulinUnit) > 0
      ? `${latestMonitoring.insulinUnit} Units`
      : profile?.insulinPrimaryDosage || "-";
  const displayInsulinType =
    Array.isArray(latestMonitoring?.insulin) && latestMonitoring.insulin.length > 0
      ? latestMonitoring.insulin[0]
      : profile?.insulinPrimary || "-";
  const analysesLabel = String(
    patientTests.filter((test) => {
      const createdAt = new Date(test?.createdAt || 0);
      const now = new Date();
      return (
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth()
      );
    }).length || 0,
  );
  const latestMonitoringValue =
    latestMonitoring?.level != null
      ? `${latestMonitoring.level} ${latestMonitoring.unit || ""}`.trim()
      : "-";
  const currentLocation = profile?.currentLocation || {};
  const hasLocation =
    Number.isFinite(Number(currentLocation?.latitude)) &&
    Number.isFinite(Number(currentLocation?.longitude));
  const mapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${currentLocation.latitude},${currentLocation.longitude}`,
      )}`
    : "";
  const locationUpdatedLabel = currentLocation?.updatedAt
    ? new Date(currentLocation.updatedAt).toLocaleString()
    : "";

  if (!viewingPatient) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center w-screen h-screen">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setViewingPatient(null)}
      ></div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-gray-100 dark:border-gray-700 mx-4">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Patient Insight
          </h2>
          <button
            onClick={() => setViewingPatient(null)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-700/50">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover shadow-sm bg-gray-50"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <User size={36} />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h3>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {displayAge} Years Old
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-5 text-lg">
              <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Activity size={18} />
              </div>
              Blood Collection
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Last Sample
                </p>
                <p className="font-extrabold text-lg text-gray-800 dark:text-white">
                  {latestMonitoringValue}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Date & Time
                </p>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {latestMonitoring?.date || latestMonitoring?.time || latestMonitoring?.createdAt ? (
                    <div className="flex flex-col gap-1 text-sm">
                      <span>{latestMonitoring?.date || ""}</span>
                      <span className="text-gray-500">
                        {latestMonitoring?.time ||
                          (latestMonitoring?.createdAt
                            ? new Date(latestMonitoring.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "")}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-5 text-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FileText size={18} />
              </div>
              Lab Tests
            </h4>

            {patientTests.length > 0 ? (
              <div className="space-y-4">
                {patientTests.map((test) => (
                  <div
                    key={test._id || test.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center gap-4"
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 dark:text-white">
                        {test.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{test.date}</span>
                        {test.type && (
                          <span className="uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md font-semibold">
                            {test.type}
                          </span>
                        )}
                      </div>
                      {test.notes && (
                        <p className="text-sm mt-2 text-gray-600 dark:text-gray-300 line-clamp-1">
                          {test.notes}
                        </p>
                      )}
                    </div>
                    {test.fileUrl && (
                      <button
                        type="button"
                        onClick={() => openFileWithAuth(test.fileUrl).catch(console.error)}
                        className="shrink-0 w-10 h-10 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center transition-colors"
                      >
                        {test.type === "pdf" ? (
                          <Download size={18} />
                        ) : (
                          <ExternalLink size={18} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No lab tests available.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-800/50">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-5 text-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Syringe size={18} />
              </div>
              Insulin & Analyses
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-wider mb-2">
                  Units Used
                </p>
                <p className="font-extrabold text-lg text-blue-900 dark:text-blue-100">
                  {displayInsulinUnits}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-wider mb-2">
                  Type Used
                </p>
                <p className="font-bold text-blue-900 dark:text-blue-100">
                  {displayInsulinType}
                </p>
              </div>
              <div className="col-span-2 mt-2 pt-5 border-t border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-wider mb-2">
                  Analyses Added This Month
                </p>
                <p className="font-bold text-blue-900 dark:text-blue-100">
                  {analysesLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2.5 mb-5 text-lg">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                <MapPin size={18} />
              </div>
              Current Location
            </h4>

            {hasLocation ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {currentLocation?.label ||
                    `${profile?.address || ""}${profile?.city ? `, ${profile.city}` : ""}${profile?.governorate ? `, ${profile.governorate}` : ""}`.trim() ||
                    "Patient location available"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {locationUpdatedLabel || "-"}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Lat: {Number(currentLocation.latitude).toFixed(5)}</span>
                  <span>Lng: {Number(currentLocation.longitude).toFixed(5)}</span>
                  {currentLocation?.accuracy ? (
                    <span>Accuracy: {Math.round(Number(currentLocation.accuracy))}m</span>
                  ) : null}
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  <ExternalLink size={16} /> Open in Maps
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No current location shared yet.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              onOpenPatientChat?.(activePatient);
              setViewingPatient(null);
            }}
            className="w-full bg-[#8EC641] hover:bg-[#8EC641]/90 text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-xl shadow-[#8EC641]/20 hover:shadow-2xl active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            <MessageSquare size={18} /> Message
          </button>
          <button
            onClick={() => {
              setSelectedPatient(activePatient);
              setViewingPatient(null);
            }}
            className="w-full bg-[#2DA1D7] hover:bg-[#2DA1D7]/90 text-white font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-xl shadow-[#2DA1D7]/20 hover:shadow-2xl active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            <Send size={18} />{" "}
            {t("AllPatient.BtnSendFeedback") || "Issue Feedback"}
          </button>
          {profile?.phone ? (
            <a
              href={`tel:${profile.phone}`}
              className="sm:col-span-2 w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 text-sm"
            >
              <Phone size={18} /> Call {profile.phone}
            </a>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MyPatientView;
