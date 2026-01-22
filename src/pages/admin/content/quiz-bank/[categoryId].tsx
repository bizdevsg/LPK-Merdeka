import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaListUl } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { useSearch } from '@/context/SearchContext';

interface QuestionType {
    id: string;
    name: string;
    _count?: {
        question_bank: number;
    }
}

interface Category {
    id: string;
    name: string;
    description: string;
    question_types: QuestionType[];
}

export default function CategoryTypes() {
    const router = useRouter();
    const { categoryId } = router.query;
    const { searchQuery } = useSearch();

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({ id: '', name: '' });

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

    const fetchCategory = async () => {
        if (!categoryId) return;
        try {
            const res = await fetch(`/api/admin/content/quiz-bank/categories/${categoryId}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setCategory(data);
            }
        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch category', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    const handleCreate = () => {
        setFormData({ id: '', name: '' });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleEdit = (type: QuestionType) => {
        setFormData({ id: type.id, name: type.name });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/content/quiz-bank/types/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                fetchCategory();
                setToast({ isOpen: true, message: 'Type deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete type', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting type', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const [errors, setErrors] = useState<{ name: string }>({ name: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'name' && !value.trim()) {
            error = 'Type name is required';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name') {
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            !errors.name
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation
        const isNameValid = validateField('name', formData.name);

        if (!isNameValid) {
            setToast({ isOpen: true, message: 'Please fix errors.', type: 'error' });
            return;
        }

        const url = formMode === 'create'
            ? '/api/admin/content/quiz-bank/types'
            : `/api/admin/content/quiz-bank/types/${formData.id}`;

        const method = formMode === 'create' ? 'POST' : 'PUT';
        const body = formMode === 'create'
            ? { name: formData.name, category_id: categoryId }
            : { name: formData.name };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchCategory();
                setToast({ isOpen: true, message: `Type ${formMode === 'create' ? 'created' : 'updated'}`, type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredTypes = category?.question_types.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) return (
        <AdminLayout>
            <div className="p-8 text-center text-gray-500">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`Quiz Bank: ${category?.name}`}>
            <Head>
                <title>{category?.name} | Quiz Bank</title>
            </Head>

            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/content/quiz-bank" className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition">
                    <FaArrowLeft /> Back to Categories
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{category?.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage question types for this category.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                    >
                        <FaPlus /> New Type
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTypes.map(type => (
                        <div key={type.id} className="group relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                            <Link href={`/admin/content/quiz-bank/${categoryId}/${type.id}`} className="block p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <FaListUl size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleEdit(type); }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(type.id, e)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-900 truncate mb-1">{type.name}</h4>
                                <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-50 w-fit px-2 py-1 rounded">
                                    {type._count?.question_bank || 0} Questions
                                </div>
                            </Link>
                        </div>
                    ))}

                    {filteredTypes.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                            <div className="mx-auto w-12 h-12 text-gray-300 mb-3">
                                <FaListUl size={48} />
                            </div>
                            <p className="text-gray-500">
                                {searchQuery ? `No types match "${searchQuery}"` : 'No Question Types found. Create one (e.g., Multiple Choice).'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {formMode === 'create' ? 'Create Question Type' : 'Edit Question Type'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500'}`}
                                    placeholder="e.g. Multiple Choice"
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
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
                                    disabled={!isFormValid()}
                                    className={`px-4 py-2 text-white rounded-lg transition ${!isFormValid() ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
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
                title="Delete Type?"
                message="Are you sure? All questions inside this type will be deleted."
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
