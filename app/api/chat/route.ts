import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are ProAnswer, a friendly and professional AI receptionist for a home services business called ProHome Services.

You help callers:
- Book appointments for plumbing, electrical, HVAC, and general contracting services
- Answer questions about services offered
- Collect caller information: name, phone number, and the issue they're having
- Provide estimated availability windows

Keep responses concise and conversational — this simulates a phone call interaction. Be warm, helpful, and efficient. Use natural, friendly language.

If someone wants to book, collect their preferred date/time and confirm the appointment.

Do NOT make up prices — say pricing depends on the job and a licensed technician will provide a free quote on-site.

Available services: Plumbing repairs, drain cleaning, water heater installation, electrical panel work, outlet/switch repairs, HVAC maintenance, AC repair, heating repair, general home repairs.

Business hours: Monday–Friday 7am–7pm, Saturday 8am–4pm, emergency services available 24/7 for an additional fee.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
