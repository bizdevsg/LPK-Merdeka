import React, { useState } from 'react';
import Image from 'next/image';
import { FaPlay, FaImage, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export type GalleryType = 'photo' | 'video' | 'image';
export type GalleryCategory = 'activity' | 'ceremony' | 'training' | 'culture' | 'facility' | 'event' | 'other';

export interface GalleryItemProps {
    id: number;
    type: GalleryType;
    category: GalleryCategory | string;
    title: string;
    date: string;
    image: string;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ type, category, title, date, image }) => {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(image);

    const categoryLabels: Record<string, string> = {
        activity: 'Aktivitas',
        ceremony: 'Upacara',
        training: 'Pelatihan',
        culture: 'Budaya',
        facility: 'Fasilitas',
        event: 'Event',
        other: 'Lainnya'
    };

    // Extract YouTube ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Determine if it's a video type
    const isVideo = type === 'video';

    // Determine display image
    let displayImage = imageSrc;
    if (isVideo) {
        const youtubeId = getYouTubeId(image);
        if (youtubeId) {
            displayImage = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
        } else if (image.includes('drive.google.com')) {
            displayImage = '/assets/video-placeholder.jpg';
        }
    }

    // Handler for video click
    const handleClick = () => {
        if (isVideo) {
            window.open(image, '_blank');
        }
    };

    // Handle image error
    const handleImageError = () => {
        setImageError(true);
        // Try fallback for YouTube
        if (displayImage.includes('maxresdefault')) {
            setImageSrc(displayImage.replace('maxresdefault', 'hqdefault'));
        }
    };

    // Get category label with fallback
    const getCategoryLabel = (cat: string) => {
        return categoryLabels[cat?.toLowerCase()] || cat || 'Lainnya';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative cursor-pointer h-full"
            onClick={handleClick}
        >
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                    {imageError ? (
                        // Fallback placeholder for broken images
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                                <FaExclamationTriangle className="text-gray-400 text-2xl" />
                            </div>
                            <p className="text-gray-500 text-sm font-medium">Image not available</p>
                        </div>
                    ) : (
                        <Image
                            src={displayImage || '/assets/placeholder.jpg'}
                            alt={title}
                            fill
                            unoptimized
                            className={`object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={handleImageError}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                            {isVideo ? (
                                <>
                                    <FaPlay className="text-red-600 text-xs" />
                                    <span className="text-xs font-semibold text-gray-800">Video</span>
                                </>
                            ) : (
                                <>
                                    <FaImage className="text-red-600 text-xs" />
                                    <span className="text-xs font-semibold text-gray-800">Foto</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Video Play Button */}
                    {isVideo && !imageError && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 group-hover:bg-red-600/80 transition-all duration-300">
                                <FaPlay className="text-white text-xl ml-1" />
                            </div>
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        {/* Category Badge */}
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg mb-2 shadow-lg">
                            {getCategoryLabel(category)}
                        </span>

                        {/* Title & Date */}
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-1 line-clamp-2">
                            {title || 'Untitled'}
                        </h3>
                        <p className="text-gray-200 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {date}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GalleryItem;
