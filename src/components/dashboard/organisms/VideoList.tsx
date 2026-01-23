import React, { useEffect, useState, useRef } from 'react';
import { FaVideo, FaPlay, FaFolder, FaArrowLeft, FaTimes, FaCheckCircle, FaClock, FaExpand, FaCompress } from 'react-icons/fa';
import { useSearch } from '@/context/SearchContext';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/shared/molecules/Toast';

interface Video {
    id: string;
    title: string;
    url: string;
    cover_url: string | null;
    duration: number | null;
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
        videos: number;
    }
}

export const VideoList: React.FC = () => {
    const { searchQuery } = useSearch();
    const { user } = useAuth();
    const [view, setView] = useState<'folders' | 'items'>('folders');
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    // Player & Gamification State
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [watchTime, setWatchTime] = useState(0);
    const [initialStartTime, setInitialStartTime] = useState(0); // For iframe resume
    const [hasAwarded, setHasAwarded] = useState(false);
    const [targetTime, setTargetTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toast State
    const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

    // Fetch Folders
    useEffect(() => {
        if (view === 'folders') {
            const fetchFolders = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/content/folders?type=video');
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
                    const res = await fetch(`/api/content/videos?folder_id=${selectedFolder.id}`);
                    if (res.ok) {
                        setVideos(await res.json());
                    }
                } catch (error) {
                    console.error("Failed to fetch videos", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchItems();
        }
    }, [view, selectedFolder]);

    // Timer Logic for Content Tracking
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (activeVideo) {
            // Calculate target time (70% of duration or default 60s if no duration)
            const durationInSeconds = (activeVideo.duration || 1) * 60;
            const calculatedTarget = Math.floor(durationInSeconds * 0.7);
            const finalTarget = calculatedTarget > 0 ? calculatedTarget : 60;
            setTargetTime(finalTarget);

            // Check if already awarded derived from watchTime set in handleOpenVideo
            if (watchTime >= finalTarget && finalTarget > 0) {
                setHasAwarded(true);
            } else {
                setHasAwarded(false);
            }

            interval = setInterval(() => {
                // Check if tab is visible to prevent background farming
                if (document.visibilityState === 'visible') {
                    setWatchTime(prev => {
                        const newTime = prev + 1;
                        // Save progress
                        if (user?.id) {
                            localStorage.setItem(`lpk-video-progress-${user.id}-${activeVideo.id}`, newTime.toString());
                        }
                        return newTime;
                    });
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeVideo, user?.id]);

    // Check Threshold
    useEffect(() => {
        if (activeVideo && !hasAwarded && targetTime > 0 && watchTime >= targetTime) {
            trackVideoView(activeVideo.id);
            setHasAwarded(true);
        }
    }, [watchTime, targetTime, activeVideo, hasAwarded]);

    const handleFolderClick = (folder: Folder) => {
        setSelectedFolder(folder);
        setView('items');
    };

    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setView('folders');
    };

    const handleOpenVideo = (video: Video) => {
        // Load progress synchronously before setting active video
        let savedTime = 0;
        if (user?.id) {
            const stored = localStorage.getItem(`lpk-video-progress-${user.id}-${video.id}`);
            if (stored) {
                savedTime = parseInt(stored) || 0;
            }
        }

        setInitialStartTime(savedTime);
        setWatchTime(savedTime);
        setActiveVideo(video);
    };

    const getEmbedUrl = (url: string, start: number = 0) => {
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/);
        if (ytMatch) {
            // YouTube: Add start parameter
            return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&start=${start}`;
        }

        const driveMatch = url.match(/\/d\/([-\w]{25,})/);
        if (driveMatch) {
            return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
        }

        return url;
    };

    const trackVideoView = async (videoId: string) => {
        try {
            const res = await fetch('/api/user/gamification/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'video', id: videoId })
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

    const closePlayer = () => {
        setActiveVideo(null);
        setWatchTime(0);
        setHasAwarded(false);
        setIsFullscreen(false);
        setInitialStartTime(0);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // FILTER LOGIC
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())));
    const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())));

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
                        {searchQuery ? 'Folder tidak ditemukan' : 'Belum ada Folder Video'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {searchQuery ? `Tidak ada folder yang cocok dengan "${searchQuery}"` : 'Folder video pembelajaran akan segera tersedia.'}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Video Pembelajaran</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFolders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleFolderClick(folder)}
                            className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                    <FaFolder />
                                </div>
                                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs font-semibold px-2 py-1 rounded-full">
                                    {folder._count.videos} Video
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-red-600 transition-colors">
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

    // View: ITEMS (Videos)
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
                    <p className="text-sm text-gray-500">Daftar Video Pembelajaran</p>
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                    {searchQuery ? `Tidak ada video yang cocok dengan "${searchQuery}"` : 'Folder ini belum memiliki video.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all group flex flex-col h-full">
                            <div
                                className="relative aspect-video bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer group/video"
                                onClick={() => handleOpenVideo(video)}
                            >
                                {video.cover_url ? (
                                    <img src={video.cover_url} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover/video:opacity-60 transition-opacity" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800" />
                                )}

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover/video:scale-110 transition-transform">
                                        <FaPlay className="ml-1" />
                                    </div>
                                </div>

                                {video.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {video.duration} min
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                                    {video.title}
                                </h3>
                                {video.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {video.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Player Modal */}
            {activeVideo && (
                <div className={`fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center ${isFullscreen ? 'p-0 w-full h-full' : 'p-4 md:p-12'}`}>
                    <div className={`w-full ${isFullscreen ? 'h-full' : 'max-w-6xl'} flex flex-col relative`}>
                        {/* Header Controls */}
                        <div className={`flex justify-between items-center text-white mb-2 ${isFullscreen ? 'absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent' : ''}`}>
                            <h3 className={`font-semibold text-lg line-clamp-1 flex-1 pr-4 ${isFullscreen ? 'text-white' : ''}`}>
                                {activeVideo.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleFullscreen}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                                </button>
                                <button
                                    onClick={closePlayer}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-2"
                                >
                                    <span className="hidden sm:inline text-sm">Close</span>
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Video Container */}
                        <div className={`bg-black rounded-xl overflow-hidden shadow-2xl relative ${isFullscreen ? 'flex-1 rounded-none' : 'aspect-video mb-4'}`}>
                            <iframe
                                src={getEmbedUrl(activeVideo.url, initialStartTime)}
                                className="w-full h-full absolute inset-0"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Progress Bar & Status - Conditional Render based on Fullscreen */}
                        <div className={`${isFullscreen ? 'absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl' : ''}`}>
                            <div className={`bg-zinc-800/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-700 transition-all ${isFullscreen ? 'hover:opacity-100 opacity-0' : ''}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {hasAwarded ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <FaCheckCircle className="text-xl" />
                                                <span className="font-bold">Poin Diterima!</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <FaClock className="text-gray-400 animate-pulse" />
                                                <span className="text-sm">Tonton untuk mendapatkan poin...</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {hasAwarded ? '100%' : `${Math.min(100, Math.round((watchTime / targetTime) * 100))}%`}
                                    </span>
                                </div>

                                <div className="w-full bg-zinc-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-linear ${hasAwarded ? 'bg-green-500' : 'bg-red-600'}`}
                                        style={{ width: `${Math.min(100, (watchTime / targetTime) * 100)}%` }}
                                    />
                                </div>
                                {!hasAwarded && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Tetap di halaman selama {Math.max(0, targetTime - watchTime)} detik.
                                        <span className="block opacity-50 text-[10px] mt-1">(Dilarang pindah tab untuk mendapatkan poin)</span>
                                    </p>
                                )}
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
