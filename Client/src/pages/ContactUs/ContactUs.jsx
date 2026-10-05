import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Added for translation
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const ContactUs = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactMethod: "email",
    consent: false,
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const contactSubjects = [
    t("ContactUs.SubGen"),
    t("ContactUs.SubTech"),
    t("ContactUs.SubProd"),
    t("ContactUs.SubPart"),
    t("ContactUs.SubMedia"),
    t("ContactUs.SubFeed"),
    t("ContactUs.SubEmerg"),
  ];

  const contactMethods = [
    { value: "email", label: t("ContactUs.MethodEmail"), icon: "fas fa-envelope" },
    { value: "phone", label: t("ContactUs.MethodPhone"), icon: "fas fa-phone" },
    { value: "sms", label: t("ContactUs.MethodSms"), icon: "fas fa-comment-sms" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          contactMethod: "email",
          consent: false,
        });
        setSubmitSuccess(false);
      }, 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      title: "Customer Support",
      description: "Get help with your SugarWise account or products",
      email: "SugerWise@sugarwise.com",
      phone: "010 123 456 789",
      hours: "24/7",
      icon: "fas fa-headset",
      color: "from-[#2DA1D7] to-[#1a5f7f]",
    },
    {
      title: "Medical Inquiries",
      description: "Questions about diabetes management and medical advice",
      email: "SugerWise@sugarwise.com",
      phone: "010 123 456 789",
      hours: "Mon-Fri: 9AM-6PM EST",
      icon: "fas fa-user-md",
      color: "from-[#8EC641] to-[#76a536]",
    },
    {
      title: "Partnerships",
      description: "Healthcare providers, clinics, and organizations",
      email: "partners@sugarwise.com",
      phone: "010 123 456 789",
      hours: "Mon-Fri: 8AM-5PM EST",
      icon: "fas fa-handshake",
      color: "from-[#2DA1D7] via-[#2DA1D7] to-[#8EC641]",
    },
  ];

  const faqs = [
    {
      question: t("ContactUs.FaqQ1"),
      answer: t("ContactUs.FaqA1"),
    },
    {
      question: t("ContactUs.FaqQ2"),
      answer: t("ContactUs.FaqA2"),
    },
    {
      question: t("ContactUs.FaqQ3"),
      answer: t("ContactUs.FaqA3"),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 transition-colors">
                {/* [FORM HEADER]: Branded icon and upscaled typography */}
                <div className="flex items-center mb-8" data-aos="fade-down">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-[#2DA1D7]/20">
                    <i className="fas fa-envelope-open-text text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                      {t("ContactUs.FormTitle")}
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                      {t("ContactUs.FormSubtitle")}
                    </p>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-600 dark:text-green-400 text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t("ContactUs.SuccessTitle")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t("ContactUs.SuccessDesc")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {t("ContactUs.LabelName")}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2DA1D7] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300 text-lg outline-none"
                          placeholder={t("ContactUs.PlaceholderName")}
                        />
                      </div>
                      <div>
                        <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {t("ContactUs.LabelEmail")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2DA1D7] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300 text-lg outline-none"
                          placeholder={t("ContactUs.PlaceholderEmail")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {t("ContactUs.LabelPhone")}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2DA1D7] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300 text-lg outline-none"
                          placeholder={t("ContactUs.PlaceholderPhone")}
                        />
                      </div>
                      <div>
                        <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {t("ContactUs.LabelSubject")}
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2DA1D7] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300 text-lg outline-none"
                        >
                          <option value="">{t("ContactUs.SelectSubject")}</option>
                          {contactSubjects.map((subject, index) => (
                            <option key={index} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                        {t("ContactUs.LabelMethod")}
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {contactMethods.map((method) => (
                          <label
                            key={method.value}
                            className={`flex items-center px-6 py-3.5 rounded-xl border-2 cursor-pointer transition duration-300 text-base font-bold ${
                              formData.contactMethod === method.value
                                ? "border-[#2DA1D7] bg-[#2DA1D7]/5 dark:bg-[#2DA1D7]/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="contactMethod"
                              value={method.value}
                              checked={formData.contactMethod === method.value}
                              onChange={handleInputChange}
                              className="mr-3"
                            />
                            <i className={`${method.icon} mr-2 text-[#2DA1D7]`}></i>
                            <span className="text-gray-700 dark:text-gray-300">
                              {method.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("ContactUs.LabelMessage")}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="6"
                        className="w-full px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2DA1D7] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300 text-lg outline-none"
                        placeholder={t("ContactUs.PlaceholderMessage")}
                      ></textarea>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        required
                        className="mt-1 mr-3 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        {t("ContactUs.LabelConsent")}
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.consent}
                      className={`w-full py-5 px-6 rounded-xl font-black text-xl transition duration-300 uppercase tracking-widest shadow-xl shadow-[#2DA1D7]/10 ${
                        isSubmitting || !formData.consent
                          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] hover:from-[#1a5f7f] hover:to-[#76a536] text-white"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t("ContactUs.BtnSending")}
                        </span>
                      ) : (
                        t("ContactUs.BtnSend")
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t("ContactUs.FaqTitle")}
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition duration-300"
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                        <i className="fas fa-question-circle text-blue-600 dark:text-blue-400 mr-3"></i>
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("ContactUs.InfoTitle")}
                </h3>
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300"
                    data-aos="fade-left"
                    data-aos-delay={index * 100}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                      <i className={`${info.icon} text-white text-xl`}></i>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {info.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {info.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <i className="fas fa-envelope text-blue-500 dark:text-blue-400 mr-3"></i>
                        <a href={`mailto:${info.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {info.email}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <i className="fas fa-phone text-green-500 dark:text-green-400 mr-3"></i>
                        <a href={`tel:${info.phone}`} className="hover:text-green-600 dark:hover:text-green-400">
                          {info.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <i className="fas fa-clock text-gray-400 dark:text-gray-500 mr-3"></i>
                        <span>{t("ContactUs.InfoHours")} {info.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-ambulance text-2xl"></i>
                </div>
                <h4 className="text-xl font-bold mb-3">{t("ContactUs.EmergencyTitle")}</h4>
                <p className="mb-4 opacity-90">
                  {t("ContactUs.EmergencyDesc")}
                </p>
                <a href="tel:121" className="inline-flex items-center bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300">
                  <i className="fas fa-phone mr-2"></i>
                  {t("ContactUs.BtnCallEmergency")}
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t("ContactUs.SocialTitle")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {t("ContactUs.SocialDesc")}
                </p>
                <div className="flex space-x-4">
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#2DA1D7]/10 text-[#2DA1D7] hover:bg-[#2DA1D7] hover:text-white rounded-xl flex items-center justify-center transition duration-300 shadow-md">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-600 hover:text-white rounded-xl flex items-center justify-center transition duration-300 shadow-md">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-[#2DA1D7] hover:bg-[#2DA1D7] hover:text-white rounded-xl flex items-center justify-center transition duration-300 shadow-md">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-700 hover:bg-blue-700 hover:text-white rounded-xl flex items-center justify-center transition duration-300 shadow-md">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700" data-aos="zoom-in">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-8 md:col-span-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("ContactUs.OfficeTitle")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-map-marker-alt text-red-500 dark:text-red-400 text-xl mr-4 mt-1"></i>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{t("ContactUs.OfficeHq")}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{t("ContactUs.OfficeAddr")}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-building text-blue-500 dark:text-blue-400 text-xl mr-4"></i>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{t("ContactUs.OfficeReg")}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{t("ContactUs.OfficeAddr")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#2DA1D7]/10 to-[#8EC641]/10 dark:from-[#2DA1D7]/20 dark:to-[#8EC641]/20 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#2DA1D7]/10">
                    <i className="fas fa-map-marked-alt text-[#2DA1D7] text-2xl"></i>
                  </div>
                  <button onClick={() => alert("Opening map directions")} className="bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white font-bold py-3.5 px-8 rounded-xl transition duration-300 shadow-lg shadow-[#2DA1D7]/20">
                    {t("ContactUs.BtnDirections")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* [CTA SECTION]: Final branded conversion area */}
          <div className="mt-12 text-center" data-aos="fade-up">
            <div className="bg-gradient-to-br from-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-[#2DA1D7]/10 dark:to-[#8EC641]/10 rounded-[2.5rem] p-10 border border-[#2DA1D7]/10">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                {t("ContactUs.CtaTitle")}
              </h3>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto font-medium">
                {t("ContactUs.CtaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:010 123 456 789" className="bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white font-black py-4 px-10 rounded-xl transition duration-300 inline-flex items-center justify-center shadow-lg shadow-[#2DA1D7]/20">
                  <i className="fas fa-phone mr-2"></i>
                  {t("ContactUs.BtnCallSupport")}
                </a>
                <Link to="/resources/faq" className="bg-white dark:bg-gray-800 text-[#2DA1D7] hover:bg-[#2DA1D7]/5 dark:hover:bg-gray-700 font-black py-4 px-10 rounded-xl border-2 border-[#2DA1D7] transition duration-300 inline-flex items-center justify-center">
                  <i className="fas fa-question-circle mr-2"></i>
                  {t("ContactUs.BtnVisitFaq")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;