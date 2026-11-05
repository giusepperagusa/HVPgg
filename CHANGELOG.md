# Changelog

All notable changes to the SUSE Edge Provisioning & Execution Assistant (PEA) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-11-05
### Added
- **Multi-Profile Management**: Save unlimited configuration profiles in browser memory with custom names, comments, and fast switching without losing wizard states.
- **Zero-Binary Profile Serialization**: Clean, lightweight profile exports containing all form parameters without large binary ISO blobs.
- **Human-Editable Commented YAML**: Full export and import in standard YAML (`.eib-profile.yaml`) enriched with descriptive documentation and security notices for easy inspection and manual editing.
- **Web Crypto AES-256-GCM Encryption**: Optional enterprise-grade client-side encryption using PBKDF2 (100,000 iterations, SHA-256) and AES-GCM to protect cluster tokens, root passwords, and SCC registration credentials.
- **Collision Detection & Diff Comparison**: Smart import conflict engine detecting existing profile names, presenting a side-by-side diff table with changed-field filtering, and offering Overwrite, Keep Both (Rename), or Cancel options.
- **Future-Proof Backward Compatibility**: Automatic schema normalization (`normalizeEIBConfig`) ensuring older profile exports gracefully backfill missing attributes with safe production defaults.
- **Multi-Profile Backup Bundles**: Export and import complete profile collections in a single commented or encrypted archive.

## [1.2.0] - 2026-11-04
### Added
- **Total Offline Execution (Workbox Precaching)**: Full offline service worker caching (`sw.js`) allowing the app to run completely air-gapped without internet connectivity.
- **Automated Online Update Detection**: Proactive update polling (15-minute background interval, network reconnect, and focus/tab visibility change triggers) and immediate feedback.
- **Interactive Update Notification & Controlled Reload**: High-visibility update banner with single-click skip-waiting activation to prevent losing in-progress recipe inputs.
- **Manual "Check for Updates" Diagnostics**: Real-time update check in Header and About dialog querying both `version.json` and service worker byte-diffing.
- **In-App PWA Installation**: Prominent "Install App" button and native iOS Safari "Add to Home Screen" step-by-step guidance modal.
- **Cache-Bypass SW Registration**: Registered with `updateViaCache: 'none'` to overcome aggressive browser HTTP caching of service worker scripts.

## [1.1.1] - 2026-11-04
### Fixed
- **Markdown Tree Formatting**: Fixed README.md Section 3 directory tree formatting by removing backslash-escaped code fences so the full tree and commands render as readable multiline code blocks across all markdown parsers.
- **GitHub Actions Lockfile & Runner Hardening**: Generated and committed `package-lock.json`, aligned `esbuild` dependency with Vite 8 (`^0.28.0`), updated action runners to `ubuntu-24.04`, and added fallback npm dependency caching via `actions/cache@v4` with resilient `npm ci || npm install --legacy-peer-deps`.

## [1.1.0] - 2026-11-04
### Added
- **Subpath Deployment Flexibility**: PWA and assets configured with relative base paths (`./`) enabling publishing at any subpath or nested directory on any generic web server (Apache, Nginx, Caddy, Cloudflare Pages, GitHub Pages).
- **Comprehensive Package & License Matrix**: Interactive catalog of all runtime, development, and CDN libraries with versions, purposes, and open-source licenses inside the About dialog.
- **Embedded Changelog Viewer**: Full in-app release history tab integrated directly into the user interface.
- **Automated CI/CD & GitHub Actions Release Pipeline**: Complete workflow (`.github/workflows/release.yml`) to compile TypeScript, run unit tests, create compressed tarballs, and publish version-tagged GitHub releases.
- **AI Coding Assistant Constitution**: Comprehensive `AI_GUIDELINES.md` guide for maintaining, extending, and re-creating the application from scratch.

## [1.0.0] - 2026-11-04
### Added
- **Interactive EIB Recipe Wizard**:
  - 5-step intuitive progressive workflow: Environment, Versions, Kubernetes, Nodes/Storage, and Export.
- **Dual Environment Modes**:
  - Community **Free Mode** (openSUSE Leap Micro) with public mirror RPM repo generation and bypass of commercial registration checks.
  - Enterprise **Commercial Mode** (SLE Micro) with SCC credentials, authenticated curl fallback downloads, and commercial repo injection.
- **ARM64 (aarch64) Multi-Architecture Support**:
  - Dynamic URL and SHA-256 hash swapping for 64-bit ARM hardware.
  - Automated QEMU user-static emulation registration (`multiarch/qemu-user-static`) in `build.sh` for cross-compilation on x86_64 host machines.
- **Containerized SUSE Kiwi Pre-Patching Pipeline**:
  - Optional toggle to pre-compile a freshly patched base ISO via containerized `kiwi-builder` (`registry.suse.com/edge/[VERSION]/kiwi-builder`).
  - Scaffolding of `kiwi-config/config.xml` in exported ZIP bundle.
- **Multi-Node NMState Declarations (Up to 3 Nodes)**:
  - Granular hardware MAC address binding and static IP/gateway/DNS configuration.
  - Outputs individual `network/*.yaml` files in valid NMState schema.
- **Target Storage Device Specification**:
  - Unattended installation disk target selector for `/dev/nvme0n1`, `/dev/sda`, `/dev/vda`, or custom device paths.
- **Enterprise Corporate Proxy Layer**:
  - HTTP, HTTPS, and No Proxy parameters with optional basic authentication.
  - Passed cleanly into host environment and container runtime `-e` flags.
- **Supply-Chain Integrity & Security**:
  - Strict Subresource Integrity (SRI) on external CDN scripts.
  - Embedded SHA-256 verification via `sha256sum --check --status` in `build.sh`.
  - In-browser local ISO file hash validator using the streaming Web Crypto API (`crypto.subtle.digest`).
- **PWA & Accessibility**:
  - Full PWA manifest, service worker caching, and in-app install prompt with iOS Safari guide.
  - Automatic adaptation to dark/light/high-contrast settings with manual 4-way switcher.
  - Full AGPL-3.0 licensing headers and embedded license modal.
