import React, { useEffect, useState } from 'react';
import { FaVideo, FaPlay, FaFolder, FaArrowLeft, FaExpand, FaTimes } from 'react-icons/fa';

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

import { useSearch } from '@/context/SearchContext';

export const VideoList: React.FC = () => {
    const { searchQuery } = useSearch();
    const [view, setView] = useState<'folders' | 'items'>('folders');
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

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

    const handleFolderClick = (folder: Folder) => {
        setSelectedFolder(folder);
        setView('items');
    };

    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setView('folders');
    };

    const getEmbedUrl = (url: string) => {
        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

        // Drive
        // Matches /file/d/ID/preview or /file/d/ID/view
        const driveMatch = url.match(/\/d\/([-\w]{25,})/);
        if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

        return url;
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
                                onClick={() => setActiveVideo(video.url)}
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
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-12">
                    <button
                        onClick={() => setActiveVideo(null)}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 z-50"
                    >
                        <FaTimes size={32} />
                    </button>

                    <div className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 relative">
                        <iframe
                            src={getEmbedUrl(activeVideo)}
                            className="w-full h-full absolute inset-0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
