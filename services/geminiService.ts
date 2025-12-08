import { GoogleGenAI, Type } from "@google/genai";
import { Curriculum, Quiz } from "../types";

// Using gemini-2.5-flash for speed and cost-effectiveness (lowest price tier)
const MODEL_NAME = "gemini-2.5-flash";

export const generateCurriculum = async (skill: string, apiKey: string): Promise<Curriculum> => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const ai = new GoogleGenAI({ apiKey });
  
  // Prompt updated to strictly ignore Video IDs and focus on search-friendly metadata
  const prompt = `
    Create a comprehensive, university-style learning curriculum for the skill: "${skill}".
    
    Structure the curriculum into 4 distinct modules: Beginner, Intermediate, Advanced, and Mastery.
    
    For each module:
    1. Define a clear Title.
    2. List 3 specific learning goals.
    3. List 3 key concepts.
    4. Curate the best educational YouTube content.
       
       VIDEO SELECTION RULES:
       - DO NOT generate video IDs or URLs.
       - YOU MUST provide the EXACT Title and Channel Name of real, existing, high-quality videos.
       - The user will search for these titles, so they must be accurate.
       - Avoid generic titles like "Python Tutorial". Use specific ones like "Python for Beginners - Full Course [2024]".
    
    Finally, generate a "Career Integration" section with project ideas, interview questions, and resume bullet points.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skillName: { type: Type.STRING },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                level: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced', 'Mastery'] },
                title: { type: Type.STRING },
                learningGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                videos: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      channel: { type: Type.STRING },
                      description: { type: Type.STRING },
                      duration: { type: Type.STRING },
                    },
                    required: ['title', 'channel', 'description', 'duration']
                  }
                }
              },
              required: ['id', 'level', 'title', 'learningGoals', 'keyConcepts', 'videos']
            }
          },
          career: {
            type: Type.OBJECT,
            properties: {
              projectIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              resumeBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              githubStarterDescription: { type: Type.STRING }
            },
            required: ['projectIdeas', 'interviewQuestions', 'resumeBullets', 'githubStarterDescription']
          }
        },
        required: ['skillName', 'modules', 'career']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  // Parse JSON and add initial local state properties
  const data = JSON.parse(text) as Curriculum;
  
  // Ensure IDs are unique if Gemini messed up, and set defaults
  data.modules = data.modules.map((m, i) => ({
    ...m,
    id: m.id || `mod-${i}`,
    isCompleted: false
  }));

  return data;
};

export const generateQuiz = async (skill: string, moduleTitle: string, concepts: string[], apiKey: string): Promise<Quiz> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Generate a short 3-question quiz to test knowledge on: "${moduleTitle}" within the skill "${skill}".
    Focus on these concepts: ${concepts.join(', ')}.
    
    For each question, provide 4 options and the index (0-3) of the correct answer. Provide a short explanation for the correct answer.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctAnswerIndex', 'explanation']
            }
          }
        },
        required: ['questions']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No quiz generated");

  const data = JSON.parse(text);
  
  return {
    moduleId: 'temp', // This will be assigned by the caller
    questions: data.questions
  };
};