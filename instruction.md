# ayeJOB Togo — Plan de réalisation complet (Antigravity Implementation Guide)

> **Contexte du projet :** Marketplace biface de services à domicile au Togo (modèle TaskRabbit adapté au marché togolais).  
> **Stack :** Next.js 15 (App Router) · Supabase (DB + Auth + Storage + Realtime + Edge Functions) · Vercel (déploiement) · CinetPay (paiement Mobile Money) · WhatsApp Business API · Africa's Talking (SMS)  
> **Durée estimée :** 8 semaines pour un développeur solo assisté par IA  
> **Langue de l'interface :** Français (marché togolais)

---

## BILAN DE RÉALISATION (Prévu vs Réel)

### Ce qui était prévu :
1. **Paiements CinetPay réels** avec Edge Functions.
2. **Authentification OTP** avec Africa's Talking (SMS).
3. **Mails ou notifications WhatsApp** (WhatsApp Business API).
4. Interface basique standard.

### Ce qui a finalement été fait :
1. **Environnement de test complet pour les paiements :** À la place d'une Edge Function complexe en production, nous avons mis en place une intégration CinetPay simulée (`/mock-cinetpay`) via une API route Next.js pour valider le flux de bout-en-bout sans frais réels pendant la phase de développement/tests.
2. **Authentification par mot de passe sécurisé :** L'authentification par OTP SMS réel nécessitant un compte payant Africa's Talking ou Twilio, nous avons implémenté l'authentification par **Téléphone + Mot de passe** via Supabase Auth. C'est plus rapide, moins coûteux et offre une très bonne expérience utilisateur.
3. **Refonte complète du Design (UI/UX Premium) :** Nous avons largement dépassé les prévisions sur l'interface ! Le site a été doté d'une véritable identité visuelle : animations au survol (hover cards interactives), logo personnalisé avec fond transparent, ruban de texte défilant (marquee) dans le pied de page, et un design professionnel centré sur la couleur Vert Émeraude.
4. **Flux utilisateur optimisés (Conversion) :** Sur la page d'accueil, le clic sur une catégorie redirige directement vers le formulaire de demande avec la bonne catégorie pré-sélectionnée (approche "Conversion Rapide" façon Uber/TaskRabbit), ce qui accélère la prise de commande.
5. **Composants Mobiles Spécifiques :** Création d'un Menu Mobile interactif (`MobileMenu`) propre aux smartphones, incluant le bouton de déconnexion, et ajustement parfait des menus de notifications pour s'adapter à toutes les résolutions d'écran sans déborder.

---

## ARCHITECTURE GÉNÉRALE

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│          Next.js 15 App Router — déployé sur Vercel         │
│   PWA mobile-first · Tailwind CSS · Radix UI · Lucide Icons │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                              │
│                      SUPABASE                               │
│  PostgreSQL · Auth OTP · Storage · Realtime · Edge Functions│
└─────────┬──────────────┬───────────────┬────────────────────┘
          │              │               │
    ┌─────▼────┐  ┌──────▼──────┐ ┌─────▼──────┐
    │CinetPay  │  │  WhatsApp   │ │Africa's    │
    │(Paiement)│  │Business API │ │Talking SMS │
    └──────────┘  └─────────────┘ └────────────┘
```

---

## PHASE 0 — Fondations (Semaine 1)

### Étape 0.1 — Installer l'environnement

```bash
# Prérequis : Node.js 20 LTS, Git

# Créer le projet Next.js
npx create-next-app@latest ayejob-togo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd ayejob-togo

# Installer les dépendances principales
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast
npm install react-hook-form @hookform/resolvers zod
npm install date-fns sonner next-themes

# Supabase CLI
npm install -g supabase

# Vercel CLI
npm install -g vercel
```

### Étape 0.2 — Configurer Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (région : **Europe West**)
3. Récupérer dans Settings → API :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

```bash
supabase login
supabase init
supabase link --project-ref TON_PROJECT_REF
```

### Étape 0.3 — Premier déploiement Vercel

```bash
vercel

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## PHASE 1 — Base de données complète (Semaines 1-2)

### Étape 1.1 — Schéma SQL complet

Exécuter dans le **SQL Editor** de Supabase :

```sql
-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- TABLE : PROFILS UTILISATEURS
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'tasker', 'admin')),
  city TEXT DEFAULT 'Lomé',
  neighborhood TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : PROFILS TASKERS
-- =============================================
CREATE TABLE public.tasker_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  hourly_rate_min INTEGER DEFAULT 1000,
  hourly_rate_max INTEGER DEFAULT 5000,
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
  id_card_url TEXT,
  id_card_back_url TEXT,
  selfie_url TEXT,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  service_radius_km INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : CATÉGORIES DE SERVICES
-- =============================================
CREATE TABLE public.service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT,
  base_price_min INTEGER,
  base_price_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales
INSERT INTO public.service_categories
  (name, slug, description, icon_name, base_price_min, base_price_max, sort_order)
VALUES
  ('Nettoyage',      'nettoyage',     'Nettoyage maison, bureau, appartement', 'sparkles',   2000,  15000, 1),
  ('Électricité',    'electricite',   'Installation, dépannage électrique',    'zap',        3000,  25000, 2),
  ('Plomberie',      'plomberie',     'Réparation robinets, canalisations',    'wrench',     3000,  20000, 3),
  ('Jardinage',      'jardinage',     'Tonte, entretien espace vert',          'flower-2',   2000,  10000, 4),
  ('Déménagement',   'demenagement',  'Transport et déplacement de meubles',   'truck',      5000,  50000, 5),
  ('Peinture',       'peinture',      'Peinture intérieure et extérieure',     'paintbrush', 5000,  80000, 6),
  ('Maçonnerie',     'maconnerie',    'Petits travaux de construction',        'hammer',     5000, 100000, 7),
  ('Informatique',   'informatique',  'Dépannage PC, installation logiciels',  'monitor',    3000,  30000, 8),
  ('Garde enfants',  'garde-enfants', 'Babysitting, aide aux devoirs',         'baby',       2000,   8000, 9),
  ('Livraison',      'livraison',     'Courses, commissions, livraisons',      'package',    1000,   5000, 10);

-- =============================================
-- TABLE : COMPÉTENCES TASKERS
-- =============================================
CREATE TABLE public.tasker_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tasker_id UUID REFERENCES public.tasker_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id),
  experience_level TEXT DEFAULT 'intermediate'
    CHECK (experience_level IN ('beginner', 'intermediate', 'expert')),
  UNIQUE(tasker_id, category_id)
);

-- =============================================
-- TABLE : TÂCHES
-- =============================================
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_neighborhood TEXT,
  budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')),
  budget_amount INTEGER,
  scheduled_date DATE,
  scheduled_time_slot TEXT CHECK (scheduled_time_slot IN ('matin', 'après-midi', 'soir', 'flexible')),
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),
  photos TEXT[],
  assigned_tasker_id UUID REFERENCES public.profiles(id),
  views_count INTEGER DEFAULT 0,
  bids_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : OFFRES (BIDS)
-- =============================================
CREATE TABLE public.task_bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  message TEXT NOT NULL,
  estimated_duration TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, tasker_id)
);

-- =============================================
-- TABLE : RÉSERVATIONS
-- =============================================
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id),
  bid_id UUID REFERENCES public.task_bids(id),
  client_id UUID REFERENCES public.profiles(id),
  tasker_id UUID REFERENCES public.profiles(id),
  agreed_amount INTEGER NOT NULL,           -- Montant de l'offre artisan (ex: 10 000 FCFA)
  service_fee INTEGER DEFAULT 500,          -- Frais "Assurance Prestation" payés par le client (fixe)
  platform_fee INTEGER,                     -- Commission plateforme 12% prélevée sur l'artisan
  tasker_payout INTEGER,                    -- Ce que reçoit l'artisan (agreed_amount - platform_fee)
  total_client_amount INTEGER,              -- Ce que paye réellement le client (agreed_amount + service_fee)
  status TEXT DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'in_progress', 'completed', 'cancelled', 'disputed')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  client_confirmed BOOLEAN DEFAULT false,
  tasker_confirmed BOOLEAN DEFAULT false,
  completion_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : PAIEMENTS
-- =============================================
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  client_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'XOF',
  payment_method TEXT CHECK (payment_method IN ('flooz', 'tmoney', 'orange_money', 'wave', 'carte_bancaire')),
  provider TEXT CHECK (provider IN ('cinetpay', 'kkiapay')),
  transaction_id TEXT UNIQUE,
  payment_url TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : PORTEFEUILLE TASKERS (ESCROW)
-- =============================================
CREATE TABLE public.tasker_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tasker_id UUID REFERENCES public.profiles(id) UNIQUE,
  balance_pending INTEGER DEFAULT 0,
  balance_available INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : RETRAITS
-- =============================================
CREATE TABLE public.withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tasker_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  operator TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : AVIS
-- =============================================
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) UNIQUE,
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewed_id UUID REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('client_to_tasker', 'tasker_to_client')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : NOTIFICATIONS
-- =============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE : MESSAGES IN-APP
-- =============================================
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  sender_id UUID REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Étape 1.2 — Row Level Security (RLS)

```sql
-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profil public visible" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Modifier son propre profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks
CREATE POLICY "Tâches ouvertes visibles" ON public.tasks
  FOR SELECT USING (status = 'open' OR client_id = auth.uid() OR assigned_tasker_id = auth.uid());
