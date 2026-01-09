
import React, { useState } from 'react';

interface CaseStudyDetail {
  company: string;
  lesson: string;
  shortText: string;
  thesis: string;
  moat: string;
  numbers: string;
  outcome: string;
  psychology: string;
  management: string;
  keyQuote: string;
}

const caseStudies: CaseStudyDetail[] = [
  {
    company: "See's Candies (1972)",
    lesson: "Die Macht der Marke",
    shortText: "Buffetts Prototyp für ein 'Dream Business'. Ein kleiner Kapitaleinsatz kombiniert mit einer enormen Preismacht.",
    thesis: "Buffett und Munger kauften See's für 25 Mio. USD, obwohl das Unternehmen nur 7 Mio. USD Netto-Sachanlagen hatte. Es war ihr erster großer Kauf, der auf 'Qualität' statt auf 'Zigarettenstummel-Taktik' setzte.",
    moat: "Der 'Share of Mind'. In Kalifornien war See's gleichbedeutend mit Qualität. Diese emotionale Bindung erlaubte es See's, die Preise jährlich zu erhöhen, ohne Kunden an billigere Konkurrenten zu verlieren.",
    numbers: "Bis 2011 generierte See's über 1,6 Mrd. USD an Vorsteuergewinnen für Berkshire, während nur 40 Mio. USD an zusätzlichem Kapital reinvestiert werden mussten.",
    outcome: "Die wichtigste Lektion für Warren: Ein Unternehmen mit Preismacht und geringem Kapitalbedarf ist eine Goldmine in Inflationszeiten.",
    psychology: "Buffett musste lernen, den Preis für immaterielle Werte (Goodwill) zu akzeptieren. Er erkannte, dass Kunden für eine Pralinenschachtel am Valentinstag keine Experimente machen – sie wollen Sicherheit, keine Schnäppchen.",
    management: "Buffett suchte Management, das das Produkt nicht 'verschlimmbesserte'. Die Kontinuität der Qualität stand über kurzfristiger Gewinnmaximierung.",
    keyQuote: "Wenn Sie einen Dollar in ein Geschäft investieren und es wirft jedes Jahr einen Dollar ab, ist es egal, wie viele Fabriken es hat."
  },
  {
    company: "American Express (1964)",
    lesson: "Kaufen bei Panik",
    shortText: "Der berühmte 'Salad Oil Scandal'. Buffett nutzte eine existenzielle Krise, die das Kerngeschäft nicht berührte.",
    thesis: "Nachdem Amex durch einen Betrug im Warenlagergeschäft hunderte Millionen verlor, brach der Kurs ein. Buffett sah, dass das Kernprodukt (Kreditkarten und Reiseschecks) völlig intakt war.",
    moat: "Das Vertrauen. Buffett setzte sich in Restaurants in New York und beobachtete, ob die Leute weiterhin mit Amex zahlten. Das taten sie. Der Markenkern war unzerstörbar.",
    numbers: "Buffett investierte 13 Mio. USD (40% des Kapitals der Buffett Partnership). Innerhalb von zwei Jahren verdoppelte sich der Kurs.",
    outcome: "Ein Meilenstein für konträres Investieren. Unterscheide stets zwischen einem temporären Image-Problem und einem kaputten Geschäftsmodell.",
    psychology: "Absolute Disziplin gegen den Herdentrieb. Während Wall Street die Aktie abstieß, verließ Buffett sich auf seine eigene Beobachtung am Point of Sale.",
    management: "Er vertraute darauf, dass das Management den Skandal professionell abwickeln würde, solange der 'Default' des Unternehmens nicht drohte.",
    keyQuote: "Gelegenheiten kommen unregelmäßig. Wenn es Gold regnet, stellen Sie den Eimer raus, nicht den Fingerhut."
  },
  {
    company: "Coca-Cola (1988)",
    lesson: "Globale Dominanz",
    shortText: "Buffett erkannte die unausweichliche globale Expansion und den unschätzbaren Wert des Markennamens.",
    thesis: "Nach dem Börsencrash 1987 begann Buffett massiv Coke-Aktien zu kaufen. Er sah ein Unternehmen, das ein tägliches Konsumgut mit extrem niedrigen Herstellungskosten und globaler Skalierbarkeit verkaufte.",
    moat: "Das globale Vertriebsnetz und das Marken-Image. 'Wenn man mir 100 Milliarden Dollar gäbe und sagte: Nimm Coca-Cola die Führung ab, würde ich sie dir zurückgeben und sagen, dass es nicht geht.'",
    numbers: "Berkshire investierte 1,3 Mrd. USD. Heute erhält Berkshire allein an jährlichen Dividenden über 700 Mio. USD von Coca-Cola – eine Rendite auf die ursprünglichen Kosten von über 50% pro Jahr.",
    outcome: "Geduld zahlt sich aus. Buffett hat seit 1988 keine einzige Aktie verkauft.",
    psychology: "Buffett kaufte Coke, als es 'langweilig' war. Er sah das 'Inevitable' (das Unausweichliche) – dass Menschen weltweit mehr Erfrischungsgetränke konsumieren würden.",
    management: "Roberto Goizueta trieb die Kapitalallokation voran, verkaufte unrentable Sparten und konzentrierte sich auf den 'Syrup' – das Herzstück des Gewinns.",
    keyQuote: "Ich würde lieber ein großartiges Unternehmen zu einem fairen Preis kaufen als ein faires Unternehmen zu einem großartigen Preis."
  },
  {
    company: "Apple (2016)",
    lesson: "Das digitale Ökosystem",
    shortText: "Obwohl Buffett Technologie mied, sah er in Apple schließlich ein Konsumgüterunternehmen mit extremer Bindung.",
    thesis: "Buffett erkannte, dass das iPhone kein 'Tech-Gadget' ist, sondern das Zentrum des modernen Lebens. Die Wechselkosten für Nutzer sind durch das Ökosystem (iCloud, Apps, Interface) enorm hoch.",
    moat: "Hohe Switching Costs und Brand Loyalty. Kunden würden eher auf ihr Auto verzichten als auf ihr iPhone. Das macht Apple zu einer 'Mautstation' im digitalen Zeitalter.",
    numbers: "Apple wurde zur größten Position in Berkshires Portfolio, zeitweise über 40% des Gesamtwerts. Die massiven Aktienrückkäufe von Apple steigerten Berkshires Anteil ohne zusätzliche Kosten.",
    outcome: "Buffetts erfolgreichste Wette des 21. Jahrhunderts. Er bewies, dass man seinen 'Kompetenzkreis' erweitern kann, wenn man die fundamentalen ökonomischen Prinzipien beibehält.",
    psychology: "Buffett beobachtete seine Enkel und wie sie ihre iPhones nutzten. Er verstand, dass Apple kein Hardware-Verkäufer ist, sondern die wichtigste Software-Infrastruktur der Welt besitzt.",
    management: "Tim Cook ist für Buffett ein Meister der Kapitalallokation. Er nutzt den massiven Cashflow für Rückkäufe, die den Wert für die verbleibenden Aktionäre massiv steigern.",
    keyQuote: "Es ist ein extrem wertvolles Ökosystem. Wenn man einmal drin ist, kommt man nicht mehr so leicht raus."
  }
];

