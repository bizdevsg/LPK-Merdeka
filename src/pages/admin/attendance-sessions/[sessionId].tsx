import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaArrowLeft, FaUsers, FaCheckCircle, FaSearch, FaFileExcel } from 'react-icons/fa';

interface AttendanceRecord {
    id: string;
    checked_in_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface Session {
    id: string;
    title: string;
    date: string;
}

export default function SessionAttendeesPage() {
    const router = useRouter();
    const { sessionId } = router.query;

    const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        if (!sessionId) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/attendance-sessions/${sessionId}/records`, {
                    headers: getAuthHeaders()
                });

                if (res.ok) {
                    const data = await res.json();
                    setAttendees(data);
                }

                const resSessions = await fetch(`/api/admin/attendance-sessions`, { headers: getAuthHeaders() });
                if (resSessions.ok) {
                    const sessions = await resSessions.json();
                    const currentSession = sessions.find((s: any) => s.id.toString() === sessionId);
                    if (currentSession) setSession(currentSession);
                }

            } catch (error) {
                console.error("Failed to load attendees", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId]);

    const filteredAttendees = attendees.filter(record =>
        record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        if (!attendees.length) return;

        const headers = ["No", "Nama", "Email", "Waktu Absen", "Tanggal"];
        const csvContent = [
            headers.join(","),
            ...attendees.map((record, index) => [
                index + 1,
                `"${record.user.name}"`,
                record.user.email,
                new Date(record.checked_in_at).toLocaleTimeString('id-ID'),
                new Date(record.checked_in_at).toLocaleDateString('id-ID')
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `absensi_${session?.title || 'sesi'}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!sessionId) return null;

    return (
        <AdminLayout title="Detail Kehadiran">
            <Head>
                <title>Detail Kehadiran | Admin</title>
            </Head>

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.push('/admin/attendance-sessions')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition self-start"
                    >
                        <FaArrowLeft /> Kembali ke Daftar Sesi
                    </button>

                    {session && (
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-900">{session.title}</h2>
                            <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    )}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaUsers className="text-red-600" />
                                Daftar Hadir ({attendees.length})
                            </h3>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <button
                                onClick={exportToCSV}
                                disabled={attendees.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaFileExcel />
                                <span className="hidden md:inline">Export CSV</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-16">No</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nama Peserta</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Waktu Check-in</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                Memuat data...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <FaUsers size={32} className="text-gray-300" />
                                                <p>Belum ada peserta yang absen di sesi ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendees.map((record, index) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{record.user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{record.user.email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                                                    <FaCheckCircle size={12} />
                                                    {new Date(record.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
