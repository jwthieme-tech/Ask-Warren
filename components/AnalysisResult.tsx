
import React, { useRef, useState } from 'react';
import { AnalysisResponse } from '../types';
import FinancialChart from './FinancialChart';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisResultProps {
  analysis: AnalysisResponse;
  onSave: () => void;
  isSaved: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onSave, isSaved }) => {
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const sections = analysis.text.split(/(?=\d️⃣|🔮)/g);

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);

    try {
      const element = pdfRef.current;
      // We create a canvas of the element
      // Using a higher scale for better PDF quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617', // Match the app's dark theme
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multi-page PDF if content is long
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ASK_WARREN_Analyse_${analysis.query.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mt-12 animate-fade-in">
      <div className="bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-6 md:p-12">
          {/* Action Buttons Top */}
          <div className="flex flex-wrap justify-end gap-4 mb-8">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center space-x-3 px-6 py-3 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${isExporting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExporting ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                )}
              </svg>
              <span className="font-bold text-xs uppercase tracking-widest">{isExporting ? 'Exportiere...' : 'PDF Export'}</span>
            </button>

            <button
              onClick={onSave}
              disabled={isSaved}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full border transition-all duration-300 ${
                isSaved 
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-default' 
                : 'bg-pink-600 text-white border-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-900/20 transform hover:-translate-y-0.5'
              }`}
            >
              <svg className={`w-5 h-5 ${isSaved ? 'fill-pink-500 stroke-pink-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-bold text-xs uppercase tracking-widest">{isSaved ? 'Gespeichert' : 'In Watchlist'}</span>
            </button>
          </div>

          {/* Wrapper for PDF Exporting */}
          <div ref={pdfRef} className="pdf-content-wrapper p-2 rounded-2xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 border-b border-slate-800 pb-10">
              <div className="serif-font">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{analysis.query}</h2>
                <div className="flex items-center mt-3 space-x-3">
                  <span className="h-px w-10 bg-pink-500"></span>
                  <p className="text-slate-500 text-xs uppercase tracking-[0.4em] font-bold">Fundamental-Analyse</p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-pink-600 font-bold serif-font text-xl">ASK WARREN</p>
                  <p className="text-slate-600 text-[10px] tracking-widest uppercase">Investment Report</p>
                </div>
              </div>
            </div>

            {/* Key Metrics Charts */}
            {analysis.charts && (
              <div className="space-y-8 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FinancialChart 
                    data={analysis.charts.revenue} 
                    title="Umsatzentwicklung" 
                    unit="Mrd." 
                    type="bar" 
                    color="#3b82f6" 
                  />
                  <FinancialChart 
                    data={analysis.charts.margins} 
                    title="Netto-Gewinnmarge" 
                    unit="%" 
                    type="line" 
                    color="#ec4899" 
                  />
                  <FinancialChart 
                    data={analysis.charts.roic} 
                    title="Kapitalrendite (ROIC)" 
                    unit="%" 
                    type="line" 
                    color="#10b981"
                    benchmark={15}
                  />
                </div>
                
                <div className="grid grid-cols-1">
                  <FinancialChart 
                    data={analysis.charts.stockPrice} 
                    title="Historischer Kursverlauf" 
                    unit="Währung" 
                    type="line" 
                    color="#8b5cf6" 
                  />
                </div>
              </div>
            )}

            {/* Analysis Content */}
            <div className="prose prose-invert max-w-none">
              {sections.map((section, idx) => {
                const trimmed = section.trim();
                if (!trimmed) return null;
                
                const isVerdict = trimmed.startsWith('🔮');
                
                return (
                  <div 
                    key={idx} 
                    className={`mb-12 last:mb-0 ${
                      isVerdict 
                        ? 'bg-pink-500/5 p-8 md:p-12 rounded-[2.5rem] border border-pink-500/20 shadow-lg shadow-pink-900/5 relative overflow-hidden' 
                        : ''
                    }`}
                  >
                    {isVerdict && (
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <svg className="w-32 h-32 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-200 serif-font text-xl md:text-2xl relative z-10">
                      {trimmed}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sources - Correctly rendered as links as per guidelines */}
            {analysis.sources.length > 0 && (
              <div className="mt-20 pt-12 border-t border-slate-800">
                <div className="flex items-center space-x-4 mb-8">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Quellen & Belege</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.sources.map((source, idx) => (
                    source.web && (
                      <a 
                        key={idx}
                        href={source.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors group/source"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 mr-4 group-hover/source:text-pink-500 group-hover/source:bg-pink-500/10 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <span className="text-xs text-slate-400 group-hover/source:text-slate-200 transition-colors truncate">
                          {source.web.title || source.web.uri}
                        </span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* PDF Footer Notice */}
            <div className="mt-12 text-center text-[10px] text-slate-700 uppercase tracking-widest border-t border-slate-900/50 pt-8">
              Generiert von ASK WARREN • Basierend auf Buffett-Prinzipien • Keine Anlageberatung
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
