import { NextApiRequest, NextApiResponse } from 'next';
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

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { category } = req.query;
        const where = category ? { category: category as string } : {};
        const faqs = await prisma.cms_faq.findMany({
            where,
            orderBy: { order: 'asc' }
        });
        return res.json(serializeBigInt(faqs));
    }

    if (req.method === 'POST') {
        const { question, answer, category, order } = req.body;
        const faq = await prisma.cms_faq.create({
            data: { question, answer, category, order: parseInt(order || '0') }
        });
        return res.json(serializeBigInt(faq));
    }
}
export default checkAdmin(handler);
