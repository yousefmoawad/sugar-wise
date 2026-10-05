import React from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * [COMPONENT]: HelpSettings
 * Purpose: Provides customer support contacts and localized FAQ documentation.
 * Styling: Premium clinical aesthetic using both brand green and blue accent colors.
 */
const HelpSettings = () => {
  const { t } = useTranslation();
  
  const contactMethods = [
    {
      id: "email",
      icon: Mail,
      title: t("help.email_us"),
      desc: t("help.email_response"),
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10",
      link: "mailto:support@sugarwise.com",
    },
    {
      id: "phone",
      icon: Phone,
      title: t("help.call_us"),
      desc: "+20 123 456 789",
      color: "text-[#8EC641]",
      bgColor: "bg-[#8EC641]/10",
      link: "tel:+20123456789",
    },
    {
      id: "chat",
      icon: MessageCircle,
      title: t("help.live_chat"),
      desc: t("help.live_chat_hours"),
      color: "text-[#2DA1D7]",
      bgColor: "bg-[#2DA1D7]/10",
      link: "#",
    },
  ];

  return (
    <div className="animate-fade-in">
      
      {/* SECTION HEADER */}
      <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#2DA1D7]/10 flex items-center justify-center text-[#2DA1D7] shadow-inner">
          <i className="fas fa-question-circle text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
            {t("help.title")}
          </h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {t("settings.account_settings")}
          </p>
        </div>
      </div>

      {/* CONTACT CHANNELS HUB */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {contactMethods.map((method) => (
          <a
            key={method.id}
            href={method.link}
            className="group p-10 bg-white dark:bg-gray-800/50 border-2 border-gray-50 dark:border-gray-800 rounded-[2.5rem] text-center hover:shadow-2xl hover:shadow-[#2DA1D7]/5 hover:-translate-y-2 transition-all duration-500"
          >
            <div className={`w-20 h-20 ${method.bgColor} ${method.color} rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner`}>
              <method.icon size={32} />
            </div>
            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
              {method.title}
            </h4>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {method.desc}
            </p>
          </a>
        ))}
      </div>

      {/* FAQ ACCORDION SECTION */}
      <div className="bg-gray-50/50 dark:bg-gray-900/30 rounded-[3rem] p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-[#8EC641] rounded-full"></div>
          <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {t("help.faq_title")}
          </h4>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((num) => (
            <details key={num} className="group overflow-hidden rounded-[1.5rem] border-2 border-transparent dark:border-gray-800/50 transition-all">
              <summary className="flex items-center justify-between p-6 bg-white dark:bg-gray-800/60 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">{t(`help.q${num}`)}</span>
                <div className="w-8 h-8 rounded-full border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-open:rotate-180 transition-transform">
                  <i className="fas fa-chevron-down text-[10px]"></i>
                </div>
              </summary>
              <div className="p-8 bg-white/50 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-700 text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {t(`help.a${num}`)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSettings;
