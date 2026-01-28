import React, { useEffect, useState } from 'react';
import { FaCrown, FaMedal, FaUserCircle } from 'react-icons/fa';
import { Avatar } from '@/components/shared/atoms/Avatar';

interface LeaderboardEntry {
    rank: number;
    name: string;
    image: string | null;
    points: number;
    level: number;
}



export const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/user/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaCrown className="text-yellow-500" /> Leaderboard
            </h2>

            {/* Desktop/Tablet Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">XP Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {leaderboard.map((entry) => (
                                <tr key={entry.rank} className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${entry.rank <= 3 ? 'bg-yellow-50/50 dark:bg-yellow-500/5' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center w-8 h-8 font-bold rounded-full">
                                            {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                                            {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                                            {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                                            {entry.rank > 3 && <span className="text-gray-500 text-lg">#{entry.rank}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={entry.image || ''} alt={entry.name} size={40} />
                                            <span className="font-semibold text-gray-900 dark:text-white">{entry.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            Lvl {entry.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">
                                        {entry.points.toLocaleString()} <span className="text-xs font-normal text-gray-500">XP</span>
                                    </td>
                                </tr>
                            ))}
                            {leaderboard.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Belum ada data leaderboard. Mulailah berlomba!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
                {leaderboard.map((entry) => (
                    <div
                        key={entry.rank}
                        className={`flex items-center p-4 rounded-xl border transition-colors ${entry.rank <= 3
                                ? 'bg-yellow-50/50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20'
                                : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800'
                            }`}
                    >
                        <div className="flex-shrink-0 w-8 text-center mr-3 font-bold">
                            {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                            {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                            {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                            {entry.rank > 3 && <span className="text-gray-500 text-lg">#{entry.rank}</span>}
                        </div>

                        <div className="flex-shrink-0 mr-3">
                            <Avatar src={entry.image || ''} alt={entry.name} size={40} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {entry.name}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mt-1">
                                Lvl {entry.level}
                            </span>
                        </div>

                        <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-bold text-sm text-gray-900 dark:text-white">
                                {entry.points > 1000 ? `${(entry.points / 1000).toFixed(1)}k` : entry.points}
                            </p>
                            <span className="text-[10px] text-gray-500 uppercase">XP</span>
                        </div>
                    </div>
                ))}
                {leaderboard.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        Belum ada data leaderboard. Mulailah berlomba!
                    </div>
                )}
            </div>
        </div>
    );
};
