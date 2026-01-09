import React, { useEffect, useState, useContext } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserShield, FaCrown } from 'react-icons/fa';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { useAuth } from '@/context/AuthContext';
import { useSearch } from '@/context/SearchContext';

interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminsManagement() {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'superAdmin';

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery } = useSearch();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'admin',
        id: ''
    });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteTargetRole, setDeleteTargetRole] = useState<string>('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/admins', {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error('Failed to fetch admins', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const filteredAdmins = admins.filter(admin =>
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteClick = (id: string, role: string) => {
        setDeleteTargetId(id);
        setDeleteTargetRole(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;

        try {
            const res = await fetch(`/api/admin/admins/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                setAdmins(admins.filter(a => a.id !== deleteTargetId));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete admin');
            }
        } catch (error) {
            alert('Error deleting admin');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
            setDeleteTargetRole('');
        }
    };

    const handleEdit = (admin: Admin) => {
        setFormData({
            name: admin.name,
            email: admin.email,
            role: admin.role,
            id: admin.id
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            email: '',
            role: 'admin',
            id: ''
        });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = formMode === 'create' ? '/api/admin/users' : `/api/admin/admins/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const payload = formMode === 'create'
                ? { ...formData, password: 'admin123' } // Default password for new admins
                : formData;

            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchAdmins();
            } else {
                const data = await res.json();
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const canModify = (targetRole: string) => {
        if (!isSuperAdmin) {
            return targetRole !== 'admin' && targetRole !== 'superAdmin';
        }
        return true;
    };

    return (
        <AdminLayout title="Admins Management">
            <Head>
                <title>Manage Admins | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="relative w-full md:w-64 hidden">
                        {/* Search input managed globally in AdminLayout */}
                    </div>
                    {isSuperAdmin && (
                        <button
                            onClick={handleCreate}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                        >
                            <FaPlus /> Add Admin
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                                {isSuperAdmin && (
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery ? `No admins found matching "${searchQuery}"` : "No admins found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {admin.role === 'superAdmin' ? <FaCrown size={12} className="text-purple-600" /> : <FaUserShield size={12} />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{admin.name}</div>
                                                    <div className="text-xs text-gray-500">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${admin.role === 'superAdmin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {admin.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        disabled={admin.role === 'superAdmin'}
                                                        className={`p-2 rounded-lg transition ${admin.role === 'superAdmin'
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'hover:bg-gray-100 text-blue-600'
                                                            }`}
                                                        title={admin.role === 'superAdmin' ? 'SuperAdmin cannot be edited' : 'Edit'}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(admin.id, admin.role)}
                                                        disabled={admin.role === 'superAdmin'}
                                                        className={`p-2 rounded-lg transition ${admin.role === 'superAdmin'
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'hover:bg-gray-100 text-red-600'
                                                            }`}
                                                        title={admin.role === 'superAdmin' ? 'SuperAdmin cannot be deleted' : 'Delete'}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
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
                                {formMode === 'create' ? 'Add Admin' : 'Edit Admin'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>
                            {isSuperAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="superAdmin">Super Admin</option>
                                    </select>
                                </div>
                            )}
                            {formMode === 'create' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        Default password: <strong>admin123</strong>
                                        <br />
                                        Admin can change it after first login.
                                    </p>
                                </div>
                            )}

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
                                    {formMode === 'create' ? 'Create Admin' : 'Update Admin'}
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
                title="Hapus Admin?"
                message={
                    deleteTargetRole === 'superAdmin'
                        ? "SuperAdmin tidak dapat dihapus."
                        : "Yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan."
                }
                isDanger={true}
                confirmText="Hapus"
            />
        </AdminLayout>
    );
}
