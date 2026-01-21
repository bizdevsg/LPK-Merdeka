import React, { useState } from "react";
import Image from "next/image";
import {
    FaUser, FaCertificate, FaHistory, FaTrophy,
    FaBook, FaFileAlt, FaVideo, FaGamepad, FaPuzzlePiece,
    FaChevronDown, FaChevronRight, FaCalendarCheck,
    FaSignOutAlt, FaInfoCircle, FaHome, FaChevronLeft, FaLock
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
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    userProfile?: any;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeTab,
    onTabChange,
    isOpen,
    onClose,
    isCollapsed = false,
    onToggleCollapse,
    userProfile
}) => {
    const { logout, user } = useAuth();
    const router = useRouter();

    // Define learning center tabs that require complete profile
    const LEARNING_CENTER_TABS = ['absensi', 'artikel', 'materi', 'video', 'kuis'];

    // Check if profile is complete
    const u = userProfile || user;
    const isAdmin = u?.role === 'admin' || u?.role === 'superAdmin';
    const isProfileComplete = isAdmin || (u?.name && u?.gender && u?.birthDate && u?.address && u?.phoneNumber);

    const menuGroups: SidebarGroup[] = [
        {
            title: "Menu Utama",
            items: [
                { id: "overview", label: "Overview", icon: <FaHome /> },
                { id: "profil", label: "Profil Saya", icon: <FaUser /> },
                { id: "absensi", label: "Absensi", icon: <FaCalendarCheck /> },
            ],
        },
        {
            title: "Akademik",
            items: [
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
                fixed top-0 left-0 z-30 h-full bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800
                transform transition-all duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                ${isCollapsed ? "w-20" : "w-64"}
            `}>
                {/* Collapse Toggle Button (Desktop Only) */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full items-center justify-center text-gray-500 hover:text-red-600 shadow-sm z-50 transition-colors"
                >
                    {isCollapsed ? <FaChevronRight size={10} /> : <FaChevronLeft size={10} />}
                </button>

                {/* Logo Area */}
                <div className={`h-20 flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                            src="/assets/Logo-Tab.png"
                            alt="Logo LPK"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className={`font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        LPK Merdeka
                    </span>
                </div>

                {/* Menu Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-6">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            {!isCollapsed ? (
                                <div
                                    className="flex items-center justify-between px-3 mb-2 cursor-pointer group/header"
                                    onClick={() => toggleGroup(group.title)}
                                >
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider select-none">
                                        {group.title}
                                    </h3>
                                    <FaChevronDown
                                        className={`text-[10px] text-gray-400 transition-transform duration-200 ${collapsedGroups[group.title] ? '-rotate-90' : ''}`}
                                    />
                                </div>
                            ) : (
                                // Divider for collapsed state
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 mx-2 my-2" />
                            )}

                            <div className={`space-y-1 transition-all duration-300 overflow-hidden ${(!isCollapsed && collapsedGroups[group.title]) ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                                {group.items.map((item) => {
                                    const isLocked = !isProfileComplete && LEARNING_CENTER_TABS.includes(item.id);
                                    const tooltipText = isLocked ? 'Lengkapi profil untuk mengakses' : (isCollapsed ? item.label : undefined);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (!isLocked) {
                                                    onTabChange(item.id);
                                                    if (window.innerWidth < 768 && onClose) onClose();
                                                }
                                            }}
                                            disabled={isLocked}
                                            title={tooltipText}
                                            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'} py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isLocked
                                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-zinc-800/50'
                                                    : activeTab === item.id
                                                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                                                } ${isLocked ? 'relative group/locked' : ''}`}
                                        >
                                            <span className={`text-lg transition-colors duration-200 flex-shrink-0 ${activeTab === item.id ? "text-red-600 dark:text-red-400" : "text-gray-400 group-hover:text-gray-600"}`}>
                                                {item.icon}
                                            </span>
                                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 flex-1 text-left'}`}>
                                                {item.label}
                                            </span>
                                            {isLocked && !isCollapsed && (
                                                <FaLock className="text-xs text-red-500 flex-shrink-0" />
                                            )}
                                            {isLocked && isCollapsed && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                                    <FaLock className="text-[6px] text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};
