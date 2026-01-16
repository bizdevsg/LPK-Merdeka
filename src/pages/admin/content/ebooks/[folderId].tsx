import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaFilePdf, FaImage } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';

interface Ebook {
    id: string;
    title: string;
    file_url: string;
    cover_url: string;
    description: string;
    created_at: string;
}

interface Folder {
    id: string;
    name: string;
}

import { useSearch } from '@/context/SearchContext';

export default function FolderEbooks() {
    const router = useRouter();
    const { folderId } = router.query;
    const { searchQuery } = useSearch();

    const [folder, setFolder] = useState<Folder | null>(null);
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);

    // ... (rest of state)

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        file_url: '',
        cover_url: '',
        description: ''
    });

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    // Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const getDriveId = (url: string) => {
        // Match /d/ID pattern first (most common)
        const match = url.match(/\/d\/([-\w]{25,})/);
        if (match) return match[1];

        // Fallback to simple long string match if specific pattern fails
        const fallback = url.match(/[-\w]{25,}/);
        return fallback ? fallback[0] : null;
    };

    const handleAutoCover = (fileUrl: string) => {
        const driveId = getDriveId(fileUrl);
        if (driveId && !formData.cover_url) {
            // Using a standard thumbnail service often works for public files, 
            // or we could use the Google Drive thumbnail link pattern if valid.
            // https://drive.google.com/thumbnail?id=ID
            const potentialCover = `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`;
            setFormData(prev => ({ ...prev, cover_url: potentialCover }));
        }
    };

    const handlePreview = (fileUrl: string) => {
        const driveId = getDriveId(fileUrl);
        if (driveId) {
            setPreviewUrl(`https://drive.google.com/file/d/${driveId}/preview`);
        } else {
            // Fallback for non-drive URLs to just open standard iframe or new tab if blocked
            setPreviewUrl(fileUrl);
        }
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchFolderAndEbooks = async () => {
        if (!folderId) return;
        setLoading(true);
        try {
            // Fetch Folder Info
            const folderRes = await fetch(`/api/admin/content/folders/${folderId}`, { headers: getAuthHeaders() });
            if (folderRes.ok) {
                setFolder(await folderRes.json());
            }

            // Fetch Ebooks
            const ebooksRes = await fetch(`/api/admin/content/ebooks?folder_id=${folderId}`, { headers: getAuthHeaders() });
            if (ebooksRes.ok) {
                setEbooks(await ebooksRes.json());
            }
        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (folderId) {
            fetchFolderAndEbooks();
        }
    }, [folderId]);

    const handleCreate = () => {
        setFormData({
            id: '',
            title: '',
            file_url: '',
            cover_url: '',
            description: ''
        });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleEdit = (ebook: Ebook) => {
        setFormData({
            id: ebook.id,
            title: ebook.title,
            file_url: ebook.file_url,
            cover_url: ebook.cover_url || '',
            description: ebook.description || ''
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        // DELETE endpoint for specific ebook not implemented yet in separate file, 
        // assuming standard REST pattern `ebooks/[id]` or I need to create it.
        // Wait, I only created `ebooks/index.ts`! I forgot `ebooks/[id].ts`.
        // I will implement the UI assuming the API exists, and then implement the API.
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/content/ebooks/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setEbooks(ebooks.filter(e => e.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Ebook deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete ebook', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting ebook', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = formMode === 'create' ? '/api/admin/content/ebooks' : `/api/admin/content/ebooks/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        const payload = formMode === 'create'
            ? { ...formData, folder_id: folderId }
            : { ...formData }; // PUT probably doesn't need folder_id unless moving

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchFolderAndEbooks(); // Refresh list
                setToast({ isOpen: true, message: `Ebook ${formMode === 'create' ? 'added' : 'updated'}`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredEbooks = ebooks.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !folder) return (
        <AdminLayout>
            <div className="p-8 text-center text-gray-500">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`E-books: ${folder?.name || 'Loading...'}`}>
            <Head>
                <title>{folder?.name} | E-Books Admin</title>
            </Head>

            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/content/ebooks" className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition">
                    <FaArrowLeft /> Back to Folders
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{folder?.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage e-books inside this folder.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                    >
                        <FaPlus /> Add E-Book
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Cover</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title & Desc</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">File</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEbooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery ? `No ebooks found matching "${searchQuery}"` : 'No ebooks found in this folder.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEbooks.map((ebook) => (
                                    <tr key={ebook.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex items-center justify-center text-gray-400 relative">
                                                <FaImage className="absolute" />
                                                {ebook.cover_url && (
                                                    <img
                                                        src={ebook.cover_url}
                                                        alt={ebook.title}
                                                        className="w-full h-full object-cover relative z-10"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{ebook.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{ebook.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handlePreview(ebook.file_url)}
                                                className="flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <FaFilePdf /> Preview
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(ebook.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(ebook)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(ebook.id)}
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

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                {formMode === 'create' ? 'Add E-Book' : 'Edit E-Book'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File URL *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.file_url}
                                    onChange={e => setFormData({ ...formData, file_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="https://..."
                                    onBlur={(e) => handleAutoCover(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Direct link to the PDF file.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Image URL <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.cover_url}
                                    onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to auto-generate from Drive link.
                                    <span className="text-red-500 block mt-0.5">Note: File must be set to "Anyone with the link" for the cover to appear.</span>
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
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
                                    Save E-Book
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
                title="Delete E-Book?"
                message="Are you sure you want to delete this e-book?"
                isDanger={true}
                confirmText="Delete"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800">Document Preview</h3>
                            <button onClick={() => setPreviewUrl(null)} className="text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-1 bg-gray-100 relative">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay"
                            />
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
