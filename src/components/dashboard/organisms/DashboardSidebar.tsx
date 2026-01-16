import React, { useState } from "react";
import Image from "next/image";
import {
    FaUser, FaCertificate, FaHistory, FaTrophy,
    FaBook, FaFileAlt, FaVideo, FaGamepad, FaPuzzlePiece,
    FaChevronDown, FaChevronRight, FaCalendarCheck,
    FaSignOutAlt, FaInfoCircle, FaHome
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarGroup {
    title: string;
    items: SidebarItem[];
}

interface DashboardSidebarProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
    const { logout } = useAuth();
    const router = useRouter();

    const menuGroups: SidebarGroup[] = [
        {
            title: "Menu Utama",
            items: [
                { id: "overview", label: "Overview", icon: <FaHome /> },
                { id: "profil", label: "Profil Saya", icon: <FaUser /> },
                { id: "absensi", label: "Absensi", icon: <FaCalendarCheck /> },
                //{ id: "program", label: "Program Saya", icon: <FaFileAlt /> },
            ],
        },
        {
            title: "Akademik",
            items: [
                //{ id: "kompetisi-aktif", label: "Kompetisi", icon: <FaTrophy /> },
                { id: "panduan-gamifikasi", label: "Panduan Gamifikasi", icon: <FaInfoCircle /> },
                { id: "leaderboard", label: "Leaderboard", icon: <FaPuzzlePiece /> },
                { id: "riwayat", label: "Riwayat", icon: <FaHistory /> },
                { id: "sertifikat", label: "Sertifikat", icon: <FaCertificate /> },
            ],
        },
        {
            title: "Pusat Belajar",
            items: [
                { id: "artikel", label: "Artikel & Berita", icon: <FaFileAlt /> },
                { id: "materi", label: "E-Book", icon: <FaBook /> },
                { id: "video", label: "Video", icon: <FaVideo /> },
                { id: "kuis", label: "Kuis & Latihan", icon: <FaGamepad /> },
            ],
        },
    ];

    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (title: string) => {
        setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Logo Area */}
                {/* Logo Area */}
                <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/assets/Logo-Tab.png"
                            alt="Logo LPK"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">LPK Merdeka</span>
                </div>

                {/* Menu Area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            onTabChange(item.id);
                                            if (window.innerWidth < 768 && onClose) onClose();
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <span className={`text-lg ${activeTab === item.id ? "text-red-600 dark:text-red-400" : "text-gray-400 group-hover:text-gray-600"}`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Area */}

            </aside>
        </>
    );
};
