import { GoogleGenAI } from "@google/genai";
import { ProcurementRow, AnalysisResult } from "../types";
import { calculateVariance } from "../utils";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSchedule = async (rows: ProcurementRow[]): Promise<AnalysisResult> => {
  try {
    // Filter out empty rows to save tokens
    const validRows = rows.filter(r => r.engineeringItem || r.projectName);

    if (validRows.length === 0) {
      throw new Error("No data to analyze.");
    }

    const today = new Date();
    // Set time to midnight for consistent comparison
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const thirtyDaysFuture = new Date(today);
    thirtyDaysFuture.setDate(today.getDate() + 30);

    // Filter and Map in one pass (conceptually)
    const dataForAI = validRows.map(row => {
      const variance = calculateVariance(row.scheduledRequestDate, row.actualRequestDate);
      let status = "正常";
      if (variance !== null && variance < 0) {
        const delay = Math.abs(variance);
        if (delay > 30) status = "嚴重延誤 (紅燈)";
        else if (delay >= 8) status = "延誤需通知 (橘燈)";
        else status = "警示 (黃燈)";
      } else if (variance !== null && variance > 0) {
        status = "提早";
      }

      return {
        item: row.engineeringItem || row.projectName,
        scheduled: row.scheduledRequestDate,
        actual: row.actualRequestDate,
        variance: variance, // Days. Negative means late.
        status: status,
        remarks: row.remarks
      };
    }).filter(item => {
      // 1. Critical: Any delay
      if (item.variance !== null && item.variance < 0) return true;

      // 2. Recent Activity: Actual date within last 30 days
      if (item.actual) {
        const actualDate = new Date(item.actual);
        if (!isNaN(actualDate.getTime()) && actualDate >= thirtyDaysAgo && actualDate <= today) {
          return true;
        }
      }

      // 3. Upcoming: Scheduled date within next 30 days
      if (item.scheduled) {
        const scheduledDate = new Date(item.scheduled);
        if (!isNaN(scheduledDate.getTime()) && scheduledDate >= today && scheduledDate <= thirtyDaysFuture) {
          return true;
        }
      }

      // Otherwise, exclude to save tokens
      return false;
    });

    if (dataForAI.length === 0) {
       // If filter removes everything, just send a minimal set or message
       // But to ensure we get a valid response, let's send top 5 items if array is empty?
       // Or just return a "No critical items" result directly without API call?
       // Let's assume we proceed but maybe with a note, or if empty, simply return a default "All good".
       return {
         summary: "目前沒有延誤項目，且近 30 天內無相關進度或未來 30 天內無預定事項。",
         criticalDelays: [],
         recommendations: ["持續保持目前的進度控管。"]
       };
    }

    const prompt = `
      角色設定：你是一位嚴格且經驗豐富的「資深營建專案經理」(Senior Construction Project Manager)。
      
      數據來源 (Data):
      ${JSON.stringify(dataForAI, null, 2)}

      注意：提供的數據已經過篩選，僅包含「已延誤」、「近期已完成」或「未來 30 天內需執行」的關鍵項目。請專注分析這些關鍵領域。
      (Note: The provided data only includes delayed items, recently completed items, and upcoming tasks. Please focus your analysis on these critical areas.)

      任務：請分析上述數據，重點關注每個項目的「工程項目 (item)」、「備註 (remarks)」、「時程差異 (variance)」以及「狀態 (status)」。

      輸出要求 (嚴格遵守 JSON 格式):
      請回傳一個 JSON 物件，格式如下：
      {
        "summary": "行政摘要：評估整體專案採購健康度。請綜合參考延誤項目的數量與嚴重程度，使用繁體中文，語氣專業。",
        "criticalDelays": [
           "列出所有 variance < 0 (延誤) 的項目。格式：「[工程項目]：[備註內容]。目前延誤 X 天 (狀態)，原因分析...」。請務必參考 remarks 欄位中的說明來解釋原因或現況。"
        ],
        "recommendations": [
           "針對上述延誤項目及備註內容，提供 3-5 點具體的趕工或解決建議。建議必須具體（例如：針對長交期設備、針對缺工、針對廠商議價等）。"
        ]
      }

      限制：
      1. 只輸出 JSON，不要 Markdown block。
      2. 必須使用 **繁體中文 (Traditional Chinese)**。
      3. 若無延誤，criticalDelays 可為空陣列，並在 summary 讚揚進度良好。
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