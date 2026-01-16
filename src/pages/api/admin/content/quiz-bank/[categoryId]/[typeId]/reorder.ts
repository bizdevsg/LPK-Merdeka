import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { typeId } = req.query;
    const { questions } = req.body; // Array of { id, order }

    if (!typeId || !Array.isArray(questions)) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        // Update order for each question in a transaction
        await (prisma as any).$transaction(
            questions.map((q: { id: string; order: number }) =>
                (prisma as any).question_bank.update({
                    where: { id: BigInt(q.id) },
                    data: { order: q.order }
                })
            )
        );

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating order' });
    }
}

export default checkAdmin(handler as any);
