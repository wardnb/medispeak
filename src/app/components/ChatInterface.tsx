"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Scenario } from "@/lib/scenarios";
import { difficultyLabels, difficultyColors } from "@/lib/scenarios";
import CoachPanel, { type Coaching } from "./CoachPanel";
import VocabTracker, { type VocabEntry } from "./VocabTracker";
import { speakText, stopSpeaking, useSpeechRecognition } from "@/lib/speech";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  coaching?: Coaching;
}

interface Props {
  scenario: Scenario;
  onBack: () => void;
}

export default function ChatInterface({ scenario, onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [vocab, setVocab] = useState<VocabEntry[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, transcript, startListening, stopListening, isSupported: sttSupported } =
    useSpeechRecognition({
      lang: "es-ES",
      onResult: (finalText) => {
        setInput((prev) => (prev ? prev + " " + finalText : finalText));
      },
    });

  // Sync interim transcript into input while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  const handleSpeak = useCallback((msgId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // If already speaking this message, stop
    if (speakingId === msgId) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    stopSpeaking();
    setSpeakingId(msgId);
    speakText(text);

    // Reset icon when utterance ends
    const checkDone = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeakingId(null);
        clearInterval(checkDone);
      }
    }, 200);
  }, [speakingId]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addVocab = useCallback(
    (newTerms: { term: string; translation: string; context: string }[]) => {
      setVocab((prev) => {
        const updated = [...prev];
        for (const t of newTerms) {
          const existing = updated.find(
            (v) => v.term.toLowerCase() === t.term.toLowerCase()
          );
          if (existing) {
            existing.count++;
          } else {
            updated.push({ ...t, count: 1 });
          }
        }
        return updated;
      });
    },
    []
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          messages: chatHistory,
          userMessage: text,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.patientMessage,
        coaching: data.coaching,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-play patient response via TTS
      stopSpeaking();
      setSpeakingId(assistantMsg.id);
      speakText(data.patientMessage);
      const checkDone = setInterval(() => {
        if (typeof window !== "undefined" && !window.speechSynthesis.speaking) {
          setSpeakingId(null);
          clearInterval(checkDone);
        }
      }, 200);

      if (data.coaching?.vocabulary?.length > 0) {
        addVocab(data.coaching.vocabulary);
      }
    } catch (err) {
      console.error("Send error:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Lo siento, hubo un error. Por favor, intente de nuevo.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-[#f8fffe]">
      {/* Header */}
      <header className="bg-primary text-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-white/10 rounded-lg p-1.5 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{scenario.icon}</span>
              <h1 className="font-semibold truncate">{scenario.titleEs}</h1>
            </div>
            <p className="text-xs text-teal-100 truncate">
              {scenario.description}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[scenario.difficulty]} shrink-0`}
          >
            {difficultyLabels[scenario.difficulty]}
          </span>
        </div>
      </header>

      {/* Patient context card */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-4">
        <div className="bg-surface border border-primary/10 rounded-lg p-3 text-sm">
          <p className="font-medium text-primary mb-1">Patient Context</p>
          <p className="text-gray-700 text-xs leading-relaxed">
            {scenario.patientProfile}
          </p>
        </div>
      </div>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto chat-scroll px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted text-sm">
                Start the conversation in Spanish.
              </p>
              <p className="text-muted text-xs mt-1">
                Try greeting the patient: &quot;Buenos días, ¿cómo se
                siente?&quot;
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Message bubble */}
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-user-bg text-gray-900 rounded-br-md"
                        : "bg-patient-bg border border-primary/10 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span className="text-xs font-medium text-primary block mb-1">
                        Paciente
                      </span>
                    )}
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      className={`shrink-0 p-1.5 rounded-full transition hover:bg-primary/10 ${
                        speakingId === msg.id ? "text-primary bg-primary/10" : "text-gray-400 hover:text-primary"
                      }`}
                      title={speakingId === msg.id ? "Stop speaking" : "Listen in Spanish"}
                      aria-label={speakingId === msg.id ? "Stop speaking" : "Listen in Spanish"}
                    >
                      {speakingId === msg.id ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5l5-4v15l-5-4H4a1 1 0 01-1-1v-5a1 1 0 011-1h2.5z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Coach panel */}
              {msg.coaching && (
                <div className="mt-2 max-w-[90%] mx-auto">
                  <CoachPanel coaching={msg.coaching} />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-patient-bg border border-primary/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="typing-dot w-2 h-2 bg-primary/50 rounded-full" />
                  <div className="typing-dot w-2 h-2 bg-primary/50 rounded-full" />
                  <div className="typing-dot w-2 h-2 bg-primary/50 rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba en español..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 placeholder:text-gray-400"
            disabled={loading}
          />
          {sttSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className={`rounded-xl px-3 py-2.5 transition shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isListening ? "Stop recording" : "Speak in Spanish"}
              aria-label={isListening ? "Stop recording" : "Speak in Spanish"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
              </svg>
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-primary text-white rounded-xl px-4 py-2.5 font-medium text-sm hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19V5m0 0l-7 7m7-7l7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Vocab tracker */}
      <VocabTracker
        vocab={vocab}
        open={vocabOpen}
        onToggle={() => setVocabOpen(!vocabOpen)}
      />
    </div>
  );
}
