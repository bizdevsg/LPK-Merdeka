import React from 'react';
import GalleryItem, { GalleryItemProps } from "../molecules/GalleryItem";
import { motion } from 'framer-motion';

interface GalleryGridProps {
    items: GalleryItemProps[];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
    if (items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">Tidak ada media ditemukan</p>
                <p className="text-gray-400 text-sm mt-1">Coba pilih kategori lain</p>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <GalleryItem key={item.id} {...item} />
            ))}
        </div>
    );
};

export default GalleryGrid;
