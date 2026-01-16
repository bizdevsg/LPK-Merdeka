import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFolder, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';

interface Folder {
    id: string;
    name: string;
    description: string;
    _count?: {
        ebooks: number;
        videos: number;
    }
}

interface FolderManagerProps {
    type: 'ebook' | 'video';
    baseUrl: string; // e.g., '/admin/content/ebooks'
}

import { useSearch } from '@/context/SearchContext';

export const FolderManager: React.FC<FolderManagerProps> = ({ type, baseUrl }) => {
    const { searchQuery } = useSearch();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', description: '' });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchFolders = async () => {
        try {
            const res = await fetch(`/api/admin/content/folders?type=${type}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setFolders(data);
            }
        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch folders', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFolders();
    }, [type]);

    const handleCreate = () => {
        setFormData({ id: '', name: '', description: '' });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleEdit = (folder: Folder) => {
        setFormData({ id: folder.id, name: folder.name, description: folder.description });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if clicked on card
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/content/folders/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setFolders(folders.filter(f => f.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Folder deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete folder', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting folder', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = formMode === 'create' ? '/api/admin/content/folders' : `/api/admin/content/folders/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...formData, type })
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchFolders();
                setToast({ isOpen: true, message: `Folder ${formMode === 'create' ? 'created' : 'updated'}`, type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredFolders = folders.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Content folders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700 capitalize">{type} Folders</h3>
                <button
                    onClick={handleCreate}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                >
                    <FaPlus /> New Folder
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFolders.map(folder => (
                    <div key={folder.id} className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <Link href={`${baseUrl}/${folder.id}`} className="block p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                    <FaFolder size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleEdit(folder); }}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(folder.id, e)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 truncate mb-1">{folder.name}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">{folder.description || 'No description'}</p>
                            <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 w-fit px-2 py-1 rounded">
                                {type === 'ebook' ? (
                                    <span>{folder._count?.ebooks || 0} Ebooks</span>
                                ) : (
                                    <span>{folder._count?.videos || 0} Videos</span>
                                )}
                            </div>
                        </Link>
                    </div>
                ))}

                {folders.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="mx-auto w-12 h-12 text-gray-300 mb-3">
                            <FaFolder size={48} />
                        </div>
                        <p className="text-gray-500">No folders found. Create one to get started.</p>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {formMode === 'create' ? 'Create Folder' : 'Edit Folder'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g. Basic Tutorials"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Folder description..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Save
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
                title="Delete Folder?"
                message="Are you sure? All content inside this folder will be deleted."
                isDanger={true}
                confirmText="Delete"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    );
};
