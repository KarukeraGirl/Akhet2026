
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeProgress = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Agis comme l'Oracle d'Akhet, un coach de vie expert en sagesse ancienne et stratégie moderne.
    Analyse les données suivantes de l'utilisateur pour l'année 2026 :
    ${JSON.stringify(data)}

    Donne un conseil stratégique, une mise en garde si nécessaire, et un mot d'encouragement.
    Utilise un ton solennel mais motivant, parsemé de références à l'Égypte antique (Maât, le Nil, l'Horizon).
    Sois précis sur les chiffres si mentionnés.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

export const extractIsbnFromImage = async (base64Data: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      },
      {
        text: "Examine attentivement cette image. Ton objectif est de localiser et d'extraire le numéro ISBN (International Standard Book Number). L'ISBN peut avoir 10 ou 13 chiffres. Il est souvent situé près du code-barres. S'il y a à la fois un ISBN-10 et un ISBN-13, tu DOIS préférer l'ISBN-13. Ne retourne que la séquence numérique de l'ISBN. Si aucun ISBN n'est clairement visible ou déchiffrable, retourne le mot 'null'."
      }
    ]
  });

  const result = response.text?.trim();
  if (!result || result.toLowerCase() === 'null') return null;

  const cleaned = result.replace(/[^0-9]/g, '');

  if (cleaned.length === 13 && (cleaned.startsWith('978') || cleaned.startsWith('979'))) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return cleaned;
  }

  // Fallback for cases where the model might return a valid ISBN but with extra text.
  const isbn13Match = result.match(/(978|979)\d{10}/);
  if (isbn13Match) {
    return isbn13Match[0];
  }
  
  const isbn10Match = result.match(/\b\d{10}\b/);
  if (isbn10Match) {
      return isbn10Match[0];
  }

  return null;
};


export const getBookDetails = async (isbn: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Instruction stricte pour utiliser des APIs d'images fiables (Open Library ou Google Books)
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Trouve le titre et l'auteur exact pour l'ISBN : ${isbn}. 
    Pour la coverUrl, utilise PRIORITAIREMENT ce format : https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg. 
    Vérifie via Google Search si le livre existe bien et si les infos correspondent.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          coverUrl: { type: Type.STRING, description: "URL de la couverture (OpenLibrary ou Google Books)" },
        },
        required: ["title", "author", "coverUrl"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Erreur de parsing des détails du livre", e);
    return null;
  }
};

export const generateVisionImage = async (prompt: string, aspectRatio: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `A cinematic, high-quality, inspiring vision of: ${prompt}. Ancient Egyptian aesthetic blended with futuristic prosperity, gold accents, deep blue shadows.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const getCountryVisuals = async (country: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Donne moi le code pays ISO (2 lettres) et une description d'une image iconique pour le pays : ${country}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          imageUrl: { type: Type.STRING },
        },
        required: ["code", "imageUrl"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { code: 'FR', imageUrl: 'https://picsum.photos/800/600' };
  }
};
