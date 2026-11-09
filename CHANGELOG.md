# Changelog

All notable changes to HVPgg Wizard and the HVPgg (Hardware to Value Project "green generation") infrastructure platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2026-11-09
### Changed & Enhanced
- **Responsive Sticky Header & Stage Navigation**:
  - Implemented responsive top positioning: on desktop/laptop displays (`lg:` breakpoint), the primary header and the 5-stage progression bar stick seamlessly to the top (`lg:sticky lg:top-0` and `lg:sticky lg:top-[72px]`), keeping current stage context and progress checkmarks always in view.
  - On mobile/tablet screens (`< 1024px`), both bars scroll naturally with standard document flow, preserving 100% of vertical screen height for form inputs, network configuration, and on-screen keyboards.
- **Docked Stage Navigation Bar (`BottomNavDock`)**:
  - Introduced a streamlined bottom navigation dock with quick Back / Next stage advancement buttons and dynamic stage indicator (`Stage 0X / 05`).
  - Relocated secondary launcher shortcuts (Hardware Guide, Lineage & About, Component Engine Overrides) into the navigation dock to reduce top-of-page visual clutter while remaining accessible at all times.

## [1.4.2] - 2026-11-09
### Changed & Refined
- **Header De-cluttering**: Removed the standalone "Online" connectivity badge and the "Free / Commercial" mode badge from the header. The mode is already summarized inside the Profile Management dialog.
- **Integrated Update Checker & Connectivity State**: Merged online connectivity detection directly into the "Check for Updates" button. When offline, the button is automatically disabled with explanatory tooltip hints (`Offline - update check unavailable`), streamlining header indicators into a single intuitive action.
- **Universal Escape Key Modal Dismissal**: Integrated `useModalDismiss` across all modal dialogs (`AboutModal`, `DocsModal`, `AdvancedStackModal`, `ProfileManagerModal`, `ProfileConflictModal`, and `PWAUpdateNotification`), allowing immediate keyboard exit via the `Esc` key.
- **Keyboard Navigation & Accessibility (a11y)**: Ensured comprehensive keyboard focus rings, standard button types, ARIA labels, and logical form tab order across wizard stages and modals.

## [1.4.1] - 2026-11-08
### Changed & Pruned
- **Dependency Audit & Pruning**: Removed unused runtime and build packages (`@google/genai`, `motion`, `express`, `dotenv`, and `@types/express`), reducing bundle surface and avoiding unnecessary dependencies.
- **Component & License Catalog Synchronized**: Updated in-app package catalog and documentation in `AboutModal` to mirror the streamlined dependency tree.
- **Always-Visible Supportability Notice**: Added an explicit, persistent warning box inside the "Enterprise Production" card on Step 01 to emphasize that commercial supportability must be verified directly with SUSE even when utilizing valid SCC credentials.
- **Project Suite vs. Provisioning Tool Distinction**: Formally distinguished between the overarching *HVPgg* project (which encompasses the 6-layer architecture, future software selections, and installed systems) and *HVPgg Wizard* (the client-side browser app for kickstarting infrastructure ISO generation via EIB).
- **Metadata Alignment**: Updated `metadata.json`, `<title>`, and documentation headers to reflect *HVPgg Wizard*.

## [1.4.0] - 2026-11-07
### Changed & Evolved
- **Project Re-scope to HVPgg (Hardware to Value Project "green generation")**:
  - Redefined project mission: providing an opinionated, complete, ready-to-be-used on-premises IT infrastructure appliance for Small-to-very-very-Small Business enterprises with minimal/nonexistent IT teams, focused on pure business value.
  - Documented full evolutionary lineage: HVP (Heretic oVirt Project: legacy virtualization & AD) → HVPng (heterogeneous Fedora CoreOS + K3s, high complexity) → HVPgg (green generation: turnkey automated SUSE-technology-flavoured stack).
- **6-Layer Value Stack Architecture Model**:
  - Established the architectural blueprint spanning Layer 1 (Base OS), Layer 2 (K8s Foundation with embedded-etcd quorum), Layer 3 (Identity & Access Management with OIDC), Layer 4 (Cloud Workspace & Collaboration Suite), Layer 5 (Business ERP & Core Data Services), and Layer 6 (Fleet Device Management / MDM).
- **User-Centric Wizard Redesign**:
  - Restructured the primary wizard into 5 practical steps: Hardware Scale (01), Appliance Identity (02), Security & Updates (03), Value Stack Roadmap (04), and Build Appliance (05).
  - Elevated user-known facts (machine count, resource tier, network IPs, support tier) to the foreground, relegating technical engine names to subtitles.
