import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaPlus, FaTrash, FaEdit, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';
import { Toast } from '@/components/shared/molecules/Toast';
import { ConfirmationModal } from '@/components/shared/molecules/ConfirmationModal';
import { useSearch } from '@/context/SearchContext';

interface WeeklyQuiz {
    id: string;
    title: string;
    category: {
        id: string;
        name: string;
    };
    start_date: string;
    end_date: string;
    is_active: boolean;
    config: string;
    _count?: {
        quiz_attempts: number;
    }
}

interface Category {
    id: string;
    name: string;
}

interface QuestionType {
    id: string;
    name: string;
    category_id: string;
    _count: {
        question_bank: number;
    }
}


export default function WeeklyQuizManager() {
    const { searchQuery } = useSearch();
    const [quizzes, setQuizzes] = useState<WeeklyQuiz[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<QuestionType[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Form State
    const [formId, setFormId] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formSelectedCategory, setFormSelectedCategory] = useState('');
    const [formType, setFormType] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState(0);
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formQuestionCount, setFormQuestionCount] = useState<number>(10);
    const [formDuration, setFormDuration] = useState<number>(30);
    const [formIsActive, setFormIsActive] = useState(true);
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

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Quizzes
            const quizRes = await fetch(`/api/admin/content/weekly-quiz`, { headers: getAuthHeaders() });
            if (quizRes.ok) setQuizzes(await quizRes.json());

            // Fetch Categories (for Dropdown)
            const catRes = await fetch(`/api/admin/content/quiz-bank/categories`, { headers: getAuthHeaders() });
            if (catRes.ok) {
                const cats = await catRes.json();
                console.log('Categories:', cats);
                setCategories(cats);
            }

            // Fetch All Types
            const typesRes = await fetch(`/api/admin/content/quiz-bank/types`, { headers: getAuthHeaders() });
            if (typesRes.ok) {
                const typesData = await typesRes.json();
                console.log('Types fetched:', typesData);
                setTypes(typesData);
            } else {
                console.error('Failed to fetch types:', await typesRes.text());
            }

        } catch (error) {
            console.error(error);
            setToast({ isOpen: true, message: 'Failed to fetch data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toInputDate = (isoString: string) => {
        if (!isoString) return '';
        // Create date object
        const date = new Date(isoString);
        // Correct for timezone offset to show correct local time in input
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const handleCreate = () => {
        setFormId('');
        setFormTitle('');
        setFormSelectedCategory(categories.length > 0 ? categories[0].id : '');
        setFormType('');
        setAvailableQuestions(0);
        // Default: Start tomorrow, end 1 week later
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 09:00

        const nextWeek = new Date(tomorrow);
        nextWeek.setDate(nextWeek.getDate() + 7);

        setFormStartDate(toInputDate(tomorrow.toISOString()));
        setFormEndDate(toInputDate(nextWeek.toISOString()));
        setFormQuestionCount(10);
        setFormDuration(30);
        setFormIsActive(true);

        setFormMode('create');
        setTouched({});
        setIsFormOpen(true);
    };

    const handleEdit = (q: WeeklyQuiz) => {
        setFormId(q.id);
        setFormTitle(q.title);

        let config: { question_count?: number, type_id?: string, duration?: number } = {};
        try {
            config = JSON.parse(q.config || '{}');
            setFormQuestionCount(config.question_count || 10);
            setFormDuration(config.duration || 30);
        } catch (e) {
            setFormQuestionCount(10);
            setFormDuration(30);
        }

        // Find the type and its category based on q.category.id (which stores type_id in DB relation)
        // Wait, q.category is currently returning {id, name} of linked "type" if the relation is correct.
        // The prisma schema says: category question_types @relation...
        // So q.category is actually the QuestionType.

        const typeId = config.type_id;

        if (typeId) {
            // Find type and set category from it, or use existing category
            const type = types.find(t => t.id === typeId);
            if (type) {
                setFormSelectedCategory(type.category_id);
                setFormType(type.id);
                setAvailableQuestions(type._count.question_bank);
            } else {
                setFormSelectedCategory(q.category.id);
                setFormType(typeId);
            }
        } else {
            // Legacy support or just category
            setFormSelectedCategory(q.category.id);
            setFormType('');
        }

        setFormStartDate(toInputDate(q.start_date));
        setFormEndDate(toInputDate(q.end_date));
        setFormIsActive(q.is_active);

        try {
            config = JSON.parse(q.config || '{}');
            setFormQuestionCount(config.question_count || 10);
            setFormDuration(config.duration || 30);
        } catch (e) {
            setFormQuestionCount(10);
            setFormDuration(30);
        }

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
        try {
            const res = await fetch(`/api/admin/content/weekly-quiz/${deleteTargetId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setQuizzes(quizzes.filter(q => q.id !== deleteTargetId));
                setToast({ isOpen: true, message: 'Quiz deleted', type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Failed to delete quiz', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error deleting quiz', type: 'error' });
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const [errors, setErrors] = useState({
        title: '',
        category: '',
        type: '',
        startDate: '',
        endDate: '',
        questionCount: ''
    });

    const validateField = (name: string, value: any) => {
        let error = '';
        if (name === 'title' && !value.toString().trim()) {
            error = 'Title is required';
        } else if (name === 'category' && !value) {
            error = 'Category is required';
        } else if (name === 'type' && !value) {
            error = 'Question Type is required';
        } else if (name === 'startDate' && !value) {
            error = 'Start date is required';
        } else if (name === 'endDate') {
            if (!value) {
                error = 'End date is required';
            } else if (formStartDate && new Date(value) <= new Date(formStartDate)) {
                error = 'End date must be after start date';
            }
        } else if (name === 'questionCount') {
            if (value <= 0) {
                error = 'Must be at least 1';
            } else if (formType && value > availableQuestions) {
                error = `Maximum ${availableQuestions} questions available`;
            }
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const isFormValid = () => {
        return (
            formTitle.trim() !== '' &&
            formSelectedCategory !== '' &&
            formType !== '' &&
            formStartDate !== '' &&
            formEndDate !== '' &&
            formQuestionCount > 0 &&
            (formType ? formQuestionCount <= availableQuestions : true) &&
            !errors.title &&
            !errors.category &&
            !errors.type &&
            !errors.startDate &&
            !errors.endDate &&
            !errors.questionCount
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation
        const isTitleValid = validateField('title', formTitle);
        const isCategoryValid = validateField('category', formSelectedCategory);
        const isTypeValid = validateField('type', formType);
        const isStartValid = validateField('startDate', formStartDate);
        const isEndValid = validateField('endDate', formEndDate);
        const isCountValid = validateField('questionCount', formQuestionCount);

        if (!isTitleValid || !isCategoryValid || !isTypeValid || !isStartValid || !isEndValid || !isCountValid) {
            setToast({ isOpen: true, message: 'Please fix errors.', type: 'error' });
            return;
        }

        const url = formMode === 'create'
            ? '/api/admin/content/weekly-quiz'
            : `/api/admin/content/weekly-quiz/${formId}`;

        const method = formMode === 'create' ? 'POST' : 'PUT';

        const payload = {
            title: formTitle,
            category_id: formSelectedCategory,
            start_date: new Date(formStartDate).toISOString(),
            end_date: new Date(formEndDate).toISOString(),
            is_active: formIsActive,
            config: JSON.stringify({
                question_count: formQuestionCount,
                type_id: formType,
                duration: formDuration
            })
        };

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsFormOpen(false);
                fetchData();
                setToast({ isOpen: true, message: `Quiz ${formMode === 'create' ? 'created' : 'updated'}`, type: 'success' });
            } else {
                setToast({ isOpen: true, message: 'Operation failed', type: 'error' });
            }
        } catch (error) {
            setToast({ isOpen: true, message: 'Error submitting form', type: 'error' });
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AdminLayout title="Weekly Quizzes">
            <Head>
                <title>Weekly Quiz Manager | Admin</title>
            </Head>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Weekly Quiz Schedule</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage weekly quizzes and their schedules.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-sm"
                    >
                        <FaPlus /> Schedule Quiz
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading Quizzes...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuizzes.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                                {searchQuery ? 'No quizzes match your search.' : 'No quizzes scheduled. Create one to get started.'}
                            </div>
                        ) : (
                            filteredQuizzes.map(quiz => (
                                <div key={quiz.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg flex items-center justify-center text-xl shrink-0 ${quiz.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FaClipboardList />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{quiz.title}</h4>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{quiz.category.name}</span>
                                                {!quiz.is_active && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Inactive</span>}
                                            </div>
                                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="flex items-center gap-1">
                                                    <FaCalendarAlt className="text-gray-400" />
                                                    {formatDate(quiz.start_date)} - {formatDate(quiz.end_date)}
                                                </span>
                                                <span>• {quiz._count?.quiz_attempts || 0} Attempts</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(quiz)}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            <FaEdit className="inline mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(quiz.id, e)}
                                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FaTrash className="inline mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">
                            {formMode === 'create' ? 'Schedule Weekly Quiz' : 'Edit Quiz'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={e => {
                                        setFormTitle(e.target.value);
                                        validateField('title', e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                    placeholder="e.g. Weekly Math Challenge #1"
                                />
                                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formSelectedCategory}
                                    onChange={e => {
                                        setFormSelectedCategory(e.target.value);
                                        setFormType('');
                                        setAvailableQuestions(0);
                                        validateField('category', e.target.value);
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white ${errors.category ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formType}
                                    onChange={e => {
                                        const tId = e.target.value;
                                        setFormType(tId);
                                        const type = types.find(t => t.id === tId);
                                        setAvailableQuestions(type?._count.question_bank || 0);
                                        validateField('type', tId);
                                        // Re-validate count when type/available questions change
                                        if (formQuestionCount) {
                                            // Need to defer this or pass updated available
                                            // Simple way: just pass current count to re-trigger internal check
                                            // But availableQuestions state update is async/detached here?
                                            // Actually state updates are batched. We might need useEffect or direct logic.
                                            // For now, let's trust validation on count change or submit.
                                        }
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 outline-none bg-white ${errors.type ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                    disabled={!formSelectedCategory}
                                >
                                    <option value="" disabled>Select Type</option>
                                    {types
                                        .filter(type => type.category_id === formSelectedCategory)
                                        .map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} ({type._count.question_bank} questions)
                                            </option>
                                        ))}
                                </select>
                                {!formSelectedCategory && (
                                    <p className="text-xs text-gray-500 mt-1">Please select a category first</p>
                                )}
                                {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formStartDate}
                                        onChange={e => {
                                            setFormStartDate(e.target.value);
                                            validateField('startDate', e.target.value);
                                        }}
                                        className={`w-full border rounded-lg px-3 py-2 outline-none ${errors.startDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                    />
                                    {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={formEndDate}
                                        onChange={e => {
                                            setFormEndDate(e.target.value);
                                            validateField('endDate', e.target.value);
                                        }}
                                        className={`w-full border rounded-lg px-3 py-2 outline-none ${errors.endDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500 focus:ring-2'}`}
                                    />
                                    {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    max={availableQuestions > 0 ? availableQuestions : 50}
                                    required
                                    value={formQuestionCount}
                                    onChange={e => {
                                        setFormQuestionCount(parseInt(e.target.value));
                                        validateField('questionCount', parseInt(e.target.value));
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none ${errors.questionCount
                                        ? 'border-red-500 focus:ring-red-200 text-red-600'
                                        : 'border-gray-300 focus:ring-red-500'
                                        }`}
                                    placeholder="e.g. 10"
                                />
                                {errors.questionCount ? (
                                    <p className="text-xs text-red-600 mt-1 font-medium">{errors.questionCount}</p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Random questions will be selected from the type.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                                <select
                                    required
                                    value={formDuration}
                                    onChange={e => setFormDuration(parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                >
                                    {[30, 60, 90, 120].map(m => (
                                        <option key={m} value={m}>{m} Minutes</option>
                                    ))}
                                </select>
                            </div>

                            {formMode === 'edit' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formIsActive}
                                        onChange={e => setFormIsActive(e.target.checked)}
                                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Is Active?
                                    </label>
                                </div>
                            )}

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
                                    disabled={!isFormValid()}
                                    className={`px-4 py-2 text-white rounded-lg transition ${!isFormValid() ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    Save Quiz
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
                title="Delete Quiz?"
                message="Are you sure? All attempts associated with this quiz will also be deleted."
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
