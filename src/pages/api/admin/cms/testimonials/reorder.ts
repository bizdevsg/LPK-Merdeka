import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

interface ReorderItem {
    id: string;
    order: number;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { items } = req.body as { items: ReorderItem[] };

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid items array' });
        }

        // Update all items in a transaction
        await prisma.$transaction(
            items.map((item) =>
                (prisma as any).cms_testimonials.update({
                    where: { id: BigInt(item.id) },
                    data: { order: item.order }
                })
            )
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error reordering testimonials:', error);
        return res.status(500).json({ message: 'Error reordering testimonials' });
    }
}

export default checkAdmin(handler);
