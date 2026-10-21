---
name: "Color Tokens (Multi-Mode)"
category: "tokens"
figma_id: "VariableID:4002:5484"
last_updated: "2026-10-19"
---

# Color Tokens (Multi-Mode)

## Overview
Color tokens across all defined theme modes (e.g. Light, Dark, High Contrast, Brand palettes). Resolves aliases and direct values per mode.

## Multi-Mode Color Matrix
| Token Name | Collection | Phase 1 | Phase 2 | Phase 3 | Phase4 | Neutre | Description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `text-dark-primary` | Color | `#002E2C` | `#583500` | `#081F45` | `#321310` | `#000000` | - |
| `background-level-3` | Color | `#4BBCA4` | `#E09E51` | `#477BB3` | `#CB6C62` | `#E1DBD5` | - |
| `text-light` | Color | `#D2FCCF` | `#F7EFB6` | `#DAEDF2` | `#F8DBCC` | `#A2A2A2` | - |
| `background-level-1` | Color | `#D2FCCF` | `#F7EFB6` | `#DAEDF2` | `#F8DBCC` | `#FCF9F7` | - |
| `border` | Color | `#5EC3A3` | `#E9C672` | `#74B6E8` | `#EE928A` | `#5B6068` | - |
| `background-level-2` | Color | `#9CE2C0` | `#F0E486` | `#C0E0F2` | `#EEB8B0` | `#F7F0EA` | - |
| `text-white` | Color | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | - |
| `text-dark-secondary` | Color | `#137051` | `#85550C` | `#1B417F` | `#6A342F` | `#555555` | - |
| `Accent` | Color | `#FBFF24` | `#6D9CEC` | `#F7A4CB` | `#A7FEB0` | `#74F6FF` | - |
| `Accent Alpha` | Color | `#FBFF2400` | `#324DFF00` | `#F7A4CB00` | `#A7FEB000` | `#74F6FF00` | - |


## Theme Mode CSS Implementations
/* Collection: Color - Mode: Phase 1 */
:root, [data-theme="phase 1"] {
  --text-dark-primary: #002E2C;
  --background-level-3: #4BBCA4;
  --text-light: #D2FCCF;
  --background-level-1: #D2FCCF;
  --border: #5EC3A3;
  --background-level-2: #9CE2C0;
  --text-white: #FFFFFF;
  --text-dark-secondary: #137051;
  --accent: #FBFF24;
  --accent-alpha: #FBFF2400;
}

/* Collection: Color - Mode: Phase 2 */
:root, [data-theme="phase 2"] {
  --text-dark-primary: #583500;
  --background-level-3: #E09E51;
  --text-light: #F7EFB6;
  --background-level-1: #F7EFB6;
  --border: #E9C672;
  --background-level-2: #F0E486;
  --text-white: #FFFFFF;
  --text-dark-secondary: #85550C;
  --accent: #6D9CEC;
  --accent-alpha: #324DFF00;
}

/* Collection: Color - Mode: Phase 3 */
:root, [data-theme="phase 3"] {
  --text-dark-primary: #081F45;
  --background-level-3: #477BB3;
  --text-light: #DAEDF2;
  --background-level-1: #DAEDF2;
  --border: #74B6E8;
  --background-level-2: #C0E0F2;
  --text-white: #FFFFFF;
  --text-dark-secondary: #1B417F;
  --accent: #F7A4CB;
  --accent-alpha: #F7A4CB00;
}

/* Collection: Color - Mode: Phase4 */
:root, [data-theme="phase4"] {
  --text-dark-primary: #321310;
  --background-level-3: #CB6C62;
  --text-light: #F8DBCC;
  --background-level-1: #F8DBCC;
  --border: #EE928A;
  --background-level-2: #EEB8B0;
  --text-white: #FFFFFF;
  --text-dark-secondary: #6A342F;
  --accent: #A7FEB0;
  --accent-alpha: #A7FEB000;
}

/* Collection: Color - Mode: Neutre */
:root, [data-theme="neutre"] {
  --text-dark-primary: #000000;
  --background-level-3: #E1DBD5;
  --text-light: #A2A2A2;
  --background-level-1: #FCF9F7;
  --border: #5B6068;
  --background-level-2: #F7F0EA;
  --text-white: #FFFFFF;
  --text-dark-secondary: #555555;
  --accent: #74F6FF;
  --accent-alpha: #74F6FF00;
}
