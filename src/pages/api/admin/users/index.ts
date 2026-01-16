import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkAdmin, AuthenticatedRequest, auth } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany({
                where: { role: 'user' },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    image: true,
                    photo_url: true
                }
            });

            const serializedUsers = users.map(u => ({
                ...u,
                id: u.id.toString(),
                created_at: u.createdAt.toISOString()
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
            // Check if user exists first to return friendly 409
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists' });
            }

            // Use Better Auth to create the user. This ensures Account creation and correct password hashing.
            // We do not pass headers to avoid interfering with current admin session.
            const result = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                    role: role || 'user' // Try passing role if supported by schema
                }
            });

            // If result is null/undefined or has error (depends on BA version, but usually throws or returns object)
            // Assuming it returns the session/user object on success.

            if (!result) {
                throw new Error("Failed to create user via auth system");
            }

            // Explicitly force role update via Prisma to be 100% sure, as signUpEmail typically ignores unauthorized fields for security
            // unless 'admin' logic overrides it, but we are calling as anonymous here (no headers).
            // The user returned by signUpEmail might be the user object.
            let userId = result.user?.id;

            if (userId) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: role || 'user' }
                });
            } else {
                // Fallback: try to find the user we just created by email
                const newUser = await prisma.user.findUnique({ where: { email } });
                if (newUser) {
                    userId = newUser.id;
                    await prisma.user.update({
                        where: { id: userId },
                        data: { role: role || 'user' }
                    });
                }
            }

            const finalUser = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            return res.status(201).json({
                message: 'User created successfully',
                user: { ...finalUser, id: finalUser?.id.toString() }
            });
        } catch (error: any) {
            // Handle Better Auth errors
            if (error?.body?.message) {
                return res.status(400).json({ message: error.body.message });
            }
            if (error?.message) {
                // duplicate key or similar
                if (error.message.includes('already exists')) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
                console.error("Auth Error:", error);
                return res.status(500).json({ message: error.message });
            }
            console.error(error);
            return res.status(500).json({ message: 'Error creating user' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}

export default checkAdmin(handler as any);
