import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useSearch } from '@/context/SearchContext';
import { FaUser, FaTrophy, FaStar } from 'react-icons/fa';
import { Avatar } from '@/components/shared/atoms/Avatar';

interface LeaderboardEntry {
    rank: number;
    user_id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    points: number;
    level: number;
}



export default function AdminLeaderboard() {
    const { searchQuery } = useSearch();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/admin/gamification/leaderboard');
                if (res.ok) {
                    setLeaderboard(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const filteredData = leaderboard.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="Global Leaderboard">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FaTrophy className="text-yellow-500" /> Leaderboard
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ranking of all users based on XP points</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-bold">
                        Total Players: {leaderboard.length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-center">Level</th>
                                <th className="px-6 py-4 text-right">Total Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Loading leaderboard...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((entry) => (
                                    <tr key={entry.user_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                entry.rank === 2 ? 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300' :
                                                    entry.rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {entry.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={entry.image || ''} alt={entry.name} size={32} />
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{entry.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{entry.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-300">
                                                {entry.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                Lvl {entry.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                            {entry.points.toLocaleString()} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">XP</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
