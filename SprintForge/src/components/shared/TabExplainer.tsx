import React, { useId, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  BookOpen,
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
  const contentId = useId();

  const getTheme = () => {
    switch (methodology) {
      case 'XP':
        return {
          border: 'border-cyan-200',
          badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          iconColor: 'text-cyan-700',
          iconBg: 'bg-cyan-50 border-cyan-100',
          accentColor: 'text-cyan-800',
          bulletColor: 'text-cyan-700',
          pillBg: 'bg-cyan-50 border-cyan-200',
        };
      case 'SCRUM':
        return {
          border: 'border-purple-200',
          badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
          iconColor: 'text-purple-700',
          iconBg: 'bg-purple-50 border-purple-100',
          accentColor: 'text-purple-800',
          bulletColor: 'text-purple-700',
          pillBg: 'bg-purple-50 border-purple-200',
        };
      case 'KANBAN':
        return {
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          iconColor: 'text-emerald-700',
          iconBg: 'bg-emerald-50 border-emerald-100',
          accentColor: 'text-emerald-800',
          bulletColor: 'text-emerald-700',
          pillBg: 'bg-emerald-50 border-emerald-200',
        };
      default:
        return {
          border: 'border-blue-200',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
          iconColor: 'text-blue-700',
          iconBg: 'bg-blue-50 border-blue-100',
          accentColor: 'text-blue-800',
          bulletColor: 'text-blue-700',
          pillBg: 'bg-blue-50 border-blue-200',
        };
    }
  };

  const theme = getTheme();

  return (
    <section className={`mb-6 overflow-hidden rounded-2xl border ${theme.border} bg-white shadow-sm transition-shadow duration-200 hover:shadow-md`}>
      {/* Accessible expandable header */}
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563EB]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex shrink-0 items-center justify-center rounded-xl border p-2.5 ${theme.iconBg}`}>
            <BookOpen className={`h-4 w-4 ${theme.iconColor}`} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{title}</span>
              {badge && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${theme.badgeBg}`}>
                  {badge}
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{summary}</span>
          </span>
        </span>
        <span className="ml-2 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] shadow-sm">
          <span className="hidden sm:inline">{isExpanded ? 'Ocultar Guia' : 'Como funciona'}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div id={contentId} className="space-y-4 border-t border-slate-200 px-5 pb-5 pt-4 text-xs text-slate-700 animate-in fade-in duration-150">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 leading-relaxed">
            <div className="mb-1.5 flex items-center gap-2 font-bold text-slate-900">
              <Lightbulb className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              <span>Conceito & Finalidade na Metodologia:</span>
            </div>
            <p className="text-slate-700">{summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                <CheckCircle2 className={`h-4 w-4 ${theme.bulletColor}`} aria-hidden="true" />
                <span>Como Funciona na Prática:</span>
              </div>
              <ol className="space-y-2">
                {howItWorks.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${theme.pillBg} ${theme.accentColor}`}>
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {tips && tips.length > 0 && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  <Sparkles className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  <span>Boas Práticas Ágeis & Dicas:</span>
                </div>
                <ul className="space-y-2">
                  {tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
