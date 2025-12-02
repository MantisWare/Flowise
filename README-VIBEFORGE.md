# Flowise Integration for VibeForge

This document explains how the Flowise UI is embedded in VibeForge and provides troubleshooting scripts.

## Overview

VibeForge embeds the Flowise UI directly into the application, allowing you to create and manage AI agents without leaving the VibeForge environment. The Flowise backend server runs automatically in the background using native Node.js processes, and the UI is built with special embedded mode settings.

## Automatic Setup

When you run `pnpm install` in the VibeForge root directory, the postinstall script automatically:

1. Initializes the Flowise git submodule
2. Installs Flowise dependencies
3. Builds the Flowise UI with embedded mode (`VIBEFORGE_EMBEDDED=true`)

## Manual Scripts

If you encounter issues or need to rebuild Flowise manually, use these scripts:

### Quick Fix Scripts

```bash
# If Flowise UI is not loading:
pnpm run flowise:build-ui

# If Flowise backend is not starting:
pnpm run flowise:build-server

# Full rebuild (cleans and rebuilds everything):
pnpm run flowise:rebuild
```

### Individual Component Scripts

```bash
# Install/reinstall Flowise dependencies
pnpm run flowise:install

# Build only the Flowise UI (with embedded mode)
pnpm run flowise:build-ui

# Build only the Flowise server
pnpm run flowise:build-server

# Build both UI and server
pnpm run flowise:build

# Clean all build artifacts
pnpm run flowise:clean

# Complete clean rebuild
pnpm run flowise:rebuild

# Full setup from scratch (includes submodule init)
pnpm run flowise:setup
```

### Complete Fresh Setup

```bash
# This runs everything from scratch
pnpm run setup
```

## Architecture

### Embedded Mode

When `VIBEFORGE_EMBEDDED=true` is set during build, the Flowise UI:
- Disables authentication (bypasses login screens)
- Hides Flowise branding (logo, upgrade buttons, marketplace)
- Removes workspace/organization features
- Automatically authenticates with a mock user
- Defaults to dark mode theme
- Removes theme toggle (controlled by parent VibeForge application)
- Prevents external browser redirects

#### Specific UI Modifications

The following files have been modified to support embedded mode with `VIBEFORGE_EMBEDDED=true`:

**Authentication Bypass:**
- `packages/ui/src/routes/RequireAuth.jsx` (lines 39-42)
  - Returns children directly when `VIBEFORGE_EMBEDDED=true`, bypassing all auth checks
- `packages/ui/src/hooks/useAuth.jsx` (lines 11-16)
  - Returns `true` for all permission checks in embedded mode
- `packages/ui/src/store/reducers/authSlice.js` (lines 5-37)
  - Creates mock authenticated user with global admin permissions (`permissions: ['*']`)
- `packages/ui/src/store/context/ErrorContext.jsx` (lines 15-52)
  - Bypasses 401/403 error redirects to login pages in embedded mode
  - Prevents global error handler from forcing login navigation

**Branding Removal:**
- `packages/ui/src/layout/MainLayout/LogoSection/index.jsx` (lines 13-16)
  - Returns `null` to hide Flowise logo
- `packages/ui/src/layout/MainLayout/Header/index.jsx` (lines 160-161, 274-276)
  - Hides WorkspaceSwitcher, OrgWorkspaceBreadcrumbs, and Upgrade button
  - Hides theme toggle switch (theme controlled by parent)

**Theme Management:**
- `packages/ui/src/store/reducers/customizationReducer.js`
  - Forces dark mode default when `VIBEFORGE_EMBEDDED=true`
  - Allows theme changes from parent via `SET_DARKMODE` action
- `packages/ui/src/App.jsx`
  - Listens for `VIBEFORGE_THEME_CHANGE` messages from parent window
  - Updates Flowise UI theme when VibeForge theme changes
- `packages/ui/src/views/auth/login.jsx` and `signIn.jsx`
  - Prevents external redirects when `VIBEFORGE_EMBEDDED=true`

