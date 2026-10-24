import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { 
  ChatLanguage, 
  ChatRole, 
  LiveClinicSnapshot, 
  buildGroundedSystemInstruction, 
  resolveOfflineClinicalQuery,
  parseAssistantResponse
} from '@/lib/clinical-rag-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      lang = 'en', 
      role = 'patient', 
      snapshot = {} as LiveClinicSnapshot 
    } = body;

    if (!message || typeof message !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid message string' }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // 1. Invoke Real Gemini Model via RAG Grounded System Instruction
    if (apiKey) {
      const client = new GoogleGenAI({ apiKey });
      const systemInstruction = buildGroundedSystemInstruction(
        lang as ChatLanguage,
        role as ChatRole,
        snapshot
      );

      // Model priority: flash-lite-latest (fast & active quota), 3.5-flash-lite, 3.7-flash, 3.8-flash
      const candidateModels = [
        'gemini-flash-lite-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ];

      for (const model of candidateModels) {
        try {
          const genResult = await client.models.generateContent({
            model,
            contents: message,
            config: {
              systemInstruction,
              temperature: 0.2, // High clinical precision to prevent hallucination
              maxOutputTokens: 2048,
            },
          });

          const outputText = genResult.text;
          if (outputText && outputText.trim().length > 10) {
            const { cleanText, actions, suggestedPrompts } = parseAssistantResponse(outputText);
            const isBookingQuery = /book|appointment|ቀጠሮ|beellam|schedule/i.test(message);
            return new NextResponse(
              JSON.stringify({
                success: true,
                text: cleanText,
                actions: actions.length > 0 ? actions : undefined,
                suggestedPrompts: suggestedPrompts.length > 0 ? suggestedPrompts : undefined,
                bookingWidget: isBookingQuery
                  ? {
                      serviceId: 'srv-cleaning',
                      doctorId: 'doc-senait',
                      date: 'Tomorrow',
                      slot: '10:30 AM',
                    }
                  : undefined,
                sources: [
                  `Gemini AI (${model} RAG Grounded)`,
                  'Bole Dental Verified Database',
                  snapshot.pageTitle || 'Live Operatory State'
                ],
                model,
              }),
              {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
              }
            );
          }
        } catch (geminiError: any) {
          console.warn(`Sinna AI: Model ${model} unavailable (${geminiError?.status || geminiError?.message}), trying next model...`);
        }
      }
    }

    // 2. Deterministic Grounded Offline RAG Fallback (Only if API offline or out of quota)
    const offlineResult = resolveOfflineClinicalQuery(
      message,
      lang as ChatLanguage,
      role as ChatRole,
      snapshot
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        text: offlineResult.text,
        sources: offlineResult.sources,
        suggestedPrompts: offlineResult.suggestedPrompts,
        bookingWidget: offlineResult.bookingWidget,
        model: 'sinna-clinical-rag-offline',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  } catch (error: any) {
    console.error('Sinna Chat API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process chat query', details: error?.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
