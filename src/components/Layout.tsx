import React from 'react';
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import InviteColleaguesModal from './InviteColleaguesModal';
import {
  HomeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t, isReady } = useTranslation();

  // Don't render until translations are ready
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Role-based navigation
  const getNavigation = () => {
    const baseNavigation = [
      { name: t('navigation.dashboard'), href: '/dashboard', icon: HomeIcon },
    ];

    // Add navigation items based on user role
    if (user?.role === 'admin' || user?.role === 'manager') {
      baseNavigation.push(
        { name: t('navigation.accounting'), href: '/dashboard/accounting', icon: CurrencyDollarIcon },
        { name: t('navigation.crm'), href: '/dashboard/crm', icon: UserGroupIcon },
        { name: t('navigation.invoices'), href: '/dashboard/invoices', icon: DocumentTextIcon },
        { name: t('navigation.tasks'), href: '/dashboard/tasks', icon: DocumentTextIcon }
      );
    } else if (user?.role === 'accountant') {
      baseNavigation.push(
        { name: t('navigation.accounting'), href: '/dashboard/accounting', icon: CurrencyDollarIcon },
        { name: t('navigation.invoices'), href: '/dashboard/invoices', icon: DocumentTextIcon }
      );
    } else if (user?.role === 'employee') {
      baseNavigation.push(
        { name: t('navigation.tasks'), href: '/dashboard/tasks', icon: DocumentTextIcon }
      );
    }

    return baseNavigation;
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button - Better positioned with consistent spacing */}
      <div className="lg:hidden fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">BizCore SaaS</h1>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-40 lg:hidden`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-lg sm:text-xl font-bold text-white">BizCore SaaS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-1">
            {/* Show Invite Colleagues button only for admin users */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <UserGroupIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{t('inviteColleagues.title')}</span>
              </button>
            )}
            <Link
              to="/dashboard/profile"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <UserIcon className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t('navigation.settings')}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-gray-800 hover:text-red-300 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{t('navigation.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top navigation - Only show on desktop */}
        <div className="hidden lg:block bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Page content - Add top padding for mobile header */}
        <main className="flex-1">
          <div className="pt-16 lg:pt-0 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Invite Colleagues Modal */}
      <InviteColleaguesModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
};

export default Layout;
