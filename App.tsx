import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProcurementModule } from './components/ProcurementModule';
import { OperationsModule } from './components/OperationsModule';
import { QualityModule } from './components/QualityModule';
import { LoginPage } from './components/LoginPage';
import { UserProfile, Department } from './types';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Navigation State
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentDepartment(null);
  };

  const handleBackToLanding = () => {
    setCurrentDepartment(null);
  };

  // 1. If not logged in, show Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // 2. Router Logic - Render Modules based on selection
  // Note: We pass currentUser.role to modules that need permission levels (like Procurement)
  
  if (currentDepartment === 'PROCUREMENT') {
    return (
      <ProcurementModule 
        onBackToLanding={handleBackToLanding} 
        userRole={currentUser.role} 
      />
    );
  }

  if (currentDepartment === 'OPERATIONS') {
    return (
      <OperationsModule 
        onBackToLanding={handleBackToLanding} 
      />
    );
  }
  
  if (currentDepartment === 'QUALITY') {
    return (
      <QualityModule 
        onBackToLanding={handleBackToLanding} 
      />
    );
  }

  // 3. Default: Landing Page (Dashboard Portal)
  return (
    <LandingPage 
      onSelectDepartment={(dept) => setCurrentDepartment(dept as Department)} 
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
};

export default App;