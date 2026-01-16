import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

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
            const { type_id } = req.query;

            const questions = await (prisma as any).question_bank.findMany({
                where: type_id ? { type_id: BigInt(String(type_id)) } : undefined,
                include: {
                    type: {
                        include: {
                            category: true
                        }
                    }
                },
                orderBy: [
                    { order: 'asc' },
                    { created_at: 'desc' }
                ]
            });
            return res.json(serializeBigInt(questions));
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ message: 'Error fetching questions' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { content, options, correct_answer, explanation, type_id } = req.body;

            console.log('Creating question for type_id:', type_id);

            if (!content || !options || !correct_answer || !type_id) {
                return res.status(400).json({ message: 'Content, options, correct answer, and type ID are required' });
            }

            // Calculate next order
            const lastQuestion = await (prisma as any).question_bank.findFirst({
                where: { type_id: BigInt(type_id) },
                orderBy: { order: 'desc' },
                select: { order: true }
            });
            const nextOrder = (lastQuestion?.order ?? -1) + 1;

            // Ensure options is stringified JSON if it comes as an object/array
            const optionsString = typeof options === 'string' ? options : JSON.stringify(options);

            const question = await (prisma as any).question_bank.create({
                data: {
                    content,
                    options: optionsString,
                    correct_answer,
                    explanation,
                    type_id: BigInt(type_id),
                    order: nextOrder
                }
            });
            return res.json(serializeBigInt(question));
        } catch (error) {
            console.error('Error creating question:', error);
            return res.status(500).json({ message: 'Error creating question' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler);
