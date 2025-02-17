import React, { useState } from 'react';
import { PricingModal } from './pricing-modal';

const ParentComponent: React.FC = () => {
  const [isOpen, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  return (
    <div>
      <PricingModal 
        isOpen={isOpen} 
        onClose={() => setOpen(false)}
        onSelectFree={() => {
          setSelectedModel('chat-gpt-4o-mini');
        }}
      />
    </div>
  );
};

export default ParentComponent; 