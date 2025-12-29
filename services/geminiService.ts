
import { GoogleGenAI } from "@google/genai";
import { GameStatus, Player, GameMode, Difficulty } from "../types";

export const getGameCommentary = async (
  status: GameStatus, 
  turn: Player, 
  mode: GameMode, 
  difficulty: Difficulty
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  if (status === 'PLAYING') {
    prompt = `The user is playing Tic-Tac-Toe against ${mode === GameMode.PVE ? `an AI on ${difficulty} difficulty` : 'another human'}. It is currently ${turn}'s turn. Write a very short, witty, one-sentence comment encouraging or teasing the current player. Keep it under 15 words.`;
  } else if (status === 'X_WON') {
    prompt = `Game Over. Player X has won Tic-Tac-Toe. Write a short, funny, celebratory victory line for X. Keep it under 15 words.`;
  } else if (status === 'O_WON') {
    prompt = `Game Over. Player O has won Tic-Tac-Toe. Write a short, funny, celebratory victory line for O. Keep it under 15 words.`;
  } else {
    prompt = `Game Over. The Tic-Tac-Toe match ended in a draw. Write a short, sarcastic or witty remark about how nobody won. Keep it under 15 words.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional, sarcastic, and funny Tic-Tac-Toe commentator with a neon-synthwave personality.",
        temperature: 0.8,
        maxOutputTokens: 50,
      }
    });
    return response.text || "Let's see who's smarter!";
  } catch (error) {
    console.error("Gemini Commentary Error:", error);
    return "Nice move! What's next?";
  }
};
