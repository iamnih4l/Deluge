# Deluge Frontend Documentation

Welcome to the frontend documentation for **Deluge**, a real-time flood emergency decision-support platform.

This directory contains the specifications, architecture decisions, and design guidelines for building the frontend of Deluge. The UI is designed to be a premium, high-performance mission control application used by emergency operators during critical scenarios.

## Table of Contents

### Design & UI
- [UI Specification](ui-specification.md) - Core philosophy (Calm Under Chaos, Progressive Disclosure).
- [Design System](design-system.md) - Colors, typography, spacing, and foundational styles.
- [Component Library](component-library.md) - Reusable, purpose-built UI components.
- [Interaction Guidelines](interaction-guidelines.md) - Map interaction, hover states, selection feedback.
- [Animation Guidelines](animation-guidelines.md) - Meaningful motion principles and transitions.

### Architecture & Engineering
- [Frontend Architecture](frontend-architecture.md) - Core technology choices, patterns, and structure.
- [Folder Structure](folder-structure.md) - Deep dive into the `src/` layout.
- [State Management](state-management.md) - Client (Zustand) and Server (TanStack Query) state strategies.
- [Map Rendering](map-rendering.md) - MapLibre GL integration and vector layers.
- [3D Rendering](3d-rendering.md) - Three.js / React Three Fiber setup for the Digital Twin simulation.

### Best Practices
- [Responsive Design](responsive-design.md) - Desktop-first approach and breakpoints.
- [Accessibility (A11y)](accessibility.md) - Keyboard navigation, contrast, and ARIA.
- [Performance](performance.md) - 60 FPS rendering, memoization, lazy loading.
- [Development Guidelines](development-guidelines.md) - Git flows, linting, formatting, and PRs.
