import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaArrowRight, FaClock, FaTrophy, FaArrowLeft, FaStar, FaList, FaFlag } from 'react-icons/fa';
import Link from 'next/link';
import { QuizSidebar } from '@/components/dashboard/organisms/QuizSidebar';

interface Question {
    id: string;
    content: string;
    options: string; // JSON string
    shuffledOptions?: string[]; // Shuffled options for display
    type_id: string;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function QuizPlayer() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, isPending: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [quizState, setQuizState] = useState<'start' | 'playing' | 'submitting' | 'result'>('start');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<any>(null);
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const startQuiz = async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/user/quizzes/${id}/start`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                const data = await res.json();

                // Handle new response structure (object with duration)
                const questionsList = Array.isArray(data) ? data : data.questions;
                const duration = !Array.isArray(data) ? (data.duration || 30) : 30; // default 30 mins

                // Shuffle options for each question
                const questionsWithShuffled = questionsList.map((q: Question) => ({
                    ...q,
                    shuffledOptions: shuffleArray(JSON.parse(q.options))
                }));
                setQuestions(questionsWithShuffled);

                // Set Timer
                setTimeLeft(duration * 60);

                setQuizState('playing');
                setCurrentIndex(0);
            } else {
                const err = await res.json();
                setError(err.message || 'Failed to start quiz');
            }
        } catch (e) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (quizState === 'playing' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitQuiz(); // Auto submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [quizState, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleFlag = (idx: number) => {
        const newFlagged = new Set(flagged);
        if (newFlagged.has(idx)) {
            newFlagged.delete(idx);
        } else {
            newFlagged.add(idx);
        }
        setFlagged(newFlagged);
    };

    const handleAnswer = (option: string) => {
        const currentQ = questions[currentIndex];
        setAnswers({
            ...answers,
            [currentQ.id]: option
        });
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const submitQuiz = async () => {
        setQuizState('submitting');
        try {
            const res = await fetch(`/api/user/quizzes/${id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ answers })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setQuizState('result');
            } else {
                const err = await res.json();
                setError(err.message || 'Failed to submit quiz');
                setQuizState('playing'); // Go back to playing on error?
            }
        } catch (e) {
            setError('Failed to submit quiz');
            setQuizState('playing');
        }
    };

    if (authLoading) return null;

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-80' : ''}`}>
            <Head>
                <title>Quiz | LPK Merdeka</title>
            </Head>

            {/* Header / Nav */}
            <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-white dark:bg-zinc-900 shadow-sm z-10">
                <Link href="/dashboard?tab=kuis" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium hover:text-red-600 transition">
                    <FaArrowLeft /> Keluar / Kembali
                </Link>
                <div className="font-bold text-gray-800 dark:text-white">
                    LPK Merdeka Quiz
                </div>
            </div>

            <div className="w-full max-w-2xl mt-16">

                {/* START SCREEN */}
                {quizState === 'start' && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-zinc-800">
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaTrophy size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Siap untuk Memulai?</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Kuis ini akan menguji pemahamanmu. Pastikan kamu memiliki koneksi internet yang stabil.
                            Kamu tidak bisa mengulang kuis ini setelah dimulai.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={startQuiz}
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-1"
                        >
                            {loading ? 'Memuat...' : 'Mulai Kuis Sekarang'}
                        </button>
                    </div>
                )}

                {/* PLAYING SCREEN */}
                {quizState === 'playing' && questions.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-100 dark:bg-zinc-800">
                            <div
                                className="h-full bg-red-600 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 rounded-lg text-gray-700 dark:text-gray-300 transition"
                                        title="Daftar Soal"
                                    >
                                        <FaList />
                                    </button>
                                    <span className="text-sm font-bold text-gray-400 border-l border-gray-200 dark:border-zinc-700 pl-3">
                                        SOAL {currentIndex + 1} / {questions.length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleFlag(currentIndex)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${flagged.has(currentIndex) ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <FaFlag className={flagged.has(currentIndex) ? 'text-yellow-600' : 'text-gray-400'} />
                                        Ragu-ragu
                                    </button>

                                    <div className={`flex items-center gap-2 font-bold font-mono pl-3 border-l border-gray-200 dark:border-zinc-700 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-600 dark:text-gray-400'}`}>
                                        <FaClock /> {formatTime(timeLeft)}
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
                                {questions[currentIndex].content}
                            </h2>

                            <div className="space-y-3 mb-8">
                                {(() => {
                                    const currentQ = questions[currentIndex];
                                    const opts = currentQ.shuffledOptions || JSON.parse(currentQ.options);
                                    return opts.map((opt: string, idx: number) => {
                                        const isSelected = answers[currentQ.id] === opt;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(opt)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${isSelected
                                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                                    : 'border-gray-100 dark:border-zinc-800 hover:border-red-200 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${isSelected ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-zinc-700'
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="font-medium">{opt}</span>
                                                </div>
                                                {isSelected && <FaCheckCircle className="text-red-600" />}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentIndex === 0}
                                    className={`text-gray-500 font-medium hover:text-gray-800 transition ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                                >
                                    Previous
                                </button>

                                {currentIndex === questions.length - 1 ? (
                                    <button
                                        onClick={submitQuiz}
                                        disabled={Object.keys(answers).length < questions.length} // Optional: force all answered? Or allow skip? Let's check answers count.
                                        className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-green-500/30 transition-all ${Object.keys(answers).length < questions.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Submit Quiz
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2"
                                    >
                                        Next <FaArrowRight />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULT SCREEN */}
                {quizState === 'result' && result && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-zinc-800 animate-in zoom-in duration-300">
                        <div className="w-32 h-32 mx-auto mb-6 relative">
                            {result.score >= 70 ? (
                                <div className="w-full h-full bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl animate-bounce">
                                    🏆
                                </div>
                            ) : (
                                <div className="w-full h-full bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-5xl">
                                    💪
                                </div>
                            )}
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {result.score >= 70 ? 'Luar Biasa!' : 'Belajar Lagi Yuk!'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Kamu telah menyelesaikan kuis ini.
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">Skor</div>
                                <div className={`text-2xl font-bold ${result.score >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{result.score}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">Benar</div>
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">{result.correctCount} <span className="text-sm text-gray-400">/ {result.totalQuestions}</span></div>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl">
                                <div className="text-sm text-gray-500 mb-1">XP Didapat</div>
                                <div className="text-2xl font-bold text-blue-600">+{result.earnedPoints}</div>
                            </div>
                        </div>

                        {result.certificateUrl && (
                            <div className="mb-6 animate-in slide-in-from-bottom duration-500 delay-200">
                                <Link
                                    href={result.certificateUrl}
                                    target="_blank"
                                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaTrophy /> Download Sertifikat
                                </Link>
                                <p className="text-sm text-gray-500 mt-2">Selamat! Kamu berhak mendapatkan sertifikat.</p>
                            </div>
                        )}

                        <Link
                            href="/dashboard?tab=kuis"
                            className="inline-block w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Kembali ke Dashboard
                        </Link>

                        {/* Review Section */}
                        {result.results && (
                            <div className="mt-8 text-left border-t pt-8 border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setShowReview(!showReview)}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl font-bold flex justify-between items-center hover:bg-gray-100 transition"
                                >
                                    Review Jawaban
                                    <span>{showReview ? '▲' : '▼'}</span>
                                </button>

                                {showReview && (
                                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        {result.results.map((r: any, idx: number) => (
                                            <div key={idx} className={`p-4 rounded-xl border-l-4 ${r.isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : 'bg-red-50 dark:bg-red-900/10 border-red-500'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-700 dark:text-gray-300">Soal {idx + 1}</span>
                                                    {r.isCorrect ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
                                                </div>
                                                <div className="prose dark:prose-invert max-w-none text-sm mb-3" dangerouslySetInnerHTML={{ __html: r.content }} />

                                                <div className="text-sm bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-700">
                                                    <p className="mb-1 text-gray-500">Jawaban Kamu:</p>
                                                    <p className={`font-bold ${r.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{r.submittedAnswer || '(Kosong)'}</p>

                                                    {r.isCorrect && r.explanation && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                                            <p className="font-bold text-blue-600 flex items-center gap-2 mb-1"><FaStar size={12} /> Penjelasan:</p>
                                                            <div className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: r.explanation }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <QuizSidebar
                    totalQuestions={questions.length}
                    currentIndex={currentIndex}
                    answers={answers}
                    questions={questions}
                    flagged={flagged}
                    onNavigate={(idx) => {
                        setCurrentIndex(idx);
                        // setIsSidebarOpen(false); // Keep open for faster navigation if preferred
                    }}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>
        </div>
    );
}
