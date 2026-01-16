import type { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';
import { serializeBigInt } from '../../../lib/utils';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { folder_id } = req.query;

        const whereClause = folder_id ? { folder_id: BigInt(folder_id as string) } : {};

        const ebooks = await (prisma as any).ebooks.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                folder: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return res.json(serializeBigInt(ebooks));
    } catch (error) {
        console.error('Error fetching ebooks:', error);
        return res.status(500).json({ message: 'Error fetching ebooks' });
    }
}

export default checkAuth(handler as any);
