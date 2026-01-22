import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaStar, FaUser, FaGripVertical } from 'react-icons/fa';
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

interface Testimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar_url: string;
    rating: number;
    order: number;
}

// Sortable Testimonial Item Component
const SortableTestimonialItem = ({
    testimonial,
    onEdit,
    onDelete
}: {
    testimonial: Testimonial;
    onEdit: (t: Testimonial) => void;
    onDelete: (id: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: testimonial.id });

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
            <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                {testimonial.order || '-'}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {testimonial.avatar_url ? (
                    <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                ) : (
                    <FaUser className="text-gray-400" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{testimonial.content}</p>
                <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} size={12} />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onEdit(testimonial)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition"
                >
                    <FaEdit />
                </button>
                <button
                    onClick={() => onDelete(testimonial.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default function CMSTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const { searchQuery } = useSearch();
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', content: '', avatar_url: '', rating: 5, id: '' });
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'info' | 'warning' });

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

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/admin/cms/testimonials', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                // Sort by order
                data.sort((a: Testimonial, b: Testimonial) => (a.order || 0) - (b.order || 0));
                setTestimonials(data);
            }
        } catch (error) {
            console.error('Failed to fetch testimonials', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = testimonials.findIndex((t) => t.id === active.id);
            const newIndex = testimonials.findIndex((t) => t.id === over.id);

            const newTestimonials = arrayMove(testimonials, oldIndex, newIndex);

            // Update order numbers
            const updatedTestimonials = newTestimonials.map((t, index) => ({
                ...t,
                order: index + 1
            }));

            setTestimonials(updatedTestimonials);

            // Save new order to database
            try {
                const res = await fetch('/api/admin/cms/testimonials/reorder', {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        items: updatedTestimonials.map(t => ({ id: t.id, order: t.order }))
                    })
                });

                if (res.ok) {
                    setToast({ isOpen: true, message: 'Order updated successfully', type: 'success' });
                } else {
                    // Revert on failure
                    fetchTestimonials();
                    setToast({ isOpen: true, message: 'Failed to update order', type: 'error' });
                }
            } catch (error) {
                fetchTestimonials();
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
            const res = await fetch(`/api/admin/cms/testimonials/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setTestimonials(testimonials.filter(t => t.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Testimonial deleted successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ isOpen: true, message: data.message || 'Failed to delete testimonial', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting testimonial', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setFormData({
            name: testimonial.name,
            role: testimonial.role,
            content: testimonial.content,
            avatar_url: testimonial.avatar_url || '',
            rating: testimonial.rating,
            id: testimonial.id
        });
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setFormData({ name: '', role: '', content: '', avatar_url: '', rating: 5, id: '' });
        setFormMode('create');
        setIsFormOpen(true);
    };

    const [errors, setErrors] = useState({ name: '', role: '', content: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'name' && !value.trim()) {
            error = 'Name is required';
        } else if (name === 'role' && !value.trim()) {
            error = 'Role is required';
        } else if (name === 'content' && !value.trim()) {
            error = 'Content is required';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'name' || name === 'role' || name === 'content') {
            validateField(name, value);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.role.trim() !== '' &&
            formData.content.trim() !== '' &&
            !errors.name &&
            !errors.role &&
            !errors.content
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Final validation
        const isNameValid = validateField('name', formData.name);
        const isRoleValid = validateField('role', formData.role);
        const isContentValid = validateField('content', formData.content);

        if (!isNameValid || !isRoleValid || !isContentValid) {
            setToast({ isOpen: true, message: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        const url = formMode === 'create' ? '/api/admin/cms/testimonials' : `/api/admin/cms/testimonials/${formData.id}`;
        const method = formMode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchTestimonials();
                setToast({ isOpen: true, message: `Testimonial ${formMode === 'create' ? 'created' : 'updated'} successfully`, type: 'success' });
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

    const filteredTestimonials = testimonials.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title="CMS: Testimonials">
            <Head>
                <title>Manage Testimonials | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> Testimonials
                    </h2>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <FaPlus /> Add Testimonial
                    </button>
                </div>

                {/* Drag and Drop Hint */}
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                        <FaGripVertical /> Drag and drop items to reorder. Changes are saved automatically.
                    </p>
                </div>

                {/* Testimonials List */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredTestimonials.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery ? `No testimonials found matching "${searchQuery}"` : "No testimonials found."}
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredTestimonials.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {filteredTestimonials.map((testimonial) => (
                                        <SortableTestimonialItem
                                            key={testimonial.id}
                                            testimonial={testimonial}
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
                                {formMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="role"
                                        required
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                    />
                                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
                                <textarea
                                    name="content"
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
                                />
                                {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.avatar_url}
                                    onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <select
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    {[5, 4, 3, 2, 1].map(r => (
                                        <option key={r} value={r}>{r} Stars</option>
                                    ))}
                                </select>
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
                title="Delete Testimonial?"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
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
