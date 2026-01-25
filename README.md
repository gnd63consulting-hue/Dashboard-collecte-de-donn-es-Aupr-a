# Dashboard AUPREA - Mon Bilan Succession

Dashboard temps réel pour visualiser les statistiques des leads collectés via le quiz "Mon Bilan Succession" d'AUPREA.

## Fonctionnalités

- **KPIs en temps réel** : Total leads, leads du jour, progression hebdomadaire
- **Jauge d'objectif** : Visualisation de la progression vers 10 000 leads
- **Graphiques analytiques** :
  - Évolution temporelle (7j / 30j / 90j / Tout)
  - Répartition par jour de la semaine
  - Heatmap d'activité horaire
- **Tableau des leads** : Affichage des derniers leads avec recherche et tri
- **Insights IA** : Analyses automatiques (meilleur jour, pic d'activité, etc.)
- **Actualisation automatique** : Refresh toutes les 30 secondes + temps réel Supabase

## Stack technique

- **React 18** avec Vite
- **TailwindCSS** pour le styling
- **Recharts** pour les graphiques
- **Framer Motion** pour les animations
- **Supabase** pour la base de données temps réel
- **Lucide React** pour les icônes

## Installation

```bash
# Cloner le repository
git clone <repo-url>
cd dashboard-auprea

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://fdmdfzzluklmkchcsjha.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Déploiement Vercel

### Via Dashboard Vercel

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Déployez

### Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

## Structure du projet

```
dashboard-auprea/
├── src/
│   ├── components/
│   │   ├── Header.jsx       # En-tête avec logo et statut
│   │   ├── KPICard.jsx      # Cartes KPI avec compteurs animés
│   │   ├── ProgressGauge.jsx # Jauge circulaire objectif 10K
│   │   ├── LeadsChart.jsx   # Graphique évolution temporelle
│   │   ├── WeekdayChart.jsx # Graphique répartition par jour
│   │   ├── HeatmapChart.jsx # Heatmap activité horaire
│   │   ├── LeadsTable.jsx   # Tableau des leads
│   │   ├── AIInsights.jsx   # Section insights IA
│   │   └── Footer.jsx       # Pied de page
│   ├── hooks/
│   │   └── useSupabase.js   # Hooks pour Supabase
│   ├── lib/
│   │   └── supabase.js      # Configuration Supabase
│   ├── styles/
│   │   └── globals.css      # Styles globaux + animations
│   ├── App.jsx              # Composant principal
│   └── main.jsx             # Point d'entrée
├── public/
│   └── favicon.svg
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

## Charte graphique AUPREA

### Couleurs

- **Or** : `#D4AF37` (accent premium)
- **Or clair** : `#F4E4BC` (highlights)
- **Bleu marine** : `#1E3A5F` (textes principaux)
- **Bleu foncé** : `#0F1E33` (fonds)

### Typographie

- Titres : Inter / Poppins (600-700)
- Corps : Inter (400)
- Chiffres : JetBrains Mono (effet tech)

## Workflow N8N

Le dashboard se connecte à une table Supabase `leads_succession` alimentée par un workflow N8N qui :
1. Reçoit les réponses Typeform via webhook
2. Parse les données du formulaire
3. Enregistre dans Google Sheets (backup)
4. Insère dans Supabase (source principale)

## Licence

Propriétaire - AUPREA / GND Consulting
