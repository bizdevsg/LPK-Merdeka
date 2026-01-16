import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface QuizSidebarProps {
    totalQuestions: number;
    currentIndex: number;
    answers: Record<string, string>;
    questions: { id: string }[];
    flagged: Set<number>;
    onNavigate: (index: number) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const QuizSidebar: React.FC<QuizSidebarProps> = ({
    totalQuestions,
    currentIndex,
    answers,
    questions,
    flagged,
    onNavigate,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Backdrop for mobile only */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-zinc-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Daftar Soal</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
                    <div className="grid grid-cols-5 gap-3">
                        {Array.from({ length: totalQuestions }).map((_, idx) => {
                            const questionId = questions[idx]?.id;
                            const isAnswered = !!answers[questionId];
                            const isFlagged = flagged.has(idx);
                            const isCurrent = currentIndex === idx;

                            let baseClass = "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold border transition-all relative ";

                            if (isCurrent) {
                                baseClass += "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-900/40";
                            } else if (isFlagged) {
                                baseClass += "bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-500";
                            } else if (isAnswered) {
                                baseClass += "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-500";
                            } else {
                                baseClass += "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-700";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onNavigate(idx);
                                        // Auto close on mobile if needed, but keeping open allows rapid jumping
                                    }}
                                    className={baseClass}
                                >
                                    {idx + 1}
                                    {/* Status Dots */}
                                    {isFlagged && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white dark:border-zinc-900"></div>}
                                    {isAnswered && !isFlagged && !isCurrent && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-zinc-900"></div>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 space-y-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-blue-50 border border-blue-500 flex items-center justify-center text-[10px] text-blue-600 font-bold">1</div> Sekarang
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-green-100 border border-green-500 flex items-center justify-center text-[10px] text-green-700 font-bold">2</div> Sudah Dijawab
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-yellow-100 border border-yellow-400 flex items-center justify-center text-[10px] text-yellow-700 font-bold">3</div> Ragu-ragu
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-500">4</div> Belum Dijawab
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
