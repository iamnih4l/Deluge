# Accessibility (A11y) Guidelines

An emergency response platform must be usable by all operators, including those with situational or permanent disabilities.

## 1. Keyboard Navigation

Operators in high-stress environments often rely on keyboard shortcuts rather than a mouse.
- **Tab Navigation**: Every interactive element (button, link, input) must be reachable via the `Tab` key in a logical order (left-to-right, top-to-bottom).
- **Focus States**: Ensure a highly visible focus indicator (e.g., a solid cyan ring). Do not rely solely on default browser outlines, which can disappear against dark backgrounds.
- **Command Palette**: Implement a `Cmd+K` / `Ctrl+K` command palette to allow rapid keyboard-based search and execution of commands.

## 2. High Contrast Readability

Deluge uses a dark mode interface.
- Ensure text meets **WCAG AA** contrast ratios (4.5:1 for normal text, 3:1 for large text) against the `Dark Graphite` background.
- Avoid low-contrast grays on black. If information is important enough to show, it must be legible.

## 3. Screen Reader Support (ARIA)

- Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<button>`) instead of generic `<div>` elements with click handlers.
- Use `aria-live="polite"` or `aria-live="assertive"` for critical alert banners so that screen readers announce them immediately when they appear.
- Use `aria-label` for icon-only buttons (e.g., the simulation play button).

## 4. Color as Information

Never use color alone to convey meaning.
- *Bad*: Showing a red dot to indicate a flooded road.
- *Good*: Showing a red dot **and** a warning icon, or a red dot with text stating "Flooded".
- Approximately 8% of men have color vision deficiency (CVD). Ensure that critical distinctions (e.g., Safe vs. At Risk) use varying shapes or patterns in addition to color.
