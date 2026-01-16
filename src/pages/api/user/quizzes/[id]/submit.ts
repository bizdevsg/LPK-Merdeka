import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';
import { PointsService } from '@/lib/services/points-service';
import { CertificateGenerator } from '@/lib/services/certificate-generator';

const prisma = new PrismaClient() as any;

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query; // Quiz ID
    const { answers } = req.body; // { question_id: answer_value }
    const userId = req.user?.id;

    if (!answers || Object.keys(answers).length === 0) {
        return res.status(400).json({ message: 'No answers provided' });
    }

    try {
        // 1. Validate Quiz & Attempt
        const quiz = await prisma.weekly_quizzes.findUnique({
            where: { id: BigInt(String(id)) },
            include: { quiz_attempts: { where: { user_id: userId } } }
        });

        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        // Allow retake
        // if (quiz.quiz_attempts.length > 0) {
        //     return res.status(400).json({ message: 'You have already submitted this quiz' });
        // }

        // 2. Fetch Questions to Check Answers
        const questionIds = Object.keys(answers).map(qid => BigInt(qid));
        const questions = await prisma.question_bank.findMany({
            where: {
                id: { in: questionIds }
            }
        });

        // 3. Calculate Score
        let correctCount = 0;
        let totalQuestions = questions.length;

        questions.forEach((q: any) => {
            const submittedAnswer = answers[String(q.id)];
            if (submittedAnswer === q.correct_answer) {
                correctCount++;
            }
        });

        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        // 4. Calculate XP Points (Delta Logic for Retakes)
        // Max Points = (Questions * 10) + 50 Bonus (if all correct)

        const calculatePoints = (s: number, totalQ: number) => {
            const cCount = Math.round((s / 100) * totalQ);
            let pts = cCount * 10;
            if (s === 100) pts += 50;
            return pts;
        };

        const maxScoreBefore = quiz.quiz_attempts.reduce((max: number, att: any) => Math.max(max, att.score), 0);
        const prevMaxPoints = calculatePoints(maxScoreBefore, totalQuestions);
        const currentPoints = calculatePoints(score, totalQuestions);

        // Only award points that exceed previous maximum achievement
        let earnedPoints = Math.max(0, currentPoints - prevMaxPoints);

        let certificateUrl = null;

        // 5. Transaction: Create Attempt & Update Gamification
        await prisma.$transaction(async (tx: any) => {
            // Create Attempt
            await tx.quiz_attempts.create({
                data: {
                    user_id: userId,
                    quiz_id: BigInt(String(id)),
                    score: score,
                    answers: JSON.stringify(answers), // Store raw answers
                    started_at: new Date(), // Approximate
                    finished_at: new Date()
                }
            });
        });

        // 6. Award Points (Outside Transaction to use PointsService which has its own transaction)
        await PointsService.awardPoints(userId!, 'quiz', earnedPoints, `quiz_${id}`);

        // 7. Generate Certificate if Score >= 70 (Passing Grade)
        if (score >= 70) {
            // Shorten code to fit VARCHAR(50)
            const shortUid = userId?.substring(0, 8);
            const certCode = `CERT-${id}-${shortUid}-${Date.now()}`;
            certificateUrl = await CertificateGenerator.generate(
                req.user?.name || 'Peserta',
                quiz.title,
                new Date(),
                certCode
            );

            if (certificateUrl) {
                // Check if certificate already exists to prevent duplicates
                const existingCert = await prisma.certificates.findFirst({
                    where: { user_id: userId, quiz_id: BigInt(String(id)) }
                });

                if (!existingCert) {
                    await prisma.certificates.create({
                        data: {
                            user_id: userId,
                            quiz_id: BigInt(String(id)),
                            certificate_code: certCode,
                            file_url: certificateUrl
                        }
                    });
                } else {
                    // Optionally update existing cert? For now, keep the first one.
                    certificateUrl = existingCert.file_url;
                }
            }
        }

        // Prepare detailed results for review
        const results = questions.map((q: any) => {
            const submittedAnswer = answers[String(q.id)];
            const isCorrect = submittedAnswer === q.correct_answer;
            return {
                id: q.id,
                content: q.content,
                options: q.options,
                submittedAnswer,
                isCorrect,
                // Only reveal correct answer and explanation if the user got it right
                correctAnswer: isCorrect ? q.correct_answer : null,
                explanation: isCorrect ? q.explanation : null
            };
        });

        return res.json({
            message: 'Quiz submitted successfully',
            score,
            correctCount,
            totalQuestions,
            earnedPoints,
            certificateUrl,
            results: serializeBigInt(results)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error submitting quiz' });
    }
}

export default checkAuth(handler);
