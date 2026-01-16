import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            // Get questions assigned to this quiz with their order
            const questionOrders = await (prisma as any).quiz_question_order.findMany({
                where: { quiz_id: BigInt(id as string) },
                include: {
                    question: {
                        select: {
                            id: true,
                            content: true,
                            options: true,
                            correct_answer: true,
                            type_id: true
                        }
                    }
                },
                orderBy: { order: 'asc' }
            });

            const formatted = questionOrders.map((qo: any) => ({
                id: qo.question.id,
                content: qo.question.content,
                options: qo.question.options,
                correct_answer: qo.question.correct_answer,
                type_id: qo.question.type_id,
                order: qo.order
            }));

            return res.json(serializeBigInt(formatted));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching questions' });
        }
    }

    if (req.method === 'POST') {
        // Add question to quiz
        try {
            const { question_id } = req.body;

            // Get current max order
            const maxOrder = await (prisma as any).quiz_question_order.findFirst({
                where: { quiz_id: BigInt(id as string) },
                orderBy: { order: 'desc' },
                select: { order: true }
            });

            const newOrder = maxOrder ? maxOrder.order + 1 : 0;

            await (prisma as any).quiz_question_order.create({
                data: {
                    quiz_id: BigInt(id as string),
                    question_id: BigInt(question_id),
                    order: newOrder
                }
            });

            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error adding question' });
        }
    }

    if (req.method === 'DELETE') {
        // Remove question from quiz
        try {
            const { question_id } = req.body;

            await (prisma as any).quiz_question_order.deleteMany({
                where: {
                    quiz_id: BigInt(id as string),
                    question_id: BigInt(question_id)
                }
            });

            return res.json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error removing question' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler as any);
