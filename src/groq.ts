import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function chatJSON<T>(systemPrompt: string, userContent: string): Promise<T> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");

  return JSON.parse(text) as T;
}
