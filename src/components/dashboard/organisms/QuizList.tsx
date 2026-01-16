import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaCalendarAlt, FaStar, FaTrophy, FaArrowRight, FaCheckCircle, FaClipboardList, FaSearch } from 'react-icons/fa';
import { useSearch } from '@/context/SearchContext';

interface Quiz {
    id: string;
    title: string;
    description?: string;
    category: {
        name: string;
    };
    start_date: string;
    end_date: string;
    attempted: boolean;
    last_score?: number;
}

export const QuizList: React.FC = () => {
    const { searchQuery } = useSearch();
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await fetch('/api/user/quizzes');
                if (res.ok) {
                    const data = await res.json();
                    setQuizzes(data);
                }
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                    <div key={n} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6 animate-pulse h-48"></div>
                ))}
            </div>
        );
    }

    if (quizzes.length === 0 || (searchQuery && filteredQuizzes.length === 0)) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-gray-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FaTrophy size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {searchQuery ? 'Kuis tidak ditemukan' : 'Tidak ada kuis aktif'}
                </h3>
                <p className="text-gray-500 mt-2">
                    {searchQuery ? `Tidak ada kuis yang cocok dengan "${searchQuery}"` : 'Cek kembali nanti untuk kuis mingguan terbaru.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kuis Mingguan</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all relative overflow-hidden group">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        {quiz.category.name}
                                    </span>
                                    {quiz.attempted && (
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-sm font-bold">
                                            <FaCheckCircle /> Selesai
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h3>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <FaCalendarAlt className="text-gray-400" />
                                        Berakhir: {formatDate(quiz.end_date)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                {quiz.attempted ? (
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Skor Terakhir</span>
                                            <span className={`text-2xl font-bold ${(quiz.last_score || 0) >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                                                {quiz.last_score} / 100
                                            </span>
                                        </div>
                                        <Link
                                            href={`/dashboard/quiz/${quiz.id}`}
                                            className="w-full block bg-white border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 text-center font-medium py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <FaArrowRight size={14} /> Ulangi Kuis
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href={`/dashboard/quiz/${quiz.id}`}
                                        className="w-full block bg-red-600 hover:bg-red-700 text-white text-center font-medium py-3 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                        Mulai Kuis Sekarang <FaArrowRight />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
