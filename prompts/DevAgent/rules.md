# File Organization Rules

This document defines the exact file organization patterns and directory structure rules for the application. These rules ensure consistent code organization and can be used by AI systems to reconstruct or maintain the project structure.

## Project Overview
- **Type**: React TypeScript application for Domo platform
- **Architecture**: Component-based with Redux state management
- **Styling**: SCSS modules with shared styles
- **Testing**: Jest + React Testing Library + Storybook

## Root Directory Structure

```
application-name/
├── build/                    # Production build output (auto-generated)
├── docs/                     # Project documentation
├── memory-bank/             # AI memory bank for project context
├── node_modules/            # Dependencies (auto-generated)
├── public/                   # Static assets served directly
├── scripts/                 # Build and utility scripts
├── src/                     # Source code (main development)
├── package.json               # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── sonar-project.properties # SonarQube configuration
└── yarn.lock               # Dependency lock file
```

## Source Code Organization (`src/`)

### 1. Components Directory (`src/components/`)

**Rule**: Each component must be in its own directory with the following structure:

```
src/components/[component-name]/
├── index.tsx              # Main component implementation
├── index.module.scss      # Component-specific styles
├── index.spec.tsx         # Unit tests
├── index.stories.tsx      # Storybook stories
└── README.md              # Optional: Component documentation
```

**Component Naming Convention**:
- Directory names: `kebab-case` (e.g., `date-range`, `report-wrapper`)
- Component names: `PascalCase` (e.g., `DateRange`, `ReportWrapper`)
- File names: `index.tsx` for main component, `index.module.scss` for styles

**Required Files**:
- `index.tsx`: Main component with TypeScript interfaces
- `index.module.scss`: Component-specific SCSS modules
- `index.spec.tsx`: Jest unit tests
- `index.stories.tsx`: Storybook stories

**Example Component Structure**:
```
src/components/calendar/
├── index.tsx              # Calendar component with CalendarProps interface
├── index.module.scss      # Calendar-specific styles
├── index.spec.tsx         # Calendar unit tests
└── index.stories.tsx      # Calendar Storybook stories
```

### 2. Containers Directory (`src/containers/`)

**Rule**: Containers are page-level components that connect to Redux state and contain business logic.

```
src/containers/[container-name]/
├── index.tsx              # Container component
└── index.module.scss      # Container-specific styles
```

**Container Naming**: Use descriptive names like `home`, `library`, `report`, `error`, `loading`, `setup`

### 3. Services Directory (`src/services/`)

**Rule**: Services are organized by domain with subdirectories and index exports.

```
src/services/
├── [service-name]/         # Service subdirectory
│   ├── index.ts           # Service implementation
│   └── [related-files].ts # Additional service files
├── index.ts               # Main services export
└── [standalone-services].ts # Simple services without subdirectories
```

**Service Examples**:
- `AppDB/` - Database-related services
- `codeEngine/` - SQL generation services
- `datasets.ts` - Dataset utilities
- `global.ts` - Global service functions

### 4. Interfaces Directory (`src/interfaces/`)

**Rule**: TypeScript interfaces are organized by domain with index exports.

```
src/interfaces/
├── [domain].ts            # Domain-specific interfaces
└── index.ts               # Main interfaces export
```

**Interface Files**:
- `config.ts` - Configuration interfaces
- `dataflows.ts` - Data flow interfaces
- `games.ts` - Game-related interfaces
- `report.ts` - Report interfaces
- `user.ts` - User interfaces

### 5. Constants Directory (`src/constants/`)

**Rule**: Constants are organized by type with index exports.

```
src/constants/
├── [constant-type].ts     # Type-specific constants
└── index.ts               # Main constants export
```

**Constant Files**:
- `chartTypes.ts` - Chart type definitions
- `collections.ts` - Collection constants
- `conditions.ts` - Condition constants
- `datasets.ts` - Dataset constants
- `queries.ts` - Query constants
- `reportTemplate.ts` - Report template constants

### 6. Reducers Directory (`src/reducers/`)

