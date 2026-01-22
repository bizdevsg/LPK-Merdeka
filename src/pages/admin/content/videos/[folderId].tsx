import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaVideo, FaPlay } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';

interface Video {
    id: string;
    title: string;
    url: string;
    cover_url?: string;
    duration: number | null;
    description: string;
    created_at: string;
}

interface Folder {
    id: string;
    name: string;
}

import { useSearch } from '@/context/SearchContext';

export default function FolderVideos() {
    const router = useRouter();
    const { folderId } = router.query;
    const { searchQuery } = useSearch();

    const [folder, setFolder] = useState<Folder | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    // ... (rest of state)

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        url: '',
        cover_url: '',
        duration: '',
        description: ''
    });

    // Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const getDriveId = (url: string) => {
        const match = url.match(/\/d\/([-\w]{25,})/);
        if (match) return match[1];
        const fallback = url.match(/[-\w]{25,}/);
        return fallback ? fallback[0] : null;
    };

    const getYoutubeId = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/);
        return match ? match[1] : null;
    };

    const handleAutoCover = (videoUrl: string) => {
        if (formData.cover_url) return;

        const youtubeId = getYoutubeId(videoUrl);
        if (youtubeId) {
            setFormData(prev => ({ ...prev, cover_url: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` }));
            return;
        }

        const driveId = getDriveId(videoUrl);
        if (driveId) {
            setFormData(prev => ({ ...prev, cover_url: `https://drive.google.com/thumbnail?id=${driveId}&sz=w400` }));
        }
    };

    const handlePreview = (videoUrl: string) => {
        const youtubeId = getYoutubeId(videoUrl);
        if (youtubeId) {
            setPreviewUrl(`https://www.youtube.com/embed/${youtubeId}?autoplay=1`);
            return;
        }

        const driveId = getDriveId(videoUrl);
        if (driveId) {
            setPreviewUrl(`https://drive.google.com/file/d/${driveId}/preview`);
            return;
        }

        setPreviewUrl(videoUrl);
    }

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchFolderAndVideos = async () => {
        if (!folderId) return;
        setLoading(true);
        try {
            // Fetch Folder Info
            const folderRes = await fetch(`/api/admin/content/folders/${folderId}`, { headers: getAuthHeaders() });
            if (folderRes.ok) {
                setFolder(await folderRes.json());
            }

            // Fetch Videos
            const videosRes = await fetch(`/api/admin/content/videos?folder_id=${folderId}`, { headers: getAuthHeaders() });
            if (videosRes.ok) {
                setVideos(await videosRes.json());
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
            fetchFolderAndVideos();
        }
    }, [folderId]);

    const handleCreate = () => {
        setFormData({
            id: '',
            title: '',
            url: '',
            cover_url: '',
            duration: '',
            description: ''
        });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleEdit = (video: Video) => {
        setFormData({
            id: video.id,
            title: video.title,
            url: video.url,
            cover_url: video.cover_url || '',
            duration: video.duration ? video.duration.toString() : '',
            description: video.description || ''
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/content/videos/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setVideos(videos.filter(v => v.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Video deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete video', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting video', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const [errors, setErrors] = useState({ title: '', url: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'title' && !value.trim()) {
            error = 'Title is required';
        } else if (name === 'url') {
            if (!value.trim()) {
                error = 'URL is required';
            } else if (!/(youtube\.com|youtu\.be|drive\.google\.com|docs\.google\.com)/.test(value)) {
                error = 'Invalid URL! Only YouTube or Google Drive links are allowed.';
            }
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation for specific fields
        if (name === 'title' || name === 'url') {
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.title.trim() !== '' &&
            formData.url.trim() !== '' &&
            !errors.title &&
            !errors.url
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation check
        const isTitleValid = validateField('title', formData.title);
        const isUrlValid = validateField('url', formData.url);

        if (!isTitleValid || !isUrlValid) {
            setToast({ isOpen: true, message: 'Please fix the errors in the form.', type: 'error' });
            return;
        }

        const url = formMode === 'create' ? '/api/admin/content/videos' : `/api/admin/content/videos/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        const payload = formMode === 'create'
            ? { ...formData, folder_id: folderId }
            : { ...formData };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchFolderAndVideos(); // Refresh list
                setToast({ isOpen: true, message: `Video ${formMode === 'create' ? 'added' : 'updated'}`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !folder) return (
        <AdminLayout>
            <div className="p-8 text-center text-gray-500">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`Videos: ${folder?.name || 'Loading...'}`}>
            <Head>
                <title>{folder?.name} | Videos Admin</title>
            </Head>

            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/content/videos" className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition">
                    <FaArrowLeft /> Back to Folders
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{folder?.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage videos inside this folder.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                    >
                        <FaPlus /> Add Video
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Video</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVideos.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery ? `No videos found matching "${searchQuery}"` : 'No videos found in this folder.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredVideos.map((video) => (
                                    <tr key={video.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-10 rounded bg-gray-200 overflow-hidden relative flex-shrink-0">
                                                    {/* Cover Image or Fallback */}
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                        <FaVideo />
                                                    </div>
                                                    {video.cover_url && (
                                                        <img
                                                            src={video.cover_url}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover relative z-10"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                // Fallback icon behind remains visible
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-1">{video.title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{video.description}</div>
                                                    <button
                                                        onClick={() => handlePreview(video.url)}
                                                        className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                                                    >
                                                        <FaPlay size={10} /> Play Video
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {video.duration ? `${video.duration} min` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(video)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(video.id)}
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
                                {formMode === 'create' ? 'Add Video' : 'Edit Video'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                />
                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube/Drive) <span className="text-red-500">*</span></label>
                                <div className="mb-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs flex gap-2 items-start border border-blue-100">
                                    <span className="mt-0.5">ℹ️</span>
                                    <span>
                                        <strong>Only YouTube or Google Drive links are accepted.</strong><br />
                                        For Drive, ensure permission is set to "Anyone with the link".
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="url"
                                    required
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.url ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                    placeholder="https://youtube.com/... or https://drive.google.com/..."
                                    onBlur={(e) => {
                                        validateField('url', e.target.value);
                                        handleAutoCover(e.target.value);
                                    }}
                                />
                                {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="e.g. 15"
                                />
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
                                    Leave empty to auto-generate from YouTube/Drive link.
                                    <span className="text-red-500 block mt-0.5" style={{ display: formData.url.includes('drive.google.com') ? 'block' : 'none' }}>
                                        Note: For Drive, file must be set to "Anyone with the link".
                                    </span>
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
                                    disabled={!isFormValid()}
                                    className={`px-4 py-2 text-white rounded-lg font-medium transition ${!isFormValid() ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    Save Video
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
                title="Delete Video?"
                message="Are you sure you want to delete this video?"
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
                    <div className="bg-white w-full max-w-5xl aspect-video rounded-xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-black text-white">
                            <h3 className="font-semibold">Video Preview</h3>
                            <button onClick={() => setPreviewUrl(null)} className="text-gray-300 hover:text-white text-xl">&times;</button>
                        </div>
                        <div className="flex-1 bg-black relative">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
