import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; // Added for translation
import AOS from "aos";
import "aos/dist/aos.css";

const Blog = () => {
  const { t } = useTranslation(); // Initialize translation hook

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: t("Blog.Post1Title"),
      category: t("Blog.CategoryParents"),
      date: t("Blog.Post1Date"),
      readTime: t("Blog.ReadTime5"),
      excerpt: t("Blog.Post1Excerpt"),
    },
    {
      id: 2,
      title: t("Blog.Post2Title"),
      category: t("Blog.CategoryDoctors"),
      date: t("Blog.Post2Date"),
      readTime: t("Blog.ReadTime8"),
      excerpt: t("Blog.Post2Excerpt"),
    },
    {
      id: 3,
      title: t("Blog.Post3Title"),
      category: t("Blog.CategoryPatients"),
      date: t("Blog.Post3Date"),
      readTime: t("Blog.ReadTime6"),
      excerpt: t("Blog.Post3Excerpt"),
    },
    {
      id: 4,
      title: t("Blog.Post4Title"),
      category: t("Blog.CategoryParents"),
      date: t("Blog.Post4Date"),
      readTime: t("Blog.ReadTime7"),
      excerpt: t("Blog.Post4Excerpt"),
    },
  ];

  const categories = [
    t("Blog.CategoryAll"),
    t("Blog.CategoryDoctors"),
    t("Blog.CategoryPatients"),
    t("Blog.CategoryParents"),
    t("Blog.CategoryResearch"),
    t("Blog.CategoryTechnology"),
  ];

  return (
    <>
      <Navbar />
      {/* Main Container: Added Dark Mode Gradient */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* [HEADER SECTION]: Elevated typography for impact */}
          <div className="text-center mb-12" data-aos="fade-down">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              {t("Blog.PageTitle")}
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors">
              {t("Blog.PageSubtitle")}
            </p>
          </div>

          {/* Categories Filter */}
          <div className="mb-8" data-aos="fade-right">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-2.5 rounded-full transition duration-300 text-base font-bold ${
                    category === t("Blog.CategoryAll")
                      ? "bg-[#2DA1D7] text-white shadow-lg shadow-[#2DA1D7]/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#2DA1D7]/10 dark:hover:bg-[#2DA1D7]/20"
                  }`}
                  onClick={() => alert(`${t("Blog.FilterAlert")} ${category}`)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {blogPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-base font-bold uppercase tracking-wider ${
                        post.category === t("Blog.CategoryDoctors")
                          ? "bg-[#2DA1D7]/10 text-[#2DA1D7]"
                          : post.category === t("Blog.CategoryPatients")
                            ? "bg-[#8EC641]/10 text-[#8EC641]"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-base">
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 transition-colors">
                    {post.excerpt}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 text-base">
                      {post.date}
                    </span>
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-[#2DA1D7] hover:text-[#1a5f7f] font-bold text-base transition-colors"
                    >
                      {t("Blog.ReadArticleLink")} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* [BOTTOM LINKS]: Branded call-to-action buttons */}
          <div className="text-center">
            <div className="inline-flex space-x-4">
              <Link
                to="/blog/doctors"
                className="bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg shadow-[#2DA1D7]/20 text-lg"
              >
                {t("Blog.DoctorsSectionBtn")}
              </Link>
              <Link
                to="/blog/patients"
                className="bg-[#8EC641] hover:bg-[#76a536] text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg shadow-[#8EC641]/20 text-lg"
              >
                {t("Blog.PatientsSectionBtn")}
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              {t("Blog.BackHomeLink")}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;