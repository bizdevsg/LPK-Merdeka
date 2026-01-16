import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
import { FaGripVertical, FaTrash, FaPlus, FaArrowLeft, FaSave } from 'react-icons/fa';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import Link from 'next/link';

interface Question {
    id: string;
    content: string;
    options: string;
    correct_answer: string;
    type_id: string;
    order: number;
}

interface AvailableQuestion {
    id: string;
    content: string;
}

function SortableQuestion({ question, onRemove }: { question: Question; onRemove: () => void }) {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-zinc-900 p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-800 flex items-center gap-4 mb-3 hover:border-red-300 dark:hover:border-red-700 transition-colors"
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                title="Drag to reorder"
            >
                <FaGripVertical size={20} />
            </button>

            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {question.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Order: {question.order + 1}
                </p>
            </div>

            <button
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 transition-colors"
                title="Remove from quiz"
            >
                <FaTrash />
            </button>
        </div>
    );
}

export default function QuizQuestionsManager() {
    const router = useRouter();
    const { id } = router.query;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<AvailableQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchQuestions();
            fetchAvailableQuestions();
        }
    }, [id]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`/api/admin/content/weekly-quiz/${id}/questions`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error('Failed to fetch questions', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableQuestions = async () => {
        try {
            const res = await fetch('/api/admin/content/quiz-bank/questions');
            if (res.ok) {
                const data = await res.json();
                setAvailableQuestions(data);
            }
        } catch (error) {
            console.error('Failed to fetch available questions', error);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);

            const newQuestions = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
                ...q,
                order: idx
            }));

            setQuestions(newQuestions);
            setHasChanges(true);
        }
    };

    const saveOrder = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/content/weekly-quiz/${id}/questions/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questions: questions.map((q, index) => ({
                        id: q.id,
                        order: index
                    }))
                })
            });

            if (res.ok) {
                setHasChanges(false);
                alert('Order saved successfully!');
            } else {
                alert('Failed to save order');
            }
        } catch (error) {
            console.error('Failed to save order', error);
            alert('Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = async (questionId: string) => {
        try {
            const res = await fetch(`/api/admin/content/weekly-quiz/${id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: questionId })
            });

            if (res.ok) {
                fetchQuestions();
                setShowAddModal(false);
            } else {
                alert('Failed to add question');
            }
        } catch (error) {
            console.error('Failed to add question', error);
            alert('Failed to add question');
        }
    };

    const removeQuestion = async (questionId: string) => {
        if (!confirm('Remove this question from the quiz?')) return;

        try {
            const res = await fetch(`/api/admin/content/weekly-quiz/${id}/questions`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question_id: questionId })
            });

            if (res.ok) {
                setQuestions(questions.filter(q => q.id !== questionId));
            } else {
                alert('Failed to remove question');
            }
        } catch (error) {
            console.error('Failed to remove question', error);
            alert('Failed to remove question');
        }
    };

    const assignedQuestionIds = new Set(questions.map(q => q.id));
    const unassignedQuestions = availableQuestions.filter(q => !assignedQuestionIds.has(q.id));

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/content/weekly-quiz"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <FaArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Quiz Questions</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Drag and drop to reorder questions
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FaPlus /> Add Question
                        </button>

                        {hasChanges && (
                            <button
                                onClick={saveOrder}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                <FaSave /> {saving ? 'Saving...' : 'Save Order'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No questions added yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                        >
                            <FaPlus /> Add First Question
                        </button>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={questions.map(q => q.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {questions.map((question) => (
                                <SortableQuestion
                                    key={question.id}
                                    question={question}
                                    onRemove={() => removeQuestion(question.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}

                {/* Add Question Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Question to Quiz</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {unassignedQuestions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">All available questions have been added</p>
                                ) : (
                                    <div className="space-y-2">
                                        {unassignedQuestions.map((q) => (
                                            <button
                                                key={q.id}
                                                onClick={() => addQuestion(q.id)}
                                                className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{q.content}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-zinc-800">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-full bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
