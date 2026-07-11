# Development Guidelines

This document outlines the workflow and standards for developing the Deluge frontend.

## Version Control Workflow

1. **Branch Naming**:
   - `feature/feature-name` (e.g., `feature/mission-panel`)
   - `fix/bug-description` (e.g., `fix/map-memory-leak`)
   - `chore/update-dependencies`
2. **Commit Messages**: Follow Conventional Commits.
   - `feat: add flood simulation controls`
   - `fix: resolve crash on null vehicle data`
   - `style: update button hover states`

## Code Standards

- **TypeScript**: Strict mode is enabled. Use interfaces or types for all props and state. Avoid `any` at all costs.
- **Linting & Formatting**: The project uses ESLint and Prettier. Run `npm run lint` before committing.
- **Component Structure**:
  - Keep components small and focused on a single responsibility.
  - Extract complex logic into custom hooks.
  - Order imports: Third-party libraries, absolute paths (e.g., `@/components/`), relative paths (e.g., `./styles.css`).

## Testing Strategy

- **Unit Tests**: Use Jest/Vitest for pure functions (e.g., data formatters, color calculators).
- **Component Tests**: Use React Testing Library to verify component interactions and rendering (e.g., clicking the "Play" button triggers the correct Zustand action).
- **No E2E for UI details**: Avoid brittle End-to-End tests that fail if a padding value changes. Focus E2E tests on core user flows (e.g., "Can an operator assign a unit to a mission?").

## Review Process

Pull Requests must require at least one approval. Reviewers should check for:
- Adherence to the **UI Specification** (Is it too cluttered?).
- Performance implications (Will this cause unnecessary re-renders?).
- Accessibility (Are there `aria-labels` and focus states?).
