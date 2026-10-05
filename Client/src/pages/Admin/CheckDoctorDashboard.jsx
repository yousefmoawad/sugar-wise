import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom"; // 1. Import ReactDOM for Portal
import useVerificationDoctors from "../../hooks/useVerificationDoctors";
/* [BRANDED ICONS]: Professional icons for doctor verification workflow */
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Ban,
  UserSquare2, 
  Stethoscope, 
  Eye,
  X
} from "lucide-react";

/**
 * CheckDoctorDashboard
 * 
 * Manages the approval/rejection of doctor verification requests.
 * Uses the project's brand identity: Blue (#2DA1D7) and Green (#8EC641).
 */
const CheckDoctorDashboard = () => {
  const { items, loading, error, fetchAll, updateItem } = useVerificationDoctors();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); 
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const normalizedDoctors = (items || []).map((verification) => {
      const doctorProfile = verification.doctor || {};
      const fullName =
        `${doctorProfile.firstName || ""} ${doctorProfile.lastName || ""}`.trim() ||
        verification.fullName ||
        "Unknown Doctor";

      return {
        id: verification._id,
        name: fullName,
        specialty:
          doctorProfile.medicalSpecialty ||
          verification.medicalSpecialty ||
          "General",
        status: verification.status || "pending",
        selfieId:
          doctorProfile.selfImg ||
          verification.selfImg ||
          "https://placehold.co/800x500?text=No+Image",
        image:
          doctorProfile.profileImage ||
          doctorProfile.selfImg ||
          verification.selfImg ||
          "https://placehold.co/200x200?text=Doctor",
      };
    });
    setDoctors(normalizedDoctors);
  }, [items]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateItem(id, { status: newStatus });
      await fetchAll();
    } catch (updateError) {
      console.error(updateError);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in min-h-screen">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Doctor Verification</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Verify credentials and manage professional access requests.</p>
        </div>
      </div>

      {/* [SEARCH COMPONENT]: Professional brand search with blue focus highlights */}
      <div className="relative w-full group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search doctors..." 
          className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-[#2DA1D7] transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <p className="text-sm text-blue-600">Loading verification requests...</p>
      )}
      {error && (
        <p className="text-sm text-red-600">Failed to load verification data</p>
      )}

      {/* [DATA TABLE]: Brand-consistent table with professional blue accents */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2DA1D7]/5 dark:bg-gray-800/50 border-b border-[#2DA1D7]/10">
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest">Doctor Profile</th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-center">Selfie w/ ID</th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-center">Case Status</th>
              <th className="px-8 py-6 text-xs font-black text-[#2DA1D7] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {doctors.filter(dr => dr.name.toLowerCase().includes(searchTerm.toLowerCase())).map((dr) => (
              <tr key={dr.id} className="group hover:bg-[#2DA1D7]/5 dark:hover:bg-[#2DA1D7]/10 transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={dr.image} alt={dr.name} className="w-14 h-14 rounded-2xl border-2 border-white dark:border-gray-700 object-cover shadow-md" />
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-100 block">{dr.name}</span>
                      <span className="text-[10px] font-black uppercase text-[#2DA1D7] flex items-center gap-1"><Stethoscope size={12} /> {dr.specialty}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <button onClick={() => setSelectedImage(dr.selfieId)} className="relative w-24 h-16 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#2DA1D7] transition-all">
                    <img src={dr.selfieId} alt="ID" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#2DA1D7]/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Eye size={18} className="text-white" /></div>
                  </button>
                </td>
                <td className="px-8 py-5 text-center">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                     dr.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                     dr.status === 'accepted' ? 'bg-[#8EC641]/10 text-[#8EC641] border-[#8EC641]/20' : 
                     'bg-rose-50 text-rose-600 border-rose-100'
                   }`}>
                     {dr.status}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleStatusUpdate(dr.id, "accepted")} className="p-3 bg-[#8EC641]/10 text-[#8EC641] rounded-2xl hover:bg-[#8EC641] hover:text-white transition-all"><CheckCircle2 size={20} /></button>
                    <button onClick={() => handleStatusUpdate(dr.id, "rejected")} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><XCircle size={20} /></button>
                    <button onClick={() => handleStatusUpdate(dr.id, "blocked")} className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-900 hover:text-white transition-all"><Ban size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* [MODAL CONTENT]: High-fidelity verification view via Portal */}
      {selectedImage && ReactDOM.createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4 md:p-10">
          
          {/* Background Close Click */}
          <div className="absolute inset-0 w-full h-full" onClick={() => setSelectedImage(null)}></div>
          
          <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-0 right-0 md:-top-5 md:-right-5 p-4 bg-white/10 hover:bg-rose-500 text-white rounded-full transition-all pointer-events-auto z-10 shadow-2xl"
            >
              <X size={32} />
            </button>

            {/* Label */}
            <div className="mb-6 flex items-center gap-2 text-white/50 uppercase font-black text-xs tracking-widest animate-fade-in">
                <UserSquare2 size={20} className="text-[#2DA1D7]" /> Identity Verification Proof
            </div>

            {/* Image Wrapper */}
            <div className="w-full h-[75vh] flex items-center justify-center pointer-events-auto animate-zoom-in">
               <img 
                 src={selectedImage} 
                 alt="Zoomed ID" 
                 className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border-8 border-white/5 bg-gray-900"
               />
            </div>
            
            <p className="mt-6 text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Click outside or press X to close</p>
          </div>
        </div>,
        document.body // This pushes the modal to the very end of <body>
      )}
    </div>
  );
};

export default CheckDoctorDashboard;
