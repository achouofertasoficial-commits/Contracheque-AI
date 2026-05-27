import React, { useState, useEffect } from 'react';
import { Screen, User, ContrachequeAnalise } from './types';
import { INITIAL_ANALYSED_LIST } from './data';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import DashboardView from './components/DashboardView';
import UploadView from './components/UploadView';
import AnalysisView from './components/AnalysisView';
import CalendarView from './components/CalendarView';
import HistoryView from './components/HistoryView';
import MonthDetailsView from './components/MonthDetailsView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<User | null>(null);
  
  // Set up persistent / reactive paycheck data list, pre-loaded with beautiful scenario templates
  const [analysedList, setAnalysedList] = useState<ContrachequeAnalise[]>(() => {
    const cached = localStorage.getItem('contracheque_ai_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error(err);
      }
    }
    return INITIAL_ANALYSED_LIST;
  });

  // Keep ID of month currently focused under "Detalhes do mês" view
  const [selectedMonthId, setSelectedMonthId] = useState<string>(() => {
    return analysedList[0]?.id || "item-1";
  });

  // Store parsed but unconfirmed JSON extraction
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem('contracheque_ai_list', JSON.stringify(analysedList));
    if (analysedList.length > 0 && !selectedMonthId) {
      setSelectedMonthId(analysedList[0].id);
    }
  }, [analysedList]);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('welcome');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Callback when AI finishes scanning
  const handleAnalysisComplete = (extractedResult: any) => {
    setIsLoading(false);
    if (extractedResult) {
      setCurrentAnalysis(extractedResult);
      setCurrentScreen('analysis');
    } else {
      // Backed out / Cancelled
      setIsLoading(false);
      setCurrentScreen('upload');
    }
  };

  // Saved confirmed paycheck
  const handleConfirmAnalysis = (finalParsedDoc: ContrachequeAnalise) => {
    setAnalysedList(prev => [finalParsedDoc, ...prev]);
    setSelectedMonthId(finalParsedDoc.id);
    setCurrentAnalysis(null);
    
    // Auto-navigate to dashboard so charts are immediately updated
    setCurrentScreen('dashboard');
  };

  const handleDiscardAnalysis = () => {
    setCurrentAnalysis(null);
    setIsLoading(false);
    setCurrentScreen('upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Universal header navigation */}
      <Navbar 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen} 
        user={user} 
        onLogout={handleLogout}
      />

      {/* Primary content area */}
      <main className="flex-grow flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 pb-28 md:pb-8 relative">
        {currentScreen === 'welcome' && (
          <WelcomeView 
            onLogin={handleLogin} 
            onNavigate={setCurrentScreen} 
          />
        )}

        {currentScreen === 'dashboard' && user && (
          <DashboardView 
            analysedList={analysedList} 
            user={user}
            onNavigate={setCurrentScreen}
            setSelectedMonthId={setSelectedMonthId}
          />
        )}

        {currentScreen === 'upload' && (
          <UploadView 
            onAnalysisComplete={handleAnalysisComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {currentScreen === 'analysis' && (
          <AnalysisView 
            currentAnalysis={currentAnalysis}
            onConfirm={handleConfirmAnalysis}
            onDiscard={handleDiscardAnalysis}
          />
        )}

        {currentScreen === 'month_details' && (
          <MonthDetailsView 
            analysedList={analysedList}
            selectedMonthId={selectedMonthId}
            setSelectedMonthId={setSelectedMonthId}
          />
        )}

        {currentScreen === 'calendar' && (
          <CalendarView onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'history' && (
          <HistoryView 
            analysedList={analysedList}
            onNavigate={setCurrentScreen}
            setSelectedMonthId={setSelectedMonthId}
          />
        )}

        {currentScreen === 'settings' && user && (
          <SettingsView 
            user={user}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}
