import React from 'react';
import Image from 'next/image';
import { FaPlay, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

export type GalleryType = 'photo' | 'video';
export type GalleryCategory = 'activity' | 'ceremony' | 'training' | 'culture';

export interface GalleryItemProps {
    id: number;
    type: GalleryType;
    category: GalleryCategory;
    title: string;
    date: string;
    image: string;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ type, category, title, date, image }) => {
    const categoryLabels: Record<GalleryCategory, string> = {
        activity: 'Aktivitas',
        ceremony: 'Upacara',
        training: 'Pelatihan',
        culture: 'Budaya'
    };

    // Extract YouTube ID
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Determine display image
    let displayImage = image;
    if (type === 'video') {
        const youtubeId = getYouTubeId(image);
        if (youtubeId) {
            displayImage = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        } else if (image.includes('drive.google.com')) {
            // Fallback for Drive - usually need a manual cover or API
            // Using a high-quality placeholder or the default image if it happens to be valid
            // For now, we unfortunately can't auto-fetch Drive thumbs easily without API key.
            // We'll use a placeholder if the image string is obviously a drive URL
            displayImage = '/assets/video-placeholder.jpg'; // Ensure this exists or use a colorful div
        }
    }

    // Handler for video click
    const handleClick = () => {
        if (type === 'video') {
            window.open(image, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative break-inside-avoid mb-6 cursor-pointer"
            onClick={handleClick}
        >
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                    <Image
                        src={displayImage}
                        alt={title}
                        fill
                        unoptimized
                        className={`object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out ${type === 'video' && displayImage === image ? 'opacity-50' : ''}`} // Dim if raw video url
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                            // Fallback if maxresdefault doesn't exist (some videos only have hqdefault)
                            if (displayImage.includes('maxresdefault')) {
                                const target = e.target as HTMLImageElement;
                                target.src = displayImage.replace('maxresdefault', 'hqdefault');
                            }
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                            {type === 'video' ? (
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
                    {type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 group-hover:bg-red-600/80 transition-all duration-300">
                                <FaPlay className="text-white text-xl ml-1" />
                            </div>
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        {/* Category Badge */}
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg mb-2 shadow-lg">
                            {categoryLabels[category]}
                        </span>

                        {/* Title & Date */}
                        <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-1 line-clamp-2">
                            {title}
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
