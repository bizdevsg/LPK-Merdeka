import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DashboardSidebar, ProfileForm, AttendanceSessionList, ArticleList, EbookList, VideoList, QuizList, Leaderboard, CertificateList, PointHistory, GamificationGuide, DashboardOverview } from "../components/dashboard/organisms";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from '@/context/SearchContext';
import { FaBars, FaCog, FaSignOutAlt, FaSearch, FaHome, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null); // State for fresh user data
    const [showCautionBanner, setShowCautionBanner] = useState(true); // State for caution banner
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch fresh user data on mount and tab change
    useEffect(() => {
        if (isAuthenticated) {
            fetch('/api/user')
                .then(res => res.json())
                .then(data => setUserProfile(data))
                .catch(err => console.error("Failed to fetch user profile", err));
        }
    }, [isAuthenticated, activeTab]);

    // Sync initial state
    useEffect(() => {
        if (user && !userProfile) {
            setUserProfile(user);
        }
    }, [user]);

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
        if (router.isReady && router.query.tab) {
            setActiveTab(String(router.query.tab));
        }
    }, [router.isReady, router.query.tab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, tab },
        }, undefined, { shallow: true });
    };

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

    // Define learning center tabs that require complete profile
    const LEARNING_CENTER_TABS = ['absensi', 'artikel', 'materi', 'video', 'kuis'];
    const isLearningCenterTab = LEARNING_CENTER_TABS.includes(activeTab);

    // Check if profile is complete
    const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin';
    const u = userProfile || user;
    const isProfileComplete = isAdmin || (u?.name && u?.gender && u?.birthDate && u?.address && u?.phoneNumber);

    const renderContent = () => {

        // Only block learning center tabs if profile incomplete
        if (!isProfileComplete && isLearningCenterTab) {
            return (
                <div className="flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-900/30 p-8 text-center max-w-2xl mx-auto mt-10 shadow-sm animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6 text-3xl">
                        <FaExclamationTriangle />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Profil Belum Lengkap</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                        Untuk mengakses <strong className="text-red-600">Pusat Belajar</strong>, Anda diharuskan melengkapi data diri terlebih dahulu.
                    </p>
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data Wajib</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 text-left">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Jenis Kelamin
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Tempat & Tanggal Lahir
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Alamat
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Nomor Telepon
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => handleTabChange('profil')}
                        className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 transform hover:-translate-y-1"
                    >
                        Lengkapi Profil Sekarang
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case "overview":
                return <DashboardOverview />;
            case "absensi":
                return <AttendanceSessionList />;
            case "artikel":
                return <ArticleList />;
            case "materi":
                return <EbookList />;
            case "video":
                return <VideoList />;
            case "kuis":
                return <QuizList />;
            case "leaderboard":
                return <Leaderboard />;
            case "sertifikat":
                return <CertificateList />;
            case "riwayat":
                return <PointHistory />;
            case "panduan-gamifikasi":
                return <GamificationGuide />;
            case "profil":
                return <ProfileForm />;
            case "kompetisi-aktif":
                // Placeholder
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
                    onTabChange={handleTabChange}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    userProfile={userProfile}
                />

                {/* Main Content Area */}
                <div className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
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
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile?.name || user?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Peserta'}</p>
                                    </div>
                                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-zinc-700 relative">
                                        {(userProfile?.photo_url || userProfile?.image || user?.image) ? (
                                            <img
                                                src={userProfile?.photo_url || userProfile?.image || user?.image}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-red-600 font-bold text-sm">
                                                {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg py-1 border border-gray-100 dark:border-zinc-800 z-50">
                                        <Link
                                            href="/"
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                                        >
                                            <FaHome className="text-gray-400" />
                                            Beranda
                                        </Link>
                                        <button
                                            onClick={() => handleTabChange('profil')} // Or link to profile page
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
                        {/* Caution Banner - Profile Incomplete Warning */}
                        {!isProfileComplete && !isLearningCenterTab && showCautionBanner && (
                            <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-l-4 border-amber-500 dark:border-amber-600 rounded-lg p-4 shadow-sm animate-in slide-in-from-top duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                                            <FaInfoCircle className="text-amber-600 dark:text-amber-500 text-lg" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                            Profil Belum Lengkap
                                        </h3>
                                        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                                            Beberapa fitur <strong>Pusat Belajar</strong> (Absensi, Artikel, E-Book, Video, Kuis) terkunci.
                                            Lengkapi data diri Anda untuk membuka akses penuh.
                                        </p>
                                        <button
                                            onClick={() => handleTabChange('profil')}
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                        >
                                            <FaCog className="text-xs" />
                                            Lengkapi Profil Sekarang
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowCautionBanner(false)}
                                        className="flex-shrink-0 text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors p-1"
                                        aria-label="Tutup peringatan"
                                    >
                                        <FaTimes className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {renderContent()}
                    </main>
                </div>
            </div>
        </>
    );
}
