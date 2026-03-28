import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { scenarios } from "@/lib/scenarios";

const client = new Anthropic();

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { scenarioId, messages, userMessage } = (await req.json()) as {
    scenarioId: string;
    messages: ChatMessage[];
    userMessage: string;
  };

  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    return Response.json({ error: "Scenario not found" }, { status: 400 });
  }

  // Build conversation history for the patient
  const conversationHistory: ChatMessage[] = [
    ...messages,
    { role: "user", content: userMessage },
  ];

  try {
    // 1) Get patient response
    const patientResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: `${scenario.systemPrompt}

IMPORTANT RULES:
- Respond ONLY in Spanish as the patient character.
- Stay in character at all times.
- Keep responses conversational and realistic (1-4 sentences typically).
- If the user writes in English, respond in Spanish but show slight confusion, as a real patient would.
- Use natural filler words and expressions appropriate to the character.`,
      messages: conversationHistory,
    });

    const patientText =
      patientResponse.content[0].type === "text"
        ? patientResponse.content[0].text
        : "";

    // 2) Get coach feedback
    const coachResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: `You are a medical Spanish language coach. The user is a medical professional practicing Spanish with a simulated patient. Analyze the user's latest message and provide brief, helpful feedback.

Your response must be a JSON object with this exact structure:
{
  "corrections": [
    {"original": "incorrect phrase", "corrected": "correct phrase", "explanation": "brief explanation in English"}
  ],
  "vocabulary": [
    {"term": "Spanish medical term", "translation": "English translation", "context": "when to use this term"}
  ],
  "tip": "A brief encouraging tip about their Spanish or a medical communication suggestion (in English)",
  "score": 1-5
}

Rules:
- "corrections": grammar, vocabulary, or phrasing errors. Empty array if none.
- "vocabulary": 1-2 relevant medical Spanish terms they should know for this conversation, especially if they used English words where a Spanish medical term exists. Empty array if not needed.
- "tip": one sentence of encouragement or a practical tip. Always include this.
- "score": 1=major errors, 3=good with minor issues, 5=native-like.
- Be encouraging but honest.
- Focus on medical Spanish specifically.
- Return ONLY the JSON object, no other text.`,
      messages: [
        {
          role: "user",
          content: `Scenario: ${scenario.title}
Patient profile: ${scenario.patientProfile}

Conversation so far:
${messages.map((m) => `${m.role === "user" ? "Doctor" : "Patient"}: ${m.content}`).join("\n")}

Doctor's latest message: "${userMessage}"
Patient's response: "${patientText}"

Analyze the doctor's latest message:`,
        },
      ],
    });

    const coachText =
      coachResponse.content[0].type === "text"
        ? coachResponse.content[0].text
        : "{}";

    let coaching;
    try {
      coaching = JSON.parse(coachText);
    } catch {
      coaching = {
        corrections: [],
        vocabulary: [],
        tip: "Keep practicing! You're doing great.",
        score: 3,
      };
    }

    return Response.json({
      patientMessage: patientText,
      coaching,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
