# Host GodMode's existing interface on Netlify

Netlify serves the GodMode UI. Your existing OpenClaw gateway continues running on your own machine or server, with the GodMode plugin installed. Agents, memory, integrations, and application data remain there. This deployment does not turn the plugin into a serverless backend.

## Deployment configuration

The repository's `netlify.toml` first installs the UI's locked dependencies using `npm --prefix ui ci --include=dev --ignore-scripts --no-audit --no-fund`, then runs `npm --prefix ui run build` and publishes `ui/dist`, the directory produced by `ui/vite.config.ts`. The install is explicit because a CLI deployment can reach the build step without installing project dependencies. Including development dependencies makes Vite available even when the surrounding environment omits them by default. Lifecycle scripts remain disabled.

The UI's package manifest declares its browser dependencies and Vite, and `ui/package-lock.json` locks their installation. This keeps the static deployment independent of the plugin's server-side and native dependencies while using the same UI source and Vite configuration. npm avoids requiring a separately installed pnpm executable. The previous site setting of `dist` did not match the UI-only build; file-based configuration supplies the corrected publish directory.

The UI is served at the site root, with root-relative assets and a non-forced single-page application rewrite. Opening or refreshing `/chat`, `/today`, `/work`, `/memory`, `/dashboards`, or `/overview` loads the app while actual static files remain accessible. The plugin's npm build and bundled fallback UI are unchanged.

Let Netlify's deployment pipeline run the configured dependency installation and UI compilation. No gateway token, model API key, or other credential belongs in the build environment or a public `VITE_*` variable.

## Connect the gateway

1. Run OpenClaw with the GodMode plugin on your existing host. The installation steps in the root README still apply.
2. Make the gateway reachable from the browser through a trusted TLS endpoint that supports WebSocket upgrades. Use `wss://`, since the Netlify app is served over HTTPS. A gateway available only on your private network requires the browser's device to be on that network. Netlify cannot connect to or run your local gateway for you.
3. In the gateway's OpenClaw configuration, append the exact Netlify origin to `gateway.controlUi.allowedOrigins`. For this site, the origin is `https://zingy-granita-b313a1.netlify.app`. Preserve any existing trusted origins. Do not use wildcards or disable device authentication. A custom domain or deploy preview has a different origin and must be explicitly trusted before it can connect.
4. Open the Netlify app and select **Connect gateway**, or visit `/overview`. Enter the trusted gateway's WebSocket URL and its token in the masked field, then select **Save and connect**. Re-enter the token when saving a connection; the form intentionally does not display a saved token.
5. If the gateway requests pairing approval, approve the browser device on your OpenClaw host using its normal device-pairing workflow, then reconnect.

The form uses the existing connection settings and browser storage behavior. Use a trusted browser profile and do not share token-bearing URLs. The browser connects directly to the gateway; the hosting deployment does not need access to gateway credentials.

## Troubleshooting and limits

- **Page loads but chat is disabled:** the interface is deployed, but the gateway is not connected. Netlify's hostname is not a gateway endpoint; replace the default connection URL with your own gateway's address.
- **Mixed-content or TLS failure:** use a reachable `wss://` endpoint with a certificate trusted by the browser. Do not expose an unauthenticated plain-text gateway to the public internet.
- **Origin denied:** add the site's exact HTTPS origin to the gateway allowlist and restart the gateway as required by your OpenClaw setup.
- **Pairing required or unauthorized:** approve the browser device on the gateway and check the entered token. Do not bypass authentication checks.
- **Gateway-hosted HTTP features:** the existing artifact download endpoint and Nostr profile HTTP endpoints are same-origin gateway routes. They are not supplied by this static deployment. Use the gateway-hosted GodMode interface for those features; the Netlify host does not proxy private files or API requests.

## Validation

Connection-form tests cover secure connection submission, masked credentials, malformed and unsafe URLs, HTTPS mixed-content rejection, corrected validation, and the existing development WebSocket proxy. The Netlify configuration can be checked without building; deployment compilation and publication are handled by Netlify.

A live authenticated connection still requires a running gateway configured by its owner. A successful static deployment alone does not verify agent execution.
