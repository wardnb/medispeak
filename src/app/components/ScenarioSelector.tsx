"use client";

import {
  scenarios,
  difficultyLabels,
  difficultyColors,
  type Scenario,
} from "@/lib/scenarios";

interface Props {
  onSelect: (scenario: Scenario) => void;
}

export default function ScenarioSelector({ onSelect }: Props) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-6 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">MediSpeak</h1>
          <p className="text-teal-100 mt-1 text-sm">
            Practice medical Spanish through patient role-play
          </p>
        </div>
      </header>

      {/* Scenario Grid */}
      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Choose a Scenario
          </h2>
          <p className="text-sm text-muted mb-4">
            Select a patient encounter to begin practicing
          </p>

          <div className="grid gap-3">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className="text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{scenario.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {scenario.title}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[scenario.difficulty]}`}
                      >
                        {difficultyLabels[scenario.difficulty]}
                      </span>
                    </div>
                    <p className="text-sm text-primary/80 font-medium mt-0.5">
                      {scenario.titleEs}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {scenario.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 mt-1 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-muted mt-6">
            AI-powered practice — not a substitute for professional language
            training
          </p>
        </div>
      </main>
    </div>
  );
}
