import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaPlus, FaTrash, FaEdit, FaArrowLeft, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
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
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical } from 'react-icons/fa';

interface Question {
    id: string;
    content: string;
    options: string; // JSON string
    correct_answer: string;
    explanation: string | null;
    order: number;
}

interface QuestionType {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
    }
}

// Sortable Question Component
function SortableQuestion({ question, index, onEdit, onDelete }: {
    question: Question;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    let options = [];
    try {
        options = JSON.parse(question.options);
    } catch (e) { }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border-2 border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors bg-white"
        >
            <div className="flex justify-between items-start gap-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2 mt-1"
                    title="Drag to reorder"
                >
                    <FaGripVertical size={20} />
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Q{index + 1}</span>
                        <h4 className="font-medium text-gray-900 line-clamp-2">{question.content}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pl-2">
                        {options.map((opt: string, i: number) => (
                            <div key={i} className={`text-sm px-3 py-1.5 rounded-lg border ${opt === question.correct_answer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-white border-gray-100 text-gray-600'}`}>
                                {String.fromCharCode(65 + i)}. {opt}
                                {opt === question.correct_answer && <FaCheckCircle className="inline ml-2 mb-0.5" />}
                            </div>
                        ))}
                    </div>

                    {question.explanation && (
                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="font-semibold">Explanation:</span> {question.explanation}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-blue-600 transition hover:bg-blue-50 rounded-lg"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-600 transition hover:bg-red-50 rounded-lg"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function QuestionsManager() {
    const router = useRouter();
    const { categoryId, typeId } = router.query;
    const { searchQuery } = useSearch();

    const [typeData, setTypeData] = useState<QuestionType | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((q) => q.id === active.id);
                const newIndex = items.findIndex((q) => q.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex).map((q, idx) => ({
                    ...q,
                    order: idx
                }));

                return newItems;
            });
            setHasChanges(true);
        }
    };

    const saveOrder = async () => {
        try {
            const res = await fetch(`/api/admin/content/quiz-bank/${categoryId}/${typeId}/reorder`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    questions: questions.map(q => ({ id: q.id, order: q.order }))
                })
            });

            if (res.ok) {
                setToast({ isOpen: true, message: 'Order saved successfully', type: 'success' });
                setHasChanges(false);
            } else {
                setToast({ isOpen: true, message: 'Failed to save order', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Error saving order', type: 'error' });
        }
    };

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Form State
    const [formId, setFormId] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formOptions, setFormOptions] = useState<string[]>(['', '']); // Start with 2 options
    const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
    const [formExplanation, setFormExplanation] = useState('');

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

    const fetchData = async () => {
        if (!typeId) return;
        setLoading(true);
        try {
            // Fetch Type Details
            const typeRes = await fetch(`/api/admin/content/quiz-bank/types/${typeId}`, { headers: getAuthHeaders() });
            if (typeRes.ok) setTypeData(await typeRes.json());

            // Fetch Questions
            const qRes = await fetch(`/api/admin/content/quiz-bank/questions?type_id=${typeId}`, { headers: getAuthHeaders() });
            if (qRes.ok) setQuestions(await qRes.json());

        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typeId) {
            fetchData();
        }
    }, [typeId]);

    const handleCreate = () => {
        setFormId('');
        setFormContent('');
        setFormOptions(['', '', '', '']); // Default 4 options
        setFormCorrectAnswer(''); // No default correct answer, user must select
        setFormExplanation('');
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleEdit = (q: Question) => {
        setFormId(q.id);
        setFormContent(q.content);
        try {
            const parsedOptions = JSON.parse(q.options);
            setFormOptions(Array.isArray(parsedOptions) ? parsedOptions : []);
        } catch (e) {
            setFormOptions([]);
        }
        setFormCorrectAnswer(q.correct_answer);
        setFormExplanation(q.explanation || '');
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
            const res = await fetch(`/api/admin/content/quiz-bank/questions/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setQuestions(questions.filter(q => q.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Question deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete question', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting question', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const validateForm = () => {
        if (!formContent.trim()) return "Question content is required";
        if (formOptions.some(opt => !opt.trim())) return "All options must be filled";
        if (formOptions.length < 2) return "At least 2 options are required";

        // Ensure correct answer matches one of the options (exact string match)
        if (!formCorrectAnswer || !formOptions.includes(formCorrectAnswer)) {
            // Check if correct answer is index-based or value-based? 
            // The model stores 'correct_answer' as string. 
            // Let's assume it stores the OPTION VALUE.
            return "Please select a valid correct answer";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validateForm();
        if (error) {
            setToast({ isOpen: true, message: error, type: 'error' });
            return;
        }

        const url = formMode === 'create'
            ? '/api/admin/content/quiz-bank/questions'
            : `/api/admin/content/quiz-bank/questions/${formId}`;

        const method = formMode === 'create' ? 'POST' : 'PUT';

        const payload = {
            content: formContent,
            options: JSON.stringify(formOptions),
            correct_answer: formCorrectAnswer,
            explanation: formExplanation,
            type_id: typeId
        };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchData(); // Refresh list to get updated data
                setToast({ isOpen: true, message: `Question ${formMode === 'create' ? 'created' : 'updated'}`, type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formOptions];
        // If the option being changed was the correct answer, update the correct answer state too?
        // Actually, if we store the value, changing the value breaks the link.
        // It's better to store correct_answer as the VALUE, but invalidates if value changes.
        // User must re-select correct answer if they change the text of the correct option significantly?
        // Let's update it if it matches.
        if (formCorrectAnswer === newOptions[index]) {
            setFormCorrectAnswer(value);
        }
        newOptions[index] = value;
        setFormOptions(newOptions);
    };

    const addOption = () => {
        setFormOptions([...formOptions, '']);
    };

    const removeOption = (index: number) => {
        if (formOptions.length <= 2) return;
        const newOptions = formOptions.filter((_, i) => i !== index);
        setFormOptions(newOptions);
        // If removed option was correct, clear correct answer
        if (formCorrectAnswer === formOptions[index]) {
            setFormCorrectAnswer('');
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !typeData) return (
        <AdminLayout>
            <div className="p-8 text-center text-gray-500">Loading...</div>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`Quiz Bank: ${typeData?.name || '...'}`}>
            <Head>
                <title>{typeData?.name} | Questions</title>
            </Head>

            <div className="mb-6 flex items-center justify-between">
                <Link href={`/admin/content/quiz-bank/${categoryId}`} className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition">
                    <FaArrowLeft /> Back to {typeData?.name}
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{typeData?.category.name} / {typeData?.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage questions for this type.</p>
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                            <button
                                onClick={saveOrder}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-sm animate-in fade-in"
                            >
                                <FaCheckCircle /> Save Order
                            </button>
                        )}
                        <button
                            onClick={handleCreate}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                        >
                            <FaPlus /> Add Question
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredQuestions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {filteredQuestions.map((question, index) => (
                                <SortableQuestion
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    onEdit={() => handleEdit(question)}
                                    onDelete={() => handleDeleteClick(question.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {filteredQuestions.length === 0 && (
                        <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                            {searchQuery ? 'No questions match your search.' : 'No questions yet. Add one to get started.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {formMode === 'create' ? 'Add New Question' : 'Edit Question'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question Content</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formContent}
                                    onChange={e => setFormContent(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Type the question here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                <div className="space-y-3">
                                    {formOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={formCorrectAnswer === opt && opt !== ''}
                                                onChange={() => setFormCorrectAnswer(opt)}
                                                className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
                                                disabled={!opt} // Disable selection if option is empty
                                            />
                                            <span className="w-6 text-sm font-bold text-gray-400">{String.fromCharCode(65 + idx)}</span>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder={`Option ${idx + 1}`}
                                                required
                                            />
                                            {formOptions.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(idx)}
                                                    className="text-gray-400 hover:text-red-500 p-2"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="mt-3 text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1"
                                >
                                    <FaPlus size={12} /> Add Option
                                </button>
                                {(!formCorrectAnswer || !formOptions.includes(formCorrectAnswer)) && formOptions.some(o => o) && (
                                    <p className="text-xs text-red-500 mt-2">Please select one correct answer from the filled options.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={formExplanation}
                                    onChange={e => setFormExplanation(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Explain why the answer is correct..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                                    Save Question
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
                title="Delete Question?"
                message="Are you sure you want to delete this question? This cannot be undone."
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
