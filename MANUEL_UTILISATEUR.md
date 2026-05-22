# Manuel Utilisateur - ayeJOB

Bienvenue sur la plateforme **ayeJOB** ! Ce document explique le fonctionnement de bout en bout de l'application, étape par étape, pour les trois types d'utilisateurs : Le Client, l'Artisan et l'Administrateur. 

*(Note: Ce fichier sera mis à jour au fur et à mesure de l'avancement du projet).*

---

## 1. Création de compte et Connexion
- L'utilisateur se rend sur la page d'inscription (`/register`) ou de connexion (`/login`).
- Contrairement au plan initial (qui prévoyait un code OTP par SMS coûteux), le système utilise une connexion sécurisée par **Téléphone et Mot de passe**. 
- Lors de l'inscription, il renseigne son Nom complet, son numéro de téléphone, son rôle initial (Client ou Artisan) et un mot de passe de son choix.
- Une fois connecté, il accède directement au tableau de bord correspondant à son rôle (`/client` ou `/tasker`). Depuis le menu principal (ou le menu interactif "burger" sur mobile), il est possible de naviguer de manière fluide entre les différentes sections.

---

## 2. Guide d'utilisation : Côté CLIENT
Le Client est la personne qui a besoin qu'un service soit réalisé chez lui (ex: Plomberie, Nettoyage, Électricité).

**Étape 1 : Publier une demande (Mission)**
1. Depuis la page d'accueil ou la page "Services", cliquez directement sur une catégorie (ex: "Nettoyage").
2. Vous serez redirigé vers le formulaire avec la catégorie **déjà pré-sélectionnée** (méthode de conversion rapide).
3. *Alternative :* Depuis le Tableau de bord Client, cliquez sur **Nouvelle Demande** et choisissez manuellement la catégorie.
4. Suivez le formulaire interactif en 3 étapes :
   - Décrivez votre problème en détail.
   - Indiquez le lieu d'intervention (Quartier de Lomé et adresse exacte).
   - Indiquez la date souhaitée, l'heure et un budget estimatif (forfait, horaire ou négociable).
5. Votre mission est désormais publiée sur la plateforme et visible par tous les artisans.

**Étape 2 : Analyser les offres et recruter**
1. Allez sur votre Tableau de bord et cliquez sur votre demande.
2. Vous verrez à droite la liste des artisans ayant répondu avec leur prix, leur durée estimée et leur message.
3. Choisissez le profil qui vous convient et cliquez sur **Accepter l'offre**. L'artisan est désormais officiellement assigné !

**Étape 3 : Payer pour sécuriser les fonds**
1. Sur la page de votre mission assignée, cliquez sur **Accéder à l'espace de travail**.
2. Pour que l'artisan se déplace en toute confiance, vous devez sécuriser l'argent. Cliquez sur **Payer (Flooz / TMoney)**. 
3. *Note concernant le développement :* Le système redirige actuellement vers un portail de simulation de paiement (`/mock-cinetpay`). Cela permet de tester et de simuler le débit de la carte ou du mobile money sans payer de vrais frais de transaction.
4. L'argent est virtuellement bloqué et gardé en sécurité (Statut: Fonds Sécurisés).

**Étape 4 : Valider le travail et noter l'artisan**
1. Une fois que l'artisan a déclaré le travail terminé, un bouton **"Le travail est parfait, libérer l'argent"** apparaîtra sur votre espace de travail.
2. Cliquez dessus pour transférer définitivement les fonds à l'artisan.
3. Un formulaire apparaîtra pour laisser une note (1 à 5 étoiles) et un commentaire sur l'artisan.

---

## 3. Guide d'utilisation : Côté ARTISAN
L'Artisan est le professionnel qui utilise la plateforme pour trouver des chantiers et gagner sa vie.

**Étape 1 : Créer son profil professionnel**
1. Lors de votre première connexion à l'Espace Artisan, votre profil est "En attente de vérification". Vous ne pouvez pas encore accepter de missions.
2. Cliquez sur "Compléter mon profil" pour ajouter votre photo, votre métier, et vos tarifs.
3. L'administrateur devra ensuite valider votre profil.

**Étape 2 : Trouver des missions et faire une offre**
1. Sur votre Tableau de bord, vous voyez toutes les "Missions récentes disponibles" de votre ville.
2. Cliquez sur "Faire une offre" sur une mission qui correspond à vos compétences.
3. Renseignez le montant exact que vous demandez et le temps que cela prendra.

**Étape 3 : Réaliser le travail**
1. Si le Client vous choisit, la mission apparaîtra tout en haut dans la section **Mes missions en cours**.
2. **⚠️ ATTENTION :** Ne commencez pas le travail tant que le statut est "En attente de paiement".
3. Quand le statut devient **"En cours de réalisation"** (Fonds sécurisés), allez chez le client et faites le travail.
4. Une fois terminé, cliquez sur "Gérer la mission" puis sur le bouton **"J'ai terminé le travail"**.

**Étape 4 : Recevoir son argent et augmenter sa réputation**
1. Attendez que le Client confirme la bonne réalisation du travail de son côté.
2. Une fois confirmé, l'argent s'ajoutera automatiquement à votre **Solde disponible** sur votre Tableau de bord.
3. La note et le commentaire laissés par le client s'ajouteront à votre **Note moyenne**, ce qui vous aidera à obtenir plus de clients à l'avenir !

**Étape 5 : Retirer ses gains (Paiement)**
1. Rendez-vous dans la section **Mes Gains**.
2. Remplissez le formulaire de demande de retrait en indiquant votre numéro de téléphone (TMoney ou Flooz) et le montant souhaité.
3. La demande passe "En attente". L'administrateur de la plateforme procèdera au transfert manuel.
4. Une fois l'argent envoyé, vous recevrez une notification et la transaction sera marquée comme "Terminée".

---

## 4. Guide d'utilisation : Côté ADMINISTRATEUR
Le compte Administrateur permet de gérer la sécurité de la plateforme, de valider les profils et de procéder aux paiements manuels.

**Étape 1 : Connexion et Sécurité**
1. L'accès administrateur est ultra-sécurisé. Il nécessite que votre identifiant unique (UUID) soit configuré dans le fichier `.env.local` (`ADMIN_USER_ID`) et que votre rôle en base de données soit `admin`.
2. Connectez-vous avec votre numéro autorisé. Le système vous redirigera automatiquement vers le **Centre de Contrôle** (`/admin`).

**Étape 2 : Vérification des Artisans**
1. Sur le tableau de bord, consultez la liste des **Artisans en attente de vérification**.
2. Vous pouvez cliquer sur **Approuver** ou **Refuser** après avoir vérifié physiquement leurs compétences ou documents. L'artisan recevra un email/SMS de notification.

**Étape 3 : Traitement des Demandes de Retrait**
1. Dans la section **Demandes de retrait**, vous verrez l'historique des requêtes des artisans.
2. Depuis votre téléphone personnel ou professionnel, transférez le montant demandé vers le numéro (TMoney/Flooz) indiqué par l'artisan.
3. Cliquez ensuite sur **Argent envoyé**. Une modale de confirmation s'affichera pour sécuriser l'action.
4. Le solde de l'artisan sera mis à jour et la demande sera archivée comme "Complétée".
