
import React from 'react';

const Disclaimer: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`bg-slate-900/40 border-2 border-pink-600/50 rounded-2xl p-6 text-slate-500 text-xs leading-relaxed shadow-lg shadow-pink-900/5 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="mt-1">
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="font-bold uppercase tracking-widest text-pink-500">Wichtiger Hinweis & Disclaimer</p>
          <p>
            Die durch ASK WARREN bereitgestellten Informationen, Analysen und Ergebnisse dienen ausschließlich der allgemeinen Information und Weiterbildung. 
            <strong className="text-slate-400"> Es handelt sich ausdrücklich nicht um eine Anlageberatung, Steuerberatung oder finanzielle Empfehlung.</strong>
          </p>
          <p>
            Investitionen am Aktienmarkt sind mit Risiken verbunden, bis hin zum Totalverlust des eingesetzten Kapitals. 
            Wir übernehmen keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der Inhalte. 
            Jede Investitionsentscheidung erfolgt eigenverantwortlich durch den Nutzer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
