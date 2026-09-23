import React, { useState } from 'react';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export interface TabExplainerProps {
  title: string;
  badge?: string;
  methodology: 'XP' | 'SCRUM' | 'KANBAN' | 'GERAL';
  summary: string;
  howItWorks: string[];
  tips?: string[];
  defaultExpanded?: boolean;
}

export const TabExplainer: React.FC<TabExplainerProps> = ({
  title,
  badge,
  methodology,
  summary,
  howItWorks,
  tips,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getTheme = () => {
    switch (methodology) {
      case 'XP':
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-950/90',
          badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          iconColor: 'text-cyan-400',
          accentColor: 'text-cyan-300',
          bulletColor: 'text-cyan-400',
          pillBg: 'bg-cyan-500/20 text-cyan-200',
        };
      case 'SCRUM':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-slate-950/90',
          badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          iconColor: 'text-purple-400',
          accentColor: 'text-purple-300',
          bulletColor: 'text-purple-400',
          pillBg: 'bg-purple-500/20 text-purple-200',
        };
      case 'KANBAN':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950/90',
          badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          iconColor: 'text-emerald-400',
          accentColor: 'text-emerald-300',
          bulletColor: 'text-emerald-400',
          pillBg: 'bg-emerald-500/20 text-emerald-200',
        };
      default:
        return {
          border: 'border-indigo-500/30',
          bg: 'bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-slate-950/90',
          badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
          iconColor: 'text-indigo-400',
          accentColor: 'text-indigo-300',
          bulletColor: 'text-indigo-400',
          pillBg: 'bg-indigo-500/20 text-indigo-200',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.bg} shadow-lg transition-all duration-200 overflow-hidden mb-6`}>
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <BookOpen className={`w-4 h-4 ${theme.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">{title}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xl">
              {summary}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800 transition-all shrink-0 ml-2"
        >
          <span>{isExpanded ? 'Ocultar Guia' : 'Como funciona'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 space-y-4 text-xs text-slate-300 animate-in fade-in duration-150">
          
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 leading-relaxed text-slate-300">
            <div className="font-bold text-slate-100 mb-1 flex items-center gap-1.5">
              <Lightbulb className={`w-3.5 h-3.5 ${theme.iconColor}`} />
              <span>Conceito & Finalidade na Metodologia:</span>
            </div>
            <p>{summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step by Step / Como Funciona */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <CheckCircle2 className={`w-3.5 h-3.5 ${theme.bulletColor}`} />
                <span>Como Funciona na Prática:</span>
              </span>
              <ul className="space-y-1.5">
                {howItWorks.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className={`w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold ${theme.accentColor} flex items-center justify-center shrink-0 mt-0.5`}>
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Agile Best Practices & Tips */}
            {tips && tips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Boas Práticas Ágeis & Dicas:</span>
                </span>
                <ul className="space-y-1.5">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
