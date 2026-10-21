---
name: "Form"
category: "molecules"
figma_id: "4161:8245"
last_updated: "2026-10-19"
---

# Form

## Overview
Period Tracker — extrait des écrans de référence. Contenu section/article avec titre hiérarchisé. Pas de rôle ARIA card. Graphiques : fournir description et alternative textuelle des données.

## Source Element Reference
- **Source Node ID:** `4161:8245`
- **Node Type:** `COMPONENT`
- **Source Node Name:** `Card/Information`
- **Figma Page:** `Exploration`
- **Canvas Path:** `Exploration [PAGE] > Period Tracker — Design System [FRAME] > 05 Cards & data [FRAME] > Galerie des cartes [FRAME] > Historique et information [FRAME] > Card/Information [COMPONENT]`
- **Origin Determination:** Élément source exact utilisé comme référentiel pour extraire les dimensions de référence, l'auto-layout, les espacements et les variables liées.



## Variants Specifications & Tokens
### Variant: Information
- **Figma Source Node:** `Card/Information` (ID: `4161:8245`)
- **Background Fill / Token:** var(--background-level-2) (`background-level-2`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato SemiBold 16px
- **Paddings (Top, Right, Bottom, Left):** 16px, 16px, 16px, 16px
- **Item Spacing (Gap):** 0px
- **Border Radius:** 20px
- **Dimensions:** 370px x 142px
- **Bound Design Tokens:**
  - `fills`: var(--background-level-2) (`background-level-2`)



### Variants Combination Matrix
| Variant Node | Properties Combination | Size | Paddings (T/R/B/L) | Border / Stroke | Fills / Tokens |
| --- | --- | --- | --- | --- | --- |
| `Card/Information` | - | 370x142px | 16/16/16/16px | - | var(--background-level-2) (`background-level-2`) |



## Reference Auto Layout & Dimensions
- **Layout Mode:** VERTICAL
- **Reference Paddings (Top, Right, Bottom, Left):** 16px, 16px, 16px, 16px
- **Item Spacing (Gap):** 0px
- **Border Radius:** 20px
- **Default Reference Dimensions:** 370px x 142px

## Design Tokens & Bound Variables
| Property Bound | Design Token / Variable Reference |
| --- | --- |
| `fills` | var(--background-level-2) (`background-level-2`) |


## Code Preview (React & CSS)
```tsx
// React Usage
import React from 'react';

<Form variant="information">
  Information Action
</Form>

/* CSS Specifications */
.form {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

/* Information Variant */
.form-information {
  background-color: var(--background-level-2);
  border: none;
  border-radius: 20px;
  padding: 16px  16px;
}
```

