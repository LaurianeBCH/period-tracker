---
name: "Tabs"
category: "molecules"
figma_id: "4230:12220"
last_updated: "2026-10-19"
---

# Tabs

## Overview
Layered content navigation switching views within the same context.

## Source Element Reference
- **Source Node ID:** `4230:12220`
- **Node Type:** `COMPONENT`
- **Source Node Name:** `tab-bar`
- **Figma Page:** `Intégration`
- **Canvas Path:** `Intégration [PAGE] > Design System [FRAME] > tab-bar [COMPONENT]`
- **Origin Determination:** Élément source exact utilisé comme référentiel pour extraire les dimensions de référence, l'auto-layout, les espacements et les variables liées.



## Variants Specifications & Tokens
### Variant: tab-bar
- **Figma Source Node:** `tab-bar` (ID: `4230:12220`)
- **Background Fill / Token:** var(--background-level-1) (`background-level-1`)
- **Border / Stroke:** _None_
- **Text / Typography Style:** var(--text-dark-primary) (`text-dark-primary`) • Lato Bold 14px
- **Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** -
- **Dimensions:** 499px x 85px
- **Bound Design Tokens:**
  - `itemSpacing`: var(--spacing-sm) (`spacing/sm`)
  - `paddingLeft`: var(--spacing-lg) (`spacing/lg`)
  - `paddingTop`: var(--spacing-lg) (`spacing/lg`)
  - `paddingRight`: var(--spacing-lg) (`spacing/lg`)
  - `paddingBottom`: var(--spacing-lg) (`spacing/lg`)
  - `fills`: var(--background-level-1) (`background-level-1`)



### Variants Combination Matrix
| Variant Node | Properties Combination | Size | Paddings (T/R/B/L) | Border / Stroke | Fills / Tokens |
| --- | --- | --- | --- | --- | --- |
| `tab-bar` | - | 499x85px | 16/16/16/16px | - | var(--background-level-1) (`background-level-1`) |



## Reference Auto Layout & Dimensions
- **Layout Mode:** HORIZONTAL
- **Reference Paddings (Top, Right, Bottom, Left):** var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px), var(--spacing-lg) (16px)
- **Item Spacing (Gap):** var(--spacing-sm) (8px)
- **Border Radius:** 0px
- **Default Reference Dimensions:** 499px x 85px

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

<Tabs variant="tab-bar">
  tab-bar Action
</Tabs>

/* CSS Specifications */
.tabs {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

/* tab-bar Variant */
.tabs-tab-bar {
  background-color: var(--background-level-1);
  border: none;
  border-radius: 0px;
  padding: var(--spacing-lg) (16px)  var(--spacing-lg) (16px);
}
```

