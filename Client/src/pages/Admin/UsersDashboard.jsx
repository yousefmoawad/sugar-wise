import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useUsers from "../../hooks/useUsers";
import usePresence from "../../hooks/usePresence";
import {
  Search,
  Circle,
  Trash2,
  UserCheck,
  UserCog,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

const UsersDashboard = () => {
  const { t } = useTranslation();
  const { items, loading, error, fetchAll, deleteItem } = useUsers();
  const [filter, setFilter] = useState("everyone"); // options: doctor, patient, admin, superAdmin, everyone
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  // Enable presence tracking for current user
  usePresence(300000, true); // Send heartbeat every 5 minutes

  // Auto-refresh user list every 30 seconds to get updated online status
  useEffect(() => {
    const refreshUsers = () => {
      fetchAll().catch(() => {});
    };

    refreshUsers();
    const interval = setInterval(refreshUsers, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    const normalizedUsers = (items || []).map((user) => {
      const lastSeenAt = user.lastSeenAt ? new Date(user.lastSeenAt) : null;
      const now = new Date();
      const timeSinceLastSeen = lastSeenAt ? now.getTime() - lastSeenAt.getTime() : Infinity;
      
      // User is online if lastSeenAt is within 5 minutes (300000ms)
      const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
      const isOnline = lastSeenAt && !Number.isNaN(lastSeenAt.getTime()) && timeSinceLastSeen <= ONLINE_THRESHOLD;

      const normalizedRole = (user.role || "")
        .toLowerCase()
        .replace(/\s+/g, "");
      const role =
        normalizedRole === "superadmin"
          ? "superAdmin"
          : normalizedRole || "patient";
      return {
        id: user._id,
        name: user.name || "Unknown User",
        role,
        status: isOnline ? "online" : "offline",
        joinDate: user.joinDate
          ? new Date(user.joinDate).toISOString().slice(0, 10)
          : "-",
        image:
          user.image ||
          user.doctor?.profileImage ||
          user.doctor?.selfImg ||
          user.patient?.profileImage ||
          user.admin?.Image ||
          user.superAdmin?.Image ||
          "https://i.pravatar.cc/150",
      };
    });
    setUsers(normalizedUsers);
  }, [items]);

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        t("UsersDashboard.ConfirmDelete") ||
          "Are you sure you want to delete this user?",
      )
    ) {
      try {
        await deleteItem(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } catch (deleteError) {
        console.error(deleteError);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === "everyone" || user.role === filter;
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-10 animate-fade-in">
      {/* [USERS HEADER]: Upscaled typography for audit clarity */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("UsersDashboard.Title") || "User Management"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            {t("UsersDashboard.Subtitle") ||
              "Monitor and manage all system accounts"}
          </p>
        </div>

        {/* Search Bar - Focused for brand identity */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={
              t("UsersDashboard.SearchPlaceholder") || "Search by name..."
            }
            className="w-full pl-12 pr-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-[#2DA1D7] transition-all shadow-md text-lg text-gray-700 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* [ROLE FILTERS]: Using brand-aligned active states and larger tap targets */}
      <div className="flex flex-wrap gap-4 bg-white/50 dark:bg-gray-800/30 p-2 rounded-2xl w-fit border border-[#2DA1D7]/10 backdrop-blur-sm">
        {["everyone", "doctor", "patient", "admin", "superAdmin"].map(
          (role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-8 py-3 rounded-xl text-base font-black transition-all capitalize ${
                filter === role
                  ? "bg-[#2DA1D7] text-white shadow-xl scale-105"
                  : "text-gray-600 dark:text-gray-400 hover:bg-[#2DA1D7]/10 dark:hover:bg-gray-700"
              }`}
            >
              {t(`UsersDashboard.Filter${role}`) || role}
            </button>
          ),
        )}
      </div>

      {/* [USERS TABLE]: High-contrast layout with consistent icon coloring */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
        {loading && (
          <p className="px-8 py-6 text-lg font-bold text-[#2DA1D7] animate-pulse">Loading users...</p>
        )}
        {error && (
          <p className="px-8 py-6 text-lg font-bold text-red-600">
            Failed to load users
          </p>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2DA1D7]/5 dark:bg-gray-800/50 border-b border-[#2DA1D7]/10">
              <th className="px-8 py-5 text-base font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("UsersDashboard.ColUser") || "User"}
              </th>
              <th className="px-8 py-5 text-base font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("UsersDashboard.ColRole") || "Role"}
              </th>
              <th className="px-8 py-5 text-base font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("UsersDashboard.ColStatus") || "Status"}
              </th>
              <th className="px-8 py-5 text-base font-black text-[#2DA1D7] uppercase tracking-widest">
                {t("UsersDashboard.ColJoined") || "Joined Date"}
              </th>
              <th className="px-8 py-5 text-base font-black text-[#2DA1D7] uppercase tracking-widest text-right">
                {t("UsersDashboard.ColActions") || "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                {/* User Info */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-12 h-12 rounded-full border-2 border-[#2DA1D7]/20 object-cover shadow-sm"
                    />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {user.role === "admin" && (
                      <ShieldAlert size={18} className="text-red-500" />
                    )}
                    {user.role === "doctor" && (
                      <UserCheck size={18} className="text-[#2DA1D7]" />
                    )}
                    {user.role === "patient" && (
                      <UserCog size={18} className="text-[#8EC641]" />
                    )}
                    {user.role === "superAdmin" && (
                      <ShieldCheck size={18} className="text-[#8EC641]" />
                    )}
                    <span
                      className={`text-base font-black capitalize ${
                        user.role === "admin"
                          ? "text-red-600"
                          : user.role === "doctor"
                            ? "text-[#2DA1D7]"
                            : user.role === "superAdmin"
                              ? "text-[#8EC641]"
                              : "text-[#8EC641]"
                      }`}
                    >
                      {user.role === "superAdmin" ? "Super Admin" : user.role}
                    </span>
                  </div>
                </td>

                {/* Online Status */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <Circle
                      size={10}
                      fill={user.status === "online" ? "#8EC641" : "#94a3b8"}
                      className={
                        user.status === "online"
                          ? "text-[#8EC641] animate-pulse"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={`text-base font-black ${user.status === "online" ? "text-[#8EC641]" : "text-gray-500"}`}
                    >
                      {user.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-5 text-lg font-medium text-gray-600 dark:text-gray-400">
                  {user.joinDate}
                </td>

                <td className="px-8 py-5 text-right">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all hover:scale-125"
                    title="Delete User"
                  >
                    <Trash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <Users className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No users found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersDashboard;
