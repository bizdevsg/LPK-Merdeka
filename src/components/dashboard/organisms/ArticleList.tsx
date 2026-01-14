import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail_url: string | null;
    author: string | null;
    published_at: string;
}

export const ArticleList: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/cms/articles');
                if (res.ok) {
                    const data = await res.json();
                    setArticles(data);
                }
            } catch (error) {
                console.error("Failed to fetch articles", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-pulse h-80">
                        <div className="h-48 bg-gray-200 dark:bg-zinc-800"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-gray-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FaArrowRight size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Belum ada artikel</h3>
                <p className="text-gray-500 mt-2">Nantikan artikel menarik dari kami.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Featured Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Berita Utama</h2>
                {articles.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 items-start">
                        <div className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
                            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                                {articles[0].thumbnail_url ? (
                                    <img src={articles[0].thumbnail_url} alt={articles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">📰</div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 transition-colors">{articles[0].title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{articles[0].excerpt}</p>
                                <Link href={`/dashboard/articles/${articles[0].slug}`} className="text-red-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">Baca Selengkapnya <FaArrowRight /></Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Other News Section */}
            {articles.length > 1 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-red-600 pl-4">Berita Lainnya</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.slice(1).map((article) => (
                            <div key={article.id} className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                                {/* Image Container */}
                                <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                    {article.thumbnail_url ? (
                                        <img
                                            src={article.thumbnail_url}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl text-gray-300">📰</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        {article.published_at && (
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt className="text-red-500" />
                                                {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                        {article.author && (
                                            <span className="flex items-center gap-1">
                                                <FaUser className="text-red-500" />
                                                {article.author}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                        {article.title}
                                    </h3>

                                    {article.excerpt && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                                            {article.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-zinc-800">
                                        <Link
                                            href={`/dashboard/articles/${article.slug}`}
                                            className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                                        >
                                            Baca Selengkapnya <FaArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
