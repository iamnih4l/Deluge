# Design System

The Deluge design system establishes the foundational visual language for the application. It ensures consistency, readability, and a premium "mission control" aesthetic.

## Colors

The color palette uses curated, harmonious colors optimized for a dark mode interface. Avoid generic, highly saturated colors (like pure `#FF0000`).

| Category | Role | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | Deep Slate | `#0F1115` | Main application background. |
| **Panels** | Dark Graphite | `#1A1D24` | Sidebar, panels, cards. |
| **Border** | Slate Gray | `#2C313C` | Subtle dividers and panel borders. |
| **Primary** | Tactical Blue | `#3B82F6` | Primary actions, active states, active missions. |
| **Critical** | Alert Red | `#EF4444` | High-risk flood zones, critical failures, blocked routes. |
| **Warning** | Amber | `#F59E0B` | At-risk zones, delayed missions, warnings. |
| **Safe** | Secure Green | `#10B981` | Safe shelters, completed missions, clear routes. |
| **Information** | Cyan | `#06B6D4` | System notifications, AI recommendations, digital twin highlights. |

## Typography

The primary font for Deluge is **Inter**. It is highly readable at small sizes and provides a technical, precise appearance.

- **Font Family**: `Inter, sans-serif`
- **Weights**:
  - `400` (Regular) - Body text, secondary information.
  - `500` (Medium) - Buttons, labels, table headers.
  - `600` (SemiBold) - Section headings, critical data points.

### Sizing Scale
- `xs` (0.75rem / 12px) - Status badges, timestamps.
- `sm` (0.875rem / 14px) - Secondary text, tooltips.
- `base` (1rem / 16px) - Standard body text.
- `lg` (1.125rem / 18px) - Panel titles.
- `xl` (1.25rem / 20px) - Primary section headers.
- `2xl` (1.5rem / 24px) - Large data points, clock.

*Rule: Avoid tiny fonts. Legibility is paramount in an emergency context.*

## Spacing & Layout

The system uses an 8px baseline grid to ensure a structured, predictable layout.

- `1` (4px) - Micro spacing (e.g., between icon and text).
- `2` (8px) - Component internal padding.
- `4` (16px) - Standard padding for panels and cards.
- `6` (24px) - Generous spacing between distinct sections.
- `8` (32px) - Major layout divisions.

## Elevations & Shadows

Instead of heavy drop shadows, use subtle borders and depth fog for 3D elements. For floating 2D UI elements (like dropdowns or floating toolbars):

- **Panel Base**: Solid Dark Graphite (`#1A1D24`), 1px Slate Gray (`#2C313C`) border.
- **Floating Overlay**: Dark Graphite with a slight transparency (`rgba(26, 29, 36, 0.9)`), background blur (glassmorphism), and a soft, dark shadow (`0 10px 25px rgba(0,0,0,0.5)`).

## Corner Radius (Border Radius)

Keep corners slightly rounded but professional. Too rounded looks playful; too sharp looks harsh.
- **Standard**: `6px` (Buttons, small inputs).
- **Panels**: `12px` (Cards, sidebars, floating windows).
