---
name: "Badge"
category: "atoms"
figma_id: "4230:12192"
last_updated: "2026-10-19"
---

# Badge

## Overview
Small status or count indicator attached to an element.

## Source Element Reference
- **Source Node ID:** `4230:12192`
- **Node Type:** `COMPONENT`
- **Source Node Name:** `Badge`
- **Figma Page:** `Intégration`
- **Canvas Path:** `Intégration [PAGE] > Design System [FRAME] > Badge [COMPONENT]`
- **Origin Determination:** Élément source exact utilisé comme référentiel pour extraire les dimensions de référence, l'auto-layout, les espacements et les variables liées.



## Variants Specifications & Tokens
### Variant: Badge
- **Figma Source Node:** `Badge` (ID: `4230:12192`)
- **Background Fill / Token:** var(--accent) (`Accent`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato Bold 16px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-xs) (4px), var(--spacing-sm) (8px), var(--spacing-xs) (4px), var(--spacing-sm) (8px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** 8px
- **Dimensions:** 107px x 30px
- **Bound Design Tokens:**
  - `itemSpacing`: var(--spacing-sm) (`spacing/sm`)
  - `paddingLeft`: var(--spacing-sm) (`spacing/sm`)
  - `paddingTop`: var(--spacing-xs) (`spacing/xs`)
  - `paddingRight`: var(--spacing-sm) (`spacing/sm`)
  - `paddingBottom`: var(--spacing-xs) (`spacing/xs`)
  - `topLeftRadius`: var(--spacing-sm) (`spacing/sm`)
  - `topRightRadius`: var(--spacing-sm) (`spacing/sm`)
  - `bottomLeftRadius`: var(--spacing-sm) (`spacing/sm`)
  - `bottomRightRadius`: var(--spacing-sm) (`spacing/sm`)
  - `fills`: var(--accent) (`Accent`)


### Variant: Follicular
- **Figma Source Node:** `Badge/Phase/Follicular` (ID: `4161:8239`)
- **Background Fill / Token:** _Transparent / None_
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato SemiBold 14px
- **Paddings (Top, Right, Bottom, Left):** 0px, 0px, 0px, 0px
- **Item Spacing (Gap):** 4px
- **Border Radius:** -
- **Dimensions:** 167px x 18px


### Variant: Ovulation
- **Figma Source Node:** `Badge/Phase/Ovulation` (ID: `4161:8240`)
- **Background Fill / Token:** _Transparent / None_
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato SemiBold 14px
- **Paddings (Top, Right, Bottom, Left):** 0px, 0px, 0px, 0px
- **Item Spacing (Gap):** 4px
- **Border Radius:** -
- **Dimensions:** 226px x 18px


### Variant: Luteal
- **Figma Source Node:** `Badge/Phase/Luteal` (ID: `4161:8241`)
- **Background Fill / Token:** _Transparent / None_
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato SemiBold 14px
- **Paddings (Top, Right, Bottom, Left):** 0px, 0px, 0px, 0px
- **Item Spacing (Gap):** 4px
- **Border Radius:** -
- **Dimensions:** 225px x 18px


### Variant: Period
- **Figma Source Node:** `Badge/Phase/Period` (ID: `4161:8242`)
- **Background Fill / Token:** _Transparent / None_
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato SemiBold 14px
- **Paddings (Top, Right, Bottom, Left):** 0px, 0px, 0px, 0px
- **Item Spacing (Gap):** 4px
- **Border Radius:** -
- **Dimensions:** 258px x 18px



### Variants Combination Matrix
| Variant Node | Properties Combination | Size | Paddings (T/R/B/L) | Border / Stroke | Fills / Tokens |
| --- | --- | --- | --- | --- | --- |
| `Badge` | - | 107x30px | 4/8/4/8px | - | var(--accent) (`Accent`) |
| `Badge/Phase/Follicular` | - | 167x18px | 0/0/0/0px | - | - |
| `Badge/Phase/Ovulation` | - | 226x18px | 0/0/0/0px | - | - |
| `Badge/Phase/Luteal` | - | 225x18px | 0/0/0/0px | - | - |
| `Badge/Phase/Period` | - | 258x18px | 0/0/0/0px | - | - |



## Reference Auto Layout & Dimensions
- **Layout Mode:** HORIZONTAL
- **Reference Paddings (Top, Right, Bottom, Left):** var(--spacing-xs) (4px), var(--spacing-sm) (8px), var(--spacing-xs) (4px), var(--spacing-sm) (8px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** 8px
- **Default Reference Dimensions:** 107px x 30px

## Design Tokens & Bound Variables
| Property Bound | Design Token / Variable Reference |
| --- | --- |
| `itemSpacing` | var(--spacing-sm) (`spacing/sm`) |
| `paddingLeft` | var(--spacing-sm) (`spacing/sm`) |
| `paddingTop` | var(--spacing-xs) (`spacing/xs`) |
| `paddingRight` | var(--spacing-sm) (`spacing/sm`) |
| `paddingBottom` | var(--spacing-xs) (`spacing/xs`) |
| `topLeftRadius` | var(--spacing-sm) (`spacing/sm`) |
| `topRightRadius` | var(--spacing-sm) (`spacing/sm`) |
| `bottomLeftRadius` | var(--spacing-sm) (`spacing/sm`) |
| `bottomRightRadius` | var(--spacing-sm) (`spacing/sm`) |
| `fills` | var(--accent) (`Accent`) |


## Code Preview (React & CSS)
```tsx
// React Usage
import React from 'react';

<Badge variant="badge">
  Badge Action
</Badge>

<Badge variant="follicular">
  Follicular Action
</Badge>

<Badge variant="ovulation">
  Ovulation Action
</Badge>

<Badge variant="luteal">
  Luteal Action
</Badge>

<Badge variant="period">
  Period Action
</Badge>

/* CSS Specifications */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

/* Badge Variant */
.badge-badge {
  background-color: var(--accent);
  border: none;
  border-radius: 8px;
  padding: var(--spacing-xs) (4px)  var(--spacing-sm) (8px);
}

/* Follicular Variant */
.badge-follicular {
  background-color: transparent;
  border: none;
  border-radius: 0px;
  padding: 0px  0px;
}

/* Ovulation Variant */
.badge-ovulation {
  background-color: transparent;
  border: none;
  border-radius: 0px;
  padding: 0px  0px;
}

/* Luteal Variant */
.badge-luteal {
  background-color: transparent;
  border: none;
  border-radius: 0px;
  padding: 0px  0px;
}

/* Period Variant */
.badge-period {
  background-color: transparent;
  border: none;
  border-radius: 0px;
  padding: 0px  0px;
}
```

