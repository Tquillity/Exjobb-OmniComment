// Frontend/extension/src/components/SettingsMenu.jsx
import React from 'react';
import { Menu } from '@headlessui/react';
import { 
  Settings, Info, Monitor, 
  BarChart2, CreditCard, MessageSquare, 
  AlertCircle, Download, Bookmark,
  User, Shield, Palette
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

const SettingsMenu = () => {
  const { navigateTo } = useNavigation();
  const { isAuthenticated } = useAuth();
  
  // Base menu items (always available)
  const publicMenuItems = [
    {
      icon: Palette,
      label: 'Appearance',
      action: () => navigateTo('settings', { category: 'appearance' }),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: Info,
      label: 'About',
      action: () => navigateTo('about'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: Monitor,
      label: 'Go To WebApp',
      action: () => window.open('http://localhost:5173/', '_blank'),
      className: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
    }
  ];

  // Authentication required menu items
  const authenticatedMenuItems = [
    {
      icon: MessageSquare,
      label: 'My Comments',
      action: () => navigateTo('myComments'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: User,
      label: 'Profile Settings',
      action: () => navigateTo('settings', { category: 'profile' }),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      action: () => navigateTo('settings', { category: 'privacy' }),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: BarChart2,
      label: 'Statistics',
      action: () => navigateTo('statistics'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: CreditCard,
      label: 'Manage Subscription',
      action: () => navigateTo('subscription'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: Bookmark,
      label: 'Bookmarked Pages',
      action: () => navigateTo('bookmarks'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: Download,
      label: 'Export Data',
      action: () => navigateTo('export'),
      className: 'text-gray-700 dark:text-gray-200'
    },
    {
      icon: AlertCircle,
      label: 'Report Issues',
      action: () => navigateTo('report'),
      className: 'text-gray-700 dark:text-gray-200'
    }
  ];

  // Combine menu items based on authentication state
  const menuItems = isAuthenticated 
    ? [...authenticatedMenuItems, ...publicMenuItems]
    : publicMenuItems;

  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white 
                             dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black 
                             ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm ${item.className}`}
                    onClick={item.action}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default SettingsMenu;