import { NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

const prisma = new PrismaClient() as any;

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value
    ));
}

export default checkAdmin(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const types = await prisma.question_types.findMany({
                select: {
                    id: true,
                    name: true,
                    category_id: true,
                    _count: {
                        select: { question_bank: true }
                    }
                },
                orderBy: { name: 'asc' }
            });

            return res.json(serializeBigInt(types));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching types' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, category_id } = req.body;

            if (!name || !category_id) {
                return res.status(400).json({ message: 'Name and Category ID are required' });
            }

            const type = await prisma.question_types.create({
                data: {
                    name,
                    category_id: BigInt(category_id)
                }
            });
            return res.json(serializeBigInt(type));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating type' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
});
