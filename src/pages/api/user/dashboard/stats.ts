import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';

const prisma = new PrismaClient() as any;

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const userId = req.user?.id;

        // 1. Get User's Gamification Profile
        const profile = await prisma.gamification_profile.findUnique({
            where: { user_id: userId }
        });

        const totalXP = profile?.total_points || 0;
        const level = profile?.level || 1;

        // 2. Calculate Rank
        const higherRankedCount = await prisma.gamification_profile.count({
            where: {
                total_points: { gt: totalXP }
            }
        });
        const rank = higherRankedCount + 1;

        // 3. Total Users
        const totalUsers = await prisma.gamification_profile.count();

        // 4. Certificates Count
        const certificatesCount = await prisma.certificates.count({
            where: { user_id: userId }
        });

        // 5. Pending Quizzes (Active quizzes not yet attempted)
        const now = new Date();
        const activeQuizzes = await prisma.weekly_quizzes.findMany({
            where: {
                is_active: true,
                start_date: { lte: now },
                end_date: { gte: now }
            },
            select: { id: true }
        });

        const attemptedQuizIds = await prisma.quiz_attempts.findMany({
            where: {
                user_id: userId,
                quiz_id: { in: activeQuizzes.map((q: any) => q.id) }
            },
            select: { quiz_id: true }
        });

        const attemptedSet = new Set(attemptedQuizIds.map((a: any) => a.quiz_id.toString()));
        const pendingQuizzes = activeQuizzes.filter((q: any) => !attemptedSet.has(q.id.toString())).length;

        // 6. Calculate Streak from Logs
        const loginLogs = await prisma.gamification_logs.findMany({
            where: {
                user_id: userId,
                action_type: 'daily_login'
            },
            select: {
                created_at: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Process logs to finding distinct dates (YYYY-MM-DD)
        // Process logs to finding distinct dates (YYYY-MM-DD)
        const dateStrings = loginLogs.map((log: any) => {
            const d = new Date(log.created_at);
            return d.toISOString().split('T')[0];
        });

        const uniqueDatesSet = new Set<string>(dateStrings);

        const distinctDates: string[] = Array.from(uniqueDatesSet).sort((a: string, b: string) => {
            return new Date(b).getTime() - new Date(a).getTime();
        });

        let currentStreak = 0;
        let maxStreak = 0;

        // Calculate Current Streak
        if (distinctDates.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Check if the most recent login is today or yesterday
            // If most recent is older than yesterday, streak is broken (0).
            const lastLoginDate = distinctDates[0];

            if (lastLoginDate === today || lastLoginDate === yesterday) {
                currentStreak = 1;
                let currentDate = new Date(lastLoginDate);

                for (let i = 1; i < distinctDates.length; i++) {
                    const prevDateStr = distinctDates[i];
                    const prevDate = new Date(prevDateStr);

                    // Difference in days
                    const diffTime = currentDate.getTime() - prevDate.getTime();
                    const diffDays = diffTime / (1000 * 3600 * 24);

                    if (Math.round(diffDays) === 1) {
                        currentStreak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // Calculate Max Streak
        // Iterate through all sorted distinct dates
        if (distinctDates.length > 0) {
            let tempStreak = 1;
            let maxFound = 1;

            for (let i = 0; i < distinctDates.length - 1; i++) {
                const currentDate = new Date(distinctDates[i]);
                const nextDate = new Date(distinctDates[i + 1]); // older date

                const diffTime = currentDate.getTime() - nextDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);

                if (Math.round(diffDays) === 1) {
                    tempStreak++;
                } else {
                    if (tempStreak > maxFound) maxFound = tempStreak;
                    tempStreak = 1;
                }
            }
            if (tempStreak > maxFound) maxFound = tempStreak;
            maxStreak = maxFound;
        }

        // 7. Recent Activities (last 5)
        const recentActivities = await prisma.gamification_logs.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 5,
            select: {
                action_type: true,
                points: true,
                created_at: true
            }
        });

        return res.json(serializeBigInt({
            totalXP,
            level,
            rank,
            totalUsers,
            certificatesCount,
            pendingQuizzes,
            currentStreak,
            maxStreak,
            recentActivities: recentActivities.map((a: any) => ({
                type: a.action_type,
                points: a.points,
                created_at: a.created_at
            }))
        }));

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
}

export default checkAuth(handler);
