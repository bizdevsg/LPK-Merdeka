import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
}

export default async function handler(req: any, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const leaderboard = await prisma.gamification_profile.findMany({
            take: 10, // Top 10 for public display
            orderBy: { total_points: 'desc' },
            include: {
                user: {
                    select: { name: true, image: true, role: true, photo_url: true } // Minimal info for public
                }
            }
        });

        // Add Rank & Map
        const ranked = leaderboard.map((entry: any, index: number) => ({
            id: index + 1, // Frontend expects generic ID
            title: entry.user.name,
            description: entry.user.role || 'Member', // Use role as description
            avatar: entry.user.photo_url || entry.user.image,
            score: entry.total_points
        }));

        return res.json(serializeBigInt(ranked));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching leaderboard' });
    }
}
