import { ProcurementRow, AnalysisResult } from "../types";
import { calculateVariance } from "../utils";

export const analyzeSchedule = async (rows: ProcurementRow[]): Promise<AnalysisResult> => {
  try {
    // Filter out empty rows to save tokens
    const validRows = rows.filter(r => r.engineeringItem || r.projectName);

    if (validRows.length === 0) {
      return {
        summary: "目前沒有足夠的資料進行分析。",
        criticalDelays: [],
        recommendations: ["請先新增工程項目與預定進度。"]
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const thirtyDaysFuture = new Date(today);
    thirtyDaysFuture.setDate(today.getDate() + 30);

    // Prepare data summary for AI
    const dataForAI = validRows.map(row => {
      const variance = calculateVariance(row.scheduledRequestDate, row.actualRequestDate);
      let status = "正常";
      if (variance !== null && variance < 0) {
        const delay = Math.abs(variance);
        if (delay > 30) status = "嚴重延誤";
        else if (delay >= 8) status = "延誤需通知";
        else status = "警示";
      } else if (variance !== null && variance > 0) {
        status = "提早";
      }

      return {
        item: row.engineeringItem || row.projectName,
        scheduled: row.scheduledRequestDate,
        actual: row.actualRequestDate,
        variance: variance,
        status: status,
        remarks: row.remarks
      };
    }).filter(item => {
      // Filter logic: Keep delays, recent activity, or upcoming tasks
      if (item.variance !== null && item.variance < 0) return true; // Late
      
      if (item.actual) {
        const actualDate = new Date(item.actual);
        if (!isNaN(actualDate.getTime()) && actualDate >= thirtyDaysAgo && actualDate <= today) return true;
      }
      
      if (item.scheduled) {
        const scheduledDate = new Date(item.scheduled);
        if (!isNaN(scheduledDate.getTime()) && scheduledDate >= today && scheduledDate <= thirtyDaysFuture) return true;
      }
      
      return false;
    });

    if (dataForAI.length === 0) {
       return {
         summary: "目前專案進度良好，近期無延誤或重大預定事項。",
         criticalDelays: [],
         recommendations: ["請持續保持目前的進度控管。"]
       };
    }

    const prompt = `
      You are a Senior Construction Project Manager. Analyze the following procurement schedule data:
      ${JSON.stringify(dataForAI)}

      Output strict JSON format ONLY (no markdown blocks) with the following structure:
      {
        "summary": "Professional summary of project health in Traditional Chinese.",
        "criticalDelays": ["List of strings describing specific delayed items and reasons in Traditional Chinese"],
        "recommendations": ["List of 3-5 specific actionable recommendations in Traditional Chinese"]
      }
    `;

    const apiKey = process.env.API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error("No response content from Gemini");
    }

    const text = candidate.content.parts[0].text;
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};