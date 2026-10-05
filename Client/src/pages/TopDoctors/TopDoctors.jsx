import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Layouts/Navbar'; 
import Footer from '../../Components/Layouts/Footer'; 
import { 
  Search, Star, MapPin, Filter, ArrowRight, 
  Heart, Activity, Stethoscope, Clock, ShieldCheck 
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import AOS from 'aos';
import 'aos/dist/aos.css';
import useDoctors from '../../hooks/useDoctors';

/**
 * [COMPONENT]: TopDoctors
 * Purpose: Professional roster for discovering and filtering clinical specialists.
 * Styling: Premium clinical aesthetic using Primary Blue (#2DA1D7) and Green (#8EC641).
 */

/**
 * [LOGIC]: mapDoctor
 * Normalizes doctor data from the API into a consistent internal format for the UI.
 */
const mapDoctor = (doctor, index = 0) => {
  const name = `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || doctor.name || "Doctor";
  const specialty = doctor.medicalSpecialty || doctor.specialty || "General Medicine";
  const category = specialty.includes("Cardio")
    ? "Cardiology"
    : specialty.includes("Endocr")
    ? "Diabetes"
    : specialty.includes("Pressure") || specialty.includes("Nephro")
    ? "Blood Pressure"
    : "All";

    return {
      ...doctor,
      _id: doctor._id,
      id: doctor._id || doctor.id || `doctor-${index}`,
      doctorId: doctor.doctorId,
      name,
      specialty,
      rating: Number(doctor.averageRating ?? doctor.rating ?? doctor.rate ?? 0),
      reviews: Number(doctor.ratingCount ?? doctor.reviews ?? 0),
      experience: doctor.experienceYears != null ? `${doctor.experienceYears} Years` : (doctor.experience || "0 Years"),
      patients: doctor.patients != null ? String(doctor.patients) : (doctor.followersCount != null ? String(doctor.followersCount) : "0"),
      about: doctor.about || doctor.bio || `Specialist in ${specialty}.`,
      image: doctor.profileImage || doctor.image || "https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg",
      category,
      availability: doctor.Status === "Online" ? "Online Today" : "Schedule Clinical Visit",
      clinics: Array.isArray(doctor.clinics) && doctor.clinics.length > 0
        ? doctor.clinics
        : [{
            id: `${doctor._id || doctor.id || index}-clinic-1`,
            name: `${name} Clinic`,
            address: doctor.address || "Medical Plaza, Area 4",
            price: doctor.price || 300,
            selectedDays: ["sun", "mon"],
            maxCasesPerDay: 20,
          }],
  };
};

const TopDoctors = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, loading, error, fetchAll } = useDoctors();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const doctorsList = useMemo(() => Array.isArray(items) ? items.map(mapDoctor) : [], [items]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const categories = [
    { id: 'All', label: t('doctors.filter_all'), icon: Stethoscope },
    { id: 'Diabetes', label: t('doctors.filter_diabetes'), icon: Activity },
    { id: 'Cardiology', label: t('doctors.filter_cardiology'), icon: Heart },
    { id: 'Blood Pressure', label: t('doctors.filter_bp'), icon: Activity }, 
  ];

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return doctorsList.filter(doc => {
      const matchesCategory = activeFilter === 'All' || doc.category === activeFilter;
      const matchesSearch = doc.name.toLowerCase().includes(query) || doc.specialty.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [doctorsList, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="bg-gradient-to-br from-[#2DA1D7] via-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] py-24 px-4 relative overflow-hidden transition-colors">
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight animate-fade-in-up">
            {t('doctors.header_title')}
          </h1>
          <p className="text-blue-50 dark:text-blue-100 text-lg max-w-2xl mx-auto mb-12 font-medium opacity-90 animate-fade-in-up delay-100 uppercase tracking-widest leading-loose">
            {t('doctors.header_desc')}
          </p>

          <div className="relative max-w-2xl mx-auto animate-fade-in-up delay-200 group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors" size={24} />
            <input 
              type="text" 
              placeholder={t('doctors.search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-6 pl-16 pr-8 rounded-full shadow-2xl border-none text-gray-900 dark:text-white bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm focus:ring-8 focus:ring-white/20 outline-none transition-all placeholder-gray-400 font-bold"
            />
          </div>
        </div>
        
        {/* Glow Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-[120px] -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8EC641]/20 rounded-full blur-[120px] translate-x-1/2"></div>
        </div>
      </div>

      {/* --- MAIN ROSTER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-20">
        
        {/* FILTERS BAR */}
        <div className="bg-white dark:bg-gray-900 p-3 rounded-[2.5rem] shadow-2xl border border-gray-50 dark:border-gray-800 mb-16 overflow-x-auto flex gap-4 no-scrollbar transition-colors" data-aos="fade-up">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-[#2DA1D7] text-white shadow-xl shadow-[#2DA1D7]/30 scale-105'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <cat.icon size={18} />
              {cat.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-[#2DA1D7]/20 border-t-[#2DA1D7] rounded-full animate-spin"></div>
             <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Syncing Medical Directory...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
             <p className="text-red-500 font-black uppercase tracking-widest">Connectivity issue with clinical API.</p>
          </div>
        )}

        {/* DOCTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <div 
                key={doctor.id}
                onClick={() => navigate(`/doctor-view/${doctor._id || doctor.id || doctor.doctorId}`, { state: { doctor } })}
                className="group bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden p-6"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                {/* Image Container */}
                <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" 
                  />
                  <div className="absolute top-6 right-6 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-gray-100 dark:border-gray-800">
                    <Star size={16} className="text-[#8EC641] fill-[#8EC641]" />
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{doctor.rating}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">({doctor.reviews})</span>
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-[#2DA1D7] text-white text-[10px] font-black px-5 py-2 rounded-xl shadow-xl uppercase tracking-widest">
                      {doctor.specialty}
                    </span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="px-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-[#2DA1D7] transition-colors leading-none">
                      {doctor.name}
                    </h3>
                    <div className="w-10 h-10 rounded-xl bg-[#2DA1D7]/10 flex items-center justify-center text-[#2DA1D7] shadow-inner">
                       <ShieldCheck size={20} />
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400 line-clamp-1 uppercase tracking-tight">
                        {doctor.clinics && doctor.clinics.length > 0 ? doctor.clinics[0].address : "Global Health Center"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-inner ${doctor.availability === "Online Today" ? "bg-[#8EC641]/10 text-[#8EC641]" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}>
                        <Clock size={16} />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${doctor.availability === "Online Today" ? "text-[#8EC641]" : "text-gray-400"}`}>
                        {doctor.availability}
                      </p>
                    </div>
                  </div>

                  <button className="w-full py-5 rounded-[1.5rem] border-4 border-gray-100 dark:border-gray-800 text-gray-400 font-black text-xs uppercase tracking-widest group-hover:border-[#2DA1D7] group-hover:text-[#2DA1D7] dark:group-hover:border-[#2DA1D7] transition-all flex items-center justify-center gap-3 shadow-sm group-hover:shadow-xl group-hover:shadow-[#2DA1D7]/10">
                    {t('doctors.btn_view_profile')} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-gray-50 dark:bg-gray-900 shadow-inner rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-gray-800" data-aos="zoom-in">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl text-gray-300 transform -rotate-12">
                <Filter size={48} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">{t('doctors.no_found_title')}</h3>
              <p className="text-lg text-gray-500 font-medium mb-10">{t('doctors.no_found_desc')}</p>
              <button 
                onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}
                className="bg-[#2DA1D7] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
              >
                {t('doctors.clear_filters')}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopDoctors;
