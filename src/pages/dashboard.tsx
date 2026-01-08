import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { DashboardSidebar, ProfileForm, AttendanceSessionList } from "../components/dashboard/organisms";
import { useAuth } from "@/context/AuthContext";
import { FaBars } from "react-icons/fa";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("absensi");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Simple auth check delay or logic if needed, 
        // but useAuth handles state mostly.
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [loading, isAuthenticated, router]);

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
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Peserta'}</p>
                            </div>
                            <div className="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0) || 'U'}
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
