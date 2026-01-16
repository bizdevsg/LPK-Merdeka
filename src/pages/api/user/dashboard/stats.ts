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

        // 6. Recent Activities (last 5)
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
