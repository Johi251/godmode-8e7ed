# Personal-copy CI maintenance — 16 October 2026

`Johi251/godmode-8e7ed` is a separate repository copied from
`GodMode-Team/godmode`, not a GitHub fork. Its original `main` is
`1ef8644250bbdbbe3163a3a7c8626bff23bd3731` (26 March 2026).
The unmerged Netlify PR #1 (`agent-create-the-app-45a8`,
`6decde6ff18f440faf4a5e6e036d97ce6160c498`) adds a static UI build,
Netlify settings and gateway connection instructions. Those changes are
preserved separately; this repair does not merge them or change any hosting.

## Repeated failure and repair

The inherited OpenClaw watch ran every six hours. It upgraded the host SDK
in a temporary runner from the March dependency to 2026.10.4, then failed
with TS2307 for `openclaw/plugin-sdk` during auto-fix. The earlier typecheck
and build used `tee` without `pipefail`, so failures could be reported as
passed and incorrectly enter auto-fix.

This personal Hermes copy now provides an explicit manual compatibility
check. Blank input tests the committed lockfile; a concrete input version
tests that host upgrade only in the runner. Explicit Bash shell enables
`pipefail`, and failed checks retain a failed workflow conclusion. Logs and
the tested manifest/lockfile are saved as artifacts. The workflow never
creates issues or PRs, bumps versions, pushes commits, or publishes packages.
The separate npm publishing job is restricted to `GodMode-Team/godmode`,
which owns the package namespace.

The root lockfile is regenerated with pnpm 9 to match the existing
`better-sqlite3: ^12.8.0` declaration. Frozen installs remain mandatory.
The committed March OpenClaw version is preserved; this is not a claim of
compatibility with OpenClaw 2026.10.4. Such a host upgrade needs its own
investigation and explicit manual check.

## Scope

No repository, branch, Netlify project, Render service, secret, user memory,
or runtime configuration is deleted or moved. No paid model or AI endpoint
is invoked by this maintenance workflow.

## Verification

On 16 October 2026 the pnpm 9.15.9 frozen installation, TypeScript check,
complete UI/plugin/standalone/MCP build and distribution integrity check
passed locally. The build now copies required assets with Node filesystem
APIs so the same build works on Windows and Linux. The package manager is
pinned to prevent nested scripts from using a different global pnpm major.
No generated UI snapshot changed.

The original production audit reported 156 findings. A focused follow-up
removed the unused `mem0ai` dependency (the implemented memory facade only
selects `honcho` or `none`), updated `ws` to 8.21.0 and DOMPurify to 3.4.16,
and pinned the development host to the already tested OpenClaw 2026.3.23.
The regenerated SQLite 12 lock and pnpm 9.15.9 pin remain in place.

After those changes, `pnpm audit --prod --json` reports zero known production
findings, and typecheck, full build and distribution checks pass. This does
not imply complete security: an audit including development dependencies
still finds vulnerabilities in the old OpenClaw development toolchain.
Upgrade that host only after a separate compatibility investigation; the
2026.10.4 SDK incompatibility has not been patched or hidden.