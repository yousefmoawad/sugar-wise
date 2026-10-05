import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getAuthHeaders } from "../../utils/getAuthHeaders";
import useNotifications from "../../hooks/useNotifications";
import "../../styles/Navbar.css";
import Logo_Cycle from "../../Images/BrandLogo/logo-cycle.png";
import Suger_Wise_Logo from "../../Images/BrandLogo/Suger_Wise_Logo.png";
import Logout from "../../pages/Login/Logout";

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBlogDropdownOpen, setIsBlogDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileName, setProfileName] = useState("");
  const [notificationItems, setNotificationItems] = useState([]);
  const seededNotificationIdsRef = useRef(false);
  const seenDangerNotificationIdsRef = useRef(new Set());

  const location = useLocation();
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);
  const { fetchAll: fetchNotifications, updateItem: updateNotification } =
    useNotifications();

  const normalizeRole = (role) => {
    const value = String(role || "")
      .trim()
      .toLowerCase();
    if (
      value === "super admin" ||
      value === "superadmin" ||
      value === "subadmin"
    )
      return "superadmin";
    if (value === "admin") return "admin";
    if (value === "doctor") return "doctor";
    if (value === "patient") return "patient";
    return "guest";
  };
  const userType = isAuthenticated ? normalizeRole(user?.role) : "guest";
  const canSeeDoctorBlog = ["doctor", "admin", "superadmin"].includes(userType);
  const canSeePatientBlog = ["patient", "admin", "superadmin"].includes(
    userType,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setProfileAvatar("");
      setProfileName("");
      return;
    }

    // Prefer the session user image immediately, but also fetch latest avatar for patients
    // because User.image can be stale if only Patient.profileImage was updated.
    const sessionImage = user?.image || user?.profileImage || "";
    if (sessionImage) {
      setProfileAvatar(sessionImage);
    }
    if (user?.name) {
      setProfileName(user.name);
    }

    const controller = new AbortController();
    (async () => {
      try {
        if (userType === "patient") {
          const res = await fetch("/api/patients/me", {
            headers: getAuthHeaders(),
            signal: controller.signal,
          });
          const body = await res.json().catch(() => ({}));
          if (res.ok) {
            const p = body?.data || body;
            const img = p?.profileImage || "";
            const name = `${p?.firstName || ""} ${p?.lastName || ""}`.trim();
            if (img) setProfileAvatar(img);
            if (name) setProfileName(name);
          }
        }

        if (userType === "doctor" && user?.doctor) {
          const res = await fetch(`/api/doctors/${user.doctor}`, {
            headers: getAuthHeaders(),
            signal: controller.signal,
          });
          const body = await res.json().catch(() => ({}));
          if (res.ok) {
            const d = body?.data || body;
            const img = d?.profileImage || d?.image || "";
            const name = d?.name || `${d?.firstName || ""} ${d?.lastName || ""}`.trim();
            if (img) setProfileAvatar(img);
            if (name) setProfileName(name);
          }
        }
      } catch {
        // ignore (best-effort)
      }
    })();

    return () => controller.abort();
  }, [isAuthenticated, userType, user?.image, user?.profileImage, user?._id, user?.patient, user?.doctor, user?.name]);

  useEffect(() => {
    if (!isAuthenticated || userType !== "patient" || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const sessionKey = "sugarwise_patient_location_sent";
    if (sessionStorage.getItem(sessionKey) === "1") return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch("/api/patients/me/location", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });
          sessionStorage.setItem(sessionKey, "1");
        } catch {
          // ignore
        }
      },
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 5 * 60 * 1000,
        timeout: 15000,
      },
    );
  }, [isAuthenticated, userType]);

  const userData = {
    name: profileName || user?.name || "User",
    image:
      profileAvatar ||
      user?.image ||
      user?.profileImage ||
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop&q=60",
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsBlogDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogoutClick = () => {
    closeMobileMenu();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout(); // ✅ استدعاء logout من useAuth hook
    navigate("/"); // التوجيه إلى الصفحة الرئيسية
  };

  const handleBlogOptionClick = () => {
    closeMobileMenu();
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const unreadNotificationsCount = notificationItems.filter(
    (item) => item && item.isRead === false,
  ).length;

  const getNotificationLink = (notification) => {
    if (notification?.actionUrl) return notification.actionUrl;
    if (notification?.relatedChat) {
      return `/messages?chat=${notification.relatedChat}`;
    }
    return "/";
  };

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotificationItems([]);
      return;
    }
    try {
      const data = await fetchNotifications();
      setNotificationItems(Array.isArray(data) ? data : []);
    } catch {
      setNotificationItems([]);
    }
  }, [fetchNotifications, isAuthenticated]);

  const playDangerNotificationSound = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const now = audioContext.currentTime;
      const notes = [880, 660, 880];

      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.18);
        gainNode.gain.setValueAtTime(0.0001, now + index * 0.18);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + index * 0.18 + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.16);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(now + index * 0.18);
        oscillator.stop(now + index * 0.18 + 0.18);
      });

      window.setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 900);
    } catch {
      // ignore audio failures
    }
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (notification?._id && notification.isRead === false) {
        await updateNotification(notification._id, { isRead: true });
      }
    } catch {
      // ignore best-effort mark-read errors
    } finally {
      setIsNotificationsOpen(false);
      navigate(getNotificationLink(notification));
      loadNotifications().catch(() => {});
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated || userType !== "doctor") {
      seededNotificationIdsRef.current = false;
      seenDangerNotificationIdsRef.current = new Set();
      return;
    }

    const dangerItems = notificationItems.filter((item) => {
      if (!item?._id || item.isRead) return false;
      const severity = String(item.severity || "").toLowerCase();
      const type = String(item.type || "").toLowerCase();
      return severity === "danger" || type.includes("-high") || type.includes("-low");
    });

    if (!seededNotificationIdsRef.current) {
      dangerItems.forEach((item) => {
        seenDangerNotificationIdsRef.current.add(item._id);
      });
      seededNotificationIdsRef.current = true;
      return;
    }

    const newlyArrived = dangerItems.filter(
      (item) => !seenDangerNotificationIdsRef.current.has(item._id),
    );

    if (newlyArrived.length > 0) {
      newlyArrived.forEach((item) => {
        seenDangerNotificationIdsRef.current.add(item._id);
      });
      playDangerNotificationSound();
    }
  }, [isAuthenticated, notificationItems, playDangerNotificationSound, userType]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = setInterval(() => {
      loadNotifications().catch(() => {});
    }, 15000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Navbar changed from sticky to fixed top-0 w-full */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md navbar-transition z-[100] border-b border-transparent dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-2"
                onClick={closeMobileMenu}
              >
                <div className="w-10 h-10 border-2 dark:border-gray-600 text-center rounded-lg flex items-center justify-center bg-white dark:bg-gray-800">
                  <img
                    src={Logo_Cycle}
                    alt="SugerWise Logo"
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  <img
                    src={Suger_Wise_Logo}
                    alt="SugerWise Logo"
                    className="h-10"
                  />
                </span>
              </Link>
            </div>

            <div className="hidden md:flex center-nav-container">
              <div className="flex items-center space-x-7">
                {[
                  {
                    to: "/about",
                    icon: "fa-users",
                    label: t("Navbar.AboutLink"),
                  },
                  ...(userType === "patient"
                    ? [
                        {
                          to: "/top-doctors",
                          icon: "fa-user-md",
                          label: t("Navbar.DoctorsLink"),
                        },
                      ]
                    : []),
                  {
                    to: "/shop",
                    icon: "fa-shopping-cart",
                    label: t("Navbar.ShopLink"),
                  },
                  {
                    to: "/insulin_units",
                    icon: "fa-droplet",
                    label: t("Navbar.InsulinLink"),
                  },
                ].map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className={`nav-link flex items-center gap-2 ${location.pathname === link.to ? "active text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-700 dark:text-gray-300"} hover:text-[#2DA1D7] dark:hover:text-[#2DA1D7] px-3 py-2 rounded-md text-[1.05rem] font-bold navbar-transition`}
                    onClick={closeMobileMenu}
                  >
                    <i className={`fas ${link.icon} text-[#2DA1D7]`}></i> {link.label}
                  </Link>
                ))}

                {(canSeeDoctorBlog || canSeePatientBlog) && (
                  <div className="dropdown relative">
                    <button
                      type="button"
                      className={`nav-link flex items-center gap-2 cursor-pointer ${location.pathname.startsWith("/blog") ? "active text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-700 dark:text-gray-300"} hover:text-[#2DA1D7] dark:hover:text-[#2DA1D7] px-3 py-2 rounded-md text-[1.05rem] font-bold navbar-transition bg-transparent border-0`}
                    >
                      <i className="fas fa-blog text-[#8EC641]"></i> {t("Navbar.BlogDropdown")}
                      <i className="fas fa-chevron-down ml-1 text-xs dropdown-arrow"></i>
                    </button>

                    <div className="dropdown-content bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg">
                      {canSeeDoctorBlog && (
                        <Link
                          to="/blog/doctors"
                          className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleBlogOptionClick}
                        >
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user-md text-blue-600 dark:text-blue-400 text-sm"></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {t("Navbar.BlogOptionDoctor")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("Navbar.BlogDescDoctor")}
                            </p>
                          </div>
                        </Link>
                      )}
                      {canSeePatientBlog && (
                        <Link
                          to="/blog/patients"
                          className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={handleBlogOptionClick}
                        >
                          <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-user-injured text-teal-600 dark:text-teal-400 text-sm"></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {t("Navbar.BlogOptionPatient")}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("Navbar.BlogDescPatient")}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  to="/contact"
                  className={`nav-link flex items-center gap-2 ${location.pathname === "/contact" ? "active text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-700 dark:text-gray-300"} hover:text-[#2DA1D7] dark:hover:text-[#2DA1D7] px-3 py-2 rounded-md text-[1.05rem] font-bold navbar-transition`}
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-envelope text-[#2DA1D7]"></i> {t("Navbar.ContactLink")}
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-4">
              {userType === "guest" ? (
                <>
                  <Link
                    to="/cart"
                    className="text-gray-700 dark:text-gray-300 hover:text-[#2DA1D7] px-4 py-2 rounded-md text-base font-bold navbar-transition"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-cart-shopping mr-2 text-[#8EC641]"></i>{" "}
                    {t("Navbar.CartBtn")}
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-[#2DA1D7] px-4 py-2 rounded-md text-base font-bold navbar-transition"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-sign-in-alt mr-2 text-[#2DA1D7]"></i>{" "}
                    {t("Navbar.LoginBtn")}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#2DA1D7] hover:bg-[#1a5f7f] text-white px-5 py-2 rounded-md text-base font-bold navbar-transition shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user-plus mr-2"></i>{" "}
                    {t("Navbar.SignUpBtn")}
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative" ref={notificationsDropdownRef}>
                    <button
                      type="button"
                      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#2DA1D7] hover:text-[#2DA1D7] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      onClick={() => {
                        setIsNotificationsOpen((prev) => !prev);
                        setIsUserDropdownOpen(false);
                        if (!isNotificationsOpen) {
                          loadNotifications().catch(() => {});
                        }
                      }}
                    >
                      <i className="fas fa-bell"></i>
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                          {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            Notifications
                          </span>
                          <span className="text-xs font-bold text-[#2DA1D7]">
                            {unreadNotificationsCount} unread
                          </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notificationItems.length === 0 ? (
                            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                              No notifications yet.
                            </div>
                          ) : (
                            notificationItems.map((notification) => (
                              <button
                                key={notification._id}
                                type="button"
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full border-0 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                  notification.isRead
                                    ? "bg-white dark:bg-gray-800"
                                    : "bg-[#2DA1D7]/5 dark:bg-[#2DA1D7]/10"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                      {notification.title || "Notification"}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                      {notification.message}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#8EC641]"></span>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="dropdown relative" ref={userDropdownRef}>
                    <button
                      type="button"
                      className="flex items-center space-x-2 cursor-pointer py-2 bg-transparent border-0 w-full text-left"
                      onClick={toggleUserDropdown}
                    >
                      <img
                        src={userData.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-200 text-base font-bold">
                        {userData.name}
                      </span>
                      <i
                        className={`fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400 dropdown-arrow ${isUserDropdownOpen ? "rotate-180" : ""}`}
                      ></i>
                    </button>

                    {isUserDropdownOpen && (
                    <div
                      className="dropdown-content bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg"
                      style={{
                        display: "block",
                        minWidth: "180px",
                        right: 0,
                        left: "auto",
                      }}
                    >
                      <Link
                        to="/messages"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                        onClick={closeMobileMenu}
                      >
                        <i className="fas fa-comment-dots mr-3 text-[#2DA1D7]"></i>{" "}
                        {t("Navbar.Messages")}
                      </Link>

                      {userType === "patient" && (
                        <>
                          <Link
                            to="/my-health"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-heartbeat mr-3 text-[#8EC641]"></i>{" "}
                            {t("Navbar.UserHealth")}
                          </Link>
                          <Link
                            to="/cart"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-md text-sm font-medium navbar-transition"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-cart-shopping mr-2 text-[#8EC641]"></i>{" "}
                            {t("Navbar.CartBtn")}
                          </Link>
                          <Link
                            to="/Setting"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-cog mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.UserSettings")}
                          </Link>
                          <Link
                            to="/profile-patient"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-user mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.UserProfile")}
                          </Link>
                        </>
                      )}

                      {userType === "doctor" && (
                        <>
                          <Link
                            to="/doctor"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-users mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.DoctorPatients")}
                          </Link>
                          <Link
                            to="/cart"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-md text-sm font-medium navbar-transition"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-cart-shopping mr-2 text-[#8EC641]"></i>{" "}
                            {t("Navbar.CartBtn")}
                          </Link>
                          <Link
                            to="/setting"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-cog mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.UserSettings")}
                          </Link>
                          <Link
                            to="/profile-doctor"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-user-md mr-3 text-gray-600"></i>{" "}
                            {t("Navbar.UserProfile")}
                          </Link>
                        </>
                      )}

                      {(userType === "admin" || userType === "superadmin") && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-tachometer-alt mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.DashboardAdmin")}
                          </Link>
                          <Link
                          to="/cart"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-cart-shopping mr-2"></i>{" "}
                          {t("Navbar.CartBtn")}
                        </Link>
                          <Link
                            to="/setting"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600"
                            onClick={closeMobileMenu}
                          >
                            <i className="fas fa-cog mr-3 text-[#2DA1D7]"></i>{" "}
                            {t("Navbar.UserSettings")}
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent border-0"
                      >
                        <i className="fas fa-sign-out-alt mr-3"></i>{" "}
                        {t("Navbar.LogoutBtn")}
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none bg-transparent border-0"
              >
                <i
                  className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}
                ></i>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mobile-menu-slide bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {userType !== "guest" && (
                <div className="px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded-md border-b dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={userData.image}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {userData.name}
                      </p>
                      <p className="text-xs text-[#2DA1D7] dark:text-[#2DA1D7] uppercase">
                        {userType}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 pl-2 border-l-2 border-[#2DA1D7]/20 dark:border-[#2DA1D7]/40">
                    <Link
                      to="/messages"
                      className="block py-2 text-base text-gray-600 dark:text-gray-300 font-bold"
                      onClick={closeMobileMenu}
                    >
                      <i className="fas fa-comment-dots mr-2 text-[#2DA1D7]"></i>{" "}
                      {t("Navbar.Messages")}
                    </Link>

                    {userType === "patient" ? (
                      <>
                        <Link
                          to="/my-health"
                          className="block py-2 text-base text-gray-600 dark:text-gray-300 font-bold"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-heartbeat mr-2 text-[#8EC641]"></i>{" "}
                          {t("Navbar.UserHealth")}
                        </Link>
                        <Link
                          to="/cart"
                          className="block py-2 text-base text-gray-600 dark:text-gray-300 font-bold"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-cart-shopping mr-2 text-[#8EC641]"></i>{" "}
                          {t("Navbar.CartBtn")}
                        </Link>
                        <Link
                          to="/Setting"
                          className="block py-2 text-base text-gray-600 dark:text-gray-300 font-bold"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-cog mr-2 text-[#2DA1D7]"></i>{" "}
                          {t("Navbar.UserSettings")}
                        </Link>
                        <Link
                          to="/profile-patient"
                          className="block py-2 text-base text-gray-600 dark:text-gray-300 font-bold"
                          onClick={closeMobileMenu}
                        >
                          <i className="fas fa-user mr-2 text-[#2DA1D7]"></i>{" "}
                          {t("Navbar.UserProfile")}
                        </Link>
                      </>
                    ) : userType === "doctor" ? (
                      <>
                        <Link
                          to="/doctor"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.DoctorPatients")}
                        </Link>
                        <Link
                          to="/cart"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.CartBtn")}
                        </Link>
                        <Link
                          to="/setting"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.UserSettings")}
                        </Link>
                        <Link
                          to="/profile-doctor"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.UserProfile")}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/admin"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.DashboardAdmin")}
                        </Link>
                        <Link
                          to="/cart"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.CartBtn")}
                        </Link>
                        <Link
                          to="/setting"
                          className="block py-2 text-sm text-gray-600 dark:text-gray-300"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.UserSettings")}
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left py-2 text-sm text-red-600 bg-transparent border-0"
                    >
                      {t("Navbar.LogoutBtn")}
                    </button>
                  </div>
                </div>
              )}

              {[
                { to: "/", icon: "fa-home", label: t("Navbar.HomeLink") },
                {
                  to: "/about",
                  icon: "fa-users",
                  label: t("Navbar.AboutLink"),
                },
                ...(userType === "patient"
                  ? [
                      {
                        to: "/top-doctors",
                        icon: "fa-user-md",
                        label: t("Navbar.DoctorsLink"),
                      },
                    ]
                  : []),
                {
                  to: "/shop",
                  icon: "fa-shopping-cart",
                  label: t("Navbar.ShopLink"),
                },
                {
                  to: "/insulin_units",
                  icon: "fa-droplet",
                  label: t("Navbar.InsulinLink"),
                },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  className={`nav-link block ${location.pathname === link.to ? "active text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-700 dark:text-gray-200"} px-4 py-3 rounded-md text-base font-medium`}
                  onClick={closeMobileMenu}
                >
                  <i className={`fas ${link.icon} mr-3 text-[#2DA1D7]`}></i> {link.label}
                </Link>
              ))}

              {(canSeeDoctorBlog || canSeePatientBlog) && (
                <div
                  className={`mobile-dropdown ${isBlogDropdownOpen ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-gray-700 dark:text-gray-200 px-4 py-3 rounded-md text-base font-medium bg-transparent border-0"
                    onClick={() => setIsBlogDropdownOpen(!isBlogDropdownOpen)}
                  >
                    <div className="flex items-center">
                      <i className="fas fa-blog mr-3 text-[#8EC641]"></i>{" "}
                      {t("Navbar.BlogDropdown")}
                    </div>
                    <i
                      className={`fas fa-chevron-down text-xs dropdown-arrow ${isBlogDropdownOpen ? "rotate-180" : ""}`}
                    ></i>
                  </button>
                  {isBlogDropdownOpen && (
                    <div className="mobile-dropdown-content bg-gray-50 dark:bg-gray-800/50">
                      {canSeeDoctorBlog && (
                        <Link
                          to="/blog/doctors"
                          className="block text-gray-700 dark:text-gray-300 px-8 py-3 rounded-md text-sm font-medium"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.BlogOptionDoctor")}
                        </Link>
                      )}
                      {canSeePatientBlog && (
                        <Link
                          to="/blog/patients"
                          className="block text-gray-700 dark:text-gray-300 px-8 py-3 rounded-md text-sm font-medium"
                          onClick={closeMobileMenu}
                        >
                          {t("Navbar.BlogOptionPatient")}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/contact"
                className={`nav-link block ${location.pathname === "/contact" ? "active text-[#2DA1D7] dark:text-[#2DA1D7]" : "text-gray-700 dark:text-gray-200"} px-4 py-3 rounded-md text-lg font-bold`}
                onClick={closeMobileMenu}
              >
                <i className="fas fa-envelope mr-3 text-[#2DA1D7]"></i>{" "}
                {t("Navbar.ContactLink")}
              </Link>

              {userType === "guest" && (
                <div className="flex flex-col space-y-3 mt-4 px-3">
                  <Link
                    to="/login"
                    className="block text-center border border-[#2DA1D7] text-[#2DA1D7] px-4 py-3 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>{" "}
                    {t("Navbar.LoginBtn")}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-[#2DA1D7] text-white px-4 py-3 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-user-plus mr-2"></i>{" "}
                    {t("Navbar.SignUpBtn")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-16 w-full"></div>

      {showLogoutConfirm && (
        <Logout
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={confirmLogout}
        />
      )}
    </>
  );
};

export default Navbar;
