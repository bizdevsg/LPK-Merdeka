import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Navbar } from "../components/organisms";
import { DashboardSidebar } from "../components/organisms/DashboardSidebar";
import Head from "next/head";
import Image from "next/image";

import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profil");
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Check for auth token
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case "profil":
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-zinc-700 transition-colors">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Profil Saya</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Nama Lengkap</label>
                                    <p className="font-medium text-gray-900 dark:text-gray-200 text-lg">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Email</label>
                                    <p className="font-medium text-gray-900 dark:text-gray-200 text-lg">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Gamification Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100 flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                    <span className="text-2xl font-bold">🏆</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Skor</p>
                                    <p className="text-xl font-bold text-gray-900">1,250</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <span className="text-2xl font-bold">🥇</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ranking</p>
                                    <p className="text-xl font-bold text-gray-900">#42</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100 flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <span className="text-2xl font-bold">🎖️</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Badges</p>
                                    <p className="text-xl font-bold text-gray-900">5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "kompetisi-aktif":
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Kompetisi Aktif</h2>
                        <div className="bg-white p-6 rounded-xl border border-red-100 bg-red-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full mb-3">Seasonal</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lomba Pidato Bahasa Jepang Season 2</h3>
                                    <p className="text-gray-600 mb-4 max-w-2xl">Tunjukkan kemampuan berbicara bahasa Jepangmu dan menangkan hadiah total 5 Juta Rupiah + Sertifikat Resmi.</p>
                                    <div className="flex gap-4 text-sm text-gray-500 mb-6">
                                        <span className="flex items-center gap-1">📅 Deadline: 25 Des 2023</span>
                                        <span className="flex items-center gap-1">👥 Peserta: 45/100</span>
                                    </div>
                                    <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition">Daftar Sekarang</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            // Default fallback for other tabs
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="text-6xl mb-4">🚧</div>
                        <h3 className="text-xl font-bold text-gray-400">Halaman Belum Tersedia</h3>
                        <p className="text-gray-500 mt-2">Fitur <span className="font-semibold text-gray-700">{activeTab}</span> sedang dalam pengembangan.</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Dashboard | LPK PB Merdeka</title>
            </Head>
            {/* Navbar with hideNavigation */}
            <Navbar hideNavigation={true} />

            <div className="min-h-screen bg-gray-50 dark:bg-zinc-800 transition-colors">
                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Left Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            {/* Import Sidebar dynamically to avoid circular dependencies if any, though standard import is fine */}
                            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                        </div>

                        {/* Right Content */}
                        <div className="flex-grow w-full">
                            {/* Header for Mobile/Context */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                    <p className="text-gray-500 text-sm">Selamat datang kembali, {user?.name}</p>
                                </div>
                            </div>

                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
