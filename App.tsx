import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProcurementModule } from './components/ProcurementModule';
import { OperationsModule } from './components/OperationsModule';
import { QualityModule } from './components/QualityModule';

// Define available departments
type Department = 'PROCUREMENT' | 'OPERATIONS' | 'QUALITY' | null;

const App: React.FC = () => {
  const [currentDepartment, setCurrentDepartment] = useState<Department>(null);

  const handleBackToLanding = () => {
    setCurrentDepartment(null);
  };

  // Router Logic
  if (currentDepartment === 'PROCUREMENT') {
    return <ProcurementModule onBackToLanding={handleBackToLanding} />;
  }

  if (currentDepartment === 'OPERATIONS') {
    return <OperationsModule onBackToLanding={handleBackToLanding} />;
  }
  
  if (currentDepartment === 'QUALITY') {
    return <QualityModule onBackToLanding={handleBackToLanding} />;
  }

  // Default: Landing Page
  return <LandingPage onSelectDepartment={(dept) => setCurrentDepartment(dept as Department)} />;
};

export default App;