CREATE POLICY "Client crée ses tâches" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Client modifie ses tâches" ON public.tasks FOR UPDATE USING (auth.uid() = client_id);

-- Bids
CREATE POLICY "Voir bids pertinents" ON public.task_bids
  FOR SELECT USING (
    tasker_id = auth.uid() OR
    task_id IN (SELECT id FROM public.tasks WHERE client_id = auth.uid())
  );
CREATE POLICY "Tasker crée un bid" ON public.task_bids FOR INSERT WITH CHECK (auth.uid() = tasker_id);

-- Messages
CREATE POLICY "Messages des deux parties" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Envoyer message" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications
CREATE POLICY "Ses propres notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
```

### Étape 1.3 — Triggers et fonctions SQL

```sql
-- Mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_ts BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_ts BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_ts BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Créer profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Recalculer la note moyenne après chaque avis
CREATE OR REPLACE FUNCTION update_tasker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasker_profiles
  SET
    rating_avg = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews
                  WHERE reviewed_id = NEW.reviewed_id AND review_type = 'client_to_tasker'),
    total_reviews = (SELECT COUNT(*) FROM public.reviews
                     WHERE reviewed_id = NEW.reviewed_id AND review_type = 'client_to_tasker')
  WHERE user_id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_tasker_rating();

-- Incrémenter compteur de bids
CREATE OR REPLACE FUNCTION increment_task_bids_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks SET bids_count = bids_count + 1 WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_bid_insert AFTER INSERT ON public.task_bids FOR EACH ROW EXECUTE FUNCTION increment_task_bids_count();

