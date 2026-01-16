# WP Dev Toolkit - Frontend Scope

This directory contains the React/TypeScript frontend architecture including components, stores, and type definitions.

## Directory Structure

```
src/
├── components/          # React components
├── stores/             # WordPress data stores (WC Affiliate patterns)
├── types/              # TypeScript type definitions
└── styles/             # CSS/SCSS files
```

## Stores Architecture (WC Affiliate Patterns)

The frontend uses WordPress data stores following WooCommerce Affiliate conventions for state management.

### Store Structure

Each store follows the WC Affiliate pattern with these files:

```
src/stores/{store-name}/
├── constants.ts    # Action types and store name
├── actions.ts      # Action creators with API calls
├── reducer.ts      # State reducer (default export)
├── selectors.ts    # State selectors (default export)
├── resolvers.ts    # Data resolvers (default export)
└── index.ts        # Store registration and exports
```

### Available Stores

#### Settings Store (`src/stores/settings/`)

- Plugin configuration management
- Tool enable/disable settings
- Configuration persistence

#### Error Log Store (`src/stores/error-log/`)

- Error log entries management
- Filtering and clearing logs
- Log settings management

#### Query Monitor Store (`src/stores/query-monitor/`)

- Database query tracking and analysis
- Slow query identification
- Query performance metrics

#### Hook Inspector Store (`src/stores/hook-inspector/`)

- WordPress hook monitoring
- Hook execution analysis
- Filter and action inspection

#### System Info Store (`src/stores/system-info/`)

- WordPress/PHP system information
- Server diagnostics
- Environment details

#### Terminal Store (`src/stores/terminal/`)

- Command-line interface functionality
- Command execution and history
- Terminal output management

#### Dev Mode Store (`src/stores/dev-mode/`)

- Development mode toggling
- Debug settings management
- Development tools control

## WC Affiliate Store Patterns

### Actions Pattern

```typescript
const actions = {
  setIsResolving(key: string, isResolving: boolean): Action {
    return { type: SET_LOADING, key, isResolving };
  },

  fetchData() {
    return async ({ dispatch }) => {
      dispatch(actions.setIsResolving('fetch', true));
      try {
        const data = await apiFetch({ path: '/endpoint' });
        dispatch(actions.setData(data));
      } catch (error) {
        dispatch(actions.setError('fetch', error.message));
      } finally {
        dispatch(actions.setIsResolving('fetch', false));
      }
    };
  },
};
```

### Reducer Pattern

```typescript
const initialState = {
  data: [],
  isResolving: {},
  errors: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isResolving: {
          ...state.isResolving,
          [action.key]: action.isResolving,
        },
      };
    // ... other cases
  }
};
```

### Selectors Pattern

```typescript
export default {
  getData(state) {
    if (!state) return [];
    return state.data || [];
  },

  isResolving(state, key) {
    if (!state) return false;
    return (state.isResolving || {})[key] || false;
  },

  getError(state, key) {
    if (!state) return null;
    return (state.errors || {})[key] || null;
  },
};
```

## Components Architecture

### Component Organization

- Functional components with TypeScript
- React.FC pattern with proper prop interfaces
- WordPress component library integration
- Custom hooks for store interactions

### Key Components

- **App.tsx**: Main application router and layout
- **Dashboard.tsx**: Main dashboard interface
- **Settings.tsx**: Plugin configuration interface
- Tool-specific components for each feature

## Type Definitions

### Store Types (`src/types/store.ts`)

- Action type definitions
- Store state interfaces
- API response types
- Component prop interfaces

## Styling

### Tailwind CSS v4

- Custom prefix: `wdt` (WordPress compatibility)
- CSS-first configuration with `@theme`
- Component-based styling approach
- WordPress admin integration

## Build System

### @wordpress/scripts

- TypeScript compilation
- ESLint integration
- Production asset optimization
- WordPress script enqueuing

## Development Workflow

### Adding New Stores

1. Create store directory in `src/stores/{store-name}/`
2. Implement WC Affiliate pattern files
3. Register store in `src/stores/index.ts`
4. Add TypeScript types in `src/types/store.ts`

### Adding Components

1. Create component in `src/components/`
2. Define TypeScript interfaces
3. Connect to relevant stores
4. Add routing in `src/App.tsx`

## Dependencies

- **@wordpress/data**: WordPress data stores
- **@wordpress/api-fetch**: API communication
- **@wordpress/components**: UI components
- **React/TypeScript**: Frontend framework
- **Tailwind CSS**: Styling framework
