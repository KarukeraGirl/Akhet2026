
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
    contents: { parts: [{ text: prompt }] },
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

export const getBookDetails = async (isbn: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Trouve les détails bibliographiques précis (titre, auteur) pour cet identifiant unique : ${isbn}. 
    Cherche spécifiquement l'édition française si elle existe.
    Le champ isbn doit contenir l'ISBN-13 complet.
    Pour l'URL de couverture, privilégie une source stable (Google Books API, Amazon S3, ou https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg).` }] },
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

export const searchBookByText = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: `Effectue une recherche bibliographique exhaustive pour l'ouvrage suivant : "${query}".
    Identifie le titre exact, l'auteur principal et son numéro ISBN-13 correspondant.
    Si plusieurs éditions existent, choisis la plus récente ou la version française.
    Si aucune couverture n'est trouvée, utilise systématiquement le format OpenLibrary avec l'ISBN trouvé (https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg).` }] },
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
    contents: { parts: [{ text: `Donne moi le code pays ISO (2 lettres), une description d'une image iconique et les coordonnées GPS centrales (lat/lng) pour le lieu : ${country}. 
    REGLE CRITIQUE : Si le lieu est un territoire français d'outre-mer, NE RENVOIE PAS 'FR'. Renvoie IMPÉRATIVEMENT son code ISO spécifique : 
    - Guadeloupe: GP
    - Martinique: MQ
    - Guyane: GF
    - Réunion: RE
    - Mayotte: YT
    - Nouvelle-Calédonie: NC
    - Polynésie Française: PF
    - Saint-Martin: MF` }] },
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
