import { GoogleGenAI } from "@google/genai";
import { ProcurementRow, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSchedule = async (rows: ProcurementRow[]): Promise<AnalysisResult> => {
  try {
    // Filter out empty rows to save tokens
    const validRows = rows.filter(r => r.engineeringItem || r.projectName);

    if (validRows.length === 0) {
      throw new Error("No data to analyze.");
    }

    const prompt = `
      Analyze the following construction procurement schedule data as a project manager.
      
      Data:
      ${JSON.stringify(validRows)}

      Logic:
      - Variance = Scheduled Date - Actual Date. 
      - Negative variance means the request was late (delay).
      - Positive variance means it was early.

      Return a JSON object strictly adhering to this schema (do not include markdown code blocks):
      {
        "summary": "A brief executive summary of the procurement status.",
        "criticalDelays": ["List of specific items that are critically delayed and by how many days."],
        "recommendations": ["Actionable advice to recover schedule or improve process."]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
