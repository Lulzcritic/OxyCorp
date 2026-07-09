# Spécification de Game Design : Le Système d'Essaim "Balatro-Style" (Version Simplifiée)

Ce document définit la version simplifiée du système de préparation au combat de **Tarsis**. Pour éliminer toute complexité inutile (pas de puces logiques ou d'IDE de code), l'armée de drones elle-même constitue l'algorithme de synergie. 

Le positionnement et la quantité des drones dans les slots déterminent leurs statistiques finales pour la simulation de combat.

---

## 1. La Console Tactique (Les 5 Slots d'Essaim)

L'essaim du joueur est configuré sur une grille linéaire de 5 emplacements :

*   **5 Slots Actifs :** Évalués séquentiellement de gauche à droite.
*   **Empilement (Stacking) :** Chaque slot peut contenir **entre 1 et 10 drones du même type**.
*   **Taille maximale de l'essaim :** 50 drones au total.
*   **Pas de Puces (Jokers) séparées :** Les types de drones eux-mêmes possèdent des capacités passives qui agissent comme des multiplicateurs (Jokers) sur les autres slots.

```
  [ SLOT 1 ]         [ SLOT 2 ]         [ SLOT 3 ]         [ SLOT 4 ]         [ SLOT 5 ]
10x Gardiens        5x Porteurs        10x Kamikazes         Vide               Vide
(Donne +HP à →)    (Donne +Mult à →)  (Consomme +HP/+Mult)
```

---

## 2. Le Rôle Double des Drones (Unités & Synergies)

Chaque type de drone a deux facettes :
1.  **Statistiques Brutes (Jetons / Chips) :** Ses dégâts (ATK) et sa structure (HP) par unité.
2.  **Effet de Synergie (Joker) :** Une formule qui modifie les statistiques des slots adjacents ou de tout l'essaim selon la quantité de drones empilés dans son slot.

---

## 3. Catalogue des Drones (Unités / Jokers)

### 3.1. Drone Gardien (Le Tank)
*   **Statistiques de Base :** 10 ATK / 200 HP par drone.
*   **Effet de Synergie (Joker - Addition de PV) :** 
    *   *Propriété :* Ajoute **+15 Jetons HP** au slot situé immédiatement à sa droite pour chaque Gardien présent dans ce slot.
    *   *Exemple :* 10 Gardiens au Slot 1 ajoutent $+150$ HP de base à chaque unité du Slot 2.

### 3.2. Drone Porteur / Mère (Le Buffeur)
*   **Statistiques de Base :** 20 ATK / 150 HP par drone.
*   **Effet de Synergie (Joker - Addition de Mult) :**
    *   *Propriété :* Ajoute **+0.5 Mult ATK** au slot situé immédiatement à sa droite pour chaque Porteur présent dans ce slot.
    *   *Exemple :* 6 Porteurs au Slot 2 ajoutent $+3.0$ Mult ATK au Slot 3.

### 3.3. Drone Kamikaze (Le DPS Explosif)
*   **Statistiques de Base :** 80 ATK / 20 HP par drone.
*   **Effet de Synergie (Joker - Multiplicateur xMult) :**
    *   *Propriété :* S'il y a au moins 5 Kamikazes dans ce slot et que le slot immédiatement à sa gauche contient des drones Porteurs, gagne **x2.0 Mult ATK**.

### 3.4. Drone Brouilleur (Le Saboteur)
*   **Statistiques de Base :** 30 ATK / 80 HP par drone.
*   **Effet de Synergie (Joker - Vitesse et Esquive) :**
    *   *Propriété :* Multiplie la vitesse de déplacement des drones du slot situé immédiatement à sa droite par **x1.1** par Brouilleur présent dans son slot.

### 3.5. Drone Commando (Le Combattant Polyvalent)
*   **Statistiques de Base :** 50 ATK / 100 HP par drone.
*   **Effet de Synergie (Joker - Bonus Solo/Stack) :**
    *   *Propriété :* Si ce slot contient exactement 1 unique Drone Commando, ses statistiques individuelles sont multipliées par **x3.0 (ATK et HP)**.

---

## 4. Exemple de Résolution Mathématique

Prenons la configuration suivante :
*   **Slot 1 :** 10x Drones Gardiens (HP de base = 200, ATK = 10)
*   **Slot 2 :** 5x Drones Porteurs (HP de base = 150, ATK = 20)
*   **Slot 3 :** 8x Drones Kamikazes (HP de base = 20, ATK = 80)
*   **Slots 4 & 5 :** Vides.

### Résolution de gauche à droite :

1.  **Slot 1 (10x Gardiens) :**
    *   Pas de bonus appliqué à gauche.
    *   *Stats Finales :* 200 HP / 10 ATK par drone.
    *   *Effet appliqué sur le Slot 2 :* $+150$ HP de base par unité ($10 \text{ Gardiens} \times 15$).
2.  **Slot 2 (5x Porteurs) :**
    *   Reçoit le bonus du Slot 1 : HP de base passe de 150 à 300.
    *   *Stats Finales :* 300 HP / 20 ATK par drone.
    *   *Effet appliqué sur le Slot 3 :* $+2.5$ Mult ATK par unité ($5 \text{ Porteurs} \times 0.5$).
3.  **Slot 3 (8x Kamikazes) :**
    *   Reçoit le bonus du Slot 2 : +2.5 Mult ATK.
    *   Valide sa condition passive (8 unités, placé à droite de Porteurs) : $\times 2.0$ Mult ATK global.
    *   *Calcul ATK Final :* $\text{ATK Base } (80) \times (1 + \text{Bonus Mult } (2.5)) \times \text{xMult } (2) = 80 \times 3.5 \times 2 = 560\text{ ATK par drone !}$
    *   *Stats Finales :* 20 HP / 560 ATK par drone.

---

## 5. Avantages de cette Simplification

*   **Zéro Complexité Cognitive :** Le joueur manipule un seul concept physique (les drones de son inventaire). Choisir ses unités équivaut à programmer ses bonus.
*   **UI Épurée :** La War Room affiche simplement 5 casiers circulaires dans lesquels le joueur fait glisser des piles de cartes de drones.
*   **Économie Directe :** Pas besoin de concevoir un système de craft et d'inventaire pour des puces électroniques indépendantes. La classe *Tharsis* fabrique les drones et la classe *Cogitator* extrait les ressources nécessaires.
