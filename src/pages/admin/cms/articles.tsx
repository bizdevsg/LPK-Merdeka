import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaNewspaper, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { Toast } from '@/components/shared/molecules/Toast';
import { useSearch } from '@/context/SearchContext';

interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    thumbnail_url: string;
    author: string;
    is_published: boolean;
    published_at: string;
    created_at: string;
}

export default function CMSArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const { searchQuery } = useSearch();
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        thumbnail_url: '',
        author: '',
        is_published: false,
        publish_date: '',
        publish_time: '',
        publish_now: true,
        id: ''
    });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchArticles = async () => {
        try {
            const res = await fetch('/api/admin/cms/articles', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            }
        } catch (error) {
            console.error('Failed to fetch articles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/cms/articles/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setArticles(articles.filter(a => a.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Article deleted successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Failed to delete article', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting article', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleEdit = (article: Article) => {
        let pDate = '';
        let pTime = '';

        if (article.published_at) {
            const d = new Date(article.published_at);
            pDate = d.toLocaleDateString('en-CA');
            pTime = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        }

        setFormData({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt || '',
            thumbnail_url: article.thumbnail_url || '',
            author: article.author || '',
            is_published: article.is_published,
            publish_date: pDate,
            publish_time: pTime,
            publish_now: article.published_at ? false : true,
            id: article.id
        });

        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        const now = new Date();
        setFormData({
            title: '',
            content: '',
            excerpt: '',
            thumbnail_url: '',
            author: '',
            is_published: true, // Default to true (Published/Active) for new articles
            publish_date: now.toLocaleDateString('en-CA'),
            publish_time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            publish_now: true,
            id: ''
        });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const [errors, setErrors] = useState({ title: '', content: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'title' && !value.trim()) {
            error = 'Title is required';
        } else if (name === 'content' && !value.trim()) {
            error = 'Content is required';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Handle checkbox separately if needed, but here simple inputs
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' || name === 'content') {
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.title.trim() !== '' &&
            formData.content.trim() !== '' &&
            !errors.title &&
            !errors.content
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation
        const isTitleValid = validateField('title', formData.title);
        const isContentValid = validateField('content', formData.content);

        if (!isTitleValid || !isContentValid) {
            setToast({ isOpen: true, message: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        const url = formMode === 'create' ? '/api/admin/cms/articles' : `/api/admin/cms/articles/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        // ... (date logic)
        let finalPublishedAt = null;

        if (formData.publish_now) {
            finalPublishedAt = new Date().toISOString();
        } else if (formData.publish_date && formData.publish_time) {
            finalPublishedAt = new Date(`${formData.publish_date}T${formData.publish_time}`).toISOString();
        }

        const payload = {
            ...formData,
            is_published: true,
            published_at: finalPublishedAt
        };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchArticles();
                setToast({ isOpen: true, message: `Article ${formMode === 'create' ? 'created' : 'updated'} successfully`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const toggleStatus = async (article: Article) => {
        try {
            const res = await fetch(`/api/admin/cms/articles/${article.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...article,
                    is_published: !article.is_published
                    // We don't change published_at here, so it stays as is (or server handles it)
                    // If switching from draft to published, server logic (is_published ? now : null) might trigger if we don't send published_at.
                    // But we are sending "...article", which includes published_at string.
                    // Wait, article.published_at is string from GET.
                })
            });

            if (res.ok) {
                // Update local state
                const updated = await res.json();
                setArticles(articles.map(a => a.id === article.id ? { ...a, is_published: !a.is_published, published_at: updated.published_at } : a));
                setToast({ isOpen: true, message: `Article ${!article.is_published ? 'published' : 'unpublished'}`, type: 'success' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Failed to update status', type: 'error' });
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.author && article.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AdminLayout title="CMS: Articles">
            <Head>
                <title>Manage Articles | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaNewspaper className="text-blue-500" /> Articles & News
                    </h2>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <FaPlus /> Add Article
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Author</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        {searchQuery ? `No articles found matching "${searchQuery}"` : 'No articles found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-sm truncate">{article.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{article.author || '-'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(article)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${article.is_published ? 'bg-green-500' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${article.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {article.is_published ? 'Published' : 'Draft'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(article)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(article.id)}
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {formMode === 'create' ? 'Add Article' : 'Edit Article'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Summary)</label>
                                <textarea
                                    name="excerpt"
                                    rows={2}
                                    value={formData.excerpt}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Short summary..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                                <textarea
                                    name="content"
                                    required
                                    rows={8}
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none font-mono text-sm ${errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                    placeholder="Article content..."
                                />
                                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        name="thumbnail_url"
                                        value={formData.thumbnail_url}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="publish_now"
                                        checked={formData.publish_now}
                                        onChange={e => setFormData({ ...formData, publish_now: e.target.checked })}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <label htmlFor="publish_now" className="text-sm font-medium text-gray-700">
                                        Publish Immediately
                                    </label>
                                </div>

                                <div className={`grid grid-cols-2 gap-4 transition-all duration-200 ${formData.publish_now ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.publish_date}
                                            onChange={e => setFormData({ ...formData, publish_date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.publish_time}
                                            onChange={e => setFormData({ ...formData, publish_time: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>
                                {formData.publish_now && (
                                    <p className="text-xs text-gray-500 italic">Article will be published with the current time.</p>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
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
                                    {formMode === 'create' ? 'Create' : 'Update'}
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
                title="Hapus Artikel?"
                message="Yakin ingin menghapus artikel ini?"
                isDanger={true}
                confirmText="Hapus"
            />

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </AdminLayout>
    );
}
