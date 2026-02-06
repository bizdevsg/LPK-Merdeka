import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import nodemailer from "nodemailer";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    database: prismaAdapter(prisma, {
        provider: 'mysql',
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        requireEmailVerification: false, // Set to true if verification is needed
        async sendResetPassword({ user, url }) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const mailOptions = {
                    from: process.env.SMTP_FROM || '"LPK Merdeka" <no-reply@lpk-merdeka.com>',
                    to: user.email,
                    subject: "Reset Your Password - LPK PB Merdeka",
                    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Password Reset</h1>
                            <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 10px 0 0;">LPK PB Merdeka</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello <strong>${user.name || 'there'}</strong>,</p>
                            <p style="color: #6b7280; font-size: 15px; line-height: 1.7; margin: 0 0 30px;">We received a request to reset the password for your LPK PB Merdeka account. Click the button below to create a new password:</p>
                            
                            <!-- Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 30px;">
                                        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 40px; border-radius: 10px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">Reset Password</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Note -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                                    <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
                                </p>
                            </div>
                            
                            <!-- Alternative Link -->
                            <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="color: #6b7280; font-size: 12px; word-break: break-all; margin: 10px 0 0; padding: 12px; background-color: #f9fafb; border-radius: 8px;">${url}</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center; line-height: 1.6;">
                                © ${new Date().getFullYear()} LPK PB Merdeka. All rights reserved.<br>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                    `,
                };

                const result = await transporter.sendMail(mailOptions);
            } catch (error) {
                throw error;
            }
        },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
                required: false,
            },
            gender: {
                type: 'string',
                required: false,
            },
            birthDate: {
                type: 'date',
                required: false,
            },
            birthPlace: {
                type: 'string',
                required: false,
            },
            address: {
                type: 'string',
                required: false,
            },
            phoneNumber: {
                type: 'string',
                required: false,
            },
            photo_url: {
                type: 'string',
                required: false,
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        }
    },
    plugins: [
        twoFactor({
            issuer: 'LPK PB Merdeka', // Name shown in authenticator app
            totpOptions: {
                period: 30, // 30 seconds validity
                digits: 6,  // 6-digit code
            }
        })
    ]
});

export type Session = typeof auth.$Infer.Session;

import { fromNodeHeaders } from "better-auth/node";
import type { NextApiRequest, NextApiResponse } from "next";

export interface AuthenticatedRequest extends NextApiRequest {
    user?: typeof auth.$Infer.Session.user;
    session?: typeof auth.$Infer.Session.session;
}

export const checkAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) => async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;

    return handler(req, res);
};

export const checkAdmin = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<any>) => async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    console.log('[CheckAdmin] Session:', session ? 'Found' : 'Missing');
    if (session) {
        console.log('[CheckAdmin] User ID:', session.user.id);
        console.log('[CheckAdmin] User Role:', (session.user as any).role);
    }

    // @ts-ignore - role is added via additionalFields but TS might not pick it up on the session type immediately
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superAdmin')) {
        console.log('[CheckAdmin] Access Denied - 403');
        return res.status(403).json({ message: "Forbidden" });
    }

    req.user = session.user;
    req.session = session.session;

    return handler(req, res);
};