-- Créditer le portefeuille Tasker
CREATE OR REPLACE FUNCTION credit_tasker_wallet(p_tasker_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO public.tasker_wallets (tasker_id, balance_pending, total_earned)
  VALUES (p_tasker_id, p_amount, p_amount)
  ON CONFLICT (tasker_id) DO UPDATE SET
    balance_pending = tasker_wallets.balance_pending + p_amount,
    total_earned = tasker_wallets.total_earned + p_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Libérer les fonds vers le solde disponible
CREATE OR REPLACE FUNCTION release_tasker_funds(p_booking_id UUID)
RETURNS void AS $$
DECLARE
  v_tasker_id UUID;
  v_payout_amount INTEGER;
BEGIN
  SELECT tasker_id, tasker_payout INTO v_tasker_id, v_payout_amount
  FROM public.bookings WHERE id = p_booking_id AND status = 'completed';

  IF v_tasker_id IS NOT NULL THEN
    UPDATE public.tasker_wallets SET
      balance_pending = balance_pending - v_payout_amount,
      balance_available = balance_available + v_payout_amount,
      updated_at = NOW()
    WHERE tasker_id = v_tasker_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## PHASE 2 — Structure du projet Next.js (Semaines 2-3)

### Étape 2.1 — Architecture des fichiers

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx              # Connexion OTP téléphone
│   │   └── register/page.tsx           # Inscription (client ou tasker)
│   ├── (dashboard)/
│   │   ├── client/
│   │   │   ├── page.tsx                # Tableau de bord client
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx            # Mes tâches
│   │   │   │   ├── new/page.tsx        # Créer une tâche (formulaire multi-étapes)
│   │   │   │   └── [id]/page.tsx       # Détail tâche + bids reçus
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx            # Mes réservations
│   │   │   │   └── [id]/page.tsx       # Détail réservation + chat
│   │   │   └── profile/page.tsx        # Mon profil client
│   │   └── tasker/
│   │       ├── page.tsx                # Tableau de bord tasker
│   │       ├── tasks/page.tsx          # Tâches disponibles (marketplace)
│   │       ├── bookings/
│   │       │   ├── page.tsx            # Mes missions
│   │       │   └── [id]/page.tsx       # Détail mission + code de complétion
│   │       ├── profile/page.tsx        # Mon profil + upload CNI
│   │       └── earnings/page.tsx       # Portefeuille + retraits
│   ├── admin/
│   │   ├── page.tsx                    # KPIs globaux
│   │   ├── taskers/page.tsx            # Vérification identité taskers
│   │   ├── transactions/page.tsx       # Toutes les transactions
│   │   ├── disputes/page.tsx           # Gestion des litiges
│   │   └── withdrawals/page.tsx        # Demandes de retrait
│   ├── taskers/
│   │   ├── page.tsx                    # Annuaire public des taskers
│   │   └── [id]/page.tsx              # Profil public tasker
│   ├── api/
│   │   └── webhooks/
│   │       └── cinetpay/route.ts       # Webhook paiement CinetPay
│   └── page.tsx                        # Landing page publique
├── components/
│   ├── ui/                             # Button, Input, Card, Badge, Modal...
│   ├── auth/
│   │   ├── PhoneLoginForm.tsx          # Connexion OTP SMS
│   │   └── RegisterForm.tsx            # Formulaire inscription
│   ├── tasks/
│   │   ├── TaskCard.tsx                # Carte résumé d'une tâche
│   │   ├── TaskForm.tsx                # Formulaire multi-étapes création tâche
│   │   ├── BidCard.tsx                 # Carte d'une offre reçue
│   │   └── BidForm.tsx                 # Formulaire de soumission d'une offre
│   ├── taskers/
│   │   ├── TaskerCard.tsx              # Carte publique d'un tasker
│   │   └── TaskerVerifyForm.tsx        # Admin : formulaire vérification
│   ├── bookings/
│   │   ├── BookingCard.tsx             # Résumé d'une réservation
│   │   ├── BookingStatus.tsx           # Badge de statut coloré
│   │   └── CompletionCodeInput.tsx     # Input code 4 chiffres
│   ├── payments/
│   │   └── PaymentModal.tsx            # Modal choix méthode + initiation paiement
│   ├── messaging/
│   │   └── ChatWindow.tsx              # Fenêtre de chat temps réel
│   ├── wallet/
│   │   └── WithdrawalForm.tsx          # Formulaire demande de retrait
│   └── layout/
│       ├── Navbar.tsx                  # Navigation principale
│       ├── BottomNav.tsx               # Navigation mobile (bottom bar)
│       ├── Sidebar.tsx                 # Sidebar dashboard desktop
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Client navigateur
│   │   └── server.ts                   # Client serveur (SSR/RSC)
│   ├── cinetpay/index.ts               # Fonctions d'appel API CinetPay
│   ├── whatsapp/index.ts               # Envoi messages WhatsApp Business
│   └── utils.ts                        # Helpers (formatCFA, formatDate...)
├── hooks/
│   ├── useNotifications.ts             # Abonnement temps réel notifications
│   ├── useMessages.ts                  # Abonnement temps réel messages
│   └── useProfile.ts                   # Profil utilisateur courant
├── types/
│   └── database.ts                     # Types auto-générés Supabase
└── middleware.ts                        # Protection des routes par rôle
```

### Étape 2.2 — Clients Supabase

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        }
      }
    }
  )
}
```

---

## PHASE 3 — Authentification OTP SMS (Semaine 3)

### Étape 3.1 — Configurer Supabase Auth

Dans le Dashboard Supabase → **Authentication → Providers → Phone** :
- Activer le provider téléphone
- Configurer **Africa's Talking** comme provider SMS (couverture Togo)
- Indicatif pays Togo : **+228**

### Étape 3.2 — Composant LoginForm

```typescript
// src/components/auth/PhoneLoginForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PhoneLoginForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const sendOTP = async () => {
    if (phone.length < 8) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone: `+228${phone}` })
    if (error) setError(error.message)
    else setStep('otp')
    setLoading(false)
  }

  const verifyOTP = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({
      phone: `+228${phone}`,
      token: otp,
      type: 'sms'
    })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Connexion</h2>
      {step === 'phone' ? (
        <>
          <div className="flex">
            <span className="bg-gray-100 border border-r-0 rounded-l-lg px-3 flex items-center text-gray-600">+228</span>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="90 00 00 00" maxLength={8}
              className="flex-1 border rounded-r-lg px-4 py-3 focus:outline-none focus:border-green-500" />
          </div>
          <button onClick={sendOTP} disabled={loading || phone.length < 8}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-green-700 transition">
            {loading ? 'Envoi...' : 'Recevoir le code SMS'}
          </button>
        </>
      ) : (
        <>
          <p className="text-center text-sm text-gray-600">Code envoyé au +228 {phone}</p>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="0 0 0 0 0 0" maxLength={6}
            className="w-full border rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-green-500" />
          <button onClick={verifyOTP} disabled={loading || otp.length < 6}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
        </>
      )}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  )
}
```

---

## PHASE 4 — Intégration paiement CinetPay (Semaine 4)

### Étape 4.1 — Edge Function : initier le paiement

Créer le fichier `supabase/functions/create-payment/index.ts` :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Constantes tarifaires (modifier ici uniquement) ───────────────────────
const PLATFORM_COMMISSION_RATE = 0.12   // 12% prélevé sur l'artisan
const CLIENT_SERVICE_FEE       = 500    // 500 FCFA fixes "Assurance Prestation" payés par le client
// ────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  const { booking_id, payment_method } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Vérifier l'authentification du client appelant
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, tasks(*), profiles!client_id(*)')
    .eq('id', booking_id)
    .single()

  if (!booking) return new Response(JSON.stringify({ error: 'Réservation introuvable' }), { status: 404 })

  // ── Calcul des montants ──────────────────────────────────────────────────
  // Modèle : 12% commission sur l'artisan + 500 FCFA fixes "Assurance Prestation" sur le client
  //
  //   agreed_amount      = offre de l'artisan (ex: 10 000 FCFA)
  //   platform_fee       = agreed_amount × 12%    = 1 200 FCFA  → déduit de l'artisan
  //   tasker_payout      = agreed_amount - platform_fee = 8 800 FCFA → reçu par l'artisan
  //   service_fee        = 500 FCFA fixes           → payé par le client
  //   total_client_amount= agreed_amount + service_fee = 10 500 FCFA → débité sur le client
  // ────────────────────────────────────────────────────────────────────────
  const platformFee        = Math.round(booking.agreed_amount * PLATFORM_COMMISSION_RATE)
  const taskerPayout       = booking.agreed_amount - platformFee
  const serviceFee         = CLIENT_SERVICE_FEE
  const totalClientAmount  = booking.agreed_amount + serviceFee

  const transactionId = `AYEJOB_${Date.now()}_${booking_id.slice(0, 8)}`

  // Persister les montants calculés sur le booking
  await supabase.from('bookings').update({
    platform_fee:        platformFee,
    tasker_payout:       taskerPayout,
    service_fee:         serviceFee,
    total_client_amount: totalClientAmount,
  }).eq('id', booking_id)

  // ── Appel CinetPay ── Le client est débité de total_client_amount
  const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey:                  Deno.env.get('CINETPAY_API_KEY'),
      site_id:                 Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id:          transactionId,
      amount:                  totalClientAmount,   // ← 10 500 FCFA (et non 10 000)
      currency:                'XOF',
      description:             `ayeJOB — ${booking.tasks.title} (dont 500 FCFA assurance prestation)`,
      customer_name:           booking.profiles.full_name,
      customer_phone_number:   booking.profiles.phone,
      notify_url:              `${Deno.env.get('APP_URL')}/api/webhooks/cinetpay`,
      return_url:              `${Deno.env.get('APP_URL')}/client/bookings/${booking_id}?status=success`,
      cancel_url:              `${Deno.env.get('APP_URL')}/client/bookings/${booking_id}?status=cancelled`,
      channels:                'ALL',
      lang:                    'fr',
    })
  })
  const paymentData = await cinetpayRes.json()

  // Enregistrer le paiement avec le montant réel débité
  await supabase.from('payments').insert({
    booking_id,
    client_id:      booking.client_id,
    amount:         totalClientAmount,   // montant réellement encaissé
    payment_method,
    provider:       'cinetpay',
    transaction_id: transactionId,
    payment_url:    paymentData.data?.payment_url,
    metadata:       paymentData
  })

  return new Response(
    JSON.stringify({ payment_url: paymentData.data?.payment_url }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Étape 4.2 — Webhook CinetPay (confirmation paiement)

Créer `src/app/api/webhooks/cinetpay/route.ts` :

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createClient()

  if (body.status === 'ACCEPTED') {
    await supabase.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('transaction_id', body.cpm_trans_id)

    const { data: payment } = await supabase.from('payments').select('booking_id')
      .eq('transaction_id', body.cpm_trans_id).single()

    const { data: booking } = await supabase.from('bookings').update({ status: 'paid' })
      .eq('id', payment!.booking_id).select().single()

    // Créditer l'artisan de son payout (agreed_amount - 12% commission)
    // Le service_fee (500 FCFA) reste acquis à la plateforme
    await supabase.rpc('credit_tasker_wallet', {
      p_tasker_id: booking!.tasker_id,
      p_amount:    booking!.tasker_payout   // ex: 8 800 FCFA sur 10 000 FCFA
    })

    await supabase.from('notifications').insert([
      {
        user_id: booking!.client_id,
        type:    'payment_confirmed',
        title:   'Paiement confirmé ✅',
        // Afficher total_client_amount (ce que le client a réellement payé)
        message: `Votre paiement de ${booking!.total_client_amount.toLocaleString()} FCFA a été reçu. Votre prestataire est prévenu !`,
        data:    { booking_id: booking!.id }
      },
      {
        user_id: booking!.tasker_id,
        type:    'new_booking',
        title:   'Nouvelle mission ! 🎉',
        // Montrer à l'artisan ce qu'il va toucher (pas le total client)
        message: `Mission confirmée. Vous recevrez ${booking!.tasker_payout.toLocaleString()} FCFA à la fin de la prestation.`,
        data:    { booking_id: booking!.id }
      }
    ])
  }
  return NextResponse.json({ status: 'ok' })
}
```

---

## PHASE 5 — Notifications temps réel (Semaine 5)

```typescript
// src/hooks/useNotifications.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Charger les notifications existantes
    supabase.from('notifications').select('*')
      .eq('user_id', userId).eq('is_read', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotifications(data || [])
        setUnreadCount(data?.length || 0)
      })

    // Abonnement temps réel
    const channel = supabase.channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'notifications', filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
        toast(payload.new.title, { description: payload.new.message })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead }
}
```

---

## PHASE 6 — Dashboard Admin (Semaine 6)

L'admin dashboard doit permettre :
1. **KPIs globaux** : users, taskers, tâches actives, revenus du mois, satisfaction
2. **Vérification Taskers** : voir CNI + selfie, approuver / rejeter avec motif
3. **Gestion transactions** : filtres par date, statut, montant
4. **Gestion litiges** : historique messages, décision admin
5. **Traitement retraits** : approuver les demandes de retrait Mobile Money

### Requête principale — Statistiques admin

```typescript
// src/app/admin/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalClients },
    { count: totalTaskers },
    { count: pendingVerif },
    { count: activeTasks },
    { count: completedToday },
    { data: payments30d }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tasker'),
    supabase.from('tasker_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      .gte('completed_at', new Date().toISOString().split('T')[0]),
    supabase.from('payments').select('amount').eq('status', 'completed')
      .gte('paid_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ])

  const volume30d = payments30d?.reduce((s, p) => s + p.amount, 0) || 0
  // Commission = 12% × montant artisan + 500 FCFA service_fee × nombre de bookings complétés
  // Approximation depuis les paiements (total_client_amount encaissé) :
  const commission30d = Math.round(volume30d * 0.12 / 1.12) // inverse du markup pour retrouver la part plateforme
  // OU plus précis : requêter directement SUM(platform_fee) + SUM(service_fee) sur bookings

  // Rendu avec KPI Cards...
}
```

---

## PHASE 7 — Déploiement production (Semaine 8)

### Étape 7.1 — Variables d'environnement complètes

```bash
# .env.local (et sur Vercel via vercel env add)

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# APP
NEXT_PUBLIC_APP_URL=https://ayejob.tg
NEXT_PUBLIC_APP_NAME=ayeJOB Togo
ADMIN_USER_ID=uuid-du-compte-admin

# CINETPAY
CINETPAY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
CINETPAY_SITE_ID=123456789
CINETPAY_SECRET_KEY=xxxxxxxxxxxxxxxx

# WHATSAPP BUSINESS API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=ton_token_secret_custom

# AFRICA'S TALKING (SMS)
AFRICAS_TALKING_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
AFRICAS_TALKING_USERNAME=ayejob_togo

# EMAIL
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ayejob.tg
```

### Étape 7.2 — Générer les types TypeScript

```bash
supabase gen types typescript --project-id TON_PROJECT_REF > src/types/database.ts
```

### Étape 7.3 — Middleware protection des routes

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const protectedPaths = ['/client', '/tasker', '/admin']

  if (protectedPaths.some(p => path.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (path.startsWith('/admin')) {
    const { data: profile } = await supabase.from('profiles')
      .select('role').eq('id', user!.id).single()
    if (profile?.role !== 'admin')
      return NextResponse.redirect(new URL('/', request.url))
  }

  if (path === '/dashboard' && user) {
    const { data: profile } = await supabase.from('profiles')
      .select('role').eq('id', user!.id).single()
    const map: Record<string, string> = { client: '/client', tasker: '/tasker', admin: '/admin' }
    return NextResponse.redirect(new URL(map[profile?.role || 'client'], request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|api/webhooks).*)']
}
```

---

## PHASE 8 — Messagerie in-app temps réel (Semaine 5-6)

```typescript
// src/components/messaging/ChatWindow.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  bookingId: string
  currentUserId: string
  otherUser: { id: string; full_name: string; avatar_url?: string }
}

export function ChatWindow({ bookingId, currentUserId, otherUser }: Props) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('messages').select('*, sender:profiles!sender_id(full_name, avatar_url)')
      .eq('booking_id', bookingId).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))

    supabase.from('messages').update({ is_read: true })
      .eq('booking_id', bookingId).eq('recipient_id', currentUserId).then(() => {})

    const channel = supabase.channel(`chat-${bookingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `booking_id=eq.${bookingId}` },
        async (payload) => {
          const { data: sender } = await supabase.from('profiles')
            .select('full_name, avatar_url').eq('id', payload.new.sender_id).single()
          setMessages(prev => [...prev, { ...payload.new, sender }])
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    await supabase.from('messages').insert({
      booking_id: bookingId, sender_id: currentUserId,
      recipient_id: otherUser.id, content: newMessage.trim()
    })
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
          {otherUser.full_name[0].toUpperCase()}
        </div>
        <span className="font-semibold">{otherUser.full_name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === currentUserId
                ? 'bg-green-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }`}>
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-green-200' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Votre message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500" />
        <button onClick={sendMessage} disabled={!newMessage.trim()}
          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-40 transition">
          ➤
        </button>
      </div>
    </div>
  )
}
```

---

## PHASE 9 — Système de retrait Tasker (Semaine 6)

```typescript
// supabase/functions/request-withdrawal/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { tasker_id, amount, phone_number, operator } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: wallet } = await supabase.from('tasker_wallets')
    .select('balance_available').eq('tasker_id', tasker_id).single()

  if (!wallet || wallet.balance_available < amount)
    return new Response(JSON.stringify({ error: 'Solde insuffisant' }), { status: 400 })

  if (amount < 2000)
    return new Response(JSON.stringify({ error: 'Minimum : 2 000 FCFA' }), { status: 400 })

  const { data: withdrawal } = await supabase.from('withdrawals')
    .insert({ tasker_id, amount, phone_number, operator, status: 'pending' })
    .select().single()

  await supabase.from('tasker_wallets')
    .update({ balance_available: wallet.balance_available - amount })
    .eq('tasker_id', tasker_id)

  await supabase.from('notifications').insert({
    user_id: Deno.env.get('ADMIN_USER_ID'),
    type: 'withdrawal_request',
    title: '💰 Demande de retrait',
    message: `${amount.toLocaleString()} FCFA vers ${phone_number} (${operator})`,
    data: { withdrawal_id: withdrawal!.id }
  })

  return new Response(
    JSON.stringify({ success: true, message: 'Traitement sous 24h ouvrées.', withdrawal_id: withdrawal!.id }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## PHASE 10 — Code de complétion & litiges (Semaine 7)

```typescript
// supabase/functions/complete-booking/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { booking_id, completion_code, user_id } = await req.json()
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: booking } = await supabase.from('bookings').select('*').eq('id', booking_id).single()

  if (!booking) return new Response(JSON.stringify({ error: 'Réservation introuvable' }), { status: 404 })
  if (booking.tasker_id !== user_id) return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 403 })
  if (booking.completion_code !== completion_code)
    return new Response(JSON.stringify({ error: 'Code incorrect. Demandez le code au client.' }), { status: 400 })

  await supabase.from('bookings').update({
    status: 'completed', completed_at: new Date().toISOString(),
    tasker_confirmed: true, client_confirmed: true
  }).eq('id', booking_id)

  await supabase.from('tasks').update({ status: 'completed' }).eq('id', booking.task_id)
  await supabase.rpc('release_tasker_funds', { p_booking_id: booking_id })

  await supabase.from('notifications').insert([
    {
      user_id: booking.client_id, type: 'task_completed', title: '✅ Mission terminée !',
      message: 'Votre prestation est terminée. Laissez un avis !',
      data: { booking_id, can_review: true }
    },
    {
      user_id: booking.tasker_id, type: 'payment_released', title: '💰 Paiement libéré !',
      message: `${booking.tasker_payout.toLocaleString()} FCFA disponibles dans votre portefeuille.`,
      data: { booking_id }
    }
  ])

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } })
})
```

---

## PHASE 11 — PWA & Configuration Production (Semaine 7-8)

### manifest.json

```json
{
  "name": "ayeJOB Togo",
  "short_name": "ayeJOB",
  "description": "Trouvez des prestataires de confiance à Lomé en quelques minutes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["business", "productivity"],
  "lang": "fr"
}
```

### next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: '*.supabase.co' }]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
      ]
    }]
  }
}

