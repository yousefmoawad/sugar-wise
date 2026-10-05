import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useTranslation } from "react-i18next"; // Added for translation
import AOS from "aos";
import "aos/dist/aos.css";

// Import Team Images
import Member1 from "../../Images/team/youssef_khattab.jpg";
import Member2 from "../../Images/team/Mai_Mohamed_Ahmed.jpeg"; 
import Member3 from "../../Images/team/youssef_Moawad.jpeg";
import Member4 from "../../Images/team/youssef_khattab.jpg";
import Member5 from "../../Images/team/youssef_khattab.jpg";
import Member6 from "../../Images/team/Rawan_Yousry_Ahmed.jpeg";
import Member7 from "../../Images/team/shahd_Hesham.jpeg";
import Member8 from "../../Images/team/youssef_khattab.jpg";
import Member9 from "../../Images/team/Mariam_Mustafa.jpeg";
import Member10 from "../../Images/team/Fatma_Mohamed.jpeg";
const About = () => {
  const { t } = useTranslation(); // Initialize translation hook

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Youssef Wahed",
      role: t("about.team_roles.leader"),
      specialty: "Full-Stack Web Development React | Nodejs MangoDB",
      image: Member1,
      description: t("about.team_desc.youssef_w"),
    },
    {
      id: 2,
      name: "Mai Mohammed Ahmed",
      role: "Front End Web Development ",
      specialty: "Front End Web Development React",
      image: Member2,
      description: "Front End Web Development React",
    },
    {
      id: 3,
      name: "Youssef Moawad",
      role: "BackEnd Developer, cyber red team",
      specialty: "Backup, cyber red team, penetration testing, and vulnerability exploration",
      image: Member3,
      description: "Backup, cyber red team, penetration testing, and vulnerability exploration"
    },
    {
      id: 4,
      name: "Youssef Tarek",
      role: t("about.team_roles.developer"),
      specialty: "UX Designer | Data Analysis",
      image: Member4,
      description: t("about.team_desc.youssef_t"),
    },
    {
      id: 5,
      name: "Basil Ashraf",
      role: t("about.team_roles.developer"),
      specialty: "Mobile App Development",
      image: Member5,
      description: t("about.team_desc.basil"),
    },
    {
      id: 6,
      name: "Rawan Yousry Ahmed",
      role: "full stack developer nodejs & UI UX Designer",
      specialty: "full stack developer nodejs & UI UX Designer",
      image: Member6,
      description: "full stack developer nodejs & UI UX Designer",
    },
    {
      id: 7,
      name: "Shahd Hesham Fathy",
      role: "UI UX Designer & FrontEnd Web Development",
      specialty: "UI UX Designer & FrontEnd Web Development & Flutter",
      image: Member7,
      description: "UI UX Designer & FrontEnd Web Development & Flutter",
    },
    {
      id: 8,
      name: "xxxxxx",
      role: t("about.team_roles.developer"),
      specialty: "Front End Web Development React",
      image: Member8,
      description: t("about.team_desc.alaa"),
    },
    {
      id: 9,
      name: "Mariam Mostafa",
      role: "Flutter Developer",
      specialty: "Flutter Developer",
      image: Member9,
      description: "I focused on building responsive mobile apps and seamless backend integration through APIs.",
    },
    {
      id: 10,
      name: "Fatma Mohamed",
      role: "Flutter Developer",
      specialty: "Flutter Developer",
      image: Member10,
      description: "Specialized in Flutter Mobile Application Development",
    },
  ];

  const milestones = [
    { year: "2021", event: t("about.milestones.m1") },
    { year: "2022", event: t("about.milestones.m2") },
    { year: "2023", event: t("about.milestones.m3") },
    { year: "2024", event: t("about.milestones.m4") },
  ];

  return (
    <>
      <Navbar />
      {/* Unified Brand Gradient Background */}
      <div className="min-h-screen bg-gradient-to-br from-white via-[#2DA1D7]/5 to-[#8EC641]/5 dark:from-gray-950 dark:via-[#1a5f7f]/10 dark:to-[#4d6a23]/10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        
        {/* Our Story Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Content - Upscaled Typography */}
              <div data-aos="fade-right">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {t("about.story_title")}
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {t("about.story_p1")}
                </p>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {t("about.story_p2")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg"
                  >
                    <i className="fas fa-handshake mr-2"></i>
                    {t("about.btn_partner")}
                  </Link>
                  <Link
                    to="/careers"
                    className="inline-flex items-center border-2 border-[#2DA1D7] text-[#2DA1D7] dark:text-[#2DA1D7] dark:border-[#2DA1D7] hover:bg-[#2DA1D7]/10 dark:hover:bg-[#2DA1D7]/20 font-bold py-3 px-6 rounded-lg transition duration-300"
                  >
                    <i className="fas fa-users mr-2"></i>
                    {t("about.btn_careers")}
                  </Link>
                </div>
              </div>

              {/* Timeline Section - Updated Gradients & Text */}
              <div className="relative" data-aos="fade-left">
                <div className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] rounded-2xl p-0.5 shadow-2xl">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      {t("about.timeline_title")}
                    </h3>
                    <div className="space-y-6">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start group">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-[#2DA1D7]/10 to-[#8EC641]/10 dark:from-[#2DA1D7]/20 dark:to-[#8EC641]/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                            <span className="font-bold text-[#2DA1D7]">
                              {milestone.year}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {milestone.event}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-base">
                              {t("about.milestone_subtext")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values - Increased Font Sizes */}
        <section className="py-16 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("about.values_title")}
              </h2>
              <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("about.values_description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Value Card 1 - Updated Color */}
              <div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent hover:border-[#2DA1D7]/20 dark:border-gray-700 hover:-translate-y-2 transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay="0"
              >
                <div className="w-16 h-16 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-child text-[#2DA1D7] text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.value1_title")}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t("about.value1_desc")}
                </p>
              </div>

              {/* Value Card 2 - Updated Color */}
              <div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent hover:border-[#8EC641]/20 dark:border-gray-700 hover:-translate-y-2 transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <div className="w-16 h-16 bg-[#8EC641]/10 dark:bg-[#8EC641]/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-shield-alt text-[#8EC641] text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.value2_title")}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t("about.value2_desc")}
                </p>
              </div>

              {/* Value Card 3 - Updated Color */}
              <div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent hover:border-[#2DA1D7]/20 dark:border-gray-700 hover:-translate-y-2 transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <div className="w-16 h-16 bg-[#2DA1D7]/10 dark:bg-[#2DA1D7]/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-lightbulb text-[#2DA1D7] text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.value3_title")}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {t("about.value3_desc")}
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/mission"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {t("about.learn_mission")}
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* Team Section - Refined Card Typography */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {t("about.team_title")}
              </h2>
              <p className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("about.team_description")}
              </p>
            </div>

            {/* Custom Styles for hiding scrollbar */}
            <style>
              {`
              .scrollbar-hide::-webkit-scrollbar {
                  display: none;
              }
              .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
              }
              `}
            </style>

            <div className="relative group">
              {/* Scroll Buttons */}
                <button
                onClick={() => {
                  const container = document.getElementById("team-scroll-container");
                  if (container)
                    container.scrollBy({ left: -300, behavior: "smooth" });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-700 text-[#2DA1D7] dark:text-[#2DA1D7] rounded-full shadow-lg flex items-center justify-center hover:bg-[#2DA1D7]/10 dark:hover:bg-gray-600 focus:outline-none transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Scroll Left"
              >
                <i className="fas fa-chevron-left text-xl"></i>
              </button>

              <button
                onClick={() => {
                  const container = document.getElementById("team-scroll-container");
                  if (container)
                    container.scrollBy({ left: 300, behavior: "smooth" });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-700 text-[#2DA1D7] dark:text-[#2DA1D7] rounded-full shadow-lg flex items-center justify-center hover:bg-[#2DA1D7]/10 dark:hover:bg-gray-600 focus:outline-none transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Scroll Right"
              >
                <i className="fas fa-chevron-right text-xl"></i>
              </button>

              {/* Horizontal Scroll Container */}
              <div
                id="team-scroll-container"
                className="flex overflow-x-auto space-x-6 pb-8 snap-x snap-mandatory scrollbar-hide px-4"
              >
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="min-w-[300px] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 snap-center"
                    data-aos="flip-left"
                    data-aos-delay={member.id * 100}
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {member.name}
                      </h3>
                      <p className="text-[#2DA1D7] dark:text-[#2DA1D7] font-bold text-center mb-2">
                        {member.role}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-base text-center mb-4">
                        {member.specialty}
                      </p>
                      <p className="text-lg text-gray-700 dark:text-gray-300 text-center italic leading-relaxed">
                        "{member.description}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/careers"
                className="inline-flex items-center bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] hover:from-[#1a5f7f] hover:to-[#4d6a23] text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-user-plus mr-2"></i>
                {t("about.btn_join_team")}
              </Link>
            </div>
          </div>
        </section>

        {/* Partners & Recognition */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t("about.partners_title")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("about.partners_description")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-md border border-[#2DA1D7]/5">
                <div className="text-4xl font-bold text-[#2DA1D7] mb-2">50+</div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-bold">{t("about.stats.clinics")}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-md border border-[#8EC641]/5">
                <div className="text-4xl font-bold text-[#8EC641] mb-2">
                  25K+
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-bold">{t("about.stats.families")}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-md border border-[#2DA1D7]/5">
                <div className="text-4xl font-bold text-[#2DA1D7] mb-2">
                  98%
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-bold">{t("about.stats.satisfaction")}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-md border border-orange-100/20">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  10+
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 font-bold">{t("about.stats.awards")}</p>
              </div>
            </div>

            {/* Call to Action Box - Multi-color Brand Gradient */}
            <div
              className="bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] rounded-2xl p-10 text-white shadow-2xl"
              data-aos="zoom-in"
            >
              <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <div className="max-w-2xl">
                  <h3 className="text-3xl font-bold mb-4">
                    {t("about.bottom_cta_title")}
                  </h3>
                  <p className="text-xl text-white/90">
                    {t("about.bottom_cta_desc")}
                  </p>
                </div>
                <div className="mt-8 md:mt-0">
                  <Link
                    to="/register"
                    className="inline-flex items-center bg-white dark:bg-gray-900 text-[#2DA1D7] dark:text-white hover:bg-gray-100 dark:hover:bg-black font-bold py-4 px-10 rounded-xl transition duration-300 shadow-xl transform hover:scale-105"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    {t("about.btn_start_free")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information Links */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12" data-aos="fade-up">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {t("about.learn_more_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Press */}
              <Link
                to="/press"
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                data-aos="fade-up"
                data-aos-delay="0"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-newspaper text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.info_card1_title")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t("about.info_card1_desc")}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                  {t("about.read_more")} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </Link>

              {/* Blog */}
              <Link
                to="/blog"
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-blog text-green-600 dark:text-green-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.info_card2_title")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t("about.info_card2_desc")}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                  {t("about.visit_blog")} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </Link>

              {/* Contact */}
              <Link
                to="/contact"
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-envelope text-purple-600 dark:text-purple-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("about.info_card3_title")}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {t("about.info_card3_desc")}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                  {t("about.contact_now")} <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            data-aos="fade-up"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {t("about.final_q_title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("about.final_q_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 inline-flex items-center justify-center shadow-lg"
              >
                <i className="fas fa-headset mr-2"></i>
                {t("about.btn_support")}
              </Link>
              <Link
                to="/resources/faq"
                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold py-3 px-8 rounded-lg border-2 border-blue-600 dark:border-blue-400 transition duration-300 inline-flex items-center justify-center"
              >
                <i className="fas fa-question-circle mr-2"></i>
                {t("about.btn_faq")}
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About;