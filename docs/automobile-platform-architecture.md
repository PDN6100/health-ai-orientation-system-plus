# Plateforme Visite Technique & Assurance Auto — Sénégal

## 1) Vision produit
Plateforme multi-acteurs pour le suivi réglementaire automobile au Sénégal : obligations de visite technique, assurance, rendez-vous, notifications et supervision.

## 2) Architecture cible (production)
- **Frontend Web**: Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, Zustand.
- **Mobile**: React Native Expo (consommation API REST partagée).
- **Backend**: NestJS modulaire (API REST + OpenAPI), validation class-validator, guards RBAC.
- **Base de données**: PostgreSQL + Prisma.
- **Fichiers**: S3-compatible (AWS S3 / Cloudflare R2 / MinIO).
- **Auth**: JWT access/refresh + rotation, bcrypt, vérification email + OTP SMS optionnel.
- **Notifications**: Worker de jobs (BullMQ + Redis) pour envois planifiés (J-30/J-15/J-7/J-1/J0).
- **Observabilité**: logs structurés, métriques, traces, audit log.

## 3) Domaines fonctionnels
1. Authentification
2. Utilisateurs & profils
3. Véhicules & flottes
4. Visites techniques
5. Rendez-vous
6. Centres techniques
7. Assurances (contrats)
8. Compagnies d’assurance (offres)
9. Notifications
10. Dashboard
11. Administration
12. Paiements (Wave/Orange Money)
13. Documents
14. Support

## 4) RBAC (rôles)
- `OWNER`: propriétaire individuel
- `FLEET_MANAGER`: entreprise
- `CENTER_AGENT`: centre technique
- `INSURANCE_AGENT`: compagnie assurance
- `ADMIN`: administrateur plateforme

## 5) Sécurité
- Hash mots de passe `bcrypt` (cost >= 12)
- JWT courts (15 min) + refresh (30 jours) avec rotation
- Rate limit sur auth et endpoints sensibles
- CORS strict, Helmet, CSRF strategy (si cookie auth), sanitization XSS
- Upload sécurisé (MIME whitelist, antivirus async optionnel, URL signées)
- Journalisation d’audit pour actions admin/pro

## 6) Flux clés
- Ajout véhicule -> échéance calculée -> notifications planifiées.
- Enregistrement visite technique -> certificat uploadé -> statut conformité recalculé.
- Création RDV -> confirmation centre -> notification propriétaire.
- Ajout contrat assurance -> alertes expiration + renouvellement.

## 7) Déploiement recommandé
- **Pilot Dakar**: 1 API instance + 1 worker + PostgreSQL managé + Redis + stockage objet.
- **National**: autoscaling API/worker, CDN assets, read-replicas DB, files lifecycle policy.

## 8) KPI de succès
- Taux de conformité véhicule.
- Taux de RDV honorés.
- Taux d’ouverture notifications SMS/email.
- Délai moyen de traitement tickets support.
