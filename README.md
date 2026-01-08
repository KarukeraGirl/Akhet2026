
# 🌅 Akhet - Horizon 2026

**Akhet** (l'Horizon en égyptien ancien) est une application de suivi d'objectifs holistique pour l'année 2026, conçue avec une esthétique immersive inspirée de l'Égypte antique.

## 🚀 Fonctionnalités

- **Tableau de Bord Maât** : Vue d'ensemble de votre équilibre de vie.
- **Calendrier Solaire** : Planification interactive sur la grille de l'année 2026.
- **Oracle d'Akhet** : Intelligence Artificielle (Gemini) qui analyse votre progression et vous conseille.
- **Invocateur de Vision** : Génération d'images par IA pour visualiser vos rêves.
- **Suivi Multidisciplinaire** : Finance, Lecture (avec scanner ISBN), Voyages, Sport, Connaissances et Santé.

## 🛠 Installation et Sécurité

Ce projet utilise l'API Google Gemini. Pour protéger vos accès, suivez ces étapes :

### 1. Configuration de l'API
Ne partagez **jamais** votre clé API sur GitHub.

1. Créez un fichier `.env` à la racine du projet.
2. Ajoutez votre clé comme ceci :
   ```env
   API_KEY=votre_cle_gemini_ici
   ```

### 2. Protection Git
Assurez-vous que votre fichier `.gitignore` contient bien :
```text
.env
node_modules/
dist/
```

### 3. Déploiement (Vercel/Netlify)
Si vous hébergez l'application, ajoutez `API_KEY` dans les **Environment Variables** des paramètres de votre projet sur la plateforme de déploiement.

## 📜 Technologies
- **React 19**
- **Tailwind CSS**
- **Google GenAI SDK** (Gemini 3 Pro & Flash)
- **Lucide React** (Iconographie)
- **Recharts** (Visualisation de données)

---
*Que votre voyage vers l'horizon 2026 soit guidé par la sagesse et la discipline.*
