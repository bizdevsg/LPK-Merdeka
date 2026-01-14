import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaUsers } from 'react-icons/fa';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { useSearch } from '@/context/SearchContext';

interface Session {
    id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    isActive: boolean;
    created_at: string;
}

export default function AttendanceSessionsManagement() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery } = useSearch();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        start_time: '',
        end_time: '',
        isActive: true,
        id: ''
    });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const router = useRouter();

    // Validation State
    const [timeError, setTimeError] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/attendance-sessions', {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;

        try {
            const res = await fetch(`/api/admin/attendance-sessions/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== deleteTargetId));
            } else {
                alert('Failed to delete session');
            }
        } catch (error) {
            alert('Error deleting session');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleEdit = (session: Session) => {
        const formatTime = (iso: string) => {
            const d = new Date(iso);
            return d.toTimeString().slice(0, 5); // HH:MM
        };
        const formatDate = (iso: string) => {
            return iso.split('T')[0];
        };

        setFormData({
            title: session.title,
            date: formatDate(session.date),
            start_time: formatTime(session.start_time),
            end_time: formatTime(session.end_time),
            isActive: session.isActive,
            id: session.id
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
            title: '',
            date: today,
            start_time: '09:00',
            end_time: '17:00',
            isActive: true,
            id: ''
        });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTimeError(''); // Clear previous error

        // Validate end_time is not before start_time
        if (formData.start_time && formData.end_time) {
            const start = new Date(`1970-01-01T${formData.start_time}:00`);
            const end = new Date(`1970-01-01T${formData.end_time}:00`);

            if (end <= start) {
                setTimeError('Waktu selesai harus lebih besar dari waktu mulai');
                return;
            }
        }

        const url = formMode === 'create' ? '/api/admin/attendance-sessions' : `/api/admin/attendance-sessions/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        const payload = {
            ...formData,
            is_active: formData.isActive
        };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                setTimeError(''); // Clear error on success
                fetchSessions();
            } else {
                const data = await res.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const toggleStatus = async (session: Session) => {
        try {
            const res = await fetch(`/api/admin/attendance-sessions/${session.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ is_active: !session.isActive })
            });

            if (res.ok) {
                // Update local state immediately for better UX
                setSessions(sessions.map(s =>
                    s.id === session.id ? { ...s, isActive: !s.isActive } : s
                ));
            }
        } catch (error) {
            console.error(error);
        }
    }

    const displayTime = (iso: string) => {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <AdminLayout title="Attendance Sessions">
            <Head>
                <title>Manage Sessions | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full md:w-64 hidden">
                        {/* Search input managed globally in AdminLayout */}
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <FaPlus /> Create Session
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading sessions...</td>
                                </tr>
                            ) : filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery ? `No sessions found matching "${searchQuery}"` : "No sessions found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <button
                                                onClick={() => router.push(`/admin/attendance-sessions/${session.id}`)}
                                                className="flex items-center gap-2 hover:text-red-600 transition"
                                            >
                                                <FaUsers className="text-gray-400" />
                                                {session.title}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(session.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {displayTime(session.start_time)} - {displayTime(session.end_time)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(session)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${session.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                                title={session.isActive ? 'Click to deactivate' : 'Click to activate'}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${session.isActive ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(session)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(session.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {formMode === 'create' ? 'Create Session' : 'Edit Session'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Sesi Pagi 1"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.start_time}
                                        onChange={e => {
                                            setFormData({ ...formData, start_time: e.target.value });
                                            setTimeError(''); // Clear error when user changes time
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.end_time}
                                        onChange={e => {
                                            setFormData({ ...formData, end_time: e.target.value });
                                            setTimeError(''); // Clear error when user changes time
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Time Validation Error */}
                            {timeError && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg animate-in fade-in slide-in-from-top-2">
                                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {timeError}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <label className="block text-sm font-medium text-gray-700">Active Status</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                >
                                    {formMode === 'create' ? 'Save Session' : 'Update Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Sesi?"
                message="Apakah Anda yakin ingin menghapus sesi ini? Tindakan ini tidak dapat dibatalkan."
                isDanger={true}
                confirmText="Hapus"
                cancelText="Batal"
            />
        </AdminLayout>
    );
}
