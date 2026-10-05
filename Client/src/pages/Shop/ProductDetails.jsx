import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Layouts/Navbar";
import Footer from "../../Components/Layouts/Footer";
import {
  ShoppingCart,
  CreditCard,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Star,
} from "lucide-react";
import useProducts from "../../hooks/useProducts";
import useCart from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { setPendingAddToCart, setPendingCheckout } from "../../utils/pendingCart";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * [COMPONENT]: ProductDetails
 * Purpose: Detailed product view with high-impact visuals and purchase actions.
 * Styling: Premium clinical aesthetic using Primary Green (#8EC641) and Blue (#2DA1D7).
 */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { createItem: addCartItem } = useCart();
  const { items, item, loading, fetchAll, fetchById } = useProducts();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  /**
   * [LOGIC]: Product Mapping
   * Normalizes individual product data for visual display.
   */
  const mapProduct = (entry, index = 0) => {
    if (!entry) return null;
    const categoryValue = Array.isArray(entry.category)
      ? entry.category[0] || "General"
      : entry.category || "General";
    const images = [entry.image1, entry.image2, entry.image3, entry.image4].filter(Boolean);

    return {
      id: entry._id || entry.id || entry.p_id || `product-${index}`,
      name: entry.name || "Product",
      category: categoryValue,
      price: Number(entry.price) || 0,
      images: images.length ? images : ["https://placehold.co/600x600"],
      desc: entry.description || entry.desc || "",
      deliveryTime: entry.status === "Available" ? "2-4 Days" : "Check availability",
    };
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 100 });
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    fetchById(id).catch(() => fetchAll().catch(() => {}));
  }, [id, fetchAll, fetchById]);

  useEffect(() => {
    if (item) {
      const mapped = mapProduct(item);
      setProduct(mapped);
      setActiveImage(mapped.images[0]);
    } else if (Array.isArray(items) && items.length > 0) {
      const found = items.map(mapProduct).find((entry) => String(entry.id) === String(id));
      if (found) {
        setProduct(found);
        setActiveImage(found.images[0]);
      }
    }
  }, [id, items, item]);

  const handleAddToCartClick = async () => {
    if (!product) return;
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

  const handleBuyNowClick = () => {
    if (!product) return;
    if (!isAuthenticated) {
      setPendingCheckout("/payment", { product });
      navigate("/login", { state: { from: location } });
      return;
    }
    navigate("/payment", { state: { product } });
  };

  const relatedProducts = product
    ? (Array.isArray(items) ? items.map(mapProduct) : [])
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4)
    : [];

  if (!product && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-[#8EC641]/20 border-t-[#8EC641] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 font-black uppercase tracking-widest">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/shop")}
          className="group flex items-center gap-3 text-gray-400 hover:text-[#2DA1D7] mb-12 transition-all font-black uppercase tracking-widest text-xs"
          data-aos="fade-right"
        >
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center group-hover:bg-[#2DA1D7] group-hover:text-white transition-all shadow-inner">
            <ArrowLeft size={16} />
          </div>
          <span>Back to marketplace</span>
        </button>

        {/* HERO PRODUCT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-24" data-aos="fade-up">
          
          {/* VISUALS SIDE */}
          <div className="space-y-8">
            <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-[4rem] flex items-center justify-center border-2 border-gray-100 dark:border-gray-800 p-12 transition-all hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none shadow-xl overflow-hidden relative group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-10 left-10 w-2 h-20 bg-[#8EC641] rounded-full opacity-30"></div>
            </div>
            
            <div className="grid grid-cols-4 gap-6 px-4">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-[2rem] border-4 bg-gray-50 dark:bg-gray-900 p-3 transition-all duration-300 ${
                    activeImage === img
                      ? "border-[#2DA1D7] shadow-xl scale-110"
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-800"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT SIDE */}
          <div className="flex flex-col justify-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 bg-[#2DA1D7]/10 text-[#2DA1D7] font-black text-[10px] uppercase tracking-[0.2em] rounded-full mb-6">
                Pharmaceutical Grade
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-[0.95]">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-[#8EC641] mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} fill="currentColor" size={20} />
                ))}
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  Clinical Efficiency Verified
                </span>
              </div>
              <div className="text-5xl font-black text-[#8EC641] mb-10 tracking-tighter shadow-green-100 italic">
                ${product.price}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-12 border-l-4 border-gray-100 dark:border-gray-800 pl-8">
                {product.desc}
              </p>
            </div>

            {/* ACTION CENTER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <button
                onClick={handleBuyNowClick}
                className="bg-[#8EC641] hover:bg-[#6a9431] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#8EC641]/30 hover:shadow-[#8EC641]/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CreditCard size={24} /> Buy Now
              </button>
              <button
                onClick={handleAddToCartClick}
                className="bg-white dark:bg-gray-900 text-[#2DA1D7] border-4 border-[#2DA1D7] py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-[#2DA1D7] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <ShoppingCart size={24} /> Add to Cart
              </button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-100 dark:border-gray-900">
              <div className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#2DA1D7] transition-all group-hover:bg-[#2DA1D7] group-hover:text-white shadow-inner">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Express</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{product.deliveryTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#8EC641] transition-all group-hover:bg-[#8EC641] group-hover:text-white shadow-inner">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Grade</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase">Sugar Wise Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-1.5 h-10 bg-[#2DA1D7] rounded-full"></div>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Complementary Health Tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {relatedProducts.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 border-2 border-gray-50 dark:border-gray-800 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-[2rem] mb-6 flex items-center justify-center p-8 group-hover:bg-[#2DA1D7]/5 transition-colors overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full object-contain group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <span className="text-[#2DA1D7] font-black text-xl">${item.price}</span>
                    <i className="fas fa-arrow-right text-[#2DA1D7] transform group-hover:translate-x-2 transition-transform"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;
