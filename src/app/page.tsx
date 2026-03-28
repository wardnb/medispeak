"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/scenarios";
import ScenarioSelector from "./components/ScenarioSelector";
import ChatInterface from "./components/ChatInterface";

export default function Home() {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  if (scenario) {
    return (
      <ChatInterface scenario={scenario} onBack={() => setScenario(null)} />
    );
  }

  return <ScenarioSelector onSelect={setScenario} />;
}
