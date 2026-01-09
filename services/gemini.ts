
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
        text: "Analyse cette image de couverture ou de quatrième de couverture de livre. Localise le code-barres ou le texte ISBN. Trouve spécifiquement le numéro ISBN-13 (souvent 978... ou 979...). Ignore les prix et autres codes. Retourne UNIQUEMENT les 13 chiffres sans espaces ni tirets. Si l'ISBN n'est pas clairement lisible ou absent, réponds par 'null'."
      }
    ]
  });

  const result = response.text?.trim();
  if (!result || result.toLowerCase().includes('null')) return null;
  const cleaned = result.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 ? cleaned : null;
};

export const getBookDetails = async (isbn: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recherche les détails précis du livre avec l'ISBN : ${isbn}. 
    Utilise Google Search pour confirmer les informations. 
    Retourne les données au format JSON. 
    L'URL de l'image doit être fonctionnelle (OpenLibrary ou Google Books).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          coverUrl: { type: Type.STRING, description: "URL directe de l'image de couverture" },
          isbn: { type: Type.STRING },
          found: { type: Type.BOOLEAN, description: "Indique si le livre a été trouvé avec certitude" }
        },
        required: ["title", "author", "coverUrl", "found", "isbn"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.found ? data : null;
  } catch (e) {
    console.error("Erreur de parsing des détails du livre", e);
    return null;
  }
};

export const searchBookByText = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Trouve le livre correspondant le mieux à la recherche : "${query}".
    Cherche le titre exact, l'auteur principal et son numéro ISBN-13.
    L'URL de l'image doit être de haute qualité (Google Books, Amazon ou OpenLibrary).`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          coverUrl: { type: Type.STRING },
          isbn: { type: Type.STRING },
          found: { type: Type.BOOLEAN }
        },
        required: ["title", "author", "coverUrl", "found", "isbn"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.found ? data : null;
  } catch (e) {
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
    contents: `Donne moi le code pays ISO (2 lettres), une description d'une image iconique et les coordonnées GPS centrales (lat/lng) pour le pays : ${country}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          imageUrl: { type: Type.STRING },
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER }
        },
        required: ["code", "imageUrl", "lat", "lng"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { code: 'FR', imageUrl: 'https://picsum.photos/800/600', lat: 46.2276, lng: 2.2137 };
  }
};
