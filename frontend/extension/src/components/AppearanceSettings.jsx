// Frontend/extension/src/components/AppearanceSettings.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContexts';
import { Info } from 'lucide-react';

const AppearanceSettings = () => {
  const { theme, setThemePreference } = useTheme();
  const [fontSize, setFontSize] = React.useState('medium');
  const [commentDisplay, setCommentDisplay] = React.useState('sidebar');
  const [density, setDensity] = React.useState('comfortable');
  const [notificationMode, setNotificationMode] = React.useState('notify');

  // Tooltip content for notification modes
  const notificationTooltips = {
    silent: "The extension makes no noise, you have to actively look for comments.",
    notify: "The extension shows notification in the extensions pane if the URL is commented.",
    popup: "The extension opens up and shows the comments if the URL is commented.",
    bottomBar: "The extension opens up and show the comments in a bottom of the screen Bar."
  };

  return (
    <div className="p-4 space-y-6">
      {/* Notification Mode Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Comment Notification Mode</label>
        <div className="space-y-2">
          {[
            { value: 'silent', label: 'Silent' },
            { value: 'notify', label: 'Notify' },
            { value: 'popup', label: 'PopUp' },
            { value: 'bottomBar', label: 'Bottom Bar' }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={option.value}
                name="notificationMode"
                value={option.value}
                checked={notificationMode === option.value}
                onChange={(e) => setNotificationMode(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={option.value} className="flex items-center">
                <span>{option.label}</span>
                <div className="relative group ml-2">
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="fixed left-32 top-1/4 transform -translate-y-1/4 
                                w-64 p-3 bg-gray-900 text-white text-sm rounded-lg
                                border border-gray-600 dark:border-gray-500
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-200 z-50">
                    {notificationTooltips[option.value]}
                    <div className="absolute top-1/2 -left-2 transform -translate-y-1/2
                                  border-8 border-transparent border-r-gray-900"></div>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Theme</label>
        <select 
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={theme}
          onChange={(e) => setThemePreference(e.target.value)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Font Size</label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Comment Display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Comment Display</label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={commentDisplay}
          onChange={(e) => setCommentDisplay(e.target.value)}
        >
          <option value="sidebar">Sidebar</option>
          <option value="overlay">Overlay</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      {/* Density */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Display Density</label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={density}
          onChange={(e) => setDensity(e.target.value)}
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      {/* Custom Colors */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Accent Color</label>
        <div className="grid grid-cols-5 gap-2">
          {['blue', 'green', 'purple', 'red', 'orange'].map((color) => (
            <button
              key={color}
              className={`w-full h-8 rounded-md border-2 ${
                color === 'blue' ? 'bg-blue-500' :
                color === 'green' ? 'bg-green-500' :
                color === 'purple' ? 'bg-purple-500' :
                color === 'red' ? 'bg-red-500' :
                'bg-orange-500'
              }`}
              onClick={() => {/* Implement color change logic */}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;