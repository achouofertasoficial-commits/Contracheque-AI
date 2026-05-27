import React, { useState, useEffect } from 'react';
import { Screen, User, ContrachequeAnalise, ComplementaryAnalysisData } from './types';
import { INITIAL_ANALYSED_LIST } from './data';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import DashboardView from './components/DashboardView';
import UploadView from './components/UploadView';
import ComplementAnalysisView from './components/ComplementAnalysisView';
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
      setCurrentScreen('complement-analysis');
    } else {
      // Backed out / Cancelled
      setIsLoading(false);
      setCurrentScreen('upload');
    }
  };

  const calculateEnhancedAnalysis = (analysis: any, complements: ComplementaryAnalysisData) => {
    const merged = { ...analysis };

    // Make sure nested structures are cloned
    merged.trabalhador = { ...analysis.trabalhador };
    merged.empresa = { ...analysis.empresa };
    merged.valores = { ...analysis.valores };
    merged.trabalho = { ...analysis.trabalho };

    if (complements.empresa_nome !== undefined && complements.empresa_nome !== null) {
      merged.empresa.nome = complements.empresa_nome;
    }
    if (complements.tipo_trabalhador !== undefined && complements.tipo_trabalhador !== null) {
      merged.trabalhador.tipo = complements.tipo_trabalhador;
    }
    
    // Set days and hours
    merged.trabalho.dias_trabalhados = complements.dias_trabalhados;
    merged.trabalho.horas_trabalhadas = complements.horas_trabalhadas;
    merged.trabalho.horas_extras = complements.horas_extras;
    merged.trabalho.horas_noturnas = complements.horas_noturnas;
    
    if (complements.salario_liquido_recebido !== undefined && complements.salario_liquido_recebido !== null) {
      merged.valores.salario_liquido = complements.salario_liquido_recebido;
    }
    
    merged.observacoes_trabalhador = complements.observacoes || null;

    // Calculate metrics:
    const salLiq = merged.valores.salario_liquido;
    const dias = merged.trabalho.dias_trabalhados;
    const horas = merged.trabalho.horas_trabalhadas;
    const totDescontos = merged.valores.total_descontos;
    const totAdicionais = merged.valores.total_adicionais;
    const adicionalNoturnoValor = merged.valores.adicional_noturno_valor;
    const horasNoturnas = merged.trabalho.horas_noturnas;
    const horasExtrasValor = merged.valores.horas_extras_valor;
    const horasExtrasQtd = merged.trabalho.horas_extras;

    const ganho_por_dia = (salLiq && dias && dias > 0) ? Number((salLiq / dias).toFixed(2)) : null;
    const ganho_por_hora = (salLiq && horas && horas > 0) ? Number((salLiq / horas).toFixed(2)) : null;
    const desconto_por_dia = (totDescontos && dias && dias > 0) ? Number((totDescontos / dias).toFixed(2)) : null;
    const adicional_por_dia = (totAdicionais && dias && dias > 0) ? Number((totAdicionais / dias).toFixed(2)) : null;
    const adicional_noturno_por_hora = (adicionalNoturnoValor && horasNoturnas && horasNoturnas > 0) ? Number((adicionalNoturnoValor / horasNoturnas).toFixed(2)) : null;
    const horas_extras_por_hora = (horasExtrasValor && horasExtrasQtd && horasExtrasQtd > 0) ? Number((horasExtrasValor / horasExtrasQtd).toFixed(2)) : null;

    merged.metricas_calculadas = {
      ganho_por_dia,
      ganho_por_hora,
      desconto_por_dia,
      adicional_por_dia,
      adicional_noturno_por_hora,
      horas_extras_por_hora
    };

    // Update the standard work averages
    merged.trabalho.media_por_dia = ganho_por_dia;
    merged.trabalho.media_por_hora = ganho_por_hora;

    // Append observation text to resumo_ia if any complement filled
    const isComplemented = complements.dias_trabalhados !== null || complements.horas_trabalhadas !== null || complements.observacoes !== null;
    if (isComplemented) {
      const line = "\nA análise foi complementada com informações informadas pelo trabalhador.";
      if (!merged.resumo_ia.includes(line)) {
        merged.resumo_ia += line;
      }
    }

    return merged;
  };

  const handleComplementConfirm = (complements: ComplementaryAnalysisData) => {
    const finalEnhanced = calculateEnhancedAnalysis(currentAnalysis, complements);
    setCurrentAnalysis(finalEnhanced);
    setCurrentScreen('analysis');
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

        {currentScreen === 'complement-analysis' && (
          <ComplementAnalysisView 
            currentAnalysis={currentAnalysis}
            onConfirm={handleComplementConfirm}
            onDiscard={handleDiscardAnalysis}
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
