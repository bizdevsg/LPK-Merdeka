import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaQuestionCircle, FaGripVertical } from 'react-icons/fa';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { Toast } from '@/components/shared/molecules/Toast';
import { useSearch } from '@/context/SearchContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQ {
    id: string; // BigInt serialized
    question: string;
    answer: string;
    category: string;
    order: number;
}

type CategoryType = 'General' | 'Registration';

// Sortable FAQ Item Component
const SortableFAQItem = ({
    faq,
    onEdit,
    onDelete
}: {
    faq: FAQ;
    onEdit: (faq: FAQ) => void;
    onDelete: (id: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: faq.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 mt-1"
            >
                <FaGripVertical />
            </div>

            {/* Order Badge */}
            <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                {faq.order}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onEdit(faq)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                >
                    <FaEdit />
                </button>
                <button
                    onClick={() => onDelete(faq.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default function CMSFAQ() {
    const [activeCategory, setActiveCategory] = useState<CategoryType>('General');
    const { searchQuery } = useSearch();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ question: '', answer: '', category: 'General', order: 0, id: '' });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' });

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchFaqs = async (category: CategoryType) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/cms/faq?category=${category}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                // Sort by order
                data.sort((a: FAQ, b: FAQ) => a.order - b.order);
                setFaqs(data);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs(activeCategory);
    }, [activeCategory]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = faqs.findIndex((faq) => faq.id === active.id);
            const newIndex = faqs.findIndex((faq) => faq.id === over.id);

            const newFaqs = arrayMove(faqs, oldIndex, newIndex);

            // Update order numbers
            const updatedFaqs = newFaqs.map((faq, index) => ({
                ...faq,
                order: index + 1
            }));

            setFaqs(updatedFaqs);

            // Save new order to database
            try {
                const res = await fetch('/api/admin/cms/faq/reorder', {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        category: activeCategory,
                        items: updatedFaqs.map(faq => ({ id: faq.id, order: faq.order }))
                    })
                });

                if (res.ok) {
                    setToast({ isOpen: true, message: 'Order updated successfully', type: 'success' });
                } else {
                    // Revert on failure
                    fetchFaqs(activeCategory);
                    setToast({ isOpen: true, message: 'Failed to update order', type: 'error' });
                }
            } catch (error) {
                fetchFaqs(activeCategory);
                setToast({ isOpen: true, message: 'Error updating order', type: 'error' });
            }
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            const res = await fetch(`/api/admin/cms/faq/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setFaqs(faqs.filter(f => f.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'FAQ deleted successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Failed to delete FAQ', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting FAQ', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleEdit = (faq: FAQ) => {
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || activeCategory,
            order: faq.order,
            id: faq.id
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setFormData({ question: '', answer: '', category: activeCategory, order: faqs.length + 1, id: '' });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const [errors, setErrors] = useState({ question: '', answer: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'question' && !value.trim()) {
            error = 'Question is required';
        } else if (name === 'answer' && !value.trim()) {
            error = 'Answer is required';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'question' || name === 'answer') {
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.question.trim() !== '' &&
            formData.answer.trim() !== '' &&
            !errors.question &&
            !errors.answer
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Final validation
        const isQuestionValid = validateField('question', formData.question);
        const isAnswerValid = validateField('answer', formData.answer);

        if (!isQuestionValid || !isAnswerValid) {
            setToast({ isOpen: true, message: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const url = formMode === 'create' ? '/api/admin/cms/faq' : `/api/admin/cms/faq/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchFaqs(activeCategory);
                setToast({ isOpen: true, message: `FAQ ${formMode === 'create' ? 'created' : 'updated'} successfully`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryLabel = (category: CategoryType) => {
        return category === 'General' ? 'FAQ Umum (Bantuan)' : 'FAQ Pendaftaran (Program)';
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="CMS: FAQ">
            <Head>
                <title>Manage FAQ | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header with Tabs */}
                <div className="border-b border-gray-100">
                    <div className="p-4 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaQuestionCircle className="text-red-500" /> Frequently Asked Questions
                        </h2>
                        <button
                            onClick={handleCreate}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                        >
                            <FaPlus /> Add FAQ
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex border-t border-gray-100">
                        <button
                            onClick={() => setActiveCategory('General')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeCategory === 'General'
                                ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            FAQ Bantuan
                        </button>
                        <button
                            onClick={() => setActiveCategory('Registration')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeCategory === 'Registration'
                                ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            FAQ Pendaftaran
                        </button>
                    </div>
                </div>

                {/* Drag and Drop Hint */}
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                        <FaGripVertical /> Drag and drop items to reorder. Changes are saved automatically.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredFaqs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? `No FAQs found matching "${searchQuery}"` : `No FAQs found for ${getCategoryLabel(activeCategory)}.`}
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredFaqs.map(faq => faq.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {filteredFaqs.map((faq) => (
                                        <SortableFAQItem
                                            key={faq.id}
                                            faq={faq}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {formMode === 'create' ? 'Add FAQ' : 'Edit FAQ'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="question"
                                    required
                                    value={formData.question}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.question ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                />
                                {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Answer <span className="text-red-500">*</span></label>
                                <textarea
                                    name="answer"
                                    required
                                    rows={4}
                                    value={formData.answer}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.answer ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                />
                                {errors.answer && <p className="text-xs text-red-500 mt-1">{errors.answer}</p>}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    >
                                        <option value="General">FAQ Umum (Bantuan)</option>
                                        <option value="Registration">FAQ Pendaftaran (Program)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid()}
                                    className={`px-4 py-2 text-white rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2 ${isSubmitting || !isFormValid() ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
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
                title="Delete FAQ?"
                message="Are you sure you want to delete this FAQ? This action cannot be undone."
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
