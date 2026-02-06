import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import {
    FaUsers,
    FaCalendarCheck,
    FaUserShield,
    FaImage,
    FaQuestionCircle,
    FaStar,
    FaNewspaper,
    FaCog,
    FaChartLine,
    FaArrowRight,
    FaBook,
    FaVideo
} from 'react-icons/fa';

interface StatsData {
    users: {
        total: number;
        admins: number;
    };
    attendance: {
        activeSessions: number;
        totalRecords: number;
    };
    cms: {
        gallery: number;
        faq: number;
        testimonials: number;
        articles: number;
    };
    content?: {
        ebooks: number;
        videos: number;
    };
    system?: {
        database: string;
        api: string;
        lastUpdated: string;
    };
}

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        } else if (isAuthenticated && user) {
            if (user.role !== 'admin' && user.role !== 'superAdmin') {
                router.push('/dashboard');
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, user, loading, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && (user?.role === 'admin' || user?.role === 'superAdmin')) {
            fetchStats();
        }
    }, [isAuthenticated, user]);



    const statCards = stats ? [
        { label: 'Total Users', value: stats.users.total, icon: <FaUsers />, color: 'bg-blue-500' },
        { label: 'Admins', value: stats.users.admins, icon: <FaUserShield />, color: 'bg-purple-500' },
        { label: 'Active Sessions', value: stats.attendance.activeSessions, icon: <FaCalendarCheck />, color: 'bg-green-500' },
        { label: 'Attendance Records', value: stats.attendance.totalRecords, icon: <FaChartLine />, color: 'bg-indigo-500' },
        { label: 'E-Books', value: stats.content?.ebooks || 0, icon: <FaBook />, color: 'bg-teal-500' },
        { label: 'Videos', value: stats.content?.videos || 0, icon: <FaVideo />, color: 'bg-red-500' },
        { label: 'Articles', value: stats.cms.articles, icon: <FaNewspaper />, color: 'bg-gray-500' },
        { label: 'Gallery', value: stats.cms.gallery, icon: <FaImage />, color: 'bg-pink-500' },
    ] : [];

    const quickActions = [
        { label: 'Manage Users', icon: <FaUsers />, path: '/admin/users', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30' },
        { label: 'Attendance', icon: <FaCalendarCheck />, path: '/admin/attendance-sessions', color: 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' },
        { label: 'Gallery', icon: <FaImage />, path: '/admin/cms/gallery', color: 'text-pink-600 bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30' },
        { label: 'FAQ', icon: <FaQuestionCircle />, path: '/admin/cms/faq', color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30' },
        { label: 'Testimonials', icon: <FaStar />, path: '/admin/cms/testimonials', color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30' },
        { label: 'Articles', icon: <FaNewspaper />, path: '/admin/cms/articles', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' },
        { label: 'Settings', icon: <FaCog />, path: '/admin/cms/settings', color: 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head>
                <title>Admin Dashboard | LPK Merdeka</title>
            </Head>

            <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your platform overview</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-zinc-700 border-t-red-600"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading...</p>
                    </div>
                ) : stats ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map((stat, index) => (
                                <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                                            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                                        </div>
                                        <div className={`w-12 h-12 rounded-lg ${stat.color} text-white flex items-center justify-center text-xl shadow-lg`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => router.push(action.path)}
                                        className={`${action.color} dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg p-4 transition-all flex flex-col items-center gap-2 group`}
                                    >
                                        <div className="text-2xl">
                                            {action.icon}
                                        </div>
                                        <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* System Status */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    System Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                        <span className={`text-sm font-medium ${stats.system?.database === 'Terhubung' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {stats.system?.database}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                                        <span className={`text-sm font-medium ${stats.system?.api === 'Terhubung' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {stats.system?.api}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {stats.system?.lastUpdated && new Date(stats.system.lastUpdated).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity Summary */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activity Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                            <FaUsers className="text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{stats.users.total} Total Users</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Registered in the system</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                                            <FaCalendarCheck className="text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{stats.attendance.activeSessions} Active Sessions</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Currently running</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center flex-shrink-0">
                                            <FaNewspaper className="text-sm" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{stats.cms.articles} Articles</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Published content</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        Failed to load statistics
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
