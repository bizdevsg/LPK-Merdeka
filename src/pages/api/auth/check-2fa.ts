import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: { twoFactor: true }
        });

        if (!user) {
            return res.status(200).json({ require2FA: false });
        }

        const require2FA = user.twoFactorEnabled && user.twoFactor?.enabled;

        return res.status(200).json({ require2FA });

    } catch (error) {
        console.error("Check 2FA error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
