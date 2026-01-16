import React, { useEffect, useState } from 'react';
import { FaHistory, FaStar, FaGamepad, FaBook, FaVideo, FaCalendarCheck } from 'react-icons/fa';

interface Log {
    id: string;
    action_type: string;
    points: number;
    created_at: string;
}

interface Summary {
    total_points: number;
    level: number;
    rank?: number;
    totalUsers?: number;
}

export const PointHistory: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/user/gamification/history');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs);
                    setSummary(data.summary);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <FaGamepad className="text-purple-500" />;
            case 'video_watch': return <FaVideo className="text-red-500" />;
            case 'ebook_read': return <FaBook className="text-blue-500" />;
            case 'daily_login': return <FaCalendarCheck className="text-green-500" />;
            default: return <FaStar className="text-yellow-500" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'quiz': return 'Menyelesaikan Kuis';
            case 'video_watch': return 'Menonton Video';
            case 'ebook_read': return 'Membaca E-Book';
            case 'daily_login': return 'Login Harian';
            default: return 'Aktivitas';
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat riwayat...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaHistory className="text-gray-400" /> Riwayat Aktivitas & Poin
            </h2>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total XP Points</h3>
                        <div className="text-4xl font-bold">{summary?.total_points.toLocaleString() || 0} XP</div>
                    </div>
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Current Level</h3>
                        <div className="text-4xl font-bold text-yellow-500">Lvl {summary?.level || 1}</div>
                    </div>
                    <div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Peringkat Global</h3>
                        <div className="text-4xl font-bold text-blue-400">#{summary?.rank || '-'}</div>
                        <p className="text-xs text-gray-400 mt-1">dari {summary?.totalUsers || 0} peserta</p>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 font-bold text-gray-700 dark:text-gray-300">
                    Aktivitas Terakhir
                </div>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Belum ada riwayat aktivitas.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-lg">
                                        {getIcon(log.action_type)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {getLabel(log.action_type)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(log.created_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold text-green-600">
                                    +{log.points} XP
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
