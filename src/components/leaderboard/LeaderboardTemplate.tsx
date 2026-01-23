import React from "react";
import { LeaderboardTable } from "./organisms";
import { LineHeading } from "../shared/molecules"; // Import LineHeading if available or use standard h2
import Image from "next/image";
import { FaCrown } from "react-icons/fa";
import { Avatar } from "../shared/atoms";

type LeaderboardData = {
  id: number;
  title: string;
  description: string;
  avatar: string;
  score: number;
};

type LeaderboardTemplateProps = {
  data: LeaderboardData[];
};

export const LeaderboardTemplate = ({ data }: LeaderboardTemplateProps) => {
  // Sort data by score just in case
  const sortedData = [...data].sort((a, b) => b.score - a.score);
  const topThree = sortedData.slice(0, 3);
  const restData = sortedData.slice(3);

  // Helper to reorder for podium visual: 2nd, 1st, 3rd
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <main className="px-6 lg:px-24 xl:px-48 py-20 mx-auto bg-white dark:bg-zinc-950 transition-colors">
      <div className="text-center mb-24">
        <LineHeading title="Top Talents" />
        <p className="text-gray-600 dark:text-gray-400 mt-4">Siswa berprestasi dengan skor kompetensi tertinggi bulan ini</p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-16 max-w-4xl mx-auto min-h-[300px]">
        {podiumOrder.map((user, index) => {
          if (!user) return null;
          // Rank logic based on index in podiumOrder array [2nd, 1st, 3rd]
          let rank = 0;
          let heightClass = "h-40";
          let colorClass = "bg-gray-100";
          let iconColor = "text-gray-400";
          let orderClass = "";
          if (index === 1) { // 1st Place (Center)
            rank = 1;
            heightClass = "h-56";
            colorClass = "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700";
            iconColor = "text-yellow-500";
            orderClass = "order-1 md:order-none";
          } else if (index === 0) { // 2nd Place (Left)
            rank = 2;
            heightClass = "h-48";
            colorClass = "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700";
            iconColor = "text-gray-400";
            orderClass = "order-2 md:order-none";
          } else { // 3rd Place (Right)
            rank = 3;
            heightClass = "h-40";
            colorClass = "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700";
            iconColor = "text-orange-500";
            orderClass = "order-3 md:order-none";
          }

          return (
            <div key={user.id} className={`flex flex-col items-center w-full md:w-1/3 group ${orderClass}`}>
              {/* Avatar */}
              <div className={`relative mb-4 transition-transform duration-300 ${rank === 1 ? 'w-24 h-24 -mt-12 group-hover:scale-110' : 'w-20 h-20 group-hover:-translate-y-2'}`}>
                {rank === 1 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
                    <FaCrown size={32} />
                  </div>
                )}
                <Avatar
                  src={user.avatar || ''}
                  alt={user.title}
                  size={rank === 1 ? 96 : 80}
                  className={`border-4 ${rank === 1 ? 'border-yellow-400 shadow-yellow-200 shadow-xl' : rank === 2 ? 'border-gray-300' : 'border-orange-300'}`}
                />
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                  {rank}
                </div>
              </div>

              {/* Name & Score */}
              <div className="text-center mb-4">
                <h3 className={`font-bold text-gray-900 dark:text-gray-100 ${rank === 1 ? 'text-xl' : 'text-lg'}`}>{user.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.description}</p>
                <p className={`font-bold mt-1 ${rank === 1 ? 'text-yellow-600 dark:text-yellow-400 text-lg' : 'text-gray-600 dark:text-gray-300'}`}>{user.score} XP</p>
              </div>

              {/* Podium Box */}
              <div className={`w-full ${heightClass} ${colorClass} rounded-t-xl border-t-4 shadow-inner flex items-end justify-center pb-4 opacity-80 hover:opacity-100 transition-opacity`}>
              </div>
            </div>
          )
        })}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <LeaderboardTable data={sortedData.slice(3)} startRank={4} />
      </div>
    </main>
  );
};