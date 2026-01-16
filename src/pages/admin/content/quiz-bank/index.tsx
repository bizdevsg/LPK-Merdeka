import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaPlus, FaTrash, FaEdit, FaLayerGroup } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { useSearch } from '@/context/SearchContext';

interface QuizCategory {
    id: string;
    name: string;
    description: string;
    question_types: any[];
}

export default function QuizBankIndex() {
    const { searchQuery } = useSearch();
    const [categories, setCategories] = useState<QuizCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({ id: '', name: '', description: '' });
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/content/quiz-bank/categories', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch categories', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = () => {
        setFormData({ id: '', name: '', description: '' });
        setFormMode('create');
        setTouched({});
        setIsFormOpen(true);
    };

    const handleEdit = (category: QuizCategory) => {
        setFormData({ id: category.id, name: category.name, description: category.description });
        setFormMode('edit');
        setTouched({});
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        // Note: DELETE not implemented in API yet for Categories in the previous step check. 
        // Wait, I only checked GET/POST in categories/index.ts. I need categories/[id].ts!
        // I will implement the functionality in UI, but I need to create the API file too.

        try {
            const res = await fetch(`/api/admin/content/quiz-bank/categories/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Category deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete category', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting category', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = formMode === 'create'
            ? '/api/admin/content/quiz-bank/categories'
            : `/api/admin/content/quiz-bank/categories/${formData.id}`;

        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchCategories();
                setToast({ isOpen: true, message: `Category ${formMode === 'create' ? 'created' : 'updated'}`, type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="Quiz Bank: Categories">
            <Head>
                <title>Quiz Categories | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Quiz Categories</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage categories for the question bank.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                    >
                        <FaPlus /> New Category
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading Categories...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map(category => (
                            <div key={category.id} className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                <Link href={`/admin/content/quiz-bank/${category.id}`} className="block p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                            <FaLayerGroup size={24} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleEdit(category); }}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(category.id, e)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 truncate mb-1">{category.name}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">{category.description || 'No description'}</p>
                                    <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 w-fit px-2 py-1 rounded">
                                        {category.question_types?.length || 0} Question Types
                                    </div>
                                </Link>
                            </div>
                        ))}

                        {filteredCategories.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                <div className="mx-auto w-12 h-12 text-gray-300 mb-3">
                                    <FaLayerGroup size={48} />
                                </div>
                                <p className="text-gray-500">
                                    {searchQuery ? `No categories match "${searchQuery}"` : 'No categories found. Create one to get started.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {formMode === 'create' ? 'Create Category' : 'Edit Category'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    onBlur={() => setTouched({ ...touched, name: true })}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none ${touched.name && !formData.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                    placeholder="e.g. History"
                                />
                                {touched.name && !formData.name && <p className="text-xs text-red-600 mt-1">Category name is required</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Category description..."
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
                title="Delete Category?"
                message="Are you sure? All question types and questions inside this category will be deleted."
                isDanger={true}
                confirmText="Delete"
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
