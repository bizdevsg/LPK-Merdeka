import React, { useEffect, useState } from 'react';
import { FaBook, FaFolder, FaArrowLeft, FaExpand, FaTimes, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/shared/molecules/Toast';

interface Ebook {
    id: string;
    title: string;
    file_url: string;
    cover_url: string | null;
    description: string | null;
    folder?: {
        name: string;
    };
    created_at: string;
}

interface Folder {
    id: string;
    name: string;
    description: string | null;
    _count: {
        ebooks: number;
    }
}

export const EbookList: React.FC = () => {
    const { searchQuery } = useSearch();
    const { user } = useAuth();
    const [view, setView] = useState<'folders' | 'items'>('folders');
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [loading, setLoading] = useState(true);

    // Preview & Gamification State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [activeEbookId, setActiveEbookId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [readTime, setReadTime] = useState(0);
    const [hasAwarded, setHasAwarded] = useState(false);
    const TARGET_READ_TIME = 180; // 180 seconds

    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

    // Fetch Folders
    useEffect(() => {
        if (view === 'folders') {
            const fetchFolders = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/content/folders?type=ebook');
                    if (res.ok) {
                        setFolders(await res.json());
                    }
                } catch (error) {
                    console.error("Failed to fetch folders", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchFolders();
        }
    }, [view]);

    // Fetch Items when folder selected
    useEffect(() => {
        if (view === 'items' && selectedFolder) {
            const fetchItems = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/content/ebooks?folder_id=${selectedFolder.id}`);
                    if (res.ok) {
                        setEbooks(await res.json());
                    }
                } catch (error) {
                    console.error("Failed to fetch ebooks", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchItems();
        }
    }, [view, selectedFolder]);

    // Read Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (previewUrl && activeEbookId) {
            // New session loaded, check storage
            if (user?.id) {
                const savedProgress = localStorage.getItem(`lpk-ebook-progress-${user.id}-${activeEbookId}`);
                if (savedProgress) {
                    const parsedTime = parseInt(savedProgress);
                    if (!isNaN(parsedTime)) {
                        setReadTime(parsedTime);
                        if (parsedTime >= TARGET_READ_TIME) {
                            setHasAwarded(true);
                        } else {
                            setHasAwarded(false);
                        }
                    } else {
                        setReadTime(0);
                        setHasAwarded(false);
                    }
                } else {
                    setReadTime(0);
                    setHasAwarded(false);
                }
            } else {
                setReadTime(0);
                setHasAwarded(false);
            }

            interval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    setReadTime(prev => {
                        const newTime = prev + 1;
                        if (user?.id) {
                            localStorage.setItem(`lpk-ebook-progress-${user.id}-${activeEbookId}`, newTime.toString());
                        }
                        return newTime;
                    });
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [previewUrl, activeEbookId, user?.id]);

    // Check Threshold
    useEffect(() => {
        if (activeEbookId && !hasAwarded && readTime >= TARGET_READ_TIME) {
            trackEbookRead(activeEbookId);
            setHasAwarded(true);
        }
    }, [readTime, activeEbookId, hasAwarded]);

    const handleFolderClick = (folder: Folder) => {
        setSelectedFolder(folder);
        setView('items');
    };

    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setView('folders');
    };

    const getPreviewLink = (url: string) => {
        const driveIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
        if (driveIdMatch) {
            return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
        }
        return url;
    };

    const handlePreview = (ebook: Ebook) => {
        setPreviewUrl(getPreviewLink(ebook.file_url));
        setActiveEbookId(ebook.id);
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setActiveEbookId(null);
        setIsFullscreen(false);
        setReadTime(0);
        setHasAwarded(false);
    };

    const trackEbookRead = async (ebookId: string) => {
        try {
            const res = await fetch('/api/user/gamification/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'ebook', id: ebookId })
            });
            const data = await res.json();
            if (res.ok && data.awarded) {
                setToast({
                    isOpen: true,
                    message: `Selamat! Anda mendapatkan +${data.points} Poin!`,
                    type: 'success'
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // FILTER LOGIC
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())));
    const filteredEbooks = ebooks.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())));

    if (loading) return <div className="text-center p-8 text-gray-500">Loading...</div>;

    // View: FOLDERS
    if (view === 'folders') {
        if (filteredFolders.length === 0) {
            return (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-gray-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FaFolder size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {searchQuery ? 'Folder tidak ditemukan' : 'Belum ada Folder Materi'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {searchQuery ? `Tidak ada folder yang cocok dengan "${searchQuery}"` : 'Folder materi pembelajaran akan segera tersedia.'}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Materi Pembelajaran (Diskusi & E-Book)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFolders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
                            className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <FaFolder />
                                </div>
                                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs font-semibold px-2 py-1 rounded-full">
                                    {folder._count.ebooks} File
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                                {folder.name}
                            </h3>
                            {folder.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {folder.description}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // View: ITEMS (E-Books)
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handleBackToFolders}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedFolder?.name}</h2>
                    <p className="text-sm text-gray-500">Daftar E-Book dan Materi</p>
                </div>
            </div>

            {filteredEbooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                    {searchQuery ? `Tidak ada file yang cocok dengan "${searchQuery}"` : 'Folder ini belum memiliki file.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredEbooks.map((ebook) => (
                        <div key={ebook.id} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all group flex flex-col h-full">
                            <div className="relative h-48 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                {ebook.cover_url ? (
                                    <img src={ebook.cover_url} alt={ebook.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <FaBook className="text-gray-400 text-4xl" />
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                                    {ebook.title}
                                </h3>
                                {ebook.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                        {ebook.description}
                                    </p>
                                )}
                                <button
                                    onClick={() => handlePreview(ebook)}
                                    className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
                                >
                                    <FaBook size={12} /> Baca / Preview
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewUrl && (
                <div className={`fixed inset-0 z-50 bg-black/95 flex flex-col ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
                    <div className="flex items-center justify-between text-white mb-2 px-2">
                        <h3 className="text-lg font-semibold truncate flex-1 mr-4">Preview Document</h3>
                        <div className="flex items-center gap-4">
                            {!isFullscreen && (
                                <button onClick={() => setIsFullscreen(true)} className="hover:text-gray-300 flex items-center gap-2">
                                    <FaExpand /> Fullscreen
                                </button>
                            )}
                            <button onClick={closePreview} className="hover:text-red-400 flex items-center gap-2">
                                <FaTimes size={24} /> <span className="hidden md:inline">Close</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className={`relative flex-1 bg-white rounded-lg overflow-hidden ${isFullscreen ? 'rounded-none' : ''}`}>
                        <iframe
                            src={previewUrl}
                            className={`w-full h-full border-0 ${!hasAwarded ? 'pb-8' : ''}`}
                            allowFullScreen
                        />

                        {/* Floating Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-2 z-10">
                            <div className="max-w-3xl mx-auto flex items-center gap-4">
                                <div className="flex items-center gap-2 shrink-0 w-32">
                                    {hasAwarded ? (
                                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold animate-in fade-in">
                                            <FaCheckCircle /> Poin Diterima!
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-300 text-xs">
                                            <FaClock className="animate-pulse" /> Membaca...
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-linear ${hasAwarded ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${Math.min(100, (readTime / TARGET_READ_TIME) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, isOpen: false })}
            />
        </div>
    );
};
