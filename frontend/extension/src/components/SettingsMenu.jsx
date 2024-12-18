// Frontend/extension/src/components/SettingsMenu.jsx
import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { MoreVertical, Settings, Info, Monitor } from 'lucide-react';

const SettingsMenu = () => {
  const handleOpenDesktop = () => {
    window.open('http://localhost:5173/', '_blank');
  };

  return (
    <div className="absolute top-2 right-2">
      <Menu>
        <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => {
                    console.log('Settings clicked');
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={() => {
                    console.log('About clicked');
                  }}
                >
                  <Info className="mr-2 h-4 w-4" />
                  About
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  onClick={handleOpenDesktop}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Desktop
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default SettingsMenu;