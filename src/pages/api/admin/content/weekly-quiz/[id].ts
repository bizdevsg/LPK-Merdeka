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
    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const { title, category_id, start_date, end_date, config, is_active } = req.body;


            const quiz = await prisma.weekly_quizzes.update({
                where: { id: BigInt(String(id)) },
                data: {
                    title,
                    category_id: category_id ? BigInt(category_id) : undefined,
                    start_date: start_date ? new Date(start_date) : undefined,
                    end_date: end_date ? new Date(end_date) : undefined,
                    config,
                    is_active: is_active !== undefined ? is_active : undefined
                }
            });
            return res.json(serializeBigInt(quiz));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error updating quiz' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.weekly_quizzes.delete({
                where: { id: BigInt(String(id)) }
            });
            return res.status(200).json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting quiz' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler);
