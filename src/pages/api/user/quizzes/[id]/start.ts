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

    const { id } = req.query;
    const userId = req.user?.id;

    try {
        // 1. Fetch Quiz Details
        const quiz = await prisma.weekly_quizzes.findUnique({
            where: { id: BigInt(String(id)) },
            include: { quiz_attempts: { where: { user_id: userId } } }
        });

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        if (!quiz.is_active) return res.status(400).json({ message: 'Quiz is not active' });

        const now = new Date();
        if (now < new Date(quiz.start_date) || now > new Date(quiz.end_date)) {
            return res.status(400).json({ message: 'Quiz is not currently open' });
        }

        // Allow retake (remove block)
        // if (quiz.quiz_attempts.length > 0) {
        //     return res.status(400).json({ message: 'You have already attempted this quiz' });
        // }

        // 2. Parse Config (optional, for future use)
        let questionCount = 10;
        let duration = 30;
        let config: any = {};
        try {
            config = JSON.parse(quiz.config || '{}');
            if (config.question_count) questionCount = config.question_count;
            if (config.duration) duration = config.duration;
        } catch (e) { }

        // 3. Fetch Questions from quiz_question_order (ordered questions)
        const questionOrders = await prisma.quiz_question_order.findMany({
            where: { quiz_id: BigInt(String(id)) },
            include: {
                question: {
                    select: {
                        id: true,
                        content: true,
                        options: true,
                        type_id: true,
                        // Exclude correct_answer and explanation
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        if (questionOrders.length === 0) {
            // Fallback: If no questions assigned via junction table, use type-based questions (preferred) or category-based
            const typeId = config.type_id;

            const whereClause = typeId
                ? { type_id: BigInt(String(typeId)) }
                : { type: { category_id: quiz.category_id } };

            const questions = await prisma.question_bank.findMany({
                where: whereClause,
                select: {
                    id: true,
                    content: true,
                    options: true,
                    type_id: true,
                },
                take: questionCount
            });

            if (questions.length === 0) {
                return res.status(500).json({ message: 'No questions available for this quiz' });
            }

            return res.json({
                questions: serializeBigInt(questions),
                duration
            });
        }

        // 4. Extract questions in order
        const selected = questionOrders.map((qo: any) => qo.question);

        return res.json({
            questions: serializeBigInt(selected),
            duration
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error starting quiz' });
    }
}

export default checkAuth(handler);
