import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

const prisma = new PrismaClient() as any;

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const quizzes = await prisma.weekly_quizzes.findMany({
                include: {
                    category: true,
                    _count: {
                        select: { quiz_attempts: true }
                    }
                },
                orderBy: { start_date: 'desc' }
            });
            return res.json(serializeBigInt(quizzes));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching quizzes' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { title, category_id, start_date, end_date, config } = req.body;

            if (!title || !category_id || !start_date || !end_date) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // config is already JSON stringified from frontend


            const quiz = await prisma.weekly_quizzes.create({
                data: {
                    title,
                    category_id: BigInt(category_id),
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    config,
                    is_active: true
                }
            });
            return res.json(serializeBigInt(quiz));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating quiz' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler);
