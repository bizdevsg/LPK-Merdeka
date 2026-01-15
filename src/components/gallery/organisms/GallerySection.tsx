import React, { useState, useEffect } from 'react';
import GalleryFilter from "../molecules/GalleryFilter";
import GalleryGrid from './GalleryGrid';
import { GalleryItemProps } from "../molecules/GalleryItem";

const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'photo', label: 'Foto' },
    { id: 'video', label: 'Video' }
];

const GallerySection = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [galleryItems, setGalleryItems] = useState<GalleryItemProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/cms/gallery');
                if (res.ok) {
                    const data = await res.json();
                    // Transform API data to match GalleryItemProps
                    const transformedData: GalleryItemProps[] = data.map((item: any) => ({
                        id: parseInt(item.id),
                        type: item.type === 'video' ? 'video' : 'photo',
                        category: item.category || 'activity',
                        title: item.title || 'Untitled',
                        date: new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }),
                        image: item.image_url
                    }));
                    setGalleryItems(transformedData);
                }
            } catch (error) {
                console.error('Failed to fetch gallery', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const filteredItems = galleryItems.filter(item => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'photo') return item.type !== 'video';
        if (activeFilter === 'video') return item.type === 'video';
        return item.category === activeFilter;
    });

    if (loading) {
        return (
            <div className="space-y-8">
                <GalleryFilter
                    filters={categories}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Filters */}
            <GalleryFilter
                filters={categories}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Grid */}
            <GalleryGrid items={filteredItems} />
        </div>
    );
};

export default GallerySection;
