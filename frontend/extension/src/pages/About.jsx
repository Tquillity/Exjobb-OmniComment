// Frontend/extension/src/pages/About.jsx
import React from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, X } from 'lucide-react';

const About = () => {
  const { goBack, closeAll } = useNavigation();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <button 
          onClick={goBack}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">About</span>
        <button 
          onClick={closeAll}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-lg font-medium italic">
          "Frustration is the cauldron of birth for OmniComment"
        </p>
        
        <p>
          OmniComment now allows you to comment on any webpage on the internet.
        </p>
        
        <p>
          Intended to work as a sort of "Community Notes" outside of X.
        </p>
        
        <p className="font-bold">
          DOGE
        </p>
        
        <p>
          Thank you!
        </p>
      </div>
    </div>
  );
};

export default About;