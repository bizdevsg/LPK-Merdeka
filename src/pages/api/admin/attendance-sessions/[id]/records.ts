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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid session ID' });
    }

    if (req.method === 'GET') {
        try {
            // Get attendance records for this session with user details
            const records = await prisma.attendance_records.findMany({
                where: { attendance_session_id: BigInt(id) },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { check_in_time: 'asc' }
            });

            // Remap for frontend consistency
            const mappedRecords = records.map((r: any) => ({
                ...r,
                checked_in_at: r.check_in_time, // Alias for frontend
                user: r.users // Map users relation to user field expected by frontend
            }));

            return res.json(serializeBigInt(mappedRecords));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching attendance records' });
        }
    }

    res.status(405).end();
}

export default checkAdmin(handler);
