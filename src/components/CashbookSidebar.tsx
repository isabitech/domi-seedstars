import React, { useState } from 'react';
import { Space } from 'antd';
import { OnlineCIHComponent } from './OnlineCIH';
import { PredictionComponent } from './PredictionComponent';
import type { Prediction } from '../hooks/Branch/Prediction/useGetPredictions';

interface CashbookSidebarProps {
  refreshTrigger?: number;
  onPredictionSubmit?: (data: Prediction) => void;
}

export const CashbookSidebar: React.FC<CashbookSidebarProps> = ({
  onPredictionSubmit
}) => {
  const [localRefresh, setLocalRefresh] = useState(0);

  const handlePredictionSubmit = (data: Prediction) => {
    // Trigger a refresh of the Online CIH component after prediction submission
    setLocalRefresh(prev => prev + 1);
    
    if (onPredictionSubmit) {
      onPredictionSubmit(data);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Online Cash in Hand Component */}
        <OnlineCIHComponent 
        />
        
        {/* Prediction Component */}
        <PredictionComponent 
          onSubmit={handlePredictionSubmit}

        />
      </Space>
    </div>
  );
};