# UI Specification & Philosophy

Deluge is not a standard web dashboard. It is an emergency operations interface. It must immediately communicate professionalism, reliability, speed, clarity, and intelligence without overwhelming the operator.

## Core Principles

### 1. Calm Under Chaos
Emergency situations are inherently stressful. The interface must actively reduce this stress.
- **No Clutter**: Remove any visual element that does not directly support decision-making.
- **No Unnecessary Information**: Avoid displaying raw data dumps. Synthesize data into actionable intelligence.
- **Dark Mode Default**: Reduces eye strain in dark EOC environments and increases contrast for critical alerts.

### 2. Progressive Disclosure
The operator should never feel overwhelmed.
- **Primary Layer**: Show only the most critical, high-level information by default (e.g., active flood zones, mission locations).
- **Secondary Layer**: Reveal details only when an element is selected or hovered (e.g., specific vehicle status, shelter capacity).
- **Tertiary Layer**: Deep dive analytics or historical data should require explicit navigation or panel expansion.

### 3. One Decision At A Time
Every screen or state must answer three questions instantly:
1. What is happening?
2. What requires attention?
3. What should I do next?

### 4. Every Pixel Has Purpose
Avoid "dashboard bloat."
- No decorative widgets.
- No meaningless charts or vanity metrics.
- Every UI element (button, map marker, alert) must have a functional reason to exist and support operational decision-making.

### 5. Human First
AI recommends; Humans decide.
- The system will automatically recalculate routes and suggest safe zones.
- The operator must always have the final say and the ability to override system suggestions.
- Do not automate critical dispatches without operator confirmation.

## Interface Aesthetic
The visual style is inspired by military command centers, air traffic control, and NASA Mission Control. It is **NOT** a standard crypto dashboard or simple admin panel.

- **High Contrast**: Ensure critical text is instantly readable against dark backgrounds.
- **Clean Lines**: Use subtle borders and structured grid layouts.
- **Data-Dense but Breathable**: Group related information logically with generous spacing between distinct operational blocks.
