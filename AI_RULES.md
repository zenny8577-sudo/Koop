# Koop Marketplace - AI Development Guidelines

## Tech Stack Overview

- **Core Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v3+ with custom configuration
- **State Management**: React Context API + useState/useReducer (No external state libs)
- **Routing**: React Router (Keep routes in App.tsx)
- **Component Library**: shadcn/ui + Radix UI primitives (Pre-installed)
- **Icons**: lucide-react (Pre-installed)
- **Form Handling**: React Hook Form (To be added when needed)
- **HTTP Client**: Axios (To be added for real API calls)
- **Authentication**: Supabase (To be added via integration)
- **Animation**: Native CSS transitions + Framer Motion (For complex animations)

## Library Usage Rules

### 1. Component Development
```markdown
- **Always** use shadcn/ui components as base
- **Never** edit shadcn/ui source files - extend via new components
- **Radix UI** for accessible primitives (Dropdowns, Dialogs)
- **Custom components** must be in `/src/components` with TypeScript
```

### 2. Styling Standards
```markdown
- **Tailwind CSS ONLY** - no CSS/SASS files
- **Responsive first** - mobile styles first, then responsive modifiers
- **Custom colors** from `constants.tsx` only
- **No inline styles** except for dynamic JS-based values
```

### 3. State Management
```markdown
- **Simple state**: `useState`/`useReducer`
- **Cross-component state**: Create contexts in `/contexts`
- **NO Redux/MobX** without explicit approval
```

### 4. Data Fetching
```markdown
- **Mock data**: Use `services/mockData.ts` during development
- **Real APIs**: 
  - Use Axios for HTTP requests
  - Services must be in `/services` with `.service.ts` suffix
  - Always handle errors with toast notifications
```

### 5. Forms
```markdown
- **React Hook Form** for complex forms
- **Zod** for validation (To be added when needed)
- **shadcn/ui** form components only
```

### 6. Routing
```markdown
- **Routes defined in App.tsx**
- **Pages** in `/src/pages` with proper lazy loading
- **No** dynamic route params without validation
```

### 7. Performance
```markdown
- **React.memo** for expensive components
- **useCallback/useMemo** for heavy computations
- **Code splitting** for routes via React.lazy
- **Bundle analysis** required before production
```

### 8. Testing
```markdown
- **Vitest** for unit tests
- **Testing Library** for component tests
- **Coverage**: 80%+ for core functionality
- **Tests live alongside** components in `__tests__` folders
```

### 9. Security
```markdown
- **Never** store secrets in client code
- **Sanitize** all user inputs
- **Content Security Policy** compliant components
- **XSS protection** for dynamic content
```

### 10. Error Handling
```markdown
- **Toast notifications** for user-facing errors
- **Sentry** integration for production (To be added)
- **Error boundaries** around route components
- **Never** show stack traces to users
```

## Prohibited Patterns
```markdown
❌ AnyState management outside React
❌ document.getElementById() direct manipulation
❌ External CSS frameworks (Bootstrap, Material UI)
❌ jQuery or legacy libraries
❌ Any database client on frontend
```

## Preferred Patterns
```markdown
✅ Atomic component structure
✅ Custom hooks for business logic
✅ TypeScript interfaces for all props
✅ Mobile-first responsive design
✅ Storybook-driven development (To be added)