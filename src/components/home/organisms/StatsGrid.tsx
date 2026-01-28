// components/organisms/StatsGrid.tsx
import React, { useEffect, useState } from "react";
import { StatBox } from "../molecules/StatBox";

interface StatsData {
  users?: number;
  quizzes?: number;
  certificates?: number;
  ebooks?: number;
  videos?: number;
  articles?: number;
}

export const StatsGrid = () => {
  const [stats, setStats] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch public stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Build stats array conditionally - only include stats with data
  const statItems = [
    stats.users && stats.users > 0 && { number: stats.users, label: "Peserta Aktif" },
    stats.quizzes && stats.quizzes > 0 && { number: stats.quizzes, label: "Kuis Tersedia" },
    stats.certificates && stats.certificates > 0 && { number: stats.certificates, label: "Sertifikat Diterbitkan" },
    stats.ebooks && stats.ebooks > 0 && { number: stats.ebooks, label: "E-Book" },
    stats.videos && stats.videos > 0 && { number: stats.videos, label: "Video Pembelajaran" },
    stats.articles && stats.articles > 0 && { number: stats.articles, label: "Artikel & Berita" },
  ].filter(Boolean) as Array<{ number: number | string; label: string }>;

  // Ensure enough items for seamless scrolling on wide screens
  let displayItems = [...statItems];
  if (displayItems.length > 0) {
    while (displayItems.length < 12) {
      displayItems = [...displayItems, ...statItems];
    }
  }

  // Don't render if loading or no stats available
  if (loading || statItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-red-600 dark:bg-red-800 overflow-hidden py-8 transition-colors duration-300">
      <div className="flex whitespace-nowrap animate-scroll w-max">
        {/* Set 1 */}
        <div className="flex gap-16 pr-16">
          {displayItems.map((stat, index) => (
            <StatBox key={`s1-${index}`} number={stat.number} label={stat.label} />
          ))}
        </div>

        {/* Set 2 (Duplicate for seamless scroll) */}
        <div className="flex gap-16 pr-16">
          {displayItems.map((stat, index) => (
            <StatBox key={`s2-${index}`} number={stat.number} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
};
