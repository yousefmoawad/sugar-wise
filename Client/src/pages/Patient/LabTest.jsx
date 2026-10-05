import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useOutletContext } from 'react-router-dom'; // Added to link with MyHealthFrame
import useLabTests from '../../hooks/useLabTests';
import { fetchProtectedFileBlobUrl, isProtectedFileUrl, openFileWithAuth } from '../../utils/fileAccess';
import { 
  Plus, FileText, Trash2, Edit2, 
  Upload, X, Eye, Calendar, FileCheck, AlertCircle 
} from 'lucide-react';

// Reusable Modal Component using Portal
const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {children}
      </div>
    </div>,
    document.body
  );
};

const LabTest = () => {
  // Access translation and shared state from the Parent Frame
  const { t } = useOutletContext(); 
  const { items, loading, error, fetchAll, createItem, updateItem, deleteItem } = useLabTests();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'text', 
    fileUrl: null,
    notes: '',
    resultStatus: 'Unknown',
  });

  const [tests, setTests] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  useEffect(() => {
    const mapped = (items || []).map((test) => ({
      id: test._id,
      title: test.title,
      date: test.date,
      type: test.type || 'text',
      fileUrl: test.fileUrl,
      notes: test.notes || '',
      resultStatus: test.resultStatus || 'Unknown',
    }));
    setTests(mapped);
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const objectUrls = [];

    (async () => {
      const nextPreviews = {};
      for (const test of tests) {
        if (test.type === 'image' && test.fileUrl) {
          if (isProtectedFileUrl(test.fileUrl)) {
            try {
              const blobUrl = await fetchProtectedFileBlobUrl(test.fileUrl);
              objectUrls.push(blobUrl);
              nextPreviews[test.id] = blobUrl;
            } catch {
              nextPreviews[test.id] = '';
            }
          } else {
            nextPreviews[test.id] = test.fileUrl;
          }
        }
      }
      if (!cancelled) {
        setPreviewUrls(nextPreviews);
      }
    })();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [tests]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.includes('image') ? 'image' : 'pdf';
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          fileUrl: reader.result, 
          type: fileType,
          title: prev.title || file.name 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', date: new Date().toISOString().split('T')[0], type: 'text', fileUrl: null, notes: '', resultStatus: 'Unknown' });
    setShowModal(true);
  };

  const openEditModal = (test) => {
    setEditingId(test.id);
    setFormData({ ...test });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("LabTest.ConfirmDelete"))) {
      try {
        await deleteItem(id);
        setTests((prev) => prev.filter((test) => test.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        type: formData.type,
        fileUrl: formData.fileUrl,
        notes: formData.notes,
        resultStatus: formData.resultStatus,
      };

      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        await createItem(payload);
      }
      await fetchAll();
      setShowModal(false);
    } catch (saveError) {
      console.error(saveError);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* [TYPOGRAPHY]: Professional black-weighted heading for health reports */}
          <h1 className="text-4xl font-black text-gray-900 dark:text-white transition-colors tracking-tight">
            {t("LabTest.PageTitle")}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 transition-colors font-medium">
            {t("LabTest.PageSubtitle")}
          </p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          {/* [BRAND GRADIENT]: Applying core logo colors to CTA button */}
          <Plus size={20} /> {t("LabTest.BtnUpload")}
        </button>
      </div>

      {/* Lab Results Grid */}
      {loading && <p className="text-sm text-[#8EC641] font-bold">Loading lab tests...</p>}
      {error && <p className="text-sm text-red-600 font-bold">Failed to load lab tests</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-[#8EC641]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
            {/* [CARD DESIGN]: High-shadow elevation and Brand Green accents */}
            <div className="h-44 w-full bg-[#8EC641]/5 dark:bg-gray-700/50 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              {test.type === 'image' && previewUrls[test.id] ? (
                <img src={previewUrls[test.id]} alt="Report" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : test.type === 'pdf' ? (
                <div className="flex flex-col items-center text-red-500 dark:text-red-400">
                  <FileText size={48} />
                  <span className="text-xs font-bold mt-2 uppercase tracking-wide">{t("LabTest.PreviewPdf")}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-blue-400 dark:text-blue-300">
                  <FileCheck size={48} />
                  <span className="text-xs font-bold mt-2 uppercase tracking-wide">{t("LabTest.PreviewText")}</span>
                </div>
              )}
              
              {/* Action Overlays */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3">
                {test.fileUrl && (
                  <button type="button" onClick={() => openFileWithAuth(test.fileUrl).catch(console.error)} className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:text-blue-600 transition">
                    <Eye size={20} />
                  </button>
                )}
                <button onClick={() => openEditModal(test)} className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:text-green-600 transition">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDelete(test.id)} className="p-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:text-red-600 transition">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight line-clamp-1">{test.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                  test.type === 'pdf' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-100'
                }`}>
                  {test.type.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs mb-3">
                <Calendar size={14} />
                <span>{test.date}</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex-1">
                {/* [TYPOGRAPHY]: Legible body text for report notes */}
                <p className="text-base text-gray-700 dark:text-gray-300 line-clamp-3 font-medium">
                  {test.notes || t("LabTest.NoNotes")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tests.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] ">
          <AlertCircle size={48} className="mb-4 opacity-20 text-[#2DA1D7]" />
          <p className="text-xl font-bold">{t("LabTest.EmptyState")}</p>
          <button onClick={openAddModal} className="mt-4 text-[#2DA1D7] font-black hover:underline tracking-tight">{t("LabTest.EmptyStateAction")}</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center transition-colors">
            <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
              {editingId ? t("LabTest.ModalEditTitle") : t("LabTest.ModalAddTitle")}
            </h2>
            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
            {/* File Dropzone */}
            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative group hover:border-blue-400 transition cursor-pointer">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              {formData.fileUrl ? (
                formData.type === 'image' ? (
                  <div className="relative w-full h-32">
                    <img src={formData.fileUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold opacity-0 group-hover:opacity-100 transition">{t("LabTest.ModalChangePrompt")}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-red-500">
                    <FileText size={48} />
                    <span className="text-sm font-bold mt-2">{t("LabTest.PreviewPdf")}</span>
                  </div>
                )
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm mb-3">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t("LabTest.ModalUploadPrompt")}</p>
                  <p className="text-xs text-gray-500">{t("LabTest.ModalUploadFormat")}</p>
                </>
              )}
            </div>

            {/* Inputs */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("LabTest.LabelTitle")}</label>
              <input type="text" required placeholder={t("LabTest.PlaceholderTitle")} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("LabTest.LabelDate")}</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors dark:[color-scheme:dark]" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Result Status</label>
              <select
                value={formData.resultStatus}
                onChange={e => setFormData({ ...formData, resultStatus: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="Unknown">Unknown</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{t("LabTest.LabelNotes")}</label>
              <textarea rows="3" placeholder={t("LabTest.PlaceholderNotes")} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
            </div>

            <button type="submit" className="w-full bg-[#8EC641] text-white py-4 rounded-2xl font-black text-xl hover:bg-[#8EC641]/90 transition shadow-xl shadow-[#8EC641]/20 hover:scale-[1.02] active:scale-95">
              {editingId ? t("LabTest.BtnUpdate") : t("LabTest.BtnSave")}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LabTest;