**Rule**: Redux state management follows a specific pattern with actions, reducers, and selectors.

```
src/reducers/
├── index.ts               # Store configuration and root reducer
├── global/                # Global state management
│   ├── actions.ts         # Global actions
│   ├── reducer.ts         # Global reducer
│   └── selectors.ts       # Global selectors
└── data/                  # Data state management
    ├── actions.ts         # Data actions
    ├── reducer.ts         # Data reducer
    └── selectors.ts       # Data selectors
```

### 7. Hooks Directory (`src/hooks/`)

**Rule**: Custom React hooks are individual files with descriptive names.

```
src/hooks/
├── use-[hook-name].ts     # Custom hook implementation
└── use-[hook-name].tsx    # Custom hook with JSX (if needed)
```

**Hook Naming**: Use `use-` prefix with descriptive names:
- `use-error-boundary.tsx`
- `use-is-mounted.ts`
- `use-report-execution-polling.ts`
- `use-responsive-chart.ts`
- `use-scroll.ts`

### 8. Utils Directory (`src/utils/`)

**Rule**: Utility functions are organized by purpose with index exports.

```
src/utils/
├── [utility-type].ts     # Utility functions by type
└── index.ts               # Main utils export
```

**Utility Files**:
- `arr.ts` - Array utilities
- `db-helpers.ts` - Database utilities
- `format-dataset.ts` - Dataset formatting
- `guid.ts` - GUID generation
- `query.ts` - Query utilities
- `svgLoader.ts` - SVG loading utilities

### 9. Assets Directory (`src/assets/`)

**Rule**: Static assets are organized by type.

```
src/assets/
├── [asset-name].svg       # SVG icons and graphics
├── [asset-name].png       # PNG images
├── [asset-name].json      # JSON data files
└── index.jsx              # Asset exports
```

### 10. Styles Directory (`src/styles/`)

**Rule**: Global styles and shared styling resources.

```
src/styles/
├── index.scss             # Main stylesheet
├── variables.scss         # SCSS variables
├── staff-shared.module.scss # Shared component styles
└── fonts/                 # Font files
    ├── [font-name].otf   # Font files
    └── [font-name].otf   # Additional fonts
```

### 11. Layouts Directory (`src/layouts/`)

**Rule**: Layout components for page structure.

```
src/layouts/
├── [layout-name].tsx     # Layout component
├── index.module.scss      # Layout styles
└── index.tsx              # Layout exports
```

## File Naming Conventions

### TypeScript Files
- **Components**: `index.tsx` (main component file)
- **Services**: `index.ts` or `[service-name].ts`
- **Interfaces**: `[domain].ts`
- **Hooks**: `use-[hook-name].ts` or `use-[hook-name].tsx`
- **Utils**: `[utility-name].ts`
- **Constants**: `[constant-type].ts`

### Style Files
- **Component styles**: `index.module.scss`
- **Global styles**: `index.scss`
- **Shared styles**: `staff-shared.module.scss`
- **Variables**: `variables.scss`

### Test Files
- **Unit tests**: `index.spec.tsx`
- **Storybook**: `index.stories.tsx`

## Import/Export Patterns

### Component Exports
```typescript
// Component with interface
export interface ComponentProps {
  // props definition
}

export const Component: FC<ComponentProps> = ({ ... }) => {
  // component implementation
};
```

### Service Exports
```typescript
// Service functions
export const serviceFunction = () => {
  // implementation
};

// Service classes
export class ServiceClass {
  // implementation
}
```

### Index File Exports
```typescript
// Re-export all from subdirectories
export * from './subdirectory';
export * from './another-subdirectory';
```

## Build and Configuration Files

### Root Level Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `sonar-project.properties` - Code quality configuration
- `yarn.lock` - Dependency lock file

### Scripts Directory
- `scripts/` - Build utilities and key generation
- `scripts/keys/` - RSA keys for authentication
- `scripts/old/` - Legacy script versions

### Public Directory
- `public/` - Static assets served directly
- `public/translations/` - Internationalization files

## Memory Bank Structure

