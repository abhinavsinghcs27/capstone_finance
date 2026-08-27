import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Search,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCheck,
  CircleAlert,
  CreditCard,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

function Topbar() {
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const [userName, setUserName] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Monthly spending update",
      message: "Your spending is 12% lower than last month.",
      time: "2 min ago",
      icon: TrendingUp,
      read: false,
    },
    {
      id: 2,
      title: "Transaction completed",
      message: "Your recent payment was successfully processed.",
      time: "1 hour ago",
      icon: CreditCard,
      read: false,
    },
    {
      id: 3,
      title: "Security update",
      message: "Your account security check is complete.",
      time: "Yesterday",
      icon: ShieldCheck,
      read: true,
    },
  ]);

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setUserName(savedUser.name || "User");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* Close dropdowns when clicking outside */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleProfileClick = () => {
    navigate("/profile-setup");
    setShowProfileMenu(false);
  };

  const handleSettingsClick = () => {
    setShowProfileMenu(false);
    alert("Settings will be available soon.");
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setShowProfileMenu(false);
    navigate("/auth/login");
  };

  const handleNotificationToggle = () => {
    setShowNotifications((current) => !current);
    setShowProfileMenu(false);
  };

  const handleNotificationClick = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const displayName = userName || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className={`flex h-20 shrink-0 items-center justify-between border-b px-6 transition-colors lg:px-8 ${
        darkMode
          ? "border-slate-800 bg-[#07111f]"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Search */}
      <div className="hidden w-full max-w-sm md:block">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search your finances..."
            className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition ${
              darkMode
                ? "bg-slate-800 text-slate-200 placeholder:text-slate-500 focus:bg-slate-800"
                : "bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:bg-white"
            }`}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme */}
        <button
          type="button"
          onClick={() => setDarkMode((value) => !value)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
            darkMode
              ? "text-slate-200 hover:bg-slate-800"
              : "text-slate-500 hover:bg-slate-50"
          }`}
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>

        {/* Notifications */}
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={handleNotificationToggle}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
              darkMode
                ? "text-slate-200 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-50"
            }`}
            title="Notifications"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              className={`absolute right-0 top-full z-50 mt-3 w-[380px] overflow-hidden rounded-2xl border shadow-xl ${
                darkMode
                  ? "border-slate-700 bg-[#101b2d]"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between border-b px-5 py-4 ${
                  darkMode
                    ? "border-slate-700"
                    : "border-slate-100"
                }`}
              >
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      darkMode
                        ? "text-white"
                        : "text-[#07111f]"
                    }`}
                  >
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1 ? "s" : ""
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification.id)
                        }
                        className={`flex w-full gap-3 border-b px-5 py-4 text-left transition ${
                          darkMode
                            ? "border-slate-800 hover:bg-slate-800/70"
                            : "border-slate-100 hover:bg-slate-50"
                        } ${
                          !notification.read
                            ? darkMode
                              ? "bg-slate-800/30"
                              : "bg-emerald-50/30"
                            : ""
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            notification.read
                              ? darkMode
                                ? "bg-slate-800 text-slate-400"
                                : "bg-slate-100 text-slate-400"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`text-sm ${
                                notification.read
                                  ? "font-medium text-slate-500"
                                  : darkMode
                                    ? "font-semibold text-white"
                                    : "font-semibold text-[#07111f]"
                              }`}
                            >
                              {notification.title}
                            </p>

                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {notification.message}
                          </p>

                          <p className="mt-1.5 text-[11px] text-slate-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        darkMode
                          ? "bg-slate-800 text-slate-500"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CircleAlert size={21} />
                    </div>

                    <p
                      className={`mt-3 text-sm font-semibold ${
                        darkMode
                          ? "text-white"
                          : "text-[#07111f]"
                      }`}
                    >
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      You're all caught up for now.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`border-t px-4 py-3 text-center ${
                  darkMode
                    ? "border-slate-700"
                    : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          ref={profileRef}
          className="relative ml-2"
        >
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((current) => !current);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${
              darkMode
                ? "hover:bg-slate-800"
                : "hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                darkMode
                  ? "bg-emerald-500 text-[#07111f]"
                  : "bg-[#07111f] text-white"
              }`}
            >
              {initial}
            </div>

            <div className="hidden text-left sm:block">
              <p
                className={`text-sm font-semibold ${
                  darkMode
                    ? "text-white"
                    : "text-[#07111f]"
                }`}
              >
                {displayName}
              </p>

              <p className="text-xs text-slate-400">
                Personal Account
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block ${
                showProfileMenu
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              className={`absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border shadow-xl ${
                darkMode
                  ? "border-slate-700 bg-[#101b2d]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`border-b px-4 py-4 ${
                  darkMode
                    ? "border-slate-700"
                    : "border-slate-100"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    darkMode
                      ? "text-white"
                      : "text-[#07111f]"
                  }`}
                >
                  {displayName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Personal Account
                </p>
              </div>

              <button
                type="button"
                onClick={handleProfileClick}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User size={17} />
                My Profile
              </button>

              <button
                type="button"
                onClick={handleSettingsClick}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                  darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Settings size={17} />
                Settings
              </button>

              <div
                className={`mx-3 border-t ${
                  darkMode
                    ? "border-slate-700"
                    : "border-slate-100"
                }`}
              />

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;