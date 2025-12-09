import React from 'react';
import GalleryItem, { GalleryItemProps } from '../molecules/GalleryItem';

interface GalleryGridProps {
    items: GalleryItemProps[];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
    if (items.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p>Tidak ada media ditemukan untuk kategori ini.</p>
            </div>
        );
    }

    return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {items.map(item => (
                <GalleryItem key={item.id} {...item} />
            ))}
        </div>
    );
};

export default GalleryGrid;
