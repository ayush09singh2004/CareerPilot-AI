import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        {icon || <FileX size={28} className="text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-textMain mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action ?? null}
    </div>
  );
};

export default EmptyState;
