import React, { useEffect, useState } from 'react';
import { FaTrophy, FaCertificate, FaGamepad, FaVideo, FaBook, FaChartLine, FaStar, FaMedal, FaFire } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
    totalXP: number;
    level: number;
    rank: number;
    totalUsers: number;
    certificatesCount: number;
    pendingQuizzes: number;
    currentStreak: number;
    maxStreak: number;
    recentActivities: Array<{
        type: string;
        points: number;
        created_at: string;
    }>;
}

export const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/dashboard/stats');
                if (res.ok) {
                    setStats(await res.json());
                } else {
                    console.error("Failed to fetch stats:", await res.text());
                    setError(true);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 18) return 'Selamat Siang';
        return 'Selamat Malam';
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20', icon: '🥇', label: 'Juara 1' };
        if (rank === 2) return { color: 'text-gray-600 bg-gray-100 dark:bg-gray-800', icon: '🥈', label: 'Juara 2' };
        if (rank === 3) return { color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20', icon: '🥉', label: 'Juara 3' };
        if (rank <= 10) return { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20', icon: '⭐', label: `Top ${rank}` };
        return { color: 'text-gray-600 bg-gray-100 dark:bg-gray-800', icon: '📊', label: `Peringkat ${rank}` };
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat dashboard...</div>;
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Gagal memuat data dashboard</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    Muat Ulang
                </button>
            </div>
        );
    }

    const rankBadge = stats ? getRankBadge(stats.rank) : null;
    const xpForNextLevel = 1000; // Assumption: 1000 XP per level
    const currentLevelXP = (stats?.totalXP || 0) % xpForNextLevel;
    const progressPercent = (currentLevelXP / xpForNextLevel) * 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name}!</h1>
                    <p className="text-red-100 text-lg">Siap untuk melanjutkan progress belajarmu hari ini?</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* Daily Streak - NEW */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    {/* Flame Effect Background */}
                    <div className="absolute -right-4 -bottom-4 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                        <FaFire size={100} />
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-lg flex items-center justify-center text-xl">
                            <FaFire className="animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 relative z-10">
                        {stats?.currentStreak || 0} Hari
                    </h3>
                    <p className="text-sm text-gray-500 relative z-10">Daily Streak</p>
                </div>

                {/* Total XP & Level - ENHANCED */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-500 rounded-lg flex items-center justify-center text-xl">
                            <FaStar />
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded">
                            Lvl {stats?.level || 1}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {stats?.totalXP.toLocaleString() || 0} XP
                    </h3>

                    {/* Level Progress Bar */}
                    <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-1">
                        <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                        {Math.floor(xpForNextLevel - currentLevelXP)} XP menuju Level {(stats?.level || 1) + 1}
                    </p>
                </div>

                {/* Rank */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${rankBadge?.color} rounded-lg flex items-center justify-center text-xl`}>
                            {rankBadge?.icon}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        #{stats?.rank || '-'}
                    </h3>
                    <p className="text-sm text-gray-500 ml-0.5">Global Rank</p>
                </div>

                {/* Certificates */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-lg flex items-center justify-center text-xl">
                            <FaCertificate />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {stats?.certificatesCount || 0}
                    </h3>
                    <p className="text-sm text-gray-500">Sertifikat</p>
                </div>

                {/* Pending Quizzes */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-lg flex items-center justify-center text-xl">
                            <FaGamepad />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {stats?.pendingQuizzes || 0}
                    </h3>
                    <p className="text-sm text-gray-500">Kuis Tertunda</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard?tab=kuis" className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-xl p-6 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                <FaGamepad />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Kerjakan Kuis</h4>
                                <p className="text-sm text-gray-500">Dapatkan +100 XP</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard?tab=video" className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-6 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                <FaVideo />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Tonton Video</h4>
                                <p className="text-sm text-gray-500">Dapatkan +50 XP</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard?tab=materi" className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-6 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                <FaBook />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Baca E-Book</h4>
                                <p className="text-sm text-gray-500">Dapatkan +30 XP</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activities */}
            {stats?.recentActivities && stats.recentActivities.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aktivitas Terbaru</h3>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {stats.recentActivities.slice(0, 5).map((activity, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {activity.type === 'quiz' && <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg"><FaGamepad /></div>}
                                        {activity.type === 'video_watch' && <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg"><FaVideo /></div>}
                                        {activity.type === 'ebook_read' && <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg"><FaBook /></div>}
                                        {activity.type === 'daily_login' && <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg"><FaChartLine /></div>}

                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {activity.type === 'quiz' && 'Menyelesaikan Kuis'}
                                            {activity.type === 'video_watch' && 'Menonton Video'}
                                            {activity.type === 'ebook_read' && 'Membaca E-Book'}
                                            {activity.type === 'daily_login' && 'Login Harian'}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-green-600">+{activity.points} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
