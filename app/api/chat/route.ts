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

    // 1. Invoke Real Gemini Model via Grounded System Instruction
    if (apiKey) {
      const systemInstruction = buildGroundedSystemInstruction(
        lang as ChatLanguage,
        role as ChatRole,
        snapshot
      );

      // Model priority: 3.5-flash-lite (ultra-fast 1.5s), 3.5-flash, flash-lite-latest, flash-latest
      const candidateModels = [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-flash-latest',
      ];

      for (const model of candidateModels) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_AFTER_6S')), 6000)
          );

          // Direct Google AI Studio REST call with full system instruction
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const fetchPromise = fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: [
                { role: 'user', parts: [{ text: message }] },
              ],
              generationConfig: {
                temperature: 0.2, // High clinical precision
                maxOutputTokens: 2048,
              },
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`HTTP ${res.status}: ${errBody}`);
            }
            return res.json();
          });

          const data = await Promise.race([fetchPromise, timeoutPromise]);
          const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
                  `Google Gemini AI (${model})`,
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
          console.warn(`Sinna AI: Model ${model} failed (${geminiError?.message || geminiError}), trying next...`);
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
