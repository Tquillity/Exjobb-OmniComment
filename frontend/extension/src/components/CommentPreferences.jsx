// Frontend/extension/src/components/CommentPreferences.jsx
import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { usePreferences } from '../contexts/PreferencesContext';

const CommentPreferences = () => {
  const { preferences, updatePreferences, loading } = usePreferences();
  const [isSaving, setIsSaving] = useState(false);
  
  // State for various preferences
  const [sortOrder, setSortOrder] = useState('newest');
  const [threadDepth, setThreadDepth] = useState(5);
  const [autoExpand, setAutoExpand] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [richTextEnabled, setRichTextEnabled] = useState(true);
  const [collapseThreads, setCollapseThreads] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState('both');

  // Initialize state from preferences when component mounts
  useEffect(() => {
    if (!loading && preferences?.comments) {
      setSortOrder(preferences.comments.sortOrder || 'newest');
      setThreadDepth(preferences.comments.threadDepth || 5);
      setAutoExpand(preferences.comments.autoExpand ?? true);
      setShowPreview(preferences.comments.showPreview ?? true);
      setRichTextEnabled(preferences.comments.richTextEnabled ?? true);
      setCollapseThreads(preferences.comments.collapseThreads ?? false);
      setShowTimestamp(preferences.comments.showTimestamp || 'relative');
    }
  }, [loading, preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Restructure the settings object to match the schema
      const localPreferences = {
        settings: {
          comments: {
            sortOrder,
            threadDepth,
            autoExpand,
            showPreview,
            richTextEnabled,
            collapseThreads,
            showTimestamp
          }
        }
      };
  
      console.log('Attempting to save preferences:', localPreferences);
      
      const success = await updatePreferences(localPreferences);
  
      if (success) {
        console.log('Preferences saved successfully');
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <Switch.Group>
      <div className="flex items-center justify-between">
        <Switch.Label className="text-sm font-medium">{label}</Switch.Label>
        <Switch
          checked={enabled}
          onChange={onChange}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-300'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );

  if (loading) {
    return <div className="p-4">Loading preferences...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Sort Order */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Default Sort Order</label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostDiscussed">Most Discussed</option>
        </select>
      </div>

      {/* Thread Depth */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Thread Depth (Nested Replies)
        </label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={threadDepth}
          onChange={(e) => setThreadDepth(Number(e.target.value))}
        >
          {[3, 4, 5, 6, 7, 8, 'unlimited'].map((depth) => (
            <option key={depth} value={depth}>
              {depth === 'unlimited' ? 'Unlimited' : `${depth} Levels`}
            </option>
          ))}
        </select>
      </div>

      {/* Time Display */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Time Display</label>
        <select
          className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
          value={showTimestamp}
          onChange={(e) => setShowTimestamp(e.target.value)}
        >
          <option value="both">Smart Format (Default - relative then absolute after 24h)</option>
          <option value="relative">Relative Only (e.g., "2 hours ago")</option>
          <option value="absolute">Absolute Only (e.g., "Jan 20, 2024 15:30")</option>
        </select>
      </div>

      {/* Toggle Switches */}
      <div className="space-y-4">
        <ToggleSwitch
          enabled={autoExpand}
          onChange={setAutoExpand}
          label="Auto-expand comment threads"
        />
        
        <ToggleSwitch
          enabled={showPreview}
          onChange={setShowPreview}
          label="Show comment preview while typing"
        />
        
        <ToggleSwitch
          enabled={richTextEnabled}
          onChange={setRichTextEnabled}
          label="Enable rich text editing"
        />
        
        <ToggleSwitch
          enabled={collapseThreads}
          onChange={setCollapseThreads}
          label="Collapse long threads by default"
        />
      </div>

      {/* Save Button */}
      <button
        className={`w-full p-2 bg-blue-600 text-white rounded-md transition-colors ${
          isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default CommentPreferences;