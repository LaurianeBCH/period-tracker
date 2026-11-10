# Synchronisation Supabase & Gestion du Compte (« Mon cycle ») — Spécification

## 1. Objectif & Contexte
Permettre à toute utilisatrice de sauvegarder et synchroniser automatiquement ses données de cycle (`settings` et `periodDates`) entre plusieurs appareils (ordinateur, téléphone) et de ne pas les perdre en cas de vidage du cache du navigateur, grâce à une authentification par email avec lien de confirmation (**Supabase Auth Magic Link / OTP**) et une base **Supabase Postgres**.

Parallèlement, simplifier la navigation conformément aux maquettes Figma V3 :
- **Suppression du bouton Paramètres** (icône engrenage) dans [`NavigationHeader.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/organisms/NavigationHeader.tsx) et retrait de l'accès au re-paramétrage des dernières règles via [`OnboardingWizard.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/OnboardingWizard/OnboardingWizard.tsx) une fois l'onboarding initial terminé.
- **Intégration du bloc de synchronisation dans la vue « Mon cycle »** ([`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx)) avec deux états visuels fidèles aux maquettes Figma (`4332:7035`, `4332:7153`, `4332:7268`).

## 2. Maquettes Figma de Référence
- **Mobile — Non synchronisé (`mobile-sync-no`)** : node `4332:7035`
- **Mobile — Synchronisé (`mobile-sync-yes`)** : node `4332:7153`
- **Desktop — Non synchronisé (`desk-sync-no`)** : node `4332:7268`

## 3. Changements d'Interface (UI & Design Tokens)

> [!IMPORTANT]
> Règle absolue (`AGENTS.md`) : Toujours utiliser les design tokens définis dans [`src/index.css`](file:///Users/lauriane/Sites/period-tracker/src/index.css) pour tout le CSS. Réutiliser le composant existant [`Button`](file:///Users/lauriane/Sites/period-tracker/src/components/atoms/Button.tsx) (`variant="primary"` et `variant="secondary"`).

### 3.1. En-tête ([`NavigationHeader.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/organisms/NavigationHeader.tsx) & [`App.tsx`](file:///Users/lauriane/Sites/period-tracker/src/App.tsx))
- Retirer le bouton engrenage (`Paramètres`) de [`NavigationHeader.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/organisms/NavigationHeader.tsx). L'en-tête affiche uniquement le titre `Period Tracker`.
- Dans [`App.tsx`](file:///Users/lauriane/Sites/period-tracker/src/App.tsx), supprimer l'état `isEditingSettings` qui rouvrait `OnboardingWizard`. `OnboardingWizard` ne s'affiche que lorsque `!settings.isOnboarded`.

### 3.2. Vue « Mon cycle » ([`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx))
- **Titre de page** : Ajouter le titre centré `Mon cycle` (`<h1>`) en haut de [`MyCycleView.tsx`](file:///Users/lauriane/Sites/period-tracker/src/components/MyCycle/MyCycleView.tsx) (`font-size: var(--typo-h1-size)`, `font-weight: var(--typo-h1-weight)`, `color: var(--text-dark-primary)`, centré sur toute la largeur, `grid-column: 1 / -1` sur desktop).
- **Disposition Desktop vs Mobile** :
  - **Mobile (< 1024px)** : Pile verticale (`gap: var(--spacing-lg)` entre les cartes) :
    1. Carte « Durée la plus fréquente de mon cycle »
    2. Carte « Durée moyenne de mes règles »
    3. Carte « Evolutions de mes derniers cycles »
    4. Carte de synchronisation (« Synchroniser vos données » ou « Données synchronisées »)
  - **Desktop (≥ 1024px)** : Grille 2 colonnes (`370px` à gauche, `1fr` à droite, `gap: var(--spacing-2xl)`) :
    - Colonne gauche (`leftColumn`) : Carte 1 + Carte 2 (`gap: var(--spacing-lg)`).
    - Colonne droite (`rightColumn`) : Carte 3 (graphique) + Carte 4 (synchronisation) empilées avec `gap: var(--spacing-lg)`.

### 3.3. Carte de Synchronisation — État 1 : Non synchronisé (`sync-no`)
Conteneur `.syncCard` :
- `background-color: var(--background-level-2)`
- `border-radius: var(--radius-full)`
- `padding: var(--spacing-lg)`
- `display: flex; flex-direction: column; gap: var(--spacing-lg)`

Contenu :
1. **Titre** : `Synchroniser vos données` (`font-size: var(--typo-caption-size)`, `font-weight: var(--typo-caption-weight)`, `color: var(--text-dark-primary)`).
2. **Texte explicatif** : `Vos données sont actuellement enregistrées dans le cache de votre navigateur. Vous pouvez saisir une adresse email pour synchroniser vos données en ligne.` (`font-size: var(--typo-body-default-size)`, `line-height: var(--typo-body-default-line-height)`, `color: var(--text-dark-primary)`).
3. **Formulaire** (`display: flex; flex-direction: column; gap: var(--spacing-lg)`):
   - Groupe champ (`display: flex; flex-direction: column; gap: var(--spacing-sm)`):
     - `<label htmlFor="sync-email">` : `Saisir une adresse email` (`font-size: var(--typo-caption-size)`, `font-weight: var(--typo-caption-weight)`, `color: var(--text-dark-primary)`).
     - `<input id="sync-email" type="email" required placeholder="contact@gmail.com">` :
       - `background-color: var(--background-level-2)`
       - `border: 1px solid var(--border)`
       - `border-radius: var(--radius-sm)`
       - `padding: var(--spacing-lg)`
       - `font-family: var(--font-family)`
       - `font-size: var(--typo-body-default-bold-size)`
       - `font-weight: var(--typo-body-default-bold-weight)`
       - `line-height: var(--typo-body-default-bold-line-height)`
       - `color: var(--text-dark-primary)`
   - Bouton de soumission : `<Button type="submit" variant="primary" fullWidth icon={false}>Créer un compte</Button>`.
   - Message de retour (après envoi du lien magique ou en cas d'erreur) :
     - Succès : `Un lien de confirmation vous a été envoyé par email. Cliquez dessus pour activer la synchronisation.`
     - Erreur / configuration manquante : message explicite en français.

### 3.4. Carte de Synchronisation — État 2 : Synchronisé (`sync-yes`)
Conteneur `.syncCard` identique (`var(--background-level-2)`, `var(--radius-full)`, `padding: var(--spacing-lg)`, `gap: var(--spacing-lg)`).

Contenu :
1. **En-tête d'état** (`display: flex; flex-direction: column; gap: var(--spacing-sm)`):
   - Titre : `Données synchronisées` (`font-size: var(--typo-caption-size)`, `font-weight: var(--typo-caption-weight)`, `color: var(--text-dark-primary)`).
   - Email : adresse email de l'utilisatrice connectée (ex. `contact@gmail.com`, `font-size: var(--typo-body-default-size)`, `line-height: var(--typo-body-default-line-height)`, `color: var(--text-dark-primary)`).
2. **Groupe d'actions** (`display: flex; flex-direction: column; gap: var(--spacing-sm)`):
   - `<Button variant="secondary" fullWidth icon={false} onClick={handleDeleteAccount}>Supprimer mon compte</Button>`
   - `<Button variant="secondary" fullWidth icon={false} onClick={handleSignOut}>Se déconnecter</Button>`

## 4. Architecture & Synchronisation Supabase

### 4.1. Configuration Client (`src/services/supabaseClient.ts`)
- Dépendance : `@supabase/supabase-js`.
- Variables d'environnement Vite :
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Si les variables ne sont pas définies (ex. environnement local sans `.env` ou tests), l'application continue de fonctionner normalement en mode local (`localStorage`) sans crasher (`supabase` exporté à `null` avec un helper `isSupabaseConfigured()`).
- Fournir un fichier `.env.example` et un script SQL d'initialisation `supabase/schema.sql` prêt à coller dans l'éditeur SQL Supabase.

### 4.2. Schéma de Base de Données (`supabase/schema.sql`)
Table `public.user_cycle_data` :
- `user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
- `settings jsonb NOT NULL DEFAULT '{}'::jsonb`
- `period_dates jsonb NOT NULL DEFAULT '[]'::jsonb`
- `updated_at timestamptz NOT NULL DEFAULT now()`

Sécurité (Row Level Security — RLS) :
- Activer RLS sur `public.user_cycle_data`.
- Policies `SELECT`, `INSERT`, `UPDATE`, `DELETE` autorisées uniquement si `auth.uid() = user_id`.
- Fonction RPC `public.delete_user_account()` (`SECURITY DEFINER`) permettant à l'utilisatrice authentifiée de supprimer son propre compte dans `auth.users` (ce qui supprime en cascade sa ligne `user_cycle_data`).

### 4.3. Flux d'Authentification & Synchronisation (`src/services/syncService.ts`)
1. **Envoi du lien de confirmation (`sendMagicLink(email: string)`)** :
   - Appelle `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`.
   - Fonctionne aussi bien pour la création d'un nouveau compte que pour la reconnexion sur un deuxième appareil ou après vidage du cache.
2. **Synchronisation à la connexion (`pullOrMergeCloudData(userId, localSettings, localDates)`)** :
   - Lorsqu'une session Supabase devient active (`getSession()` au démarrage ou `onAuthStateChange`) :
     - Récupère la ligne `user_cycle_data` de `userId`.
     - **Si une ligne existe dans Supabase** :
       - Fusionne les dates locales et distantes sans doublon (`Array.from(new Set([...cloudDates, ...localDates])).sort()`).
       - Prend les réglages distants (ou locaux si plus complets) avec `isOnboarded: true`.
       - Met à jour le cache local (`saveSettings`, `savePeriodDates`), l'état React (ce qui passe automatiquement l'onboarding si le cache venait d'être vidé), et pousse l'état fusionné vers Supabase si des dates locales ont été ajoutées.
     - **Si aucune ligne n'existe encore dans Supabase** (nouveau compte) :
       - Crée la ligne `user_cycle_data` avec les `localSettings` (`isOnboarded: true`) et `localDates` actuels.
3. **Synchronisation à chaque modification (`pushCloudData(userId, settings, periodDates)`)** :
   - Dès que l'utilisatrice connectée déclare/retire une date de règles ou modifie ses réglages, la sauvegarde se fait immédiatement dans `localStorage` ET en tâche de fond via `upsert` sur `public.user_cycle_data`.
4. **Se déconnecter (`signOutAccount()`)** :
   - Appelle `supabase.auth.signOut()`.
   - L'appareil repasse à l'état non synchronisé (`sync-no`).
5. **Supprimer mon compte (`deleteAccount()`)** :
   - Supprime la ligne dans `public.user_cycle_data` (`DELETE WHERE user_id = userId`), appelle la RPC `delete_user_account()` (avec fallback sur `signOut()` si la RPC n'est pas installée), vide le `localStorage` (`clearAllStorage()` dans [`src/services/storage.ts`](file:///Users/lauriane/Sites/period-tracker/src/services/storage.ts)), et réinitialise l'état de l'application (`DEFAULT_SETTINGS`, `periodDates = []`).

## 5. Hors Périmètre (Non-Goals)
- Pas d'authentification par mot de passe ni OAuth tiers (Google/Apple) : uniquement l'email avec lien de confirmation comme sur la maquette.
- Pas de menu Paramètres séparé dans l'en-tête.