export default nextConfig
```

---

## PHASE 12 — WhatsApp Business API (Semaine 5-6)

### Templates à créer dans Meta Business Manager

| Nom template | Contenu |
|---|---|
| `booking_confirmed` | "Bonjour {{1}} ! 🎉 Réservation confirmée. Tasker : {{2}} · Date : {{3}} · Montant : {{4}} FCFA. Code fin de mission : {{5}}" |
| `tasker_new_mission` | "Nouvelle mission ! 💼 Client : {{1}} · Service : {{2}} · Date : {{3}} · Gain : {{4}} FCFA. Connectez-vous pour confirmer." |
| `payment_released` | "💰 {{1}} FCFA crédités sur votre portefeuille ayeJOB. Demandez votre retrait à tout moment." |
| `task_reminder` | "Rappel : Votre mission {{1}} est demain à {{2}}. Client : {{3}} · Adresse : {{4}}" |

### Fonction d'envoi

```typescript
// src/lib/whatsapp/index.ts
export async function sendWhatsApp(to: string, template: string, variables: string[]) {
  await fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.startsWith('+') ? to.slice(1) : `228${to}`,
      type: 'template',
      template: {
        name: template, language: { code: 'fr' },
        components: [{ type: 'body', parameters: variables.map(v => ({ type: 'text', text: v })) }]
      }
    })
  })
}
```

---

## RÉCAPITULATIF — Roadmap 8 semaines

| Semaine | Phases | Objectif livrable |
|---|---|---|
| S1 | Phase 0 + Phase 1 | Setup complet, schéma DB, RLS, triggers → Supabase 100% configuré |
| S2 | Phase 2 + Phase 3 | Landing page, auth OTP SMS, profils → Inscription/connexion fonctionnels |
| S3 | Phase 2 (fin) | Dashboard client, création tâche, liste taskers → Parcours client E2E |
| S4 | Phase 4 | CinetPay, escrow, webhook → Premier paiement réel |
| S5 | Phase 5 + Phase 8 | Notifications realtime, chat in-app, WhatsApp → Communication E2E |
| S6 | Phase 9 + Phase 10 | Portefeuille, retraits, code complétion → Cycle financier complet |
| S7 | Phase 6 + Phase 11 | Dashboard admin, PWA, middleware → Plateforme administrable |
| S8 | Phase 7 + Phase 12 | Variables prod, déploiement final, tests → Go Live 🚀 |

---

## BUDGET INFRASTRUCTURE (mensuel)

| Poste | Coût/mois |
|---|---|
| Supabase Free | 0 FCFA |
| Vercel Free | 0 FCFA |
| Nom de domaine .tg | ~250 FCFA (amorti annuel) |
| Africa's Talking SMS | ~1 FCFA/SMS (pay-as-you-go) |
| CinetPay commission | 1,5–3,5% prélevé sur transactions |
| WhatsApp Business API | Gratuit jusqu'à 1 000 conversations/mois |
| **TOTAL démarrage** | **< 5 000 FCFA/mois** |

---

## NOTES IMPORTANTES POUR L'IMPLÉMENTATION

1. **Priorité mobile-first** : 85% des users viendront sur mobile. Tester sur écran 375px en premier.
2. **Langue** : toute l'interface en français. Pas d'anglais visible par les utilisateurs finaux.
3. **Monnaie** : afficher toujours en FCFA (XOF). Format : `15 000 FCFA` (avec espace comme séparateur de milliers).
4. **Indicatif téléphone** : préfixer automatiquement avec `+228` (Togo). Le champ ne demande que les 8 chiffres locaux.
5. **Modèle économique** : Commission de **12%** prélevée sur l'artisan (l'artisan reçoit 88% de son offre). Le client paye en plus **500 FCFA fixes** d'"Assurance Prestation" (sécurisation + médiation). Exemple : offre artisan 10 000 FCFA → client paie 10 500 FCFA → artisan reçoit 8 800 FCFA → plateforme gagne 1 700 FCFA. Constantes configurables via `PLATFORM_COMMISSION_RATE` et `CLIENT_SERVICE_FEE` dans l'Edge Function `create-payment`.
6. **Montant minimum retrait** : 2 000 FCFA.
7. **Code de complétion** : 4 chiffres générés aléatoirement à la création du booking. Le client le communique verbalement au Tasker à la fin de la prestation.
8. **Statuts tâche dans l'ordre** : `open` → `assigned` → `in_progress` → `completed` (ou `cancelled` / `disputed` à tout moment).
9. **Vérification Tasker** : aucun Tasker ne peut recevoir de missions sans que son statut soit `verified` par l'admin.
10. **Performance** : utiliser les Server Components Next.js autant que possible. Les Client Components (`'use client'`) uniquement pour les parties interactives (formulaires, realtime, chat).

---

## CORRECTIONS & COMPLÉMENTS — Guide Antigravity

> Cette section corrige les bugs identifiés et fournit le code manquant pour une implémentation sans blocage.

---

## CORRECTION 1 — Next.js 15 : `cookies()` est async

```typescript
// src/lib/supabase/server.ts — VERSION CORRIGÉE pour Next.js 15
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies() // ← await obligatoire en Next.js 15
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        }
      }
    }
  )
}
```

> ⚠️ Tous les Server Components / Route Handlers qui appellent `createClient()` doivent donc être `async`.

---

## CORRECTION 2 — Webhook CinetPay avec vérification de signature

```typescript
// src/app/api/webhooks/cinetpay/route.ts — VERSION SÉCURISÉE
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyCinetPaySignature(body: Record<string, string>, secretKey: string): boolean {
  // CinetPay signe avec : MD5(apikey + site_id + transaction_id + amount + currency + secret)
  const { cpm_site_id, cpm_trans_id, cpm_amount, cpm_currency, cpm_payid } = body
  const hash = crypto
    .createHash('md5')
    .update(`${process.env.CINETPAY_API_KEY}${cpm_site_id}${cpm_trans_id}${cpm_amount}${cpm_currency}${secretKey}`)
    .digest('hex')
  return hash === body.cpm_signature
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // 1. Vérifier la signature avant tout traitement
  if (!verifyCinetPaySignature(body, process.env.CINETPAY_SECRET_KEY!)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  const supabase = await createClient()

  if (body.cpm_result === '00' && body.cpm_trans_status === 'ACCEPTED') {
    // 2. Idempotence : vérifier que le paiement n'est pas déjà traité
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('status, booking_id')
      .eq('transaction_id', body.cpm_trans_id)
      .single()

    if (!existingPayment || existingPayment.status === 'completed') {
      return NextResponse.json({ status: 'already_processed' })
    }

    await supabase.from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('transaction_id', body.cpm_trans_id)

    const { data: booking } = await supabase.from('bookings')
      .update({ status: 'paid' })
      .eq('id', existingPayment.booking_id)
      .select()
      .single()

    if (booking) {
      // Créditer l'artisan de son payout (agreed_amount - 12%)
      await supabase.rpc('credit_tasker_wallet', {
        p_tasker_id: booking.tasker_id,
        p_amount:    booking.tasker_payout   // ex: 8 800 FCFA sur offre de 10 000 FCFA
      })

      await supabase.from('notifications').insert([
        {
          user_id: booking.client_id,
          type:    'payment_confirmed',
          title:   'Paiement confirmé ✅',
          // Afficher total_client_amount (ce que le client a réellement payé)
          message: `Votre paiement de ${booking.total_client_amount.toLocaleString()} FCFA a été reçu. Votre prestataire est prévenu !`,
          data:    { booking_id: booking.id }
        },
        {
          user_id: booking.tasker_id,
          type:    'new_booking',
          title:   'Nouvelle mission ! 🎉',
          // L'artisan voit son payout net (pas le total client)
          message: `Mission confirmée. Vous recevrez ${booking.tasker_payout.toLocaleString()} FCFA à la fin de la prestation.`,
          data:    { booking_id: booking.id }
        }
      ])
    }
  }

  return NextResponse.json({ status: 'ok' })
}
```

---

## CORRECTION 3 — RLS manquantes

```sql
-- Ajouter ces policies dans le SQL Editor Supabase

-- service_categories : lecture publique
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catégories visibles par tous" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Admin gère catégories" ON public.service_categories
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- tasker_profiles : lecture publique, écriture par l'utilisateur concerné
ALTER TABLE public.tasker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profil tasker public" ON public.tasker_profiles FOR SELECT USING (true);
CREATE POLICY "Tasker modifie son profil" ON public.tasker_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Tasker crée son profil" ON public.tasker_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- tasker_skills
ALTER TABLE public.tasker_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills visibles" ON public.tasker_skills FOR SELECT USING (true);
CREATE POLICY "Tasker gère ses skills" ON public.tasker_skills
  FOR ALL USING (tasker_id IN (SELECT id FROM public.tasker_profiles WHERE user_id = auth.uid()));

-- tasker_wallets : visible par le tasker concerné et l'admin
ALTER TABLE public.tasker_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasker voit son portefeuille" ON public.tasker_wallets
  FOR SELECT USING (tasker_id = auth.uid());
CREATE POLICY "Admin voit tous les portefeuilles" ON public.tasker_wallets
  FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasker voit ses retraits" ON public.withdrawals FOR SELECT USING (tasker_id = auth.uid());
CREATE POLICY "Admin gère retraits" ON public.withdrawals
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- bookings : client et tasker voient leurs réservations
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Voir ses réservations" ON public.bookings
  FOR SELECT USING (client_id = auth.uid() OR tasker_id = auth.uid());
CREATE POLICY "Client crée réservation" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Parties mettent à jour" ON public.bookings
  FOR UPDATE USING (client_id = auth.uid() OR tasker_id = auth.uid());
```

---

## CORRECTION 4 — Index SQL pour les performances

```sql
-- Ajouter dans le SQL Editor après création des tables

-- Recherche tâches par statut et catégorie (marketplace tasker)
CREATE INDEX idx_tasks_status_category ON public.tasks(status, category_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_assigned_tasker ON public.tasks(assigned_tasker_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);

-- Offres
CREATE INDEX idx_bids_task_id ON public.task_bids(task_id);
CREATE INDEX idx_bids_tasker_id ON public.task_bids(tasker_id);

-- Réservations
CREATE INDEX idx_bookings_client ON public.bookings(client_id, status);
CREATE INDEX idx_bookings_tasker ON public.bookings(tasker_id, status);

-- Messages (chat temps réel)
CREATE INDEX idx_messages_booking ON public.messages(booking_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Profils taskers
CREATE INDEX idx_tasker_profiles_verified ON public.tasker_profiles(verification_status, rating_avg DESC);

-- Recherche texte sur les tâches (pg_trgm)
CREATE INDEX idx_tasks_title_trgm ON public.tasks USING gin(title gin_trgm_ops);
```

---

## CORRECTION 5 — Génération du code de complétion au booking

```sql
-- Trigger : générer le code de complétion à la création d'un booking
CREATE OR REPLACE FUNCTION generate_completion_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Code 4 chiffres aléatoire
  NEW.completion_code = LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_completion_code
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION generate_completion_code();
```

---

## CORRECTION 6 — Authentification dans les Edge Functions

```typescript
// Ajouter ce helper dans chaque Edge Function pour authentifier l'appelant
// supabase/functions/_shared/auth.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return { user: null, error: 'Non authentifié' }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user, error: error?.message }
}

// Utilisation dans create-payment/index.ts :
// const { user, error } = await getAuthenticatedUser(req)
// if (!user) return new Response(JSON.stringify({ error }), { status: 401 })
// Vérifier que user.id === booking.client_id avant traitement
```

---

## SECTION MANQUANTE — Supabase Storage (photos, CNI, selfies)

```sql
-- À exécuter dans le SQL Editor Supabase

-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('task-photos',    'task-photos',    true,  5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('tasker-kyc',     'tasker-kyc',     false, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('avatars',        'avatars',        true,  2097152, ARRAY['image/jpeg','image/png','image/webp']);

-- Policies Storage
CREATE POLICY "Photos tâches publiques" ON storage.objects FOR SELECT
  USING (bucket_id = 'task-photos');
CREATE POLICY "Client upload ses photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'task-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Tasker upload son KYC" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tasker-kyc' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Tasker voit son KYC" ON storage.objects FOR SELECT
  USING (bucket_id = 'tasker-kyc' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admin voit tous les KYC" ON storage.objects FOR SELECT
  USING (bucket_id = 'tasker-kyc' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Avatar public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Upload son avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

```typescript
// Exemple upload photo tâche
// src/lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadTaskPhoto(file: File, taskId: string): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${taskId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('task-photos')
    .upload(path, file, { upsert: true })

  if (error) return null

  const { data } = supabase.storage.from('task-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadKycDocument(
  file: File,
  userId: string,
  docType: 'id_card' | 'id_card_back' | 'selfie'
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${docType}.${ext}`

  const { error } = await supabase.storage
    .from('tasker-kyc')
    .upload(path, file, { upsert: true })

  if (error) return null

  const { data } = await supabase.storage.from('tasker-kyc').createSignedUrl(path, 3600)
  return data?.signedUrl || null
}
```

---

## SECTION MANQUANTE — `lib/utils.ts`

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formate un montant en FCFA — ex: 15 000 FCFA */
export function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Formate une date en français — ex: lundi 20 mai 2026 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(date))
}

/** Date courte — ex: 20/05/2026 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR').format(new Date(date))
}

/** Temps relatif — ex: il y a 3 heures */
export function timeAgo(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })
  const diff = (new Date(date).getTime() - Date.now()) / 1000
  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second')
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

/** Formate un numéro de téléphone togolais — ex: +228 90 00 00 00 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-8)
  return `+228 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`
}

// ── Constantes tarifaires (sync avec l'Edge Function create-payment) ────────
export const PLATFORM_COMMISSION_RATE = 0.12   // 12% sur l'artisan
export const CLIENT_SERVICE_FEE       = 500    // 500 FCFA fixes sur le client
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calcule la décomposition financière d'une transaction ayeJOB.
 *
 * @param agreedAmount  Montant de l'offre de l'artisan (ex: 10 000 FCFA)
 * @returns
 *   - platformFee       : commission prélevée sur l'artisan (12%)
 *   - taskerPayout      : ce que reçoit l'artisan (88%)
 *   - serviceFee        : frais fixes payés par le client (500 FCFA)
 *   - totalClientAmount : total débité sur le client (offre + service_fee)
 */
export function calculateFees(agreedAmount: number): {
  platformFee:       number
  taskerPayout:      number
  serviceFee:        number
  totalClientAmount: number
} {
  const platformFee       = Math.round(agreedAmount * PLATFORM_COMMISSION_RATE)
  const taskerPayout      = agreedAmount - platformFee
  const serviceFee        = CLIENT_SERVICE_FEE
  const totalClientAmount = agreedAmount + serviceFee
  return { platformFee, taskerPayout, serviceFee, totalClientAmount }
}

/** Étoiles de notation */
export function ratingToStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}

/** Badge couleur selon statut booking */
export const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'En attente de paiement', color: 'yellow' },
  paid:            { label: 'Payé',                   color: 'blue' },
  in_progress:     { label: 'En cours',               color: 'purple' },
  completed:       { label: 'Terminé',                color: 'green' },
  cancelled:       { label: 'Annulé',                 color: 'gray' },
  disputed:        { label: 'Litige',                 color: 'red' },
}

export const TASK_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Ouverte',    color: 'green' },
  assigned:    { label: 'Assignée',   color: 'blue' },
  in_progress: { label: 'En cours',   color: 'purple' },
  completed:   { label: 'Terminée',   color: 'gray' },
  cancelled:   { label: 'Annulée',    color: 'red' },
  disputed:    { label: 'Litige',     color: 'orange' },
}
```

---

## SECTION MANQUANTE — `tailwind.config.ts`

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleur primaire : vert ayeJOB
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // ← couleur principale boutons
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Couleur secondaire : orange pour urgence
        accent: {
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}

export default config
```

---

## SECTION MANQUANTE — `RegisterForm.tsx`

```typescript
// src/components/auth/RegisterForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone: z.string().length(8, 'Numéro à 8 chiffres (ex: 90000000)').regex(/^\d+$/, 'Chiffres uniquement'),
  role: z.enum(['client', 'tasker']),
  otp: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function RegisterForm() {
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'client' }
  })
  const selectedRole = watch('role')

  const sendOTP = async (data: FormData) => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+228${data.phone}`,
      options: {
        data: { full_name: data.full_name, phone: data.phone, role: data.role }
      }
    })
    if (error) setError(error.message)
    else setStep('otp')
    setLoading(false)
  }

  const verifyOTP = async (data: FormData) => {
    if (!data.otp) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({
      phone: `+228${data.phone}`,
      token: data.otp,
      type: 'sms'
    })
    if (error) setError(error.message)
    else {
      // Créer le profil tasker si rôle = tasker
      if (data.role === 'tasker') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('tasker_profiles').insert({ user_id: user.id })
          router.push('/tasker/profile?onboarding=true')
        }
      } else {
        router.push('/client')
      }
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="text-gray-500 text-sm mt-1">Rejoignez ayeJOB Togo</p>
      </div>

      {step === 'info' ? (
        <form onSubmit={handleSubmit(sendOTP)} className="space-y-4">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input {...register('full_name')} placeholder="Kofi Mensah"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="flex">
              <span className="bg-gray-100 border border-r-0 rounded-l-xl px-3 flex items-center text-gray-600 text-sm">
                🇹🇬 +228
              </span>
              <input {...register('phone')} type="tel" placeholder="90 00 00 00" maxLength={8}
                className="flex-1 border rounded-r-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je suis :</label>
            <div className="grid grid-cols-2 gap-3">
              {(['client', 'tasker'] as const).map(r => (
                <label key={r} className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                  selectedRole === r ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input {...register('role')} type="radio" value={r} className="sr-only" />
                  <span className="text-2xl mb-1">{r === 'client' ? '🛋️' : '🔧'}</span>
                  <span className="font-semibold text-sm capitalize">{r === 'client' ? 'Client' : 'Prestataire'}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {r === 'client' ? 'Je cherche un service' : 'Je propose mes services'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-primary-700 transition">
            {loading ? 'Envoi du code...' : 'Recevoir le code SMS'}
          </button>
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <a href="/login" className="text-primary-600 font-medium">Se connecter</a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit(verifyOTP)} className="space-y-4">
          <p className="text-center text-sm text-gray-600">Code envoyé par SMS. Valable 10 minutes.</p>
          <input {...register('otp')} type="text" placeholder="0 0 0 0 0 0" maxLength={6}
            className="w-full border rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-primary-500" />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
            {loading ? 'Vérification...' : 'Créer mon compte'}
          </button>
          <button type="button" onClick={() => setStep('info')}
            className="w-full text-gray-500 text-sm underline">
            ← Corriger mon numéro
          </button>
        </form>
      )}
    </div>
  )
}
```

---

## SECTION MANQUANTE — `TaskCard.tsx` & `TaskForm.tsx` (simplifié)

```typescript
// src/components/tasks/TaskCard.tsx
import { formatCFA, formatDate, TASK_STATUS_LABELS } from '@/lib/utils'
import { MapPin, Clock, Users } from 'lucide-react'
import Link from 'next/link'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    location_neighborhood: string | null
    budget_amount: number | null
    budget_type: string
    scheduled_date: string | null
    scheduled_time_slot: string | null
    status: string
    urgency: string
    bids_count: number
    service_categories: { name: string; icon_name: string } | null
  }
  href: string
  variant?: 'client' | 'tasker'
}

export function TaskCard({ task, href, variant = 'client' }: TaskCardProps) {
  const statusInfo = TASK_STATUS_LABELS[task.status]

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-4 border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              {task.service_categories?.name}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {task.urgency === 'urgent' && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">🔥 Urgent</span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {task.location_neighborhood && (
            <span className="flex items-center gap-1"><MapPin size={12} />{task.location_neighborhood}</span>
          )}
          {task.scheduled_date && (
            <span className="flex items-center gap-1"><Clock size={12} />{formatDate(task.scheduled_date)}</span>
          )}
          {variant === 'client' && (
            <span className="flex items-center gap-1"><Users size={12} />{task.bids_count} offre{task.bids_count > 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Budget */}
        {task.budget_amount && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Budget</span>
            <span className="font-bold text-primary-600">
              {task.budget_type === 'negotiable' ? 'À négocier' : formatCFA(task.budget_amount)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
```

```typescript
// src/components/tasks/TaskForm.tsx — Formulaire multi-étapes
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { uploadTaskPhoto } from '@/lib/supabase/storage'

const schema = z.object({
  category_id: z.string().uuid('Sélectionnez une catégorie'),
  title: z.string().min(5, 'Titre trop court').max(100),
  description: z.string().min(20, 'Décrivez mieux votre besoin (min 20 caractères)'),
  location_address: z.string().min(5, 'Adresse requise'),
  location_neighborhood: z.string().optional(),
  budget_type: z.enum(['fixed', 'hourly', 'negotiable']),
  budget_amount: z.number().min(500).optional(),
  scheduled_date: z.string().optional(),
  scheduled_time_slot: z.enum(['matin', 'après-midi', 'soir', 'flexible']).optional(),
  urgency: z.enum(['urgent', 'normal', 'flexible']).default('normal'),
})
type FormData = z.infer<typeof schema>

const STEPS = ['Catégorie', 'Détails', 'Lieu & Budget', 'Date & Confirmation']

interface Props { categories: Array<{ id: string; name: string; icon_name: string }> }

export function TaskForm({ categories }: Props) {
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { budget_type: 'fixed', urgency: 'normal', scheduled_time_slot: 'flexible' }
  })
  const budgetType = watch('budget_type')

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Créer la tâche
    const { data: task, error } = await supabase.from('tasks').insert({
      ...data,
      client_id: user.id,
      budget_amount: data.budget_amount || null,
    }).select().single()

    if (error || !task) { setUploading(false); return }

    // Uploader les photos
    if (photos.length > 0) {
      const urls = await Promise.all(photos.map(f => uploadTaskPhoto(f, task.id)))
      const validUrls = urls.filter(Boolean) as string[]
      if (validUrls.length > 0) {
        await supabase.from('tasks').update({ photos: validUrls }).eq('id', task.id)
      }
    }

    router.push(`/client/tasks/${task.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              i < step ? 'bg-primary-600 text-white' :
              i === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' :
              'bg-gray-100 text-gray-400'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-xs ${i === step ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ÉTAPE 0 — Catégorie */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quel service cherchez-vous ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <label key={cat.id} className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                  watch('category_id') === cat.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                }`}>
                  <input {...register('category_id')} type="radio" value={cat.id} className="sr-only" />
                  <span className="text-2xl mb-1">🔧</span>
                  <span className="text-sm font-medium text-center">{cat.name}</span>
                </label>
              ))}
            </div>
            {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
          </div>
        )}

        {/* ÉTAPE 1 — Titre & Description */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Décrivez votre besoin</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre court *</label>
              <input {...register('title')} placeholder="ex: Nettoyage appartement 3 pièces"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée *</label>
              <textarea {...register('description')} rows={5}
                placeholder="Décrivez précisément ce dont vous avez besoin, les contraintes, le matériel fourni..."
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            {/* Urgence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgence</label>
              <div className="flex gap-2">
                {(['urgent', 'normal', 'flexible'] as const).map(u => (
                  <label key={u} className={`flex-1 text-center py-2 border-2 rounded-lg cursor-pointer text-sm transition ${
                    watch('urgency') === u ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-500'
                  }`}>
                    <input {...register('urgency')} type="radio" value={u} className="sr-only" />
                    {u === 'urgent' ? '🔥 Urgent' : u === 'normal' ? '⏱ Normal' : '📅 Flexible'}
                  </label>
                ))}
              </div>
            </div>
            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optionnel)</label>
              <input type="file" accept="image/*" multiple
                onChange={e => setPhotos(Array.from(e.target.files || []).slice(0, 4))}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium" />
              {photos.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{photos.length} photo(s) sélectionnée(s)</p>
              )}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — Lieu & Budget */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Lieu et budget</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input {...register('location_address')} placeholder="ex: Avenue du Bénin, Lomé"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
              {errors.location_address && <p className="text-red-500 text-xs mt-1">{errors.location_address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
              <input {...register('location_neighborhood')} placeholder="ex: Adidogomé, Bè, Tokoin..."
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
            </div>
            {/* Budget type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de tarif</label>
              <div className="flex gap-2">
                {([['fixed', 'Montant fixe'], ['hourly', 'Par heure'], ['negotiable', 'À négocier']] as const).map(([val, label]) => (
                  <label key={val} className={`flex-1 text-center py-2 border-2 rounded-lg cursor-pointer text-xs transition ${
                    budgetType === val ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-500'
                  }`}>
                    <input {...register('budget_type')} type="radio" value={val} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {budgetType !== 'negotiable' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (FCFA) {budgetType === 'hourly' ? '/ heure' : ''}
                </label>
                <input type="number" {...register('budget_amount', { valueAsNumber: true })}
                  placeholder="ex: 5000" min={500} step={500}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
                {errors.budget_amount && <p className="text-red-500 text-xs mt-1">{errors.budget_amount.message}</p>}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3 — Date & Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Quand avez-vous besoin ?</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
              <input type="date" {...register('scheduled_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Créneau horaire</label>
              <div className="grid grid-cols-2 gap-2">
                {([['matin', '☀️ Matin (7h-12h)'], ['après-midi', '🌤 Après-midi (12h-17h)'],
                   ['soir', '🌙 Soir (17h-20h)'], ['flexible', '🕐 Flexible']] as const).map(([val, label]) => (
                  <label key={val} className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition ${
                    watch('scheduled_time_slot') === val ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                  }`}>
                    <input {...register('scheduled_time_slot')} type="radio" value={val} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Récapitulatif */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-700">✅ Récapitulatif :</p>
              <p className="text-gray-600">📋 {watch('title')}</p>
              <p className="text-gray-600">📍 {watch('location_address')}</p>
              {watch('budget_amount') && <p className="text-gray-600">💰 {watch('budget_amount')?.toLocaleString('fr-FR')} FCFA</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300 transition">
              ← Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition">
              Suivant →
            </button>
          ) : (
            <button type="submit" disabled={uploading}
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-primary-700 transition">
              {uploading ? '⏳ Publication...' : '🚀 Publier la tâche'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
```

---

## SECTION MANQUANTE — `PaymentModal.tsx`

```typescript
// src/components/payments/PaymentModal.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCFA, calculateFees } from '@/lib/utils'

const OPERATORS = [
  { id: 'flooz',        label: 'Flooz',        emoji: '🟠', description: 'Moov Africa' },
  { id: 'tmoney',       label: 'T-Money',      emoji: '🔵', description: 'Togocom' },
  { id: 'orange_money', label: 'Orange Money', emoji: '🟡', description: 'Orange' },
  { id: 'wave',         label: 'Wave',         emoji: '🌊', description: 'Wave' },
]

interface Props {
  bookingId: string
  agreedAmount: number   // Offre de l'artisan (ex: 10 000 FCFA)
  taskTitle: string
  onClose: () => void
}

export function PaymentModal({ bookingId, agreedAmount, taskTitle, onClose }: Props) {
  const [operator, setOperator] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { platformFee, taskerPayout, serviceFee, totalClientAmount } = calculateFees(agreedAmount)
  const supabase = createClient()

  const handlePay = async () => {
    if (!operator) return
    setLoading(true); setError('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ booking_id: bookingId, payment_method: operator })
      }
    )
    const data = await res.json()

    if (!res.ok || !data.payment_url) {
      setError(data.error || 'Erreur lors de l\'initiation du paiement')
      setLoading(false)
      return
    }

    // Rediriger vers la page de paiement CinetPay
    window.location.href = data.payment_url
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Paiement</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
        </div>

        {/* Récapitulatif */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 truncate">{taskTitle}</p>
          <div className="space-y-1.5 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Prestation</span>
              <span className="font-medium text-gray-800">{formatCFA(agreedAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>🛡️ Assurance Prestation</span>
              <span>{formatCFA(serviceFee)}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total à payer</span>
            <span className="text-primary-600">{formatCFA(totalClientAmount)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Le prestataire recevra {formatCFA(taskerPayout)} à la fin de la mission
          </p>
        </div>

        {/* Choix opérateur */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez votre Mobile Money :</p>
          <div className="grid grid-cols-2 gap-2">
            {OPERATORS.map(op => (
              <button key={op.id} type="button" onClick={() => setOperator(op.id)}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl transition ${
                  operator === op.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-2xl">{op.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">{op.label}</p>
                  <p className="text-xs text-gray-400">{op.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button onClick={handlePay} disabled={!operator || loading}
          className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 hover:bg-primary-700 transition text-lg">
          {loading ? '⏳ Redirection...' : `💳 Payer ${formatCFA(totalClientAmount)}`}
        </button>

        <p className="text-xs text-center text-gray-400">
          🔒 Paiement sécurisé par CinetPay · Votre argent est protégé jusqu'à la fin de la prestation
        </p>
      </div>
    </div>
  )
}
```

---

## SECTION MANQUANTE — `useProfile.ts`

```typescript
// src/hooks/useProfile.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string
  phone: string
  email: string | null
  avatar_url: string | null
  role: 'client' | 'tasker' | 'admin'
  city: string | null
  neighborhood: string | null
  is_active: boolean
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => subscription.unsubscribe()
  }, [])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: 'Non connecté' }
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id)
    if (!error) setProfile(prev => prev ? { ...prev, ...updates } : null)
    return { error }
  }

  return { profile, loading, updateProfile }
}
```

---

## SECTION MANQUANTE — `BidForm.tsx`

```typescript
// src/components/tasks/BidForm.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCFA } from '@/lib/utils'

const schema = z.object({
  amount: z.number().min(500, 'Minimum 500 FCFA').max(500000, 'Maximum 500 000 FCFA'),
  message: z.string().min(20, 'Message trop court (min 20 caractères)').max(500),
  estimated_duration: z.string().min(1, 'Indiquez une durée estimée'),
})
type FormData = z.infer<typeof schema>

interface Props {
  taskId: string
  taskTitle: string
  clientBudget?: number | null
  onSuccess?: () => void
}

export function BidForm({ taskId, taskTitle, clientBudget, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: clientBudget || undefined }
  })
  const amount = watch('amount')

  const onSubmit = async (data: FormData) => {
    setLoading(true); setError('')
    const { error } = await supabase.from('task_bids').insert({
      task_id: taskId,
      ...data
    })

    if (error) {
      setError(error.code === '23505' ? 'Vous avez déjà soumis une offre pour cette tâche.' : error.message)
    } else {
      setSuccess(true)
      onSuccess?.()
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-bold text-green-800">Offre envoyée avec succès !</p>
        <p className="text-sm text-green-600 mt-1">Le client sera notifié et pourra accepter votre offre.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-gray-900">Soumettre une offre</h3>
      <p className="text-sm text-gray-500 truncate">Pour : {taskTitle}</p>

      {clientBudget && (
        <p className="text-xs text-gray-400">Budget client : {formatCFA(clientBudget)}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Votre prix (FCFA) *</label>
        <input type="number" {...register('amount', { valueAsNumber: true })}
          placeholder="ex: 8000" step={500}
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
        {amount > 0 && <p className="text-xs text-primary-600 mt-1">Vous recevrez : {formatCFA(Math.round(amount * 0.85))} (après commission)</p>}
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée *</label>
        <input {...register('estimated_duration')} placeholder="ex: 2 heures, une demi-journée..."
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500" />
        {errors.estimated_duration && <p className="text-red-500 text-xs mt-1">{errors.estimated_duration.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message au client *</label>
        <textarea {...register('message')} rows={4}
          placeholder="Présentez-vous, expliquez votre approche et pourquoi vous êtes le bon prestataire..."
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 resize-none" />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-primary-700 transition">
        {loading ? 'Envoi...' : 'Envoyer mon offre'}
      </button>
    </form>
  )
}
```

---

## SECTION MANQUANTE — Variables d'environnement Edge Functions Supabase

```bash
# À configurer dans Supabase Dashboard → Settings → Edge Functions → Secrets
# OU via CLI :

supabase secrets set SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set CINETPAY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set CINETPAY_SITE_ID=123456789
supabase secrets set CINETPAY_SECRET_KEY=xxxxxxxxxxxxxxxx
supabase secrets set APP_URL=https://ayejob.tg
supabase secrets set ADMIN_USER_ID=uuid-du-compte-admin   # ← MANQUAIT dans la doc originale
supabase secrets set WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxx
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=xxxxxxxxxxxxxxxxx
```

---

## SECTION MANQUANTE — Déploiement Edge Functions

```bash
# Déployer toutes les Edge Functions
supabase functions deploy create-payment
supabase functions deploy request-withdrawal
supabase functions deploy complete-booking

# Vérifier les logs en production
supabase functions logs create-payment
supabase functions logs complete-booking
```

---

## SECTION MANQUANTE — Utiliser des migrations (au lieu du SQL Editor)

> ✅ Recommandé pour Antigravity : travailler avec des fichiers de migration versionés.

```bash
# Créer une migration pour le schéma initial
supabase migration new initial_schema

# Le fichier est créé dans supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql
# Copier tout le SQL des étapes 1.1, 1.2, 1.3 dans ce fichier

# Appliquer en local (avec Docker)
supabase db push

# Appliquer en production
supabase db push --db-url postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

# Générer les types TypeScript après chaque migration
supabase gen types typescript --project-id TON_PROJECT_REF > src/types/database.ts
```

---

## CHECKLIST DE TESTS — Avant mise en production

### 🔐 Authentification
- [ ] Inscription client → OTP reçu → profil créé dans `profiles`
- [ ] Inscription tasker → OTP reçu → `tasker_profiles` créé automatiquement
- [ ] Connexion OTP → redirection vers bon dashboard selon rôle
- [ ] Route `/admin` sans rôle admin → redirection
- [ ] Route `/client` non connecté → redirection vers `/login`

### 📋 Cycle de vie d'une tâche
- [ ] Client crée une tâche → apparaît dans marketplace tasker
- [ ] Tasker soumet une offre → client notifié (in-app + WhatsApp)
- [ ] Client accepte une offre → booking créé avec `completion_code` auto-généré
- [ ] Client paye → webhook CinetPay reçu → booking `paid` → tasker notifié
- [ ] Tasker entre le code de complétion → booking `completed` → fonds libérés
- [ ] Client laisse un avis → note moyenne tasker mise à jour

### 💰 Paiement & finances
- [ ] Signature CinetPay vérifiée (tester avec une fausse signature → 401)
- [ ] Idempotence webhook (envoyer 2x le même paiement → traité une seule fois)
- [ ] Portefeuille tasker crédité après paiement
- [ ] Fonds libérés après complétion
- [ ] Demande de retrait crée une notification admin
- [ ] Solde insuffisant → refus avec message clair

### 📱 Mobile & PWA
- [ ] Testé sur Chrome Android 375px
- [ ] Testé sur Safari iOS 375px
- [ ] PWA installable (manifest.json valide)
- [ ] Bas de page navigation mobile (BottomNav) fonctionne

### ⚡ Performances
- [ ] Lighthouse score ≥ 90 sur mobile
- [ ] Images optimisées via `next/image`
- [ ] Pas de `'use client'` superflu sur les pages

### 🔒 Sécurité
- [ ] Toutes les tables ont RLS activé
- [ ] Un client ne peut pas voir les bookings d'un autre client
- [ ] Un tasker ne peut pas voir le portefeuille d'un autre tasker
- [ ] Les KYC docs ne sont accessibles qu'au tasker propriétaire et à l'admin
