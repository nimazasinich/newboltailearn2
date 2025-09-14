import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Users, UserPlus, Mail, Shield, User, Crown, Eye } from 'lucide-react';

export default function TeamPage() {
  const [teamMembers] = useState([
    {
      id: 1,
      name: 'علی احمدی',
      email: 'ali.ahmadi@example.com',
      role: 'admin',
      avatar: null,
      lastActive: '۲ دقیقه پیش',
      status: 'online'
    },
    {
      id: 2,
      name: 'سارا محمدی',
      email: 'sara.mohammadi@example.com',
      role: 'trainer',
      avatar: null,
      lastActive: '۱ ساعت پیش',
      status: 'away'
    },
    {
      id: 3,
      name: 'محمد رضایی',
      email: 'mohammad.rezaei@example.com',
      role: 'analyst',
      avatar: null,
      lastActive: '۳ ساعت پیش',
      status: 'offline'
    },
    {
      id: 4,
      name: 'فاطمه کریمی',
      email: 'fatemeh.karimi@example.com',
      role: 'viewer',
      avatar: null,
      lastActive: '۱ روز پیش',
      status: 'offline'
    }
  ]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'trainer':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'analyst':
        return <User className="h-4 w-4 text-green-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر سیستم';
      case 'trainer':
        return 'آموزش‌دهنده';
      case 'analyst':
        return 'تحلیلگر';
      case 'viewer':
        return 'مشاهده‌گر';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'trainer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'analyst':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مدیریت تیم</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            مدیریت اعضای تیم و دسترسی‌ها
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 ml-2" />
          دعوت عضو جدید
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل اعضا</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آنلاین</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(member => member.status === 'online').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مدیران</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(member => member.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آموزش‌دهندگان</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(member => member.role === 'trainer').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            اعضای تیم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      آخرین فعالیت: {member.lastActive}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
                    {getRoleIcon(member.role)}
                    {getRoleLabel(member.role)}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      ویرایش
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>نقش‌ها و دسترسی‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold">مدیر سیستم</h3>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• دسترسی کامل</li>
                <li>• مدیریت کاربران</li>
                <li>• تنظیمات سیستم</li>
                <li>• حذف داده‌ها</li>
              </ul>
            </div>

            <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">آموزش‌دهنده</h3>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• آموزش مدل‌ها</li>
                <li>• مدیریت اسناد</li>
                <li>• مشاهده تحلیل‌ها</li>
                <li>• صادرات داده</li>
              </ul>
            </div>

            <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">تحلیلگر</h3>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• مشاهده تحلیل‌ها</li>
                <li>• مدیریت اسناد</li>
                <li>• صادرات داده</li>
              </ul>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">مشاهده‌گر</h3>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• مشاهده تحلیل‌ها</li>
                <li>• دسترسی محدود</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}