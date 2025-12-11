import { GoogleGenAI, Type } from "@google/genai";
import { Curriculum, Quiz } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

export const generateCurriculum = async (skill: string, apiKey: string): Promise<Curriculum> => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Create a comprehensive, university-style learning curriculum for the skill: "${skill}".
    
    Structure the curriculum into 4 distinct modules: Beginner, Intermediate, Advanced, and Mastery.
    
    For each module:
    1. Define a clear Title.
    2. List 3 specific learning goals.
    3. List 3 key concepts.
    4. Curate 3 video topics. 
       For each video, provide a "searchQuery" that would find the best possible real-world YouTube video (e.g., "Python for Beginners full course Mosh").
       Provide a fallback title and description.
    
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
                      searchQuery: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['title', 'searchQuery', 'description']
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
  
  const data = JSON.parse(text) as Curriculum;
  
  data.modules = data.modules.map((m, i) => ({
    ...m,
    id: m.id || `mod-${i}`,
    isCompleted: false
  }));

  return data;
};

export const generateQuiz = async (contextType: 'module' | 'video', contextData: any, apiKey: string): Promise<Quiz> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = "";
  if (contextType === 'module') {
    prompt = `
      Generate a short 3-question quiz to test knowledge on the module: "${contextData.title}".
      Key concepts to cover: ${contextData.keyConcepts.join(', ')}.
    `;
  } else {
    prompt = `
      Generate a short 3-question quiz to verify that the user understood the video titled: "${contextData.title}".
      Video Description context: "${contextData.description}".
      
      The questions should ensure they actually watched the video content.
    `;
  }

  prompt += `
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
    contextId: contextData.id || contextData.videoId || 'temp', 
    title: contextType === 'module' ? `Module Quiz: ${contextData.title}` : `Video Quiz: ${contextData.title}`,
    questions: data.questions
  };
};