import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateStudentSummary = async (student: Student): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a brief, professional 2-sentence summary for a student ID card profile. 
            Student: ${student.fullName}, Major: ${student.department}, Status: ${student.status}.
            Tone: Formal and administrative.`,
        });
        return response.text || "No summary available.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Student profile validated locally.";
    }
};

export const verifyStudentSecurity = async (student: Student): Promise<{ allowed: boolean, reason: string }> => {
    try {
        const ai = getClient();
        const prompt = `
        Act as a university security system. Analyze this student for campus access eligibility.
        
        Student Details:
        Name: ${student.fullName}
        Status: ${student.status}
        Valid Until: ${student.validUntil}
        Department: ${student.department}
        
        Today's Date: ${new Date().toISOString().split('T')[0]}

        Rules:
        1. Status MUST be 'Active'.
        2. Valid Until date must be in the future.
        3. If Suspended, Expelled, or Inactive, deny access.
        
        Return a JSON response.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        allowed: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                    },
                    required: ["allowed", "reason"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response");
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Gemini Security Check Failed", error);
        // Fallback local logic
        const isExpired = new Date(student.validUntil) < new Date();
        if (student.status !== 'Active' || isExpired) {
            return { allowed: false, reason: "Status check failed (Offline Fallback)" };
        }
        return { allowed: true, reason: "Active student (Offline Fallback)" };
    }
};