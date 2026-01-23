import React, { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSearch } from '@/context/SearchContext';
import { useSidebar } from '@/context/SidebarContext';
import {
    FaHome, FaUsers, FaUserShield, FaCalendarCheck,
    FaBars, FaSignOutAlt, FaSearch,
    FaLock, FaImages, FaQuestionCircle, FaCog, FaStar, FaNewspaper, FaBook, FaMoneyBillWave, FaVideo, FaClipboardList,
    FaChevronLeft, FaChevronRight, FaChevronDown, FaSun, FaMoon, FaExclamationCircle
} from 'react-icons/fa';
import Image from 'next/image';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { searchQuery, setSearchQuery } = useSearch();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (user) {
            fetch('/api/user')
                .then(res => res.json())
                .then(data => setUserProfile(data))
                .catch(err => console.error("Failed to fetch admin profile", err));
        }
    }, [user]);

    // Reset error when user changes or profile updates
    useEffect(() => {
        setImageError(false);
    }, [user, userProfile]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    const toggleGroup = (group: string) => {
        setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(`${path}/`);

    const menuItems = [
        {
            group: 'Home',
            items: [
                { label: 'Dashboard', href: '/admin/dashboard', icon: <FaHome /> }
            ]
        },
        {
            group: 'Landing Page',
            items: [
                { label: 'Home & About', href: '/admin/cms/home-about', icon: <FaExclamationCircle /> },
                { label: 'Program', href: '/admin/cms/program', icon: <FaBook /> },
                { label: 'Testimonials', href: '/admin/cms/testimonials', icon: <FaStar /> },
                { label: 'FAQ', href: '/admin/cms/faq', icon: <FaQuestionCircle /> },
                { label: 'Gallery', href: '/admin/cms/gallery', icon: <FaImages /> },
                { label: 'Settings', href: '/admin/cms/settings', icon: <FaCog /> }
            ]
        },
        {
            group: 'Content',
            items: [
                { label: 'Articles', href: '/admin/cms/articles', icon: <FaNewspaper /> },
                { label: 'E-Books', href: '/admin/content/ebooks', icon: <FaBook /> },
                { label: 'Videos', href: '/admin/content/videos', icon: <FaVideo /> },
                { label: 'Quiz Bank', href: '/admin/content/quiz-bank', icon: <FaQuestionCircle /> },
                { label: 'Weekly Quizzes', href: '/admin/content/weekly-quiz', icon: <FaClipboardList /> },
                { label: 'Program Management', href: '/admin/cms/pricing', icon: <FaMoneyBillWave /> }
            ]
        },
        {
            group: 'Activity & Gamification',
            items: [
                { label: 'Attendance Sessions', href: '/admin/attendance-sessions', icon: <FaCalendarCheck /> },
                { label: 'Leaderboard', href: '/admin/gamification/leaderboard', icon: <FaStar /> },
                { label: 'Certificates', href: '/admin/gamification/certificates', icon: <FaClipboardList /> }
            ]
        },
        {
            group: 'Management',
            items: [
                { label: 'Admins', href: '/admin/admins', icon: <FaUserShield /> },
                { label: 'Users', href: '/admin/users', icon: <FaUsers /> }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transform transition-all duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                {/* Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shadow-sm z-50 transition-colors"
                >
                    {isCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
                </button>

                <div className={`h-16 flex items-center border-b border-gray-100 dark:border-zinc-800 transition-all ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                    {/* Logo Icon Placeholder if no image */}
                    <span className={`text-xl font-bold text-red-600 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'text-2xl' : ''}`}>
                        {isCollapsed ? 'A' : 'Admin Panel'}
                    </span>
                </div>

                <div className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-64px)] overflow-x-hidden">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            {!isCollapsed ? (
                                <div
                                    className="flex items-center justify-between px-3 mb-2 cursor-pointer group/header"
                                    onClick={() => toggleGroup(group.group)}
                                >
                                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                                        {group.group}
                                    </h3>
                                    <FaChevronDown
                                        className={`text-[10px] text-gray-400 dark:text-gray-500 transition-transform duration-200 ${collapsedGroups[group.group] ? '-rotate-90' : ''}`}
                                    />
                                </div>
                            ) : (
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-2 my-2" />
                            )}

                            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${(!isCollapsed && collapsedGroups[group.group]) ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'} py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 h-16 px-4 md:px-8 flex items-center justify-between transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
                        >
                            <FaBars />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title || 'Dashboard'}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-sm focus:outline-none w-48 ml-2 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={20} className="text-yellow-500" />}
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-zinc-800 focus:outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userProfile?.name || user?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Administrator'}</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-zinc-700 relative">
                                    {(!imageError && (userProfile?.photo_url || userProfile?.image || user?.image)) ? (
                                        <img
                                            src={userProfile?.photo_url || userProfile?.image || user?.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm">
                                            {(userProfile?.name || user?.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-zinc-800 z-50 animate-in fade-in zoom-in duration-200">
                                    <Link
                                        href="/"
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                    >
                                        <FaHome className="text-gray-400" />
                                        Beranda
                                    </Link>
                                    <Link
                                        href="/admin/profile"
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                    >
                                        <FaCog className="text-gray-400" />
                                        Edit Profile
                                    </Link>
                                    <Link
                                        href="/admin/security"
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                    >
                                        <FaLock className="text-gray-400" />
                                        Security
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                    >
                                        <FaSignOutAlt className="text-red-500" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-8 flex-1 text-gray-900 dark:text-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
};
