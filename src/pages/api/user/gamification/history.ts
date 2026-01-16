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

        const logs = await prisma.gamification_logs.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50 // Limit to last 50 entries
        });

        // Fetch User Total Points & Level
        const profile = await prisma.gamification_profile.findUnique({
            where: { user_id: userId }
        });

        // Calculate Rank
        const totalXP = profile?.total_points || 0;
        const higherRankedCount = await prisma.gamification_profile.count({
            where: {
                total_points: { gt: totalXP }
            }
        });
        const rank = higherRankedCount + 1;

        // Total Users
        const totalUsers = await prisma.gamification_profile.count();

        return res.json({
            logs: serializeBigInt(logs),
            summary: serializeBigInt({
                total_points: profile?.total_points || 0,
                level: profile?.level || 1,
                rank,
                totalUsers
            })
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching gamification history' });
    }
}

export default checkAuth(handler);