- **Decoupled Technical Stack Dialog**:
  - Introduced the on-demand `AdvancedStackModal` ("Component Engine & Technical Overrides") for low-level version tags, CNI selectors, and upstream Edge 3.6/3.5 baseline presets with one-click restore.

## [1.3.4] - 2026-11-07
### Changed & Centralized
- **Centralized Parameter & Defaults Repository**: Centralized all built-in parameters, URLs, filenames, container images, package manifests, and checksums in `src/config/eibDefaults.ts` to ensure ease of long-term maintenance, auditing, and upgrading.
- **Version-Agnostic Leap Immutable Naming**: Streamlined top-level card titles, mode pill badges, and documentation from specific version numbers to generic "openSUSE Leap Immutable", keeping specific point release versions strictly confined to granular detail and override panels.

## [1.3.3] - 2026-11-06
### Changed & Upgraded
- **openSUSE Leap Immutable Base OS**: Replaced Free Mode base OS baseline with openSUSE Leap in immutable mode, incorporating transactional-update and btrfs snapshot support for appliance immutability.
- **SUSE Kiwi Appliance Recipe Modernization**: Updated containerized Kiwi pre-patch configuration (`kiwi-config/config.xml`) to include `patterns-base-transactional`, `transactional-update`, `btrfsprogs`, and `snapper` packages alongside public Leap OSS and update channels.
- **Dynamic Repository Injection**: Injected `.repo` file in exported workspace bundles standardized to `rpms/opensuse-leap.repo`, tracking official openSUSE Leap package and update trees.
- **Base Image ISO Standard**: Standardized Free Mode base image ISO identifier in `definition.yaml` to `leap-base.iso` with verified installer URLs and checksums.
- **EIB Layering Integrity**: Downstream Edge Image Builder layering (RKE2/K3s, CNI network plugins, Helm charts, air-gapped embedded artifact registry, storage target, and 1/3-node NMState network profiles) remains completely preserved and untouched.

## [1.3.2] - 2026-11-06
### Changed & Hardened
- **Embedded-etcd Quorum Topology Enforcement**: Restricted selectable cluster configurations strictly to either 1 Node (Single-Node Appliance / Solo Control-Plane + Worker) or 3 Nodes (HA Quorum Cluster with 3 unified Control-Plane + Worker nodes), completely disallowing invalid 2-node configurations that lack Raft quorum fault tolerance.
- **Unified Server Roles**: All active nodes in both 1-node and 3-node configurations run as unified control-plane + worker nodes with embedded etcd (`role: 'master'`, `type: 'server'`).
- **Brand Neutrality Decoupling**: Removed the green "Community" badge and shield from the page header to prevent false impressions of tiered commercial editions.
- **About Modal Tab Bar Stability**: Added `shrink-0` and `min-h-0` flexbox constraints to prevent the tabs bar from shrinking or becoming unusable when viewing extensive tabs like Full Changelog or License.

## [1.3.1] - 2026-11-05
### Changed & Decoupled
- **Project Identity & Trademark Decoupling**: Removed bare "SUSE" branding from project titles, page titles, HTML metadata, manifest headers, exported ZIP bundle filenames, and distribution tarballs.
- **Explicit Technical Attribution**: Kept legitimate technical references to official technologies (e.g., "for SUSE EIB", "openSUSE Leap Micro", "SLE Micro", "SUSE Customer Center", "SUSE Kiwi").
- **Prominent Non-Affiliation Disclaimers**: Added explicit legal notices in `README.md`, in-app About dialog, and Docs modal clarifying non-affiliation, non-endorsement, and absence of warranty or support path.
- **Commercial Supportability Advisories**: Added specific advisory notes in documentation and in the commercial SCC configuration panel advising users to verify commercial supportability directly with SUSE even when utilizing valid SCC credentials.
- **Export & Artifact Renaming**:
  - Exported recipe ZIP: `eib-recipe-${mode}-${k8s}-${arch}-${timestamp}.zip`
  - Output ISO: `edge-image-${mode}-${k8s}-${arch}.iso`
  - Profile bundle: `eib-profiles-bundle-${timestamp}.yaml`
  - GitHub release tarballs: `eib-pea-dist-v${VERSION}.tar.gz` and `eib-pea-src-v${VERSION}.tar.gz`
- **Dual-Format Compatibility**: Profile envelope formats safely accept both `eib-profile` (current) and legacy `suse-eib-profile` signatures without breaking existing user files or local storage caches.

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
