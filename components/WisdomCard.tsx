
import React, { useMemo } from 'react';

const quotes = [
  "Preis ist das, was du bezahlst. Wert ist das, was du bekommst.",
  "Regel Nummer 1: Verliere niemals Geld. Regel Nummer 2: Vergiss niemals Regel Nummer 1.",
  "Sei ängstlich, wenn andere gierig sind. Sei gierig, wenn andere ängstlich sind.",
  "Unsere liebste Haltedauer ist für immer.",
  "Risiko entsteht dann, wenn man nicht weiß, was man tut.",
  "Zeit ist der Freund des wunderbaren Unternehmens, der Feind des mittelmäßigen.",
  "Es dauert 20 Jahre, um einen Ruf aufzubauen, und fünf Minuten, um ihn zu ruinieren.",
  "Investiere nur in das, was du verstehst.",
  "Es ist besser, ein großartiges Unternehmen zu einem fairen Preis zu kaufen, als ein faires Unternehmen zu einem großartigen Preis.",
  "Egal wie groß das Talent oder die Anstrengung ist, manche Dinge brauchen einfach Zeit. Man kann kein Baby in einem Monat produzieren, indem man neun Frauen schwängert."
];

const WisdomCard: React.FC = () => {
  const selectedQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  return (
    <div className="max-w-3xl mx-auto my-16 text-center animate-fade-in px-4">
      <div className="relative p-12 md:p-20 bg-slate-900 border-4 border-slate-800 shadow-2xl rounded-[3rem] overflow-hidden paper-texture group">
        <div className="absolute top-0 left-0 w-full h-2 bg-pink-600"></div>
        
        {/* Quote indicator */}
        <div className="absolute top-10 left-12 opacity-10 group-hover:opacity-20 transition-opacity">
           <svg className="w-20 h-20 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 15.2386 16.2556 13 19.017 13H21V21H14.017ZM3 21V18C3 15.2386 5.23858 13 8 13H10V21H3ZM10 13C10 10.2386 12.2386 8 15 8V6C11.134 6 8 9.13401 8 13H10ZM21 13C21 10.2386 18.7614 8 16 8V6C19.866 6 23 9.13401 23 13H21Z" />
          </svg>
        </div>

        <div className="relative z-10">
          <h3 className="serif-font text-3xl md:text-4xl font-bold text-white leading-tight mb-12">
            „{selectedQuote}“
          </h3>
          <div className="flex items-center justify-center space-x-6">
            <div className="h-px w-12 bg-slate-800"></div>
            <p className="text-pink-600 font-bold uppercase tracking-[0.5em] text-[10px]">Warren Buffett</p>
            <div className="h-px w-12 bg-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WisdomCard;
