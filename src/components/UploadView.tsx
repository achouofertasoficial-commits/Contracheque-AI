import React, { useState } from 'react';

interface UploadViewProps {
  onAnalysisComplete: (result: any) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function UploadView({ onAnalysisComplete, isLoading, setIsLoading }: UploadViewProps) {
  const [selectedFiles, setSelectedFiles] = useState<{ 
    name: string; 
    size: string; 
    simulated: boolean; 
    mockType?: string;
    fileData?: string;
    mimeType?: string;
  }[]>([]);
  const [loadingStatus, setLoadingStatus] = useState("Lendo layout do documento...");
  const [dragActive, setDragActive] = useState(false);

  const simulateFileSelect = (mockType: 'joao' | 'ana') => {
    const filename = mockType === 'joao' 
      ? 'contracheque_joao_silva_clt.pdf' 
      : 'contracheque_ana_silva_intermitente.pdf';
    
    setSelectedFiles(prev => [
      ...prev,
      {
        name: filename,
        size: mockType === 'joao' ? '2.4 MB' : '1.8 MB',
        simulated: true,
        mockType: mockType,
        fileData: "simulated-test-data",
        mimeType: "application/pdf"
      }
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      (Array.from(e.target.files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          setSelectedFiles(prev => [
            ...prev,
            {
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
              simulated: false,
              fileData: base64Data,
              mimeType: file.type
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      (Array.from(e.dataTransfer.files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          setSelectedFiles(prev => [
            ...prev,
            {
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
              simulated: false,
              fileData: base64Data,
              mimeType: file.type
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resetUpload = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUploadInput = () => {
    const fileInput = document.getElementById('file-upload-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const startAnalysis = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsLoading(true);

    const statuses = [
      "Processando imagem/PDF do documento...",
      "A IA está analisando seu contracheque...",
      "Extraindo proventos, descontos e tributos nacionais...",
      "Calculando médias de dias e horas trabalhadas...",
      "Avaliando regularidade do FGTS e deduções contratuais...",
      "Finalizando estrutura..."
    ];

    let i = 0;
    setLoadingStatus(statuses[0]);

    const statusInterval = setInterval(() => {
      i++;
      if (i < statuses.length) {
        setLoadingStatus(statuses[i]);
      }
    }, 700);

    try {
      const response = await fetch('/api/analisar-contracheque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selectedFiles })
      });

      const extractedJson = await response.json();
      
      // Let status show "Concluído!" briefly
      clearInterval(statusInterval);
      setLoadingStatus("Tudo pronto! Redirecionando...");
      await new Promise(resolve => setTimeout(resolve, 800));

      onAnalysisComplete(extractedJson);

    } catch (err) {
      console.error(err);
      clearInterval(statusInterval);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto py-12">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 flex flex-col items-center w-full">
          {/* Animated Scanner Radar */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {/* Pulsing ring outer */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-ping opacity-30" />
            {/* Spinning indicator ring */}
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 border-r-emerald-500 border-b-transparent border-l-transparent animate-spin duration-1000" />
            {/* Inner radar icon */}
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center z-10 shadow-sm">
              <span className="material-symbols-outlined text-slate-800 text-4xl animate-pulse">document_scanner</span>
            </div>
            {/* AI sparkle badge */}
            <span className="material-symbols-outlined absolute top-1 right-1 text-emerald-600 text-xl animate-bounce">magic_button</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">Analisando documento...</h2>
          <p className="text-sm text-slate-500 mb-6">A IA está analisando seu contracheque. Isso leva apenas alguns segundos.</p>
          
          {/* Progress bar fill */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-700 h-full rounded-full transition-all duration-300 animate-pulse" style={{ width: "85%" }} />
          </div>

          <p className="text-xs text-slate-400 mt-4 font-semibold uppercase tracking-wider">{loadingStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center p-4 py-8 max-w-xl mx-auto w-full">
      {/* Back button */}
      <div className="w-full mb-6">
        <button 
          onClick={() => onAnalysisComplete(null)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="w-full mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Enviar Contracheque</h1>
        <p className="text-sm text-slate-500 mt-1">Insira os holerites do mês atual para análise consolidada.</p>
      </div>

      {/* Warning Tip */}
      <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-left mb-4 shadow-xs">
        <span className="material-symbols-outlined text-indigo-700 select-none">info</span>
        <p className="text-xs text-indigo-900 leading-relaxed">
          Envie fotos nítidas do seu holerite sem cortes, borrões ou sombras. Aceitamos arquivos em formatos JPG, PNG ou holerites oficiais em PDF. Os dados permanecem protegidos por criptografia de ponta.
        </p>
      </div>

      {/* Competence Consolidation Info */}
      <div className="w-full bg-emerald-50 border border-emerald-100/50 rounded-xl p-4 flex gap-3 text-left mb-6 shadow-2xs">
        <span className="material-symbols-outlined text-emerald-700 select-none">layers</span>
        <div className="space-y-1">
          <p className="text-xs font-bold text-emerald-950">Múltiplos Holerites</p>
          <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
            Você pode enviar mais de um holerite, desde que sejam do mesmo mês, da mesma empresa e do mesmo pagamento. O app não permite misturar empresas ou meses diferentes.
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        id="file-upload-input" 
        type="file" 
        accept="image/*,application/pdf"
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Dropzone Area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerUploadInput}
        className={`w-full bg-white border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs group ${
          dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-slate-700 text-3xl">cloud_upload</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Toque ou arraste o arquivo</h3>
        <p className="text-xs text-slate-400">Suporta JPG, PNG ou PDF (Max 10MB)</p>
      </div>

      {/* Standard Demo Simulator block */}
      <div className="w-full mt-6 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-4 text-left">
        <span className="text-xs text-emerald-900 font-bold tracking-wide uppercase px-1 block mb-3">🛠️ Simulador IA Demonstrativo</span>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Não possui um holerite de teste à mão? Clique em um perfil simulador para testar a decodificação da IA e ver os gráficos atualizarem instantaneamente!
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => simulateFileSelect('joao')}
            className="flex-1 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-3 text-left transition-all hover:shadow-xs active:scale-95 duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">JS</div>
              <div>
                <p className="text-xs font-bold text-slate-800">João Silva (CLT)</p>
                <p className="text-[10px] text-emerald-700">Mensalista - R$ 4.500</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateFileSelect('ana')}
            className="flex-1 bg-white hover:bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-xl p-3 text-left transition-all hover:shadow-xs active:scale-95 duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs">AS</div>
              <div>
                <p className="text-xs font-bold text-slate-800">Ana Silva (Intermitente)</p>
                <p className="text-[10px] text-blue-700">Com Bônus - R$ 4.500</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* File List block - supports multiple documents! */}
      {selectedFiles.length > 0 && (
        <div className="w-full mt-6 text-left" id="file-list">
          <div className="flex justify-between items-center mb-2 px-1">
            <h4 className="text-xs text-slate-500 font-bold tracking-wider uppercase">Arquivos Adicionados ({selectedFiles.length})</h4>
            <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Suporta múltiplos envios no mês</div>
          </div>
          <div className="flex flex-col gap-2">
            {selectedFiles.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-700">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 max-w-[240px] truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{file.size} {file.simulated && "• Simulado"}</p>
                  </div>
                </div>
                <button 
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors" 
                  onClick={() => resetUpload(idx)}
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Trigger buttons */}
      <div className="w-full mt-6 flex flex-col gap-2">
        {selectedFiles.length > 0 ? (
          <button 
            type="button"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            onClick={startAnalysis}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            Analisar Documentos com IA
          </button>
        ) : (
          <div className="flex gap-2.5">
            <button 
              type="button"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95" 
              onClick={triggerUploadInput}
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              Tirar foto
            </button>
            <button 
              type="button"
              className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95" 
              onClick={triggerUploadInput}
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Anexar holerite PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
