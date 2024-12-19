// Frontend/extension/src/components/AppearanceSettings.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContexts';

const AppearanceSettings = () => {
  const { theme, setThemePreference } = useTheme();
  const [fontSize, setFontSize] = React.useState('medium');
  const [commentDisplay, setCommentDisplay] = React.useState('sidebar');
  const [density, setDensity] = React.useState('comfortable');

  return (
    <div className="p-4 space-y-6">
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