import React, { useState } from 'react';
import { ModernCard } from './ui/ModernCard';
import { SlimBadge } from './ui/SlimBadge';
import { Button } from './ui/Button';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  Crown,
  User,
  Settings,
  MoreVertical,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mock Data برای Team
const MOCK_TEAM_MEMBERS = [
  {
    id: 1,
    name: 'احمد محمدی',
    email: 'ahmad.mohammadi@example.com',
    role: 'admin',
    title: 'مدیر تیم فنی',
    avatar: null,
    status: 'online',
    joined_date: '2023-01-15',
    last_activity: new Date(Date.now() - 300000).toISOString(),
    projects: 12,
    models_trained: 45,
    department: 'Engineering'
  },
  {
    id: 2,
    name: 'فاطمه احمدی',
    email: 'fatemeh.ahmadi@example.com',
    role: 'trainer',
    title: 'متخصص آموزش مدل',
    avatar: null,
    status: 'online',
    joined_date: '2023-02-20',
    last_activity: new Date(Date.now() - 600000).toISOString(),
    projects: 8,
    models_trained: 32,
    department: 'Data Science'
  },
  {
    id: 3,
    name: 'علی رضایی',
    email: 'ali.rezaei@example.com',
    role: 'trainer',
    title: 'توسعه‌دهنده AI',
    avatar: null,
    status: 'away',
    joined_date: '2023-03-10',
    last_activity: new Date(Date.now() - 3600000).toISOString(),
    projects: 6,
    models_trained: 28,
    department: 'Research'
  },
  {
    id: 4,
    name: 'مریم کریمی',
    email: 'maryam.karimi@example.com',
    role: 'viewer',
    title: 'تحلیلگر داده',
    avatar: null,
    status: 'offline',
    joined_date: '2023-04-05',
    last_activity: new Date(Date.now() - 86400000).toISOString(),
    projects: 4,
    models_trained: 15,
    department: 'Analytics'
  },
  {
    id: 5,
    name: 'حسن موسوی',
    email: 'hassan.mousavi@example.com',
    role: 'trainer',
    title: 'مهندس نرم‌افزار',
    avatar: null,
    status: 'online',
    joined_date: '2023-05-12',
    last_activity: new Date(Date.now() - 1800000).toISOString(),
    projects: 10,
    models_trained: 38,
    department: 'Engineering'
  }
];

const MOCK_TEAM_STATS = {
  total_members: 5,
  online_members: 3,
  total_projects: 40,
  models_this_month: 158,
  avg_accuracy: 89.5,
  collaboration_score: 94
};

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredMembers = MOCK_TEAM_MEMBERS.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'trainer': return 'info';
      case 'viewer': return 'neutral';
      default: return 'neutral';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'trainer': return <Shield className="w-3 h-3" />;
      case 'viewer': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدیر';
      case 'trainer': return 'آموزشگر';
      case 'viewer': return 'بیننده';
      default: return 'نامشخص';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'away': return 'warning';
      case 'offline': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'آنلاین';
      case 'away': return 'غایب';
      case 'offline': return 'آفلاین';
      default: return 'نامشخص';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    return `${days} روز پیش`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-slate-900 dark:text-slate-100 mb-2">
              تیم و همکاران
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              مدیریت اعضای تیم و نقش‌های کاربری
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <Settings className="w-4 h-4 ml-2" />
              تنظیمات نقش‌ها
            </Button>
            <Button onClick={() => setShowInviteModal(true)} className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 ml-2" />
              دعوت عضو جدید
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_TEAM_STATS.total_members}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">کل اعضا</p>
            <div className="mt-2">
              <SlimBadge variant="success" size="xs">{MOCK_TEAM_STATS.online_members} آنلاین</SlimBadge>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_TEAM_STATS.total_projects}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">پروژه‌های فعال</p>
            <div className="mt-2">
              <SlimBadge variant="info" size="xs">در حال انجام</SlimBadge>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-4">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_TEAM_STATS.models_this_month}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">مدل این ماه</p>
            <div className="mt-2">
              <SlimBadge variant="success" size="xs">+23% از ماه قبل</SlimBadge>
            </div>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {MOCK_TEAM_STATS.collaboration_score}%
            </h3>
            <p className="text-slate-600 dark:text-slate-400">امتیاز همکاری</p>
            <div className="mt-2">
              <SlimBadge variant="warning" size="xs">عالی</SlimBadge>
            </div>
          </ModernCard>
        </div>

        {/* Search and Filter */}
        <ModernCard variant="outlined">
          <div className="flex flex-col md:flex-row gap-4 p-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجو در اعضای تیم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="all">همه نقش‌ها</option>
                <option value="admin">مدیر</option>
                <option value="trainer">آموزشگر</option>
                <option value="viewer">بیننده</option>
              </select>
            </div>
          </div>
        </ModernCard>

        {/* Team Members */}
        <ModernCard variant="outlined">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                اعضای تیم
              </h3>
              <SlimBadge variant="neutral">{filteredMembers.length} عضو</SlimBadge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {/* Avatar and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-emerald-500' :
                          member.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.name}
                        </h4>
                        <p className="text-sm text-slate-500">{member.title}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Role and Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <SlimBadge variant={getRoleColor(member.role)} size="sm">
                      {getRoleIcon(member.role)}
                      {getRoleText(member.role)}
                    </SlimBadge>
                    <SlimBadge variant={getStatusColor(member.status)} size="sm">
                      {getStatusText(member.status)}
                    </SlimBadge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>عضو از {new Date(member.joined_date).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>آخرین فعالیت: {formatLastActivity(member.last_activity)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {member.projects}
                      </div>
                      <div className="text-xs text-slate-500">پروژه</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-slate-700 rounded-lg">
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {member.models_trained}
                      </div>
                      <div className="text-xs text-slate-500">مدل</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                      <Mail className="w-3 h-3 ml-1" />
                      پیام
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                      <Settings className="w-3 h-3 ml-1" />
                      تنظیمات
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <ModernCard className="w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">دعوت عضو جدید</h3>
                <p className="text-slate-600 mb-6">فرم دعوت عضو جدید در حال توسعه است...</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                    انصراف
                  </Button>
                  <Button onClick={() => setShowInviteModal(false)}>
                    ارسال دعوت
                  </Button>
                </div>
              </div>
            </ModernCard>
          </div>
        )}
      </div>
    </div>
  );
}