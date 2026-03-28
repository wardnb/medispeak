"use client";

export interface Coaching {
  corrections: { original: string; corrected: string; explanation: string }[];
  vocabulary: { term: string; translation: string; context: string }[];
  tip: string;
  score: number;
}

interface Props {
  coaching: Coaching;
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1" title={`Score: ${score}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= score ? "bg-amber-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function CoachPanel({ coaching }: Props) {
  const hasCorrections = coaching.corrections.length > 0;
  const hasVocab = coaching.vocabulary.length > 0;

  return (
    <div className="bg-coach-bg border border-coach-border/30 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-amber-800 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Coach
        </span>
        <ScoreDots score={coaching.score} />
      </div>

      {hasCorrections && (
        <div className="mb-2">
          {coaching.corrections.map((c, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-red-500 mt-0.5 shrink-0">✗</span>
              <div>
                <span className="line-through text-red-700/70">{c.original}</span>
                {" → "}
                <span className="font-medium text-green-800">{c.corrected}</span>
                <p className="text-xs text-muted mt-0.5">{c.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasVocab && (
        <div className="mb-2">
          {coaching.vocabulary.map((v, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 bg-white/60 rounded px-2 py-1 mr-2 mb-1"
            >
              <span className="font-medium text-primary">{v.term}</span>
              <span className="text-muted">—</span>
              <span className="text-gray-700">{v.translation}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-amber-900/80 italic">{coaching.tip}</p>
    </div>
  );
}
