"use client";

export interface VocabEntry {
  term: string;
  translation: string;
  context: string;
  count: number;
}

interface Props {
  vocab: VocabEntry[];
  open: boolean;
  onToggle: () => void;
}

export default function VocabTracker({ vocab, open, onToggle }: Props) {
  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-primary-hover transition z-20"
        title="Vocabulary tracker"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-72 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Vocabulary
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {vocab.length === 0 ? (
          <p className="text-sm text-muted text-center mt-8">
            Medical vocabulary from your conversation will appear here as the
            coach highlights terms.
          </p>
        ) : (
          <div className="space-y-3">
            {vocab.map((entry, i) => (
              <div
                key={i}
                className="bg-surface rounded-lg p-3 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-primary">
                    {entry.term}
                  </span>
                  {entry.count > 1 && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      ×{entry.count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-0.5">
                  {entry.translation}
                </p>
                <p className="text-xs text-muted mt-1">{entry.context}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 text-center">
        <p className="text-xs text-muted">
          {vocab.length} term{vocab.length !== 1 ? "s" : ""} collected
        </p>
      </div>
    </div>
  );
}