const Training: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseStudyDetail | null>(null);

  if (selectedCase) {
    return (
      <div className="py-12 animate-fade-in max-w-4xl mx-auto pb-20">
        <button 
          onClick={() => setSelectedCase(null)}
          className="flex items-center space-x-3 text-pink-500 font-bold uppercase tracking-widest text-sm mb-12 hover:text-pink-400 transition-colors group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Zurück zur Übersicht</span>
        </button>

        <div className="bg-slate-900/80 border-2 border-pink-600/30 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="bg-pink-600/10 p-12 border-b border-pink-600/20">
            <p className="text-pink-500 font-bold uppercase tracking-[0.3em] text-xs mb-4">{selectedCase.lesson}</p>
            <h2 className="serif-font text-5xl md:text-6xl font-bold text-white leading-tight">{selectedCase.company}</h2>
          </div>
          
          <div className="p-12 space-y-16">
            {/* Quote Header */}
            <div className="text-center py-8 px-4 bg-slate-950/40 rounded-3xl border border-slate-800 relative">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 px-4 text-pink-500 text-3xl font-serif leading-none">„</span>
              <p className="serif-font text-2xl md:text-3xl italic text-slate-200 leading-relaxed">
                {selectedCase.keyQuote}
              </p>
              <p className="mt-4 text-[10px] text-pink-500 uppercase tracking-widest font-bold">— Warren Buffett</p>
            </div>

            {/* Core Analysis Sections */}
            <section>
              <h3 className="text-pink-500 font-bold uppercase tracking-widest text-sm mb-6 flex items-center">
                <span className="w-8 h-px bg-pink-600/50 mr-4"></span> Die Investment-These
              </h3>
              <p className="text-slate-200 text-xl serif-font leading-relaxed">{selectedCase.thesis}</p>
            </section>

            <div className="grid md:grid-cols-2 gap-12">
              <section className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-pink-500 font-bold uppercase tracking-widest text-xs mb-4">Der Burggraben (Moat)</h3>
                <p className="text-slate-400 leading-relaxed">{selectedCase.moat}</p>
              </section>
              <section className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-pink-500 font-bold uppercase tracking-widest text-xs mb-4">Die Zahlen im Fokus</h3>
                <p className="text-slate-400 leading-relaxed">{selectedCase.numbers}</p>
              </section>
            </div>

            {/* Deep Dive Grid */}
            <div className="grid md:grid-cols-2 gap-12 border-t border-slate-800 pt-16">
              <section>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Psychologische Analyse</h3>
                <div className="text-slate-400 text-base leading-relaxed p-6 bg-slate-900 rounded-2xl border border-slate-800 italic">
                  {selectedCase.psychology}
                </div>
              </section>
              <section>
                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Management & Allokation</h3>
                <div className="text-slate-400 text-base leading-relaxed p-6 bg-slate-900 rounded-2xl border border-slate-800 italic">
                  {selectedCase.management}
                </div>
              </section>
            </div>

            {/* Outcome Footer */}
            <section className="bg-gradient-to-r from-pink-600/20 to-transparent p-10 rounded-3xl border-l-4 border-pink-600">
              <h3 className="text-white font-bold text-2xl serif-font mb-4">Das Urteil & Ergebnis</h3>
              <p className="text-slate-200 leading-relaxed text-lg">{selectedCase.outcome}</p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24 py-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="serif-font text-6xl font-bold text-white mb-8">Die Buffett-Akademie</h2>
        <p className="text-slate-400 text-xl leading-relaxed font-light">
          „Investieren ist einfach, aber nicht leicht.“ Tauchen Sie tief ein in die Philosophie, die über 60 Jahre den Markt geschlagen hat.
        </p>
      </div>

      {/* Case Studies Section */}
      <section className="bg-slate-900/30 -mx-4 px-4 py-20 md:-mx-12 md:px-12 rounded-[3rem] border border-slate-800/50">
        <div className="text-center mb-16">
          <h3 className="serif-font text-4xl font-bold text-white mb-4">Fallstudien: Theorie in der Praxis</h3>
          <p className="text-slate-500 text-sm uppercase tracking-widest">Wählen Sie ein Meisterstück zur Analyse</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {caseStudies.map((cs, idx) => (
            <button 
              key={idx} 
              className="text-left bg-slate-950 p-10 rounded-[2.5rem] border-2 border-slate-800 shadow-2xl group hover:-translate-y-2 hover:border-pink-600/50 hover:shadow-pink-900/20 transition-all duration-500 active:scale-95 focus:outline-none flex flex-col justify-between h-full"
              onClick={() => setSelectedCase(cs)}
            >
              <div>
                <div className="text-pink-500 font-bold text-xs uppercase tracking-[0.25em] mb-4 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                  {cs.lesson}
                </div>
                <h4 className="serif-font text-4xl font-bold text-white mb-6 group-hover:text-pink-400 transition-colors">
                  {cs.company}
                </h4>
                <div className="w-12 h-1.5 bg-pink-600 mb-8 rounded-full transform origin-left group-hover:scale-x-[2.5] transition-transform duration-500"></div>
                <p className="text-slate-400 text-lg leading-relaxed font-light group-hover:text-slate-200 transition-colors line-clamp-3">
                  {cs.shortText}
                </p>
              </div>
              
              <div className="mt-12 flex items-center justify-between">
                <div className="flex items-center text-pink-500 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Analyse öffnen</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                <div className="text-slate-800 font-serif text-5xl opacity-10 group-hover:opacity-20 transition-opacity leading-none">
                  {idx + 1}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Core Principles Grid */}
      <section>
        <div className="flex items-center space-x-6 mb-12">
          <div className="h-px bg-slate-800 flex-grow"></div>
          <h3 className="serif-font text-2xl font-bold text-pink-600 uppercase tracking-[0.4em]">Die Grundpfeiler</h3>
          <div className="h-px bg-slate-800 flex-grow"></div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            {
              title: "Der Kompetenzkreis",
              subtitle: "Circle of Competence",
              description: "Investieren Sie nur in das, was Sie verstehen.",
              details: "Bleiben Sie bei stabilen Geschäftsmodellen. Es geht nicht um die Größe des Kreises, sondern um die Genauigkeit seiner Grenzen."
            },
            {
              title: "Der Burggraben",
              subtitle: "Economic Moat",
              description: "Suchen Sie nach dauerhaften Wettbewerbsvorteilen.",
              details: "Markenmacht, Netzwerkeffekte oder Kostenvorteile sind klassische Gräben, die Konkurrenten fernhalten."
            },
            {
              title: "Sicherheitsmarge",
              subtitle: "Margin of Safety",
              description: "Kaufen Sie einen Dollar für 40 Cent.",
              details: "Die Differenz zum Marktpreis ist Ihr Schutzpolster gegen Analysefehler und unvorhersehbare Marktschwankungen."
            },
            {
              title: "Kapitalallokation",
              subtitle: "Capital Allocation",
              description: "Die Verwendung der Gewinne entscheidet über den Wert.",
              details: "Jeder Euro muss dort landen, wo er den höchsten langfristigen Wert für die Aktionäre schafft."
            }
          ].map((p, idx) => (
            <div key={idx} className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-pink-600/30 transition-all group">
              <p className="text-pink-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-70 group-hover:opacity-100">{p.subtitle}</p>
              <h4 className="serif-font text-3xl font-bold text-white mb-4">{p.title}</h4>
              <p className="text-slate-200 font-medium mb-6 italic text-lg leading-relaxed">„{p.description}“</p>
              <div className="h-px bg-slate-800 w-full mb-6"></div>
              <p className="text-slate-400 text-sm leading-relaxed">{p.details}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Concepts */}
      <section>
        <h3 className="serif-font text-3xl font-bold text-white mb-12 border-b border-slate-800 pb-4">Vertiefung für Fortgeschrittene</h3>
        <div className="space-y-6">
          {[
            {
              title: "Owner Earnings",
              description: "Schauen Sie auf den Cashflow, abzüglich der notwendigen Reinvestitionen, um die Wettbewerbsposition zu halten.",
            },
            {
              title: "Der institutionelle Imperativ",
              description: "Die Tendenz von Managern, Konkurrenten blind nachzuahmen. Wahre Qualität zeigt sich durch unabhängiges Denken.",
            },
            {
              title: "Zinseszins (Compounding)",
              description: "Das 'Achte Weltwunder'. Suchen Sie Unternehmen, die über Jahrzehnte hohe Renditen auf Kapital erwirtschaften.",
            }
          ].map((ac, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 items-start p-8 bg-slate-900 border border-slate-800 rounded-3xl group hover:bg-slate-800/50 transition-colors">
              <div className="md:w-1/3">
                <h4 className="serif-font text-2xl font-bold text-pink-500">{ac.title}</h4>
              </div>
              <div className="md:w-2/3">
                <p className="text-slate-400 leading-relaxed text-lg">{ac.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Wisdom Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-16 rounded-[3rem] shadow-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600 opacity-[0.03] -mr-32 -mt-32 rounded-full"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h3 className="serif-font text-4xl font-bold mb-10 text-white">Ressourcen</h3>
            <ul className="space-y-6 text-slate-400">
              <li className="flex items-center space-x-5 group cursor-pointer">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-pink-500 font-bold group-hover:bg-pink-600 group-hover:text-white transition-all">1</span>
                <span className="group-hover:text-slate-200 transition-colors">Berkshire Hathaway Shareholder Letters</span>
              </li>
              <li className="flex items-center space-x-5 group cursor-pointer">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-pink-500 font-bold group-hover:bg-pink-600 group-hover:text-white transition-all">2</span>
                <span className="group-hover:text-slate-200 transition-colors">„The Intelligent Investor“ (Graham)</span>
              </li>
              <li className="flex items-center space-x-5 group cursor-pointer">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-pink-500 font-bold group-hover:bg-pink-600 group-hover:text-white transition-all">3</span>
                <span className="group-hover:text-slate-200 transition-colors">„Poor Charlie's Almanack“ (Munger)</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-950/50 p-10 rounded-[2rem] border border-slate-800 backdrop-blur-sm">
            <p className="serif-font text-3xl italic text-pink-500/80 mb-8 leading-tight">
              „In sich selbst zu investieren ist die beste Investition, die man tätigen kann.“
            </p>
            <div className="h-px bg-slate-800 w-full mb-6"></div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Worte des Orakels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
