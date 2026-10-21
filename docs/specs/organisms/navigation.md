---
name: "Navigation"
category: "organisms"
figma_id: "4230:12205"
last_updated: "2026-10-19"
---

# Navigation

## Overview
Primary top-level application header navigation.

## Source Element Reference
- **Source Node ID:** `4230:12205`
- **Node Type:** `COMPONENT`
- **Source Node Name:** `nav-header`
- **Figma Page:** `Intégration`
- **Canvas Path:** `Intégration [PAGE] > Design System [FRAME] > nav-header [COMPONENT]`
- **Origin Determination:** Élément source exact utilisé comme référentiel pour extraire les dimensions de référence, l'auto-layout, les espacements et les variables liées.



## Variants Specifications & Tokens
### Variant: nav-header
- **Figma Source Node:** `nav-header` (ID: `4230:12205`)
- **Background Fill / Token:** var(--background-level-1) (`background-level-1`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato Bold 22px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** -
- **Dimensions:** 499px x 58px
- **Bound Design Tokens:**
  - `itemSpacing`: var(--spacing-sm) (`spacing/sm`)
  - `paddingLeft`: var(--spacing-lg) (`spacing/lg`)
  - `paddingTop`: var(--spacing-lg) (`spacing/lg`)
  - `paddingRight`: var(--spacing-lg) (`spacing/lg`)
  - `paddingBottom`: var(--spacing-lg) (`spacing/lg`)
  - `fills`: var(--background-level-1) (`background-level-1`)


### Variant: CalendarActive
- **Figma Source Node:** `Navigation/Bottom/CalendarActive` (ID: `4161:8227`)
- **Background Fill / Token:** var(--background-level-1) (`background-level-1`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato Bold 14px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** 8px
- **Border Radius:** -
- **Dimensions:** 402px x 85px
- **Bound Design Tokens:**
  - `paddingLeft`: var(--spacing-lg) (`spacing/lg`)
  - `paddingTop`: var(--spacing-lg) (`spacing/lg`)
  - `paddingRight`: var(--spacing-lg) (`spacing/lg`)
  - `paddingBottom`: var(--spacing-lg) (`spacing/lg`)
  - `fills`: var(--background-level-1) (`background-level-1`)


### Variant: RecommendationsActive
- **Figma Source Node:** `Navigation/Bottom/RecommendationsActive` (ID: `4161:8228`)
- **Background Fill / Token:** var(--background-level-1) (`background-level-1`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-secondary) (`text-dark-secondary`) • Lato Bold 14px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** 8px
- **Border Radius:** -
- **Dimensions:** 402px x 85px
- **Bound Design Tokens:**
  - `paddingLeft`: var(--spacing-lg) (`spacing/lg`)
  - `paddingTop`: var(--spacing-lg) (`spacing/lg`)
  - `paddingRight`: var(--spacing-lg) (`spacing/lg`)
  - `paddingBottom`: var(--spacing-lg) (`spacing/lg`)
  - `fills`: var(--background-level-1) (`background-level-1`)


### Variant: CycleActive
- **Figma Source Node:** `Navigation/Bottom/CycleActive` (ID: `4161:8229`)
- **Background Fill / Token:** var(--background-level-1) (`background-level-1`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-secondary) (`text-dark-secondary`) • Lato Bold 14px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** 8px
- **Border Radius:** -
- **Dimensions:** 402px x 85px
- **Bound Design Tokens:**
  - `paddingLeft`: var(--spacing-lg) (`spacing/lg`)
  - `paddingTop`: var(--spacing-lg) (`spacing/lg`)
  - `paddingRight`: var(--spacing-lg) (`spacing/lg`)
  - `paddingBottom`: var(--spacing-lg) (`spacing/lg`)
  - `fills`: var(--background-level-1) (`background-level-1`)



### Variants Combination Matrix
| Variant Node | Properties Combination | Size | Paddings (T/R/B/L) | Border / Stroke | Fills / Tokens |
| --- | --- | --- | --- | --- | --- |
| `nav-header` | - | 499x58px | 16/16/16/16px | - | var(--background-level-1) (`background-level-1`) |
| `Navigation/Bottom/CalendarActive` | - | 402x85px | 16/16/16/16px | - | var(--background-level-1) (`background-level-1`) |
| `Navigation/Bottom/RecommendationsActive` | - | 402x85px | 16/16/16/16px | - | var(--background-level-1) (`background-level-1`) |
| `Navigation/Bottom/CycleActive` | - | 402x85px | 16/16/16/16px | - | var(--background-level-1) (`background-level-1`) |



## Reference Auto Layout & Dimensions
- **Layout Mode:** HORIZONTAL
- **Reference Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** 0px
- **Default Reference Dimensions:** 499px x 58px

## Design Tokens & Bound Variables
| Property Bound | Design Token / Variable Reference |
| --- | --- |
| `itemSpacing` | var(--spacing-sm) (`spacing/sm`) |
| `paddingLeft` | var(--spacing-lg) (`spacing/lg`) |
| `paddingTop` | var(--spacing-lg) (`spacing/lg`) |
| `paddingRight` | var(--spacing-lg) (`spacing/lg`) |
| `paddingBottom` | var(--spacing-lg) (`spacing/lg`) |
| `fills` | var(--background-level-1) (`background-level-1`) |


## Code Preview (React & CSS)
```tsx
// React Usage
import React from 'react';

<Navigation variant="nav-header">
  nav-header Action
</Navigation>

<Navigation variant="calendaractive">
  CalendarActive Action
</Navigation>

<Navigation variant="recommendationsactive">
  RecommendationsActive Action
</Navigation>

<Navigation variant="cycleactive">
  CycleActive Action
</Navigation>

/* CSS Specifications */
.navigation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

/* nav-header Variant */
.navigation-nav-header {
  background-color: var(--background-level-1);
  border: none;
  border-radius: 0px;
  padding: var(--spacing-lg) (16px)  var(--spacing-lg) (16px);
}

/* CalendarActive Variant */
.navigation-calendaractive {
  background-color: var(--background-level-1);
  border: none;
  border-radius: 0px;
  padding: var(--spacing-lg) (16px)  var(--spacing-lg) (16px);
}

/* RecommendationsActive Variant */
.navigation-recommendationsactive {
  background-color: var(--background-level-1);
  border: none;
  border-radius: 0px;
  padding: var(--spacing-lg) (16px)  var(--spacing-lg) (16px);
}

/* CycleActive Variant */
.navigation-cycleactive {
  background-color: var(--background-level-1);
  border: none;
  border-radius: 0px;
  padding: var(--spacing-lg) (16px)  var(--spacing-lg) (16px);
}
```

