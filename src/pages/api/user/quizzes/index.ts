import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';

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
        const now = new Date();

        const quizzes = await (prisma as any).weekly_quizzes.findMany({
            where: {
                is_active: true,
                start_date: { lte: now },
                end_date: { gte: now }
            },
            include: {
                category: true,
                quiz_attempts: {
                    where: { user_id: userId },
                    select: { id: true, score: true, finished_at: true } // check if attempt exists
                }
            },
            orderBy: { end_date: 'asc' }
        });

        // Format for frontend
        const formattedQuizzes = quizzes.map((q: any) => ({
            ...q,
            attempted: q.quiz_attempts.length > 0,
            last_score: q.quiz_attempts.length > 0 ? q.quiz_attempts[0].score : null
        }));

        return res.json(serializeBigInt(formattedQuizzes));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching quizzes' });
    }
}

export default checkAuth(handler);
