import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import {
    FaHome, FaUsers, FaUserShield, FaCalendarCheck,
    FaBars, FaSignOutAlt, FaSearch,
    FaList, FaImages, FaQuestionCircle, FaCog, FaStar, FaNewspaper
} from 'react-icons/fa';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
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
                { label: 'Testimoni', href: '/admin/cms/testimonials', icon: <FaStar /> },
                { label: 'FAQ', href: '/admin/cms/faq', icon: <FaQuestionCircle /> },
                { label: 'Galeri', href: '/admin/cms/gallery', icon: <FaImages /> },
                { label: 'Pengaturan', href: '/admin/cms/settings', icon: <FaCog /> }
            ]
        },
        {
            group: 'Konten',
            items: [
                { label: 'Artikel', href: '/admin/cms/articles', icon: <FaNewspaper /> }
            ]
        },
        {
            group: 'Management',
            items: [
                { label: 'Admins', href: '/admin/admins', icon: <FaUserShield /> },
                { label: 'Users', href: '/admin/users', icon: <FaUsers /> }
            ]
        },
        {
            group: 'Menu',
            items: [
                { label: 'Attendance Sessions', href: '/admin/attendance-sessions', icon: <FaCalendarCheck /> }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-red-600">Admin Panel</span>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {group.group}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-red-50 text-red-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FaSignOutAlt />
                            Sign Out
                        </button>
                    </div>
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
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <FaBars />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800">{title || 'Dashboard'}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <FaSearch className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none text-sm focus:outline-none w-48"
                            />
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
                            </div>
                            <div className="w-9 h-9 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};
