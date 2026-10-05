import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  CheckCircle,
  Calendar,
  Users,
  X,
  Copy,
  Map,
  Hash,
  ChevronRight
} from "lucide-react";
import useBookDoctors from "../../hooks/useBookDoctors";

/**
 * [COMPONENT]: BookingModal
 * Purpose: Intensive scheduling interface for selecting time slots and validating medical bookings.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Green (#8EC641).
 */
const BookingModal = ({ doctor, clinicId, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createItem } = useBookDoctors();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const clinic = doctor.clinics.find((c) => c.id === clinicId);
  const clinicLocation = clinic?.coords || { lat: 30.0444, lng: 31.2357 };

  const bookedSlots = ["01:00 PM"];
  const timeSlots = ["10:00 AM", "11:30 AM", "01:00 PM", "04:00 PM", "05:30 PM", "07:00 PM"];

  /**
   * [LOGIC]: availableDays
   * Calculates valid business days for the clinical context based on doctor parameters.
   */
  const availableDays = useMemo(() => {
    const days = [];
    let current = new Date();
    let count = 0;
    const workDays = clinic?.selectedDays?.length > 0 ? clinic.selectedDays : ["sun", "mon"];

    while (days.length < 5 && count < 14) { 
      current.setDate(current.getDate() + 1);
      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      if (workDays.includes(dayName)) days.push(new Date(current));
      count++;
    }
    return days;
  }, [clinic]);

  const formatDateValue = (dateObj) => dateObj.toISOString().split("T")[0];

  const handleCopyLocation = () => {
    if (clinic?.address) {
      navigator.clipboard.writeText(clinic.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleOpenMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${clinicLocation.lat},${clinicLocation.lng}`, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return alert(t("BookingModal.AlertSelection"));

    let patientName = "Guest Profile";
    let phoneNumber = "Unknown";
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (parsedUser) {
        patientName = `${parsedUser.firstName || ""} ${parsedUser.lastName || ""}`.trim();
        phoneNumber = parsedUser.phoneNumber || parsedUser.telephoneNumber || "";
      }
    } catch (e) {}

    let bookingId = null;
    try {
      const created = await createItem({
        doctorName: doctor?.name,
        clinicName: clinic?.name,
        clinicAddress: clinic?.address,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        fees: Number(clinic?.price) || 0,
        patientName,
        phoneNumber,
      });
      bookingId = created?._id;
    } catch (e) {}

    navigate("/payment", {
      state: {
        doctor,
        clinic,
        appointmentDate: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        appointmentTime: selectedTime,
        fees: clinic.price,
        appointmentNumber: timeSlots.indexOf(selectedTime) + 1,
        bookingId,
      },
    });
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-gray-100 dark:border-gray-800 animate-slide-up">
        
        <div className="bg-gray-50 dark:bg-gray-800/80 px-10 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#2DA1D7]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t("BookingModal.Title")}</h2>
            <p className="text-[10px] font-black text-[#2DA1D7] uppercase tracking-[0.2em]">{clinic?.name}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"><X size={24} className="text-gray-400" /></button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-10 space-y-10">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] p-8 text-center border-2 border-transparent hover:border-[#2DA1D7]/10 transition-all shadow-inner">
              <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl text-[#2DA1D7]"><MapPin size={32} /></div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight leading-relaxed">{clinic?.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={handleCopyLocation} className={`flex items-center justify-center gap-3 py-5 rounded-2xl border-4 font-black uppercase tracking-widest text-xs transition-all ${copySuccess ? "bg-[#8EC641]/10 border-[#8EC641]/20 text-[#8EC641]" : "bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-800 text-gray-400"}`}>
                {copySuccess ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copySuccess ? "Synchronized" : "Copy Registry"}
              </button>
              <button type="button" onClick={handleOpenMaps} className="bg-[#2DA1D7] text-white py-5 rounded-2xl shadow-xl shadow-[#2DA1D7]/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"><Map size={18} /> GPS Navigation</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 border-t border-gray-50 dark:border-gray-800 pt-10">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Registry Available Windows</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableDays.map((dateObj, index) => {
                  const dateValue = formatDateValue(dateObj);
                  const isSelected = selectedDate === dateValue;
                  return (
                    <button key={index} type="button" onClick={() => setSelectedDate(dateValue)} className={`relative p-6 rounded-[1.5rem] border-4 transition-all text-left group overflow-hidden ${isSelected ? "border-[#2DA1D7] bg-[#2DA1D7]/5" : "border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800"}`}>
                      {isSelected && <div className="absolute top-0 right-0 w-8 h-8 bg-[#2DA1D7] rounded-bl-3xl flex items-center justify-center text-white"><CheckCircle size={14} /></div>}
                      <span className="block text-xs font-black uppercase tracking-widest text-[#2DA1D7] mb-1">{dateObj.toLocaleDateString("en-US", { weekday: "long" })}</span>
                      <span className="block text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot Selection</label>
                {selectedTime && <span className="bg-[#8EC641]/10 text-[#8EC641] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Queue Position: #{timeSlots.indexOf(selectedTime) + 1}</span>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => {
                  const isBooked = bookedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button key={time} type="button" disabled={isBooked} onClick={() => !isBooked && setSelectedTime(time)} className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${isBooked ? "bg-red-50 text-red-200 border-red-50 cursor-not-allowed" : isSelected ? "bg-[#2DA1D7] text-white border-[#2DA1D7] shadow-lg shadow-[#2DA1D7]/20 scale-105" : "bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:border-[#2DA1D7]/30"}`}>
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50 dark:border-gray-800">
              <div className="flex justify-between items-end mb-8 px-4">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clinic Consultation Fee</p>
                   <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{clinic?.price} <span className="text-xs text-gray-400 ml-1">{t("DRView.Currency")}</span></p>
                </div>
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 shadow-inner"><Hash size={24} /></div>
              </div>
              <button type="submit" className="w-full bg-[#2DA1D7] hover:bg-[#1e7ca8] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-[#2DA1D7]/30 active:scale-95 transition-all flex items-center justify-center gap-4">
                 Resolve Booking <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>, document.body
  );
};

/**
 * [COMPONENT]: ClinicBook (Main Listing)
 * Purpose: Iterative component to display multiple available clinic contexts for a single provider.
 */
const ClinicBook = ({ doctor, t }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState(null);

  const handleOpenBooking = (id) => {
    setSelectedClinicId(id);
    setShowBookingModal(true);
  };

  if (!doctor.clinics || doctor.clinics.length === 0) {
    return (
      <div className="text-center py-24 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800">
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t("DRView.NoClinicsFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {doctor.clinics.map((clinic) => {
          const displayDays = clinic.selectedDays?.length > 0 ? clinic.selectedDays : ["sun", "mon"];
          return (
            <div key={clinic.id} className="group bg-white dark:bg-gray-900 rounded-[3rem] p-8 border-2 border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2DA1D7]/5 rounded-bl-full group-hover:bg-[#2DA1D7]/10 transition-colors"></div>
              
              <div className="h-56 w-full mb-8 rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner p-3 border border-gray-50 dark:border-gray-800">
                <img 
                  src={clinic.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"} 
                  alt={clinic.name} 
                  className="w-full h-full object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-700" 
                />
              </div>

              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-3xl flex items-center justify-center shadow-inner shrink-0 group-hover:bg-[#2DA1D7] group-hover:text-white transition-all"><MapPin size={24} /></div>
                <div className="min-w-0">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{clinic.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{clinic.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent group-hover:border-[#2DA1D7]/10 transition-all">
                  <div className="flex items-center gap-2 text-[#2DA1D7] mb-2">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Work Roster</span>
                  </div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase leading-tight">
                    {displayDays.map(day => t(`Days.${day}`)).join(", ")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent group-hover:border-[#8EC641]/10 transition-all">
                  <div className="flex items-center gap-2 text-[#8EC641] mb-2">
                    <Users size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Clinic Limit</span>
                  </div>
                  <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase leading-tight">
                    {clinic.maxCasesPerDay || "20"} Medical Slots
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
                   <p className="text-2xl font-black text-[#2DA1D7] uppercase tracking-tighter">{clinic.price} <span className="text-xs">{t("DRView.Currency")}</span></p>
                </div>
                <button onClick={() => handleOpenBooking(clinic.id)} className="bg-[#8EC641] hover:bg-[#6a9431] text-white font-black uppercase tracking-widest text-xs py-4 px-8 rounded-2xl shadow-xl shadow-[#8EC641]/20 transition-all active:scale-90 flex items-center gap-3">
                   Book Spot <CheckCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showBookingModal && (
        <BookingModal doctor={doctor} clinicId={selectedClinicId} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

export default ClinicBook;
