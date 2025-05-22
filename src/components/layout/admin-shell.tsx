// src/components/layout/admin-shell.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User,
  Shield
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const routes = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: pathname === '/admin',
    },
    {
      href: '/admin/customers',
      label: 'Customers',
      icon: <Users className="w-5 h-5" />,
      active: pathname.startsWith('/admin/customers'),
    },
    {
      href: '/admin/analytics',
      label: 'Platform Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      active: pathname.startsWith('/admin/analytics'),
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      active: pathname.startsWith('/admin/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center p-4 bg-white border-b">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="mx-auto">
          <h1 className="text-xl font-semibold">Review Return Admin</h1>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex items-center">
            <Shield className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold">Admin Portal</h1>
          </div>

          <nav className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
            <ul className="space-y-1">
              {routes.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      route.active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {route.icon}
                    <span className="ml-3">{route.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`pt-4 lg:pt-0 lg:pl-64 min-h-screen`}>
        {/* Content */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}