**Advanced Features Hidden:**
- `packages/ui/src/menu-items/dashboard.js` (lines 99-112, 140-153, 213-274, 275-314)
  - Hides Marketplace menu item
  - Hides API Keys menu item
  - Hides entire "User & Workspace Management" section (SSO Config, Roles, Users, Workspaces, Login Activity)
  - Hides entire "Others" section (Logs, Account Settings)

**Pattern Used:**
All modifications use conditional rendering with the `VIBEFORGE_EMBEDDED` environment variable:
```javascript
const isEmbedded = process.env.VIBEFORGE_EMBEDDED === 'true'

// For array items (menu items):
...(!isEmbedded ? [{ item }] : [])

// For components:
{!isEmbedded && <Component />}

// For early returns:
if (isEmbedded) return null
```

### Backend Integration

The Flowise backend server:
- Runs via native Node.js `child_process` for lightweight process management
- Automatically dies with the Electron process (no orphaned processes)
- Starts automatically when VibeForge launches
- Has health monitoring every 5 seconds
- Supports port auto-increment for multiple instances
- Features automatic restart with exponential backoff on crashes
- Serves both the API backend and UI from the same port (port 3000)
- UI is built with embedded mode enabled (`VIBEFORGE_EMBEDDED=true`)

### Key Files

- `electron/flowise-manager.ts` - Manages the Flowise server lifecycle using native child_process
- `electron/main.ts` - Integrates FlowiseManager with retry logic and health monitoring, blocks external browser windows
- `src/components/AgentBuilderView.tsx` - Embeds Flowise UI in iframe, injects console log capture, sends theme changes
- `src/components/FlowiseDebugPanel.tsx` - Integrated debug console panel displaying logs from both server and UI
- `packages/flowise/packages/ui/*` - Modified for embedded mode
- `scripts/postinstall.js` - Automated build script

## Architecture Benefits

The native Node.js implementation provides several advantages:

**Lightweight**
- No external daemon processes
- Direct lifecycle control tied to Electron
- Simpler architecture with fewer moving parts

**Reliable**
- Process dies with Electron (no orphaned processes)
- Automatic restart with exponential backoff (1s, 2s, 4s, 8s delays)
- Better integration with Electron's process model

**Easier to Debug**
- Direct stdout/stderr capture
- Clearer error messages
- No external process manager to troubleshoot

## Troubleshooting

### Issue: Flowise UI not showing

**Solution:**
```bash
pnpm run flowise:build-ui
```

Then restart VibeForge.

### Issue: Flowise backend not starting

**Symptoms:** Connection refused errors or server fails to spawn

**Solution:**
```bash
pnpm run flowise:build-server
```

Then restart VibeForge.

### Issue: Everything is broken

**Solution:** Complete rebuild from scratch
```bash
pnpm run flowise:rebuild
```

This will:
1. Clean all build artifacts
2. Reinstall all dependencies
3. Rebuild both server and UI

### Issue: Missing dependencies or "Module not found" errors

**Solution:**
```bash
pnpm run flowise:install
pnpm run flowise:build
```

### Issue: Port conflicts (multiple VibeForge instances)

**This is handled automatically!** The FlowiseManager will auto-increment ports:
- First instance: Port 3000 (serves both API and UI)
- Second instance: Port 3001 (serves both API and UI)
- Third instance: Port 3002 (serves both API and UI)
- etc.

### Issue: Process crashes repeatedly

**Automatic Handling:** The FlowiseManager implements exponential backoff:
- First restart: 1 second delay
- Second restart: 2 second delay
- Third restart: 4 second delay
- Fourth restart: 5 second delay (capped)

Check the debug window (in dev mode) or console logs to see crash reasons.

## Development

### Building for Embedded Mode

Always use the `VIBEFORGE_EMBEDDED=true` environment variable when building the UI. The build scripts in the root `package.json` ensure this is set automatically:

```bash
# Build UI with embedded mode (automatic)
pnpm run flowise:build-ui

# Build both server and UI (automatic)
pnpm run flowise:build
```

**Note:** The Flowise UI is served from the same port as the Flowise server (port 3000). There is no separate UI dev server.

### Testing Changes

After making changes to Flowise integration code:

1. Rebuild the affected component:
   ```bash
   pnpm run flowise:build-ui  # If UI changes
   # or
   pnpm run flowise:build-server  # If backend changes
   ```

2. Restart VibeForge dev server:
   ```bash
   pnpm run dev
   ```

## Process Management Details

### Native child_process Implementation

**File:** `electron/flowise-manager.ts:385-390`

The Flowise server is spawned using Node.js's native `spawn()`:
```typescript
this.childProcess = spawn(entryPoint, ['start'], {
  cwd: flowisePath,
  env,
  stdio: ['ignore', 'pipe', 'pipe'], // stdin ignored, stdout/stderr piped
  detached: false, // Keep as part of process group
});
```

### Auto-Restart Logic

**File:** `electron/flowise-manager.ts:464-500`

The process automatically restarts on crashes with exponential backoff:
```typescript
// Auto-restart if enabled and not shutting down
if (this.autoRestartEnabled && !this.isShuttingDown && code !== 0) {
  this.status.restartCount++;

  // Use exponential backoff for restarts
  const restartDelay = Math.min(5000, 1000 * Math.pow(2, Math.min(this.status.restartCount - 1, 3)));

  this.restartTimeout = setTimeout(() => {
    this.start().catch((error) => {
      this.log('error', 'Auto-restart failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }, restartDelay);
}
```

### Port Auto-Increment

**File:** `electron/flowise-manager.ts:274-304`

The `findAvailablePort()` method tries up to 100 ports starting from the configured port.

## Updating Flowise Submodule

When updating the Flowise submodule to a newer version, follow these steps carefully:

### 1. Update the Submodule

```bash
# From VibeForge root
pnpm run submodule:pull-latest
```

### 2. Check for Conflicts

After updating, verify that the embedded mode modifications are still present in these files:

**Critical files to check:**
- `packages/flowise/packages/ui/src/routes/RequireAuth.jsx`
- `packages/flowise/packages/ui/src/hooks/useAuth.jsx`
- `packages/flowise/packages/ui/src/store/reducers/authSlice.js`
- `packages/flowise/packages/ui/src/layout/MainLayout/LogoSection/index.jsx`
- `packages/flowise/packages/ui/src/layout/MainLayout/Header/index.jsx`
- `packages/flowise/packages/ui/src/menu-items/dashboard.js`

### 3. Reapply Modifications if Needed

If the update overwrites any modifications, search for the `VIBEFORGE_EMBEDDED` environment variable in each file:

```bash
cd packages/flowise/packages/ui
grep -r "VIBEFORGE_EMBEDDED" src/
```

If any file is missing the embedded mode logic, refer to the **Specific UI Modifications** section above to reapply the changes.

### 4. Rebuild

After verifying or reapplying modifications:

```bash
# From VibeForge root
pnpm run flowise:rebuild
```

### 5. Test

Start VibeForge in dev mode and verify:
- ✅ No login screen appears
- ✅ Flowise logo is hidden
- ✅ Sidebar shows only: Chatflows, Agentflows, Executions, Assistants, Tools, Credentials, Variables, Document Stores
- ✅ Hidden sections: Marketplace, API Keys, User & Workspace Management, Logs, Account Settings
- ✅ Theme defaults to dark mode and syncs with VibeForge theme toggle
- ✅ Theme toggle switch is hidden in Flowise UI header
- ✅ External browser windows and redirects are blocked
- ✅ Console logs from Flowise UI appear in debug console panel
- ✅ Agents sync to VibeForge Planning Board

## Support

If you encounter persistent issues:

1. Check the integrated debug console panel (toggle via "Server Console" button in status bar)
2. Check the main VibeForge console for error logs
3. Try a complete rebuild: `pnpm run flowise:rebuild`
4. If all else fails, try a fresh clone and setup: `pnpm run setup`

**Debug Console Panel:**
- Toggle via "Server Console" button in the status bar (bottom-right corner)
- Displays logs from both Flowise server (native process) and Flowise UI (iframe)
- Logs are color-coded by level (info, warn, error, debug) and source (Server/UI)
- Auto-scrolls to latest logs
- Resizable up to 80% of viewport height
