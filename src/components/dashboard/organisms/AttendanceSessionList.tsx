import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaCalendarCheck, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface AttendanceSession {
    id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    is_checked_in?: boolean;
}

export const AttendanceSessionList: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchActiveSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`/api/attendance-sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data sesi');
            }

            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'error', text: 'Gagal memuat sesi absensi.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveSessions();
    }, []);

    const handleCheckIn = async (sessionId: number) => {
        setCheckingIn(sessionId);
        setMessage(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Anda belum login");

            const response = await fetch(`/api/attendance-sessions/${sessionId}/check-in`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.status === 200) {
                const timeStr = result.check_in_time;
                const niceTime = timeStr ? formatTime(timeStr) : 'Baru saja';
                setMessage({ type: 'success', text: `Berhasil Absen! Pukul: ${niceTime}` });

                // Update local state to reflect that user has checked in
                setSessions(prevSessions => prevSessions.map(s =>
                    s.id === sessionId ? { ...s, is_checked_in: true } : s
                ));
            } else {
                setMessage({ type: 'error', text: `Gagal: ${result.message || 'Terjadi kesalahan'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan koneksi' });
        } finally {
            setCheckingIn(null);
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Memuat jadwal absensi...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Jadwal Absensi Hari Ini</h2>

            {message && (
                <div className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    <span>{message.text}</span>
                </div>
            )}

            {sessions.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCalendarCheck size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tidak ada sesi aktif</h3>
                    <p className="text-gray-500 mt-2">Belum ada jadwal absensi yang tersedia saat ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {session.is_active && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-xl font-medium">
                                    Aktif
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{session.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarCheck className="text-red-500" />
                                            <span>{formatDate(session.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-red-500" />
                                            <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleCheckIn(session.id)}
                                    disabled={checkingIn === session.id || !session.is_active || session.is_checked_in}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition shadow-sm ${session.is_checked_in
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                                        : session.is_active
                                            ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-red-200'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {checkingIn === session.id ? 'Memproses...' : session.is_checked_in ? 'Sudah Absen' : 'Absen Sekarang'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
