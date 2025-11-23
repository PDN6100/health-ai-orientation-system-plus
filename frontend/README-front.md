HealthyAI — Frontend improvements

Changements effectués :
- Nouveau header (`src/components/ui/Header.js`) avec logo et avatar.
- Composant d'onglets réutilisable (`src/components/ui/TabsPanel.js`).
- Refactor de `src/components/Predict.js` pour utiliser `Header` + `TabsPanel` et structure plus modulaire.
- Nouveaux onglets : Prédiction, Mes résultats, Infos santé, Conseils, Ressources, Statistiques, Contact, Mon espace, Admin.
- Assets SVG ajoutés : `public/assets/logo-healthyai.svg`, `public/assets/doctor-illustration.svg`.

Démarrage rapide (PowerShell):

cd frontend
npm install
npm start

Backend attendu sur : http://localhost:8080
Service ML Flask attendu sur : http://127.0.0.1:5000

Étapes recommandées :
- Lancer d'abord le backend (`backend`) puis le service ML (`ml_flask`) et enfin le frontend.
- Vérifier la console du navigateur pour messages d'erreur (CORS, endpoints non disponibles).

Prochaines améliorations possibles :
- Remplacer `mailto` par un endpoint `/contact` backend.
- Ajouter gestion des sessions / logout dans `Header`.
- Ajouter tests unitaires et configuration ESLint/Prettier.
