import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import Filter from "../../Components/Layouts/Filter";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Eye,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import useProducts from "../../hooks/useProducts";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { setPendingAddToCart, setPendingCheckout } from "../../utils/pendingCart";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: Shop
 * Purpose: Marketplace for health products and monitoring tools.
 * Styling: Premium clinical aesthetic using Primary Green (#8EC641) and Blue (#2DA1D7).
 */
const Shop = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { items, loading, error, fetchAll } = useProducts();
  const { createItem: addCartItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [priceRange, setPriceRange] = useState(200);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /**
   * [LOGIC]: Product Mapping
   * Normalizes product data from the API into a consistent internal format.
   */
  const mapProduct = (product, index) => {
    const categoryValue = Array.isArray(product.category)
      ? product.category[0] || "All Products"
      : product.category || "All Products";
    const images = [
      product.image1,
      product.image2,
      product.image3,
      product.image4,
    ].filter(Boolean);

    return {
      id: product._id || product.id || product.p_id || `product-${index}`,
      name: product.name || "Product",
      category: categoryValue,
      price: Number(product.price) || 0,
      images: images.length ? images : ["https://placehold.co/600x600"],
      desc: product.description || product.desc || "",
      deliveryTime: product.status === "Available" ? "2-4 Days" : "Check availability",
    };
  };

  const allProducts = React.useMemo(() => {
    return Array.isArray(items) ? items.map(mapProduct) : [];
  }, [items]);

  const categories = React.useMemo(() => {
    return [
      "All Products",
      ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))),
    ];
  }, [allProducts]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, offset: 50 });
    fetchAll().catch(() => {});
  }, [fetchAll]);

  // Handle post-login persistent cart actions
  useEffect(() => {
    const pending = location.state?.postLoginAddToCart;
    if (!pending || !isAuthenticated) return;
    addCartItem({ product: pending.id, quantity: 1 })
      .then(() => navigate(".", { replace: true, state: {} }))
      .catch((e) => console.error(e));
  }, [location.state, isAuthenticated, addCartItem, navigate]);

  const filteredProducts = React.useMemo(() => {
    let result = allProducts;
    if (selectedCategory !== "All Products") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    result = result.filter((p) => p.price <= priceRange);
    if (searchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [selectedCategory, priceRange, searchQuery, allProducts]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      setPendingAddToCart(location.pathname + (location.search || ""), product);
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await addCartItem({ product: product.id, quantity: 1 });
      navigate("/cart");
    } catch (e) {
      navigate("/cart", { state: { newItem: product } });
    }
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      setPendingCheckout("/payment", { product });
      navigate("/login", { state: { from: location } });
      return;
    }
    navigate("/payment", { state: { product } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* SEARCH & FILTERS HEADER */}
      <div className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto" data-aos="fade-down">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">
              {t("shop.products_title") || "Sugar Wise Marketplace"}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">
              {t("shop.items_count")}: {filteredProducts.length}
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto flex items-center gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#2DA1D7] transition-colors" />
              <input
                type="text"
                placeholder={t("shop.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-5 pl-16 pr-8 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#2DA1D7]/30 focus:ring-8 focus:ring-[#2DA1D7]/5 rounded-full text-gray-900 dark:text-white font-bold outline-none shadow-xl shadow-gray-200/20 dark:shadow-none transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="p-5 bg-gradient-to-br from-[#2DA1D7] to-[#1e7ca8] text-white rounded-full hover:shadow-2xl hover:shadow-[#2DA1D7]/30 transition-all active:scale-90 flex items-center justify-center shadow-lg"
            >
              <SlidersHorizontal size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER MODAL */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl p-10 relative animate-slide-up">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                <SlidersHorizontal className="text-[#2DA1D7]" />
                {t("shop.filters")}
              </h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="py-2">
              <Filter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={200}
              />
            </div>

            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full mt-10 bg-gradient-to-r from-[#2DA1D7] to-[#1e7ca8] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-[#2DA1D7]/30 hover:shadow-[#2DA1D7]/50 transition-all"
            >
              {t("shop.apply_filters") || "Apply Filters"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#8EC641]/20 border-t-[#8EC641] rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-bold uppercase tracking-widest">Failed to load pharmacosmetics.</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                data-aos="fade-up"
                className="group relative bg-white dark:bg-gray-900/50 rounded-[3rem] border-2 border-gray-50 dark:border-gray-800 p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-2 flex flex-col"
              >
                {/* Product Image Area */}
                <div className="relative h-72 w-full bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] overflow-hidden mb-8 flex items-center justify-center p-10 group-hover:bg-[#8EC641]/5 transition-colors">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 right-6 bg-[#8EC641] text-white font-black px-5 py-2 rounded-2xl shadow-xl transform rotate-3">
                    ${product.price}
                  </div>
                </div>

                {/* Info Area */}
                <div className="flex-grow flex flex-col px-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-[#2DA1D7]/10 text-[#2DA1D7] rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                       <Tag size={12} /> {product.category}
                    </span>
                  </div>

                  <h3
                    className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight uppercase tracking-tight cursor-pointer hover:text-[#2DA1D7] transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>

                  {/* Star Rating Placeholder */}
                  <div className="flex items-center gap-1.5 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`w-2 h-2 rounded-full ${s <= 4 ? "bg-[#8EC641]" : "bg-gray-200 dark:bg-gray-700"}`}></div>
                    ))}
                    <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Verified</span>
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-auto grid grid-cols-4 gap-4">
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="col-span-2 bg-[#8EC641] hover:bg-[#6a9431] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#8EC641]/20 active:scale-95"
                    >
                      {t("shop.buy_now")}
                    </button>
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="aspect-square bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#2DA1D7] hover:bg-[#2DA1D7]/5 rounded-2xl transition-all flex items-center justify-center border-2 border-transparent hover:border-[#2DA1D7]/10"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="aspect-square bg-[#2DA1D7]/10 text-[#2DA1D7] hover:bg-[#2DA1D7] hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-inner"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-50 dark:bg-gray-900/40 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[4rem] text-center" data-aos="zoom-in">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2rem] flex items-center justify-center shadow-xl mb-8 transform -rotate-12 transition-transform hover:rotate-0">
               <Search size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">{t("shop.no_products_found")}</h3>
            <p className="text-lg text-gray-500 font-medium max-w-md mx-auto mb-10">{t("shop.no_products_desc")}</p>
            <button
              onClick={() => { setSearchQuery(""); setPriceRange(200); setSelectedCategory("All Products"); }}
              className="bg-white dark:bg-gray-800 text-[#2DA1D7] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:shadow-2xl transition-all"
            >
              {t("shop.clear_filters")}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
