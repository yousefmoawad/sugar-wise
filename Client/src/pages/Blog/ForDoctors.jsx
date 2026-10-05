import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Added for translation
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";

const BlogPatients = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('BlogPatients.CatAll'), count: 12 },
    { id: 'nutrition', name: t('BlogPatients.CatNutrition'), count: 4 },
    { id: 'lifestyle', name: t('BlogPatients.CatLifestyle'), count: 3 },
    { id: 'monitoring', name: t('BlogPatients.CatMonitoring'), count: 3 },
    { id: 'mental-health', name: t('BlogPatients.CatMentalHealth'), count: 2 },
  ];

  const articles = [
    {
      id: 1,
      title: t('BlogPatients.Art1Title'),
      category: "nutrition",
      excerpt: t('BlogPatients.Art1Excerpt'),
      author: "Dr. Sarah Johnson",
      date: "April 15, 2024",
      readTime: t('BlogPatients.Read8Min'),
      image: "/images/blog/carb-counting.jpg",
      featured: true
    },
    {
      id: 2,
      title: t('BlogPatients.Art2Title'),
      category: "lifestyle",
      excerpt: t('BlogPatients.Art2Excerpt'),
      author: "Michael Chen",
      date: "April 10, 2024",
      readTime: t('BlogPatients.Read6Min'),
      image: "/images/blog/exercise-tips.jpg",
      featured: false
    },
    {
      id: 3,
      title: t('BlogPatients.Art3Title'),
      category: "lifestyle",
      excerpt: t('BlogPatients.Art3Excerpt'),
      author: "Dr. Aisha Rahman",
      date: "April 5, 2024",
      readTime: t('BlogPatients.Read7Min'),
      image: "/images/blog/sleep-diabetes.jpg",
      featured: true
    },
    {
      id: 4,
      title: t('BlogPatients.Art4Title'),
      category: "nutrition",
      excerpt: t('BlogPatients.Art4Excerpt'),
      author: "Nutrition Team",
      date: "March 28, 2024",
      readTime: t('BlogPatients.Read5Min'),
      image: "/images/blog/snack-ideas.jpg",
      featured: false
    },
    {
      id: 5,
      title: t('BlogPatients.Art5Title'),
      category: "mental-health",
      excerpt: t('BlogPatients.Art5Excerpt'),
      author: "Dr. Robert Garcia",
      date: "March 22, 2024",
      readTime: t('BlogPatients.Read9Min'),
      image: "/images/blog/stress-management.jpg",
      featured: false
    },
    {
      id: 6,
      title: t('BlogPatients.Art6Title'),
      category: "monitoring",
      excerpt: t('BlogPatients.Art6Excerpt'),
      author: "Tech Support Team",
      date: "March 15, 2024",
      readTime: t('BlogPatients.Read10Min'),
      image: "/images/blog/cgm-guide.jpg",
      featured: false
    }
  ];

  const featuredArticles = articles.filter(article => article.featured);
  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const tips = [
    t('BlogPatients.Tip1'),
    t('BlogPatients.Tip2'),
    t('BlogPatients.Tip3'),
    t('BlogPatients.Tip4'),
    t('BlogPatients.Tip5')
  ];

  return (
    <>
    <Navbar />
    
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-300">
      
      {/* [HERO SECTION]: Premium branded gradient with upscaled typography */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#2DA1D7] to-[#8EC641] dark:from-[#1a5f7f] dark:to-[#4d6a23] text-white py-24">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              {t('BlogPatients.HeroTitle')}
            </h1>
            <p className="text-2xl md:text-3xl max-w-3xl mx-auto mb-10 opacity-90 leading-relaxed">
              {t('BlogPatients.HeroSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link 
                to="/blog" 
                className="inline-flex items-center border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-xl transition duration-300 text-lg"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                {t('BlogPatients.BtnBackBlog')}
              </Link>
              <Link 
                to="/blog/doctors" 
                className="inline-flex items-center bg-white text-[#8EC641] hover:bg-gray-50 font-bold py-3 px-8 rounded-xl transition duration-300 text-lg shadow-xl"
              >
                <i className="fas fa-user-md mr-2"></i>
                {t('BlogPatients.BtnForDoctors')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            {/* Categories Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-5 py-2.5 rounded-full transition duration-300 font-bold text-base ${
                      selectedCategory === category.id
                        ? 'bg-[#8EC641] text-white shadow-lg shadow-[#8EC641]/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#8EC641]/10'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('BlogPatients.SectionFeatured')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredArticles.map((article) => (
                    <div key={article.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="h-48 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/40 dark:to-teal-900/40 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                              <i className="fas fa-star text-white text-2xl"></i>
                            </div>
                            <p className="text-green-800 dark:text-green-300 font-medium">{t('BlogPatients.BadgeFeatured')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <span className="bg-[#8EC641]/10 text-[#8EC641] text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                            {t(`BlogPatients.Cat${article.category.charAt(0).toUpperCase() + article.category.slice(1).replace('-', '')}`)}
                          </span>
                          <span className="ml-3 text-gray-500 dark:text-gray-400 text-base">{article.readTime}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{article.title}</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{article.excerpt}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-base">
                            <i className="fas fa-user text-gray-400 dark:text-gray-500 mr-2"></i>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{article.author}</span>
                          </div>
                          <Link 
                            to={`/blog/article/${article.id}`}
                            className="text-[#8EC641] hover:text-[#76a536] font-bold text-lg"
                          >
                            {t('BlogPatients.BtnReadMore')} →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedCategory === 'all' ? t('BlogPatients.CatAll') : 
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              
              {filteredArticles.length > 0 ? (
                <div className="space-y-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition duration-300">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start">
                          <div className="md:w-2/3">
                            <div className="flex items-center mb-3">
                              <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-3 py-1 rounded-full">
                                {t(`BlogPatients.Cat${article.category.charAt(0).toUpperCase() + article.category.slice(1).replace('-', '')}`)}
                              </span>
                              <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">{article.date}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{article.excerpt}</p>
                            <div className="flex flex-wrap items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                  <i className="fas fa-user mr-1"></i>
                                  <span>{article.author}</span>
                                </div>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                  <i className="fas fa-clock mr-1"></i>
                                  <span>{article.readTime}</span>
                                </div>
                              </div>
                              <Link 
                                to={`/blog/article/${article.id}`}
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium mt-2 md:mt-0"
                              >
                                {t('BlogPatients.BtnReadFull')} →
                              </Link>
                            </div>
                          </div>
                          <div className="md:w-1/3 mt-4 md:mt-0 md:ml-6">
                            <div className="h-40 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                  <i className="fas fa-book-open text-white"></i>
                                </div>
                                <p className="text-green-800 dark:text-green-300 text-sm font-medium">{t('BlogPatients.GuideLabel')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-search text-gray-400 dark:text-gray-500 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('BlogPatients.NoArticles')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{t('BlogPatients.NoArticlesDesc')}</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                  >
                    {t('BlogPatients.BtnShowAll')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-lightbulb text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('BlogPatients.TipsTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.TipsSubtitle')}</p>
                </div>
              </div>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3 mt-1">
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscribe Newsletter */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-700 dark:to-teal-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">{t('BlogPatients.NewsTitle')}</h3>
              <p className="mb-6 opacity-90 text-sm">
                {t('BlogPatients.NewsDesc')}
              </p>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder={t('BlogPatients.NewsPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-black/20 dark:placeholder-gray-300 border-none outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-black font-bold py-3 px-4 rounded-lg transition duration-300">
                  {t('BlogPatients.BtnSubscribe')}
                </button>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('BlogPatients.PopularTopics')}</h3>
              <div className="space-y-3">
                {categories.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-folder text-green-600 dark:text-green-400"></i>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Resources */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('BlogPatients.EmergencyTitle')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {t('BlogPatients.EmergencyDesc')}
              </p>
              <div className="space-y-3">
                <a 
                  href="tel:911" 
                  className="block bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-3 px-4 rounded-lg text-center transition duration-300"
                >
                  <i className="fas fa-phone mr-2"></i>
                  {t('BlogPatients.BtnCall911')}
                </a>
                <Link 
                  to="/resources/emergency-guide"
                  className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-3 px-4 rounded-lg text-center transition duration-300"
                >
                  <i className="fas fa-file-medical mr-2"></i>
                  {t('BlogPatients.BtnEmergencyGuide')}
                </Link>
              </div>
            </div>

            {/* Downloadable Guides */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('BlogPatients.DownloadTitle')}</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <i className="fas fa-file-pdf text-red-500 dark:text-red-400 text-2xl mr-4"></i>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('BlogPatients.Download1Title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.Download1Desc')}</p>
                  </div>
                  <button className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <i className="fas fa-utensils text-green-500 dark:text-green-400 text-2xl mr-4"></i>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t('BlogPatients.Download2Title')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.Download2Desc')}</p>
                  </div>
                  <button className="ml-auto text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('BlogPatients.SectionAdditional')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/resources/diabetes-guide"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book-medical text-blue-600 dark:text-blue-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('BlogPatients.Res1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.Res1Desc')}</p>
            </Link>
            
            <Link 
              to="/calculator"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300 text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calculator text-green-600 dark:text-green-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('BlogPatients.Res2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.Res2Desc')}</p>
            </Link>
            
            <Link 
              to="/community"
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300 text-center"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-purple-600 dark:text-purple-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('BlogPatients.Res3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('BlogPatients.Res3Desc')}</p>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-8 border border-green-100 dark:border-green-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('BlogPatients.CtaTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              {t('BlogPatients.CtaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 inline-flex items-center justify-center"
              >
                <i className="fas fa-headset mr-2"></i>
                {t('BlogPatients.BtnContact')}
              </Link>
              <Link 
                to="/resources/faq" 
                className="bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700 font-bold py-3 px-8 rounded-lg border-2 border-green-600 dark:border-green-500 transition duration-300 inline-flex items-center justify-center"
              >
                <i className="fas fa-question-circle mr-2"></i>
                {t('BlogPatients.BtnFaq')}
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

export default BlogPatients;