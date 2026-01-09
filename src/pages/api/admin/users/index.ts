import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkAdmin, AuthenticatedRequest } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const users = await prisma.users.findMany({
                where: { role: 'user' },
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true
                }
            });

            const serializedUsers = users.map(u => ({
                ...u,
                id: u.id.toString(),
                created_at: u.created_at?.toISOString()
            }));

            return res.status(200).json(serializedUsers);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error fetching users' });
        }
    }

    if (req.method === 'POST') {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.users.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'user',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });

            return res.status(201).json({
                message: 'User created successfully',
                user: { ...newUser, id: newUser.id.toString() }
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(409).json({ message: 'Email already exists' });
            }
            console.error(error);
            return res.status(500).json({ message: 'Error creating user' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler as any);
