import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FaUsers, FaCalendarCheck, FaUserShield } from 'react-icons/fa';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '...', icon: <FaUsers />, color: 'bg-blue-500' },
        { label: 'Total Admins', value: '...', icon: <FaUserShield />, color: 'bg-purple-500' },
        { label: 'Active Sessions', value: '...', icon: <FaCalendarCheck />, color: 'bg-green-500' },
    ]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user && user.role !== 'admin' && user.role !== 'superAdmin') {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats([
                        { label: 'Total Users', value: data.totalUsers.toString(), icon: <FaUsers />, color: 'bg-blue-500' },
                        { label: 'Total Admins', value: data.totalAdmins.toString(), icon: <FaUserShield />, color: 'bg-purple-500' },
                        { label: 'Active Sessions', value: data.activeSessions.toString(), icon: <FaCalendarCheck />, color: 'bg-green-500' },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        if (isAuthenticated && (user?.role === 'admin' || user?.role === 'superAdmin')) {
            fetchStats();
        }
    }, [isAuthenticated, user]);

    if (!isAuthenticated || (user && user.role !== 'admin' && user.role !== 'superAdmin')) {
        return null; // Or loading spinner
    }

    return (
        <AdminLayout title="Dashboard">
            <Head>
                <title>Admin Dashboard | LPK Backpanel</title>
            </Head>

            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h2>
                        <p className="text-gray-500">Here's what's happening with your platform today.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-lg ${stat.color} text-white flex items-center justify-center text-xl shadow-lg shadow-${stat.color.replace('bg-', '')}/30`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
