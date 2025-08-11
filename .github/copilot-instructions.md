# Android Device Catalog Browser

Android Device Catalog Browser is a modern React/TypeScript web application for exploring and analyzing 22,751+ Android devices from the official Device Catalog. Built with React 19, Vite, Tailwind CSS, and Radix UI components.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository:
- Install dependencies: `npm install` -- takes 1 minute. NEVER CANCEL.
- Lint the code: `npm run lint` -- takes 3 seconds, expect 10 warnings (no errors)
- Build for production: `npm run build` -- takes 21 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- Memory-optimized build: `npm run build:memory-optimized` -- takes 21 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- Test suite: `npm test` -- runs 110 tests across 6 test files using Vitest

### Run the Application:
- Development server: `npm run dev` -- starts in <1 second on http://localhost:5173/
- Production preview: `npm run preview` -- serves built app on http://localhost:4173/
- ALWAYS run `npm install` first before starting servers

### Development Requirements:
- Node.js 20.x or 22.x (LTS versions)
- npm package manager
- 4GB+ memory recommended for builds

## Validation

### ALWAYS manually validate any changes via these complete scenarios:
1. **Device Browsing**: Verify app loads showing "22,751 devices" and displays device grid with color-coded categories
2. **Search Functionality**: Type "Pixel" in search box → should filter to ~43 devices instantly
3. **Device Details**: Click any device card → modal opens with hardware specs, display info, architecture details
4. **Analytics Dashboard**: Click Analytics tab → comprehensive statistics with 22K+ devices, manufacturer breakdowns, technical metrics
5. **Navigation**: Test all tabs (Upload Data, Device Browser, Analytics) load correctly
6. **Export Functionality**: In Device Browser tab, verify Export button appears to the left of "Color Coding Information" button when color mode controls are visible

### Build Validation Steps:
- Run `npm run build` and verify dist/ folder contains ~11MB of assets
- Check build output shows proper chunk splitting and memory optimization warnings
- Verify build completes in ~21 seconds (normal range: 15-30 seconds)
- Always run `npm run lint` before committing - warnings are acceptable, errors are not

### CRITICAL Timeout Values:
- **Build commands**: NEVER CANCEL. Set timeout to 60+ minutes minimum
- **Development server**: Starts in <5 seconds
- **Dependency installation**: Takes 1 minute, set timeout to 10+ minutes
- **Linting**: Completes in 3 seconds

## Common Tasks

### Key Project Locations:
- **Main app entry**: `/src/main.tsx` and `/src/App.tsx`
- **Components**: `/src/components/` (DeviceGrid, Analytics, DeviceDetailModal, etc.)
- **Utilities**: `/src/lib/deviceUtils.ts` (filtering, stats calculations)
- **Hooks**: `/src/hooks/` (useKV for storage, useDataPreload for data loading)
- **Types**: `/src/types/device.ts` (AndroidDevice, DeviceFilters interfaces)
- **Build scripts**: `/scripts/inject-build-info.js` (injects git info into build)
- **Configuration**: `vite.config.ts` (build optimization settings)

### Architecture Overview:
- **Frontend**: React 19 with TypeScript, functional components with hooks
- **Styling**: Tailwind CSS + Radix UI primitives for components
- **Build**: Vite with memory optimization and chunk splitting
- **Data**: 22,751 device records loaded via JSON, virtual scrolling for performance
- **State**: React hooks + local storage via custom useKV hook
- **Routing**: Single-page app with tab-based navigation

### Making Changes:
- Device components are in `/src/components/` with clear separation by functionality
- Device filtering logic is in `/src/lib/deviceUtils.ts`
- UI components follow Radix UI patterns in `/src/components/ui/`
- Always test device search and detail modal after UI changes
- Color coding logic is in `/src/lib/deviceColors.ts`

### Performance Considerations:
- Virtual scrolling handles 22K+ devices efficiently
- Memory-optimized build available for resource-constrained environments
- Large device JSON file (~7.5MB) is optimized for loading
- Chunk splitting reduces initial bundle size

### CI/CD Information:
- GitHub Actions workflow in `.github/workflows/ci.yml`
- Tests Node.js 20.x and 22.x compatibility
- Runs linting, building, and security audits
- Build artifacts are uploaded on successful builds

## Frequent Commands Reference

### npm scripts output examples:
```bash
# npm install
added 496 packages, and audited 497 packages in 1m

# npm run lint  
10 problems (0 errors, 10 warnings) - warnings are expected

# npm run build
✓ built in 17.34s
dist/index.html                    8.74 kB │ gzip:   2.37 kB
dist/assets/index-C3A5O2qs.js   1,055.82 kB │ gzip: 347.06 kB

# npm run dev
VITE v7.1.1  ready in 583 ms
➜  Local:   http://localhost:5173/
```

### Repository structure:
```
.
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── eslint.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── data/
├── scripts/
│   └── inject-build-info.js
├── public/
└── .github/
    └── workflows/
        └── ci.yml
```

## Troubleshooting

### Common Issues:
- **Build fails with memory errors**: Use `npm run build:memory-optimized` instead
- **Dev server won't start**: Check if port 5173 is available, kill with `npm run kill` if needed
- **Large bundle warnings**: Expected due to 22K+ device dataset, optimizations already applied
- **Linting warnings**: 10 warnings are expected and acceptable (mostly React refresh and unused vars)
- **Missing dependencies**: Always run `npm install` after pulling changes

### Development Tips:
- Use `npm run dev` for development with hot reloading
- Device data loads asynchronously - test with network throttling
- Virtual scrolling may affect testing - scroll to see all devices
- Color coding helps distinguish device types (phones, tablets, TVs, wearables)
- Search is case-insensitive and searches across device names, manufacturers, and processors