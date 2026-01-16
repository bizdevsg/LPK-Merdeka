import type { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';
import { serializeBigInt } from '@/lib/utils';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { type } = req.query;

        if (!type || (type !== 'ebook' && type !== 'video')) {
            return res.status(400).json({ message: 'Valid type (ebook or video) is required' });
        }

        const folders = await (prisma as any).content_folders.findMany({
            where: { type: String(type) },
            include: {
                _count: {
                    select: { ebooks: true, videos: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return res.json(serializeBigInt(folders));
    } catch (error) {
        console.error('Error fetching user folders:', error);
        return res.status(500).json({ message: 'Error fetching folders' });
    }
}

export default checkAuth(handler as any);
