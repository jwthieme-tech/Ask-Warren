
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse, TickerInfo, GroundingChunk } from "../types";

const SYSTEM_INSTRUCTION = `
DU BIST ASK WARREN, ein digitaler Investment-Analyse-Agent.
Deine Argumentation, Struktur, dein Tonfall und deine Schlussfolgerungen leiten sich ausschließlich aus der öffentlich dokumentierten Investment-Philosophie von Warren Buffett ab.
Analysiere Unternehmen wie ein langfristiger Geschäftsinhaber auf Basis öffentlich zugänglicher Informationen.

SPRACH- & AUSGABEREGELN:
Sprache: Deutsch (zwingend)
Stil: Ruhig, rational, klar. Kein Hype, keine Emojis.

INVESTITIONSPRINZIPIEN:
1. Circle of Competence
2. Economic Moat (Rating: Kein / Schwach / Mittel / Stark)
3. Managementqualität
4. Finanzielle Stärke (Gewinnstabilität, ROIC, Verschuldung)
5. Bewertung vs. Innerer Wert (Sicherheitsmarge)

MANDATORISCHE STRUKTUR DES TEXTES:
1️⃣ Geschäftsmodell
2️⃣ Wettbewerbsvorteile (Moat)
3️⃣ Finanzielle Qualität
4️⃣ Management & Kapitalallokation
5️⃣ Bewertung & Sicherheitsmarge
6️⃣ Zentrale Risiken
🔮 Urteil des Orakels von Omaha
`;

// Analyze company using Gemini 3 Pro with search grounding
export const analyzeCompany = async (query: string): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const searchResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Führe eine Buffett-Analyse für ${query} durch.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const analysisText = searchResponse.text || "Keine Analyse verfügbar.";
    const rawGroundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources as per search grounding rules
    const sources: GroundingChunk[] = rawGroundingChunks
      .filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title || chunk.web!.uri!
        }
      }));

    // Extract financial data as structured JSON
    const jsonResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Extrahiere die Finanzdaten (Umsatz, Margen, ROIC, Kursverlauf) für ${query} basierend auf aktuellen Marktdaten der letzten 5 Jahre als JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            charts: {
              type: Type.OBJECT,
              properties: {
                revenue: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } },
                    required: ["year", "value"]
                  } 
                },
                margins: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } },
                    required: ["year", "value"]
                  } 
                },
                roic: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } },
                    required: ["year", "value"]
                  } 
                },
                stockPrice: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { year: { type: Type.STRING }, value: { type: Type.NUMBER } },
                    required: ["year", "value"]
                  } 
                },
              },
              required: ["revenue", "margins", "roic", "stockPrice"]
            }
          },
          required: ["charts"]
        }
      },
    });

    const jsonText = jsonResponse.text || "{}";
    const data = JSON.parse(jsonText.trim());

    return {
      query,
      text: analysisText,
      sources,
      charts: data.charts,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Fehler bei der Kommunikation mit dem Orakel. Bitte versuchen Sie es später erneut.");
  }
};

// Fetch market data with search grounding extraction to comply with rules
export const fetchMarketTicker = async (): Promise<{ tickers: TickerInfo[], sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const tickerResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Aktuelle Kurse für: S&P 500, DAX, Berkshire Hathaway B, Apple, Coca-Cola.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract grounding chunks for the ticker
    const sources: GroundingChunk[] = tickerResponse.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web && chunk.web.uri)
      ?.map(chunk => ({
        web: {
          uri: chunk.web!.uri!,
          title: chunk.web!.title || chunk.web!.uri!
        }
      })) || [];

    const jsonResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: `Formatiere diese Kurse als JSON Array: ${tickerResponse.text || ""}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              symbol: { type: Type.STRING },
              price: { type: Type.STRING },
              change: { type: Type.STRING },
              isUp: { type: Type.BOOLEAN },
            },
            required: ["name", "symbol", "price", "change", "isUp"],
          }
        }
      },
    });

    const jsonText = jsonResponse.text || "[]";
    return {
      tickers: JSON.parse(jsonText.trim()),
      sources
    };
  } catch (error) {
    console.error("Ticker Error:", error);
    return {
      tickers: [
        { name: "S&P 500", symbol: ".INX", price: "---", change: "0.0%", isUp: true },
        { name: "DAX", symbol: "GDAXI", price: "---", change: "0.0%", isUp: true },
        { name: "Berkshire B", symbol: "BRK.B", price: "---", change: "0.0%", isUp: true },
      ],
      sources: []
    };
  }
};

// Document summarization with Gemini 3 Flash
export const summarizeDocument = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: "Fasse dieses Dokument aus der Perspektive von Warren Buffett zusammen. Konzentriere dich auf Geschäftsmodell, Wettbewerbsvorteile und finanzielle Integrität. Halte es prägnant (max 200 Wörter)." }
        ]
      },
      config: {
        systemInstruction: "Du bist Warren Buffett. Analysiere Dokumente rational, langfristig und ohne unnötige Komplexität."
      }
    });

    return response.text || "Zusammenfassung konnte nicht generiert werden.";
  } catch (error) {
    console.error("Summarize Error:", error);
    return "Fehler bei der Dokumentenanalyse.";
  }
};
