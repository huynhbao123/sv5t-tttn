
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEvidence = async (fileName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Phân tích minh chứng hồ sơ Sinh viên 5 Tốt: 
      Tên tệp: ${fileName}
      Mô tả: ${description}
      Hãy đánh giá xem minh chứng này có phù hợp để làm 'Tiêu chí cứng' không và gợi ý điểm số dựa trên quy định (Cấp khoa, Trường, TW). 
      Trả về kết quả dưới dạng JSON có fields: isSuitable (boolean), suggestedScore (number), reasoning (string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSuitable: { type: Type.BOOLEAN },
            suggestedScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["isSuitable", "suggestedScore", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
