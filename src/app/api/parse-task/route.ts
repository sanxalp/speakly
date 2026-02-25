import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: Request) {
  try {
    const { text, currentIsoString } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
       return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const systemPrompt = `
You are an intelligent task parsing assistant. 
The current date and time is: ${currentIsoString}.

Extract the following from the user's input:
1. "title": A short, concise title (max 5 words).
2. "description": A slightly longer description or null if not applicable.
3. "due_date": An ISO-8601 timestamp for when the task is due. If no specific time is given but a date is, default the time to 17:00:00 local time based on the provided current date. Output null if no date/time is mentioned at all.

Output ONLY raw JSON format matching exactly this shape: { "title": string, "description": string | null, "due_date": string | null }
Do not wrap it in markdown blockquotes like \`\`\`json. Just the raw JSON object. Use standard JSON formatting.
`;

    // google/gemini-2.5-flash-free or meta-llama/llama-3.3-70b-instruct:free are great free options on OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            temperature: 0.1 // very low for strict JSON output
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`OpenRouter Error ${response.status}:`, errText);
        return NextResponse.json({ error: `OpenRouter error ${response.status}: ${errText.slice(0, 100)}` }, { status: 500 });
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content || "";

    // Extract JSON using regex in case the LLM wrapped it in markdown or added conversational text
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    let cleanedJsonString = jsonMatch ? jsonMatch[0] : "";
    cleanedJsonString = cleanedJsonString.trim();

    try {
        const parsedData = JSON.parse(cleanedJsonString);
        return NextResponse.json(parsedData);
    } catch (parseError) {
        console.error("Failed to parse LLM JSON output:", messageContent);
        return NextResponse.json({ error: 'Failed to parse AI response into JSON' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
