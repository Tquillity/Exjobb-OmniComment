// Frontend/extension/src/components/SettingsMenu.jsx
import React from 'react';
import { Menu } from '@headlessui/react';
import { 
  MoreVertical, Settings, Info, Monitor, 
  BarChart2, CreditCard, MessageSquare, 
  AlertCircle, Download, Bookmark
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

const SettingsMenu = () => {
  const { navigateTo } = useNavigation();
  
  const menuItems = [
    {
      icon: Settings,
      label: 'Settings',
      action: () => navigateTo('settings'),
      className: 'text-gray-700'
    },
    {
      icon: BarChart2,
      label: 'Statistics',
      action: () => navigateTo('statistics'),
      className: 'text-gray-700'
    },
    {
      icon: CreditCard,
      label: 'Manage Subscription',
      action: () => navigateTo('subscription'),
      className: 'text-gray-700'
    },
    {
      icon: MessageSquare,
      label: 'My Comments',
      action: () => navigateTo('myComments'),
      className: 'text-gray-700'
    },
    {
      icon: AlertCircle,
      label: 'Report Issues',
      action: () => navigateTo('report'),
      className: 'text-gray-700'
    },
    {
      icon: Download,
      label: 'Export Data',
      action: () => navigateTo('export'),
      className: 'text-gray-700'
    },
    {
      icon: Bookmark,
      label: 'Bookmarked Pages',
      action: () => navigateTo('bookmarks'),
      className: 'text-gray-700'
    },
    {
      icon: Info,
      label: 'About',
      action: () => navigateTo('about'),
      className: 'text-gray-700'
    },
    {
      icon: Monitor,
      label: 'Go To WebApp',
      action: () => window.open('http://localhost:5173/', '_blank'),
      className: 'text-blue-600 hover:text-blue-800'
    }
  ];

  return (
    <div className="relative">
      <Menu>
        <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${item.className}`}
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