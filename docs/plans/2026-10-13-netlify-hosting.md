# Host the existing GodMode UI on Netlify

## Scope

Deploy the existing Lit interface, not a new standalone backend. OpenClaw continues to own the gateway, agents, authentication, integrations, and application data. Netlify serves only the built interface. No database, new services, or permanent context injection is needed.

## Implementation

1. Configure Netlify to run the existing UI build and publish `ui/dist`, matching Vite's output directory. Use root-relative assets so refreshing a tab URL works.
2. Add a non-forced single-page application rewrite and conservative response headers. Preserve public assets and avoid caching the HTML shell indefinitely.
3. Add a gateway connection form to the existing system overview, with a shortcut while disconnected. Reuse the existing settings and reconnection flow rather than adding a second authentication system. Keep credentials out of URLs and build configuration.
4. Document the external gateway requirement, TLS, exact allowed origins, device approval, and the limits of static hosting.

## Review

The publish-directory mismatch is the deployment blocker. The gateway must remain external because a static deployment cannot run the long-lived OpenClaw process. The form must reject non-WebSocket protocols, embedded URL credentials, URL fragments, and insecure connections from HTTPS pages. Its token input must be masked. Existing gateway-hosted and development flows must continue to work, including the development `/ws` proxy.

The form stays within the existing overview rather than adding a seventh navigation tab. Labels, keyboard submission, native validation, and responsive field widths are required. No existing generated UI snapshot is edited, and no build artifacts are produced in this run.

## Verification

Run focused connection-form tests before and after implementation, validate the Netlify configuration with its installed parser, check changed TypeScript, inspect the diff, and search for forbidden host-core imports. The deployment system performs the build and deployment. Live gateway authentication cannot be verified without a running, trusted gateway supplied by the owner.

The repository's named Claude workflow skills are not available in this environment; this plan records the equivalent scope and safety review. Git branch management and publishing are handled by the deployment system.

## Verification results

- All 11 connection-form tests and four existing settings tests passed in Chromium.
- Desktop and mobile browser checks passed, including the disconnected shortcut, URL validation, masked token input, and a direct overview route reload.
- Netlify's configuration parser resolved the publish directory to `ui/dist`; targeted TypeScript checks passed.
- The full UI had 265 diagnostics both before and after these changes, with no introduced diagnostics. Five assertions in the unchanged navigation test suite failed during broader checks and were left outside this deployment task.
- No build, commit, or manual deployment was performed. A live authenticated gateway was not available for verification.