```
memory-bank/
├── projectbrief.md        # Project foundation document
├── productContext.md      # Product requirements and goals
├── activeContext.md       # Current work focus
├── systemPatterns.md      # Architecture and patterns
├── techContext.md         # Technology stack and setup
├── progress.md            # Current status and issues
└── Notes/                 # Additional documentation
    └── [feature].md       # Feature-specific notes
```

## Development Rules

1. **Component Structure**: Every component must have its own directory with required files
2. **TypeScript**: All files must use TypeScript with proper interfaces
3. **Testing**: Every component must have unit tests and Storybook stories
4. **Styling**: Use SCSS modules for component-specific styles
5. **State Management**: Use Redux Toolkit with proper action/reducer/selector pattern
6. **File Organization**: Group related files in subdirectories with index exports
7. **Naming**: Use kebab-case for directories, PascalCase for components, camelCase for functions
8. **Exports**: Always use index files for clean imports
9. **Documentation**: Include README files for complex components
10. **Consistency**: Follow established patterns for new files and directories

## AI Implementation Guidelines

When creating or modifying files in this project:

1. **Always create the complete directory structure** for components
2. **Include all required files** (tsx, scss, spec, stories)
3. **Follow naming conventions** exactly as specified
4. **Use proper TypeScript interfaces** for all props and data structures
5. **Include proper imports and exports** in index files
6. **Maintain consistency** with existing patterns
7. **Update related files** when adding new functionality
8. **Follow the established Redux patterns** for state management
9. **Use SCSS modules** for component styling
10. **Include comprehensive tests** and Storybook stories

This structure ensures maintainable, scalable, and consistent code organization throughout the application.

## Multi-Agent AI Worker Guidelines

When multiple AI agents are working on this project simultaneously, follow these additional rules to ensure coordination and prevent conflicts:

### Agent Coordination Rules

#### 1. Component Ownership
- **One agent per component directory** - Each agent should claim exclusive ownership of specific components
- **Agent identification** - Agents should identify themselves and their assigned components before starting work
- **Scope boundaries** - Agents should only modify files within their assigned component directories
- **Shared file coordination** - Multiple agents can read shared files (interfaces, constants, services) but only one agent should modify them at a time

#### 2. File Modification Protocols
```
PRIORITY ORDER for file modifications:
1. Component-specific files (index.tsx, index.module.scss, index.spec.tsx, index.stories.tsx)
2. Component's own directory files
3. Shared interface files (with coordination)
4. Service layer files (with coordination)
5. Root-level configuration files (single agent only)
```

#### 3. Communication Requirements
- **Pre-work announcement** - Agents must announce which components they're working on
- **Dependency declaration** - Agents must declare if their work affects shared interfaces or services
- **Completion notification** - Agents must notify when work is complete and files are ready
- **Conflict resolution** - If two agents need the same shared file, the first to announce gets priority

### Conflict Resolution Strategies

#### 1. File Locking Protocol
```
SHARED FILES (require coordination):
- src/interfaces/*.ts
- src/services/index.ts
- src/constants/index.ts
- src/reducers/index.ts
- src/utils/index.ts
- package.json
- tsconfig.json

COMPONENT FILES (agent-exclusive):
- src/components/[component-name]/*
- src/containers/[container-name]/*
- src/hooks/use-[hook-name].ts
```

#### 2. Dependency Management Rules
- **Interface changes** - If modifying shared interfaces, announce to all agents
- **Service updates** - If updating services, check if any components depend on them
- **Breaking changes** - If making breaking changes, coordinate with affected component agents
- **New dependencies** - If adding new dependencies, update package.json and notify other agents

#### 3. Coordination Workflow
```
STEP 1: Agent announces work scope
STEP 2: Check for conflicts with other agents
STEP 3: Claim exclusive access to component files
STEP 4: Request shared file access if needed
STEP 5: Complete work and validate
STEP 6: Release file locks and notify completion
```

### Quality Assurance for Multi-Agent Work

#### 1. Pre-Commit Validation
- **Component completeness** - Ensure all required files exist (tsx, scss, spec, stories)
- **Import validation** - Verify all imports are correct and available
- **Type safety** - Ensure TypeScript compilation passes
- **Test coverage** - Verify tests are included and passing
- **Storybook compatibility** - Ensure stories work correctly

#### 2. Cross-Agent Validation
- **Interface compatibility** - Verify component interfaces match shared type definitions
- **Service integration** - Ensure components properly use available services
- **State management** - Verify Redux integration follows established patterns
- **Styling consistency** - Ensure SCSS modules follow naming conventions

#### 3. Integration Testing
- **Component integration** - Test that components work together
- **Service integration** - Verify service calls work correctly
- **State flow** - Ensure Redux state flows properly between components
- **Build validation** - Verify the entire application builds successfully

### Agent-Specific Work Patterns

#### Component Agent
```
ASSIGNED FILES:
- src/components/[assigned-component]/*
- Related interface updates (with coordination)

WORKFLOW:
1. Read existing component structure
2. Implement required changes
3. Update tests and stories
4. Validate component works in isolation
5. Announce completion and any interface changes needed
```

#### Service Agent
```
ASSIGNED FILES:
- src/services/[assigned-service]/*
- src/services/index.ts
- Related interface updates

WORKFLOW:
1. Announce service modifications
2. Update service implementation
3. Update service exports
4. Validate service functionality
5. Notify component agents of changes
```

#### Interface Agent
```
ASSIGNED FILES:
- src/interfaces/[assigned-domain].ts
- src/interfaces/index.ts

WORKFLOW:
1. Announce interface changes
2. Update type definitions
3. Update interface exports
4. Validate type safety across project
5. Notify all agents of interface changes
```

### Error Handling and Recovery

#### 1. Conflict Detection
- **File modification conflicts** - If two agents modify the same file
- **Interface mismatches** - If component interfaces don't match shared types
- **Import errors** - If components import non-existent modules
- **Build failures** - If changes break the build process

#### 2. Recovery Procedures
```
CONFLICT RESOLUTION STEPS:
1. Identify the conflicting agents
2. Determine which changes are more recent/critical
3. Merge changes if possible, or choose one version
4. Validate the merged result
5. Notify affected agents of the resolution
6. Update all dependent components if needed
```

#### 3. Rollback Procedures
- **Component rollback** - Revert to previous working version of component
- **Service rollback** - Revert service changes and notify dependent components
- **Interface rollback** - Revert interface changes and update all affected components
- **Full rollback** - Revert all changes and restart coordination

### Best Practices for Multi-Agent Development

#### 1. Agent Communication
- **Clear scope definition** - Always clearly define what each agent is working on
- **Regular status updates** - Provide updates on progress and any issues
- **Dependency awareness** - Always check if your changes affect other agents' work
- **Completion confirmation** - Always confirm when work is complete and validated

#### 2. Code Quality Maintenance
- **Consistent formatting** - Follow the same code formatting rules
- **Proper commenting** - Include clear comments for complex logic
- **Type safety** - Always use proper TypeScript types
- **Test coverage** - Maintain comprehensive test coverage
- **Documentation** - Update README files when adding complex functionality

#### 3. Coordination Efficiency
- **Parallel work** - Work on independent components simultaneously
- **Sequential dependencies** - Handle dependent work in proper sequence
- **Batch updates** - Group related changes to minimize coordination overhead
- **Validation batching** - Run comprehensive validation after major changes

### Emergency Procedures

#### 1. Critical Issues
- **Build failures** - Stop all agent work until build is fixed
- **Type errors** - Resolve TypeScript errors before continuing
- **Test failures** - Fix failing tests before proceeding
- **Integration issues** - Resolve component integration problems

#### 2. Recovery Protocols
- **Backup creation** - Create backups before major changes
- **Incremental validation** - Validate changes incrementally
- **Rollback planning** - Always have a rollback plan ready
- **Communication escalation** - Escalate coordination issues if needed

These multi-agent guidelines ensure that multiple AI agents can work effectively on the project without conflicts while maintaining code quality and consistency.
