import { NextApiResponse } from 'next';
import { checkAuth, AuthenticatedRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const twoFactor = await prisma.twoFactor.findUnique({
            where: { userId }
        });

        if (!twoFactor || !twoFactor.backupCodes) {
            return res.status(404).json({ message: 'No backup codes found' });
        }

        let codes: string[] = [];
        try {
            codes = JSON.parse(twoFactor.backupCodes);
        } catch (e) {
            // Fallback if stored as comma separated or other format
            codes = [];
        }

        return res.status(200).json({
            codes
        });
    } catch (error) {
        console.error('Fetch backup codes error:', error);
        return res.status(500).json({ message: 'Error fetching backup codes' });
    }
}

export default checkAuth(handler);
