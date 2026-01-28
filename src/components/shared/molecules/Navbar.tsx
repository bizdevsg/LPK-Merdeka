import React, { useState, useEffect, useRef } from "react";
import { NavBarButton } from "../atoms";
import { FaBars, FaTimes, FaSun, FaMoon, FaChevronDown, FaSignOutAlt, FaTachometerAlt } from "react-icons/fa"; // import icon hamburger
import { useTheme } from "@/context/ThemeContext";

export interface NavItem {
  id: string;
  label: string;
  href?: string;
}

interface User {
  name?: string;
  email?: string;
  avatar?: string;
  image?: string;
  photo_url?: string;
  role?: string;
}

interface NavbarProps {
  logo?: React.ReactNode;
  navItems: NavItem[];
  activeId?: string;
  onNavClick?: (id: string) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isAuthenticated?: boolean;
  user?: User | null;
  onLogoutClick?: () => void;
  onDashboardClick?: () => void;
  hideNavigation?: boolean;
}


export const Navbar: React.FC<NavbarProps> = ({
  logo,
  navItems,
  activeId,
  onNavClick,
  onLoginClick,
  onRegisterClick,
  isAuthenticated,
  user,
  onLogoutClick,
  onDashboardClick,
  hideNavigation = false,
}) => {
  const [internalActiveNav, setInternalActiveNav] = useState(navItems[0]?.id);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user]);

  const currentActiveNav = activeId || internalActiveNav;

  const handleNavClick = (id: string) => {
    if (!activeId) {
      setInternalActiveNav(id);
    }
    onNavClick?.(id);
    setIsMenuOpen(false); // close when clicked
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);

    // Click outside handler for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-md bg-red-600/90 dark:bg-black/80 shadow-lg" : "bg-red-600 dark:bg-black"
        } text-white w-full border-b border-transparent dark:border-white/10`}
    >
      <div className="container mx-auto px-6 lg:px-12 xl:px-24 flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {logo ? logo : <span className="font-bold text-xl">LPK</span>}
        </div>

        {/* Desktop menu - HIDE if hideNavigation is true */}
        {!hideNavigation && (
          <div className="hidden md:flex items-center justify-center flex-1 gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm px-5 py-2 rounded-full transition-all duration-300 font-medium ${currentActiveNav === item.id
                  ? "bg-white text-red-600 shadow-lg dark:bg-red-600 dark:text-white"
                  : "text-red-50 hover:bg-red-500/50 hover:text-white dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Desktop buttons on right */}
        <div className={`${(isAuthenticated && hideNavigation) ? 'flex' : 'hidden'} md:flex items-center gap-3 flex-shrink-0`}>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Toggle Internal Theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 bg-red-700/50 hover:bg-red-700 dark:bg-white/10 dark:hover:bg-white/20 rounded-full px-4 py-1.5 cursor-pointer transition-colors border border-red-500/50 dark:border-white/10 select-none"
                onClick={toggleDropdown}
              >
                {/* Avatar */}
                {(!imageError && (user?.photo_url || user?.image || user?.avatar)) ? (
                  <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden relative">
                    <img
                      src={user.photo_url || user.image || user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold border border-white/30">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">{user?.name || "User"}</span>
                <FaChevronDown className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl py-1 text-gray-800 dark:text-gray-200 animate-fade-in border border-gray-100 dark:border-neutral-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  {!hideNavigation && (
                    <button
                      onClick={onDashboardClick}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-2 transition-colors"
                    >
                      <FaTachometerAlt className="text-gray-400 group-hover:text-red-500" />
                      Dashboard
                    </button>
                  )}

                  <button
                    onClick={onLogoutClick}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-white/5 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors border-t border-gray-50 dark:border-neutral-800"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavBarButton label="Masuk" variant="ghost" onClick={onLoginClick} />
              <NavBarButton label="Daftar" variant="secondary" onClick={onRegisterClick} />
            </>
          )}
        </div>


        {/* Mobile hamburger icon */}
        {!hideNavigation && (
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <button
              className="text-2xl"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu drawer */}
      {isMenuOpen && !hideNavigation && (
        <div className="md:hidden bg-red-600 dark:bg-neutral-900 flex flex-col px-6 py-4 gap-4 animate-slide-down border-t border-red-500/30 dark:border-neutral-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-white text-left text-lg font-medium"
            >
              {item.label}
            </button>
          ))}

          {isAuthenticated ? (
            <>
              <div className="border-t border-red-500/50 dark:border-neutral-800 pt-4 mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold border border-white/30 overflow-hidden">
                    {(user?.photo_url || user?.image || user?.avatar) ? (
                      <img src={user.photo_url || user.image || user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name?.charAt(0).toUpperCase() || "U")
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs opacity-80">{user?.email}</p>
                  </div>
                </div>
                <NavBarButton label="Dashboard" variant="secondary" onClick={onDashboardClick} />
                <button
                  onClick={toggleTheme}
                  className="w-full text-left py-3 text-white/90 font-medium flex items-center justify-between hover:text-white mt-1 border-t border-white/10 pt-4"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                    <span>Mode Gelap</span>
                  </div>
                  <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-white' : 'bg-red-800'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${theme === 'dark' ? 'translate-x-4.5 bg-red-600' : 'translate-x-0.5 bg-white'}`} />
                  </div>
                </button>
                <button
                  onClick={onLogoutClick}
                  className="w-full text-left py-3 text-white/90 font-medium flex items-center gap-2 hover:text-white mt-1"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavBarButton label="Login" variant="secondary" onClick={onLoginClick} />
              <NavBarButton label="Daftar" variant="secondary" onClick={onRegisterClick} />
            </>
          )}
        </div>
      )}
    </nav>
  );
};
