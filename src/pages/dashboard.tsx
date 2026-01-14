import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DashboardSidebar, ProfileForm, AttendanceSessionList, ArticleList } from "../components/dashboard/organisms";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from '@/context/SearchContext';
import { FaBars, FaCog, FaSignOutAlt, FaSearch } from "react-icons/fa";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("absensi");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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



    useEffect(() => {
        // Auth check relies on useAuth() which is cookie-based via better-auth
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        } else if (isAuthenticated) {
            // Redirect admins to admin dashboard if they land here
            if (user?.role === 'admin' || user?.role === 'superAdmin') {
                router.push('/admin/dashboard');
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, loading, router, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">Memuat Dashboard...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case "absensi":
                return <AttendanceSessionList />;
            case "artikel":
                return <ArticleList />;
            case "profil":
                return <ProfileForm />;
            case "kompetisi-aktif":
                // Placeholder for now, or existing code if I had it. 
                // I'll put a simple placeholder card.
                return (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Kompetisi Aktif</h2>
                        <div className="p-8 text-center bg-gray-50 dark:bg-zinc-800 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                            <p className="text-gray-500">Belum ada kompetisi yang diikuti.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                        <div className="text-4xl mb-4 opacity-50">🚧</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fitur Dalam Pengembangan</h3>
                        <p className="text-gray-500 mt-1 text-sm">Halaman <span className="font-semibold text-red-600">{activeTab}</span> akan segera tersedia.</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Dashboard | LPK PB Merdeka</title>
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
                {/* Fixed Sidebar */}
                <DashboardSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="md:ml-64 min-h-screen transition-all duration-300">
                    {/* Top Header */}
                    <header className="sticky top-0 z-20 md:static bg-white md:bg-transparent border-b md:border-none border-gray-100 dark:border-zinc-800 h-16 px-4 md:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <FaBars size={20} />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                                {activeTab.replace('-', ' ')}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">
                                <FaSearch className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:outline-none w-48 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-4 focus:outline-none pl-4 border-l border-gray-200 dark:border-zinc-800"
                                >
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Peserta'}</p>
                                    </div>
                                    <div className="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-zinc-800 z-50">
                                        <button
                                            onClick={() => setActiveTab('profil')} // Or link to profile page
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                        >
                                            <FaCog className="text-gray-400" />
                                            Edit Profil
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                router.push('/auth/login');
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                        >
                                            <FaSignOutAlt className="text-red-500" />
                                            Keluar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Content Scrollable Area */}
                    <main className="p-4 md:p-8 max-w-7xl mx-auto">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </>
    );
}
