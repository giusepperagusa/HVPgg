# AI Maintenance & Development Constitution (EIB-PEA)
# Edge Image Builder - Provisioning & Execution Assistant (for SUSE EIB)

> **Target Audience**: Human Maintainers and Future AI-based Coding Assistants  
> **Applicable Version**: 1.3.2+  
> **Project License**: AGPL-3.0-only  
> **Standard Compliance**: W3C PWA, POSIX/Bash Hardening, SUSE Edge 3.6/3.5 EIB Specifications

This document serves as the **master knowledge base and operational constitution** for maintaining, extending, and re-creating the **Edge Image Builder Provisioning & Execution Assistant (EIB-PEA)** application from scratch. Any future AI model or human engineer MUST adhere strictly to the rules, architectural patterns, and domain models documented below.

---

## 1. Executive Summary & Purpose

The **SUSE Edge Image Builder (EIB)** is an offline, declarative tool for creating customized, hardened OS images (openSUSE Leap Micro or SUSE Linux Enterprise Micro) with embedded Kubernetes (RKE2 or K3s), container images, Helm charts, and declarative host networking (NMState) for edge appliance clusters.

The **EIB-PEA** is a browser-based, client-side, zero-telemetry Progressive Web Application (PWA) that acts as an interactive wizard. It generates the complete, ready-to-run recipe workspace bundle packaged into a `.zip` file containing:
- `definition.yaml`: Master EIB recipe following official schema.
- `build.sh`: Automated, hardened POSIX/Bash runner script.
- `manifests/`: Embedded Helm charts and workload manifests.
- `network/`: Declarative NMState host networking profiles mapped by MAC address for up to 3 cluster nodes.
- `rpms/`: Public or commercial Zypper repository specifications.
- `kiwi-config/`: (Optional) SUSE Kiwi appliance definitions when pre-patching is active.
- `README.md`, `CHANGELOG.md`, `LICENSE`: Full offline documentation and AGPL-3.0 text.

---

## 2. Inviolable Architectural Directives (Hard Constraints)

### Directive 1: 100% Stateless & Client-Side Only
- **NO Backend Database**: The application must never rely on external databases, telemetry APIs, tracking beacons, or cloud backends.
- **In-Memory Operations**: State management, cryptographic hashing, YAML generation, and ZIP packaging must execute entirely within browser memory.

### Directive 2: Universal Subpath Deployment
- **Relative Asset Baselines**: The app must be deployable on any generic web server (Nginx, Apache, Caddy, GitHub Pages, Cloudflare Pages, S3/GCS buckets) at **ANY path level** (e.g., `https://host/`, `https://host/eib/`, or `https://host/apps/suse-pea/`).
- **Configuration Enforcement**:
  - `vite.config.ts`: Must maintain `base: './'`.
  - `index.html`: Must use relative links for assets (`./icon.svg`, `./apple-touch-icon.png`, `./manifest.webmanifest`).
  - `manifest.webmanifest`: Must specify `"id": "./"`, `"start_url": "./"`, and `"scope": "./"`.

### Directive 3: Stark Security & Subresource Integrity (SRI)
- All external CDN libraries loaded via `<script>` in `index.html` (JSZip, js-yaml) **MUST** include pinned versions, valid cryptographic `integrity` attributes (`sha384-...`), and `crossorigin="anonymous"`. Never use unpinned or wildcard URLs.
- All downloads in `build.sh` must strictly validate downloaded ISO files against embedded SHA-256 hashes using `sha256sum --check --status` and terminate execution on any mismatch.

### Directive 4: Mandatory Version Bump Before Publishing
- Whenever a code change, bug fix, or feature is added, the engineer/AI assistant **MUST increment the version** in `package.json` (e.g. `1.1.0` -> `1.1.1` or `1.2.0`), append a corresponding section in `CHANGELOG.md`, and update `src/utils/eibGenerator.ts` to match.

### Directive 5: AGPL-3.0-only Licensing Enforcement
- Every source code file must declare the `@license SPDX-License-Identifier: AGPL-3.0-only` header.
- The full AGPL-3.0 license text must remain available in the repository root (`/LICENSE`) and fully viewable within the in-app "About & Legal" dialog.

### Directive 6: Full Offline PWA & Proactive Online Update Lifecycle
- **Air-Gapped & Offline Execution**: The application must be 100% executable offline with Workbox precaching (`sw.js`). All core JavaScript, CSS, HTML, SVG, and webmanifest files must be precached so that air-gapped laptops can generate full EIB recipes and export `.zip` bundles without network access.
- **Bypass Browser SW HTTP Cache**: Always register the service worker with `updateViaCache: 'none'` so the browser never serves stale service worker scripts.
- **Proactive Online Update Detection**:
  - Offline apps do not easily receive updates unless actively polled.
  - The app must check for updates on app mount, on network reconnect (`online`), on tab focus (`visibilitychange`), on a 15-minute background interval, and via a manual "Check for Updates" button.
  - It queries both `registration.update()` and `./version.json` with cache-busting.
- **Controlled Skip-Waiting & Non-Disruptive Reload**:
  - Never reload the application automatically while a user might be filling out recipe fields.
  - When an update is waiting, display an interactive update banner.
  - Clicking "Update Now" posts `{ type: 'SKIP_WAITING' }` to the waiting service worker, which triggers `controllerchange` and clean page reload into the new version.
- **In-App PWA Installation**:
  - Capture and defer `beforeinstallprompt` to render a prominent "Install App" button in the header and about dialog.
  - Provide an iOS Safari guidance modal explaining "Share" -> "Add to Home Screen".
  - Detect `display-mode: standalone` to display the "Installed App" badge.

### Directive 7: Profile Management, Zero-Binary Serialization, Collision Handling & Future-Proof Schemas
- **Multi-Profile Persistence**: Users can save multiple configuration profiles in browser `localStorage`. Each profile contains user-defined names, descriptive comments, timestamps, and form state without any huge binary ISO blobs.
- **Human-Editable Commented YAML**: Exported profiles (`.eib-profile.yaml`) are rendered in clean YAML with multi-line explanatory header comments and field descriptions, enabling operators to inspect and manually edit configuration values.
- **Web Crypto AES-256-GCM Encryption**: To safeguard sensitive values (Kubernetes cluster tokens, root passwords, SUSE Customer Center registration codes), users can choose AES-256-GCM encryption with a custom passphrase on export. Key derivation uses PBKDF2 (100,000 iterations, SHA-256). If unencrypted export is chosen, a prominent security warning is displayed.
- **Collision Detection & Diff Inspection**: When importing a profile whose name or ID already exists, the app must never silently overwrite data. Instead, it triggers a side-by-side diff comparison modal highlighting changed fields and providing 3 explicit choices: Overwrite Existing, Keep Both (Rename), or Cancel.
- **Future-Proof Normalization**: The `normalizeEIBConfig()` utility guarantees forward and backward schema compatibility. When an older profile lacking newer fields is imported, default baseline values are backfilled so the application never breaks or encounters `undefined` state errors.

### Directive 8: Trademark Attribution & Decoupled Project Identity
- **Independent Identity**: The project name, artifacts, page titles, HTML metadata, and release tarballs MUST NOT use unqualified "SUSE" branding (use "Edge Image Builder Assistant" or "EIB-PEA").
- **Clear Technical Context**: "SUSE" is permitted ONLY when the reference or attribution is explicit and technically accurate (e.g., "for SUSE Edge Image Builder", "openSUSE Leap Micro", "SUSE Linux Enterprise Micro", "SUSE Customer Center", or "SUSE Kiwi").
- **Prominent Non-Affiliation Disclaimers**: All user-facing documentation (`README.md`, in-app About dialog, Docs modal) must feature a clear legal notice stating that the project is not a SUSE product, is neither affiliated with nor endorsed by SUSE, provides no warranty or support path, and advises operators to verify the commercial supportability of resulting images directly with SUSE even when using SCC credentials.
- **Safe Storage Migration**: Local storage keys should prefer neutral names (`eib_profiles_v1`) while retaining fallback reads for legacy keys (`suse_eib_profiles_v1`) to prevent data loss.

### Directive 9: Embedded-etcd Quorum Topology Policy (Strictly 1 or 3 Unified Nodes)
- **Raft Consensus Quorum Constraint**: K3s and RKE2 clusters built with embedded etcd require a strict majority quorum ($⌊N/2⌋ + 1$) to operate and elect leaders.
- **2-Node Configurations Strictly Disallowed**: A 2-node cluster requires 2 out of 2 votes for quorum, providing **zero fault tolerance** (failure of either node halts the cluster) and exposing the deployment to catastrophic split-brain partitions. Consequently, the application MUST only allow selecting either:
  1. **1 Node (Single-Node Appliance)**: Standalone quorum (1/1).
  2. **3 Nodes (High-Availability Quorum Cluster)**: 2/3 quorum tolerating 1 full node failure.
- **Unified Server Roles**: All active nodes in both 1-node and 3-node configurations operate as unified control-plane + worker nodes (`role: 'master'`, `type: 'server'`), avoiding dedicated non-workload control plane hardware at the edge.
- **Schema Normalization**: If an imported legacy profile contains 2 enabled nodes, `normalizeEIBConfig` automatically promotes it to 3 nodes (`node2.enabled: true, node3.enabled: true`) to satisfy the Raft quorum requirement.

---

## 3. Domain Logic & UX Workflow Matrix

### 3.1 Environment Mode Duality
| Feature / Behavior | Free Mode (openSUSE Leap Micro) | Commercial Mode (SLE Micro / SLM-ICEO) |
|---|---|---|
| **Base Image Name** | `leap-micro-base.iso` | `sl-micro-base.iso` |
| **Registration / Telemetry** | Completely bypassed (no keys) | Enables SCC Registration Token, Email, and Endpoint |
| **Repository Mirrors** | Public openSUSE Leap Micro mirrors | Authenticated SUSE Customer Center (SCC) repos |
| **Bundle Injection** | Injects `rpms/opensuse-leap-micro.repo` | Injects `rpms/sle-micro.repo` with auth tokens |
| **Container Image Source** | `registry.opensuse.org` | `registry.suse.com` (with `podman login`) |
| **Download Pipeline** | Direct download via curl | Authenticated curl with SCC Bearer token |

### 3.2 Multi-Architecture & Cross-Compilation Emulation
- **Supported Targets**: `x86_64` (Standard AMD/Intel) and `aarch64` (ARM64).
- **Dynamic Swapping**: When the user changes architecture in Tab 1, the app must automatically swap the default ISO download URL and official SHA-256 hash.
- **Cross-Compilation Bootstrap in `build.sh`**:
  If target is `aarch64` and the build host is `x86_64` (`[ "$TARGET_ARCH" = "aarch64" ] && [ "$HOST_ARCH" = "x86_64" ]`), `build.sh` must automatically execute:
  ```bash
  sudo podman run --rm --privileged multiarch/qemu-user-static --reset -p yes
  ```
  This registers QEMU user-static binfmt binaries so ARM64 containerized Zypper, Combustion, and Kiwi scripts execute without host kernel traps.

### 3.3 Upstream Image Upgrade: Containerized SUSE Kiwi
- **Toggle**: "Rebuild and Update Base ISO using containerized SUSE Kiwi Builder".
- **Execution Workflow**:
  - When enabled, `build.sh` runs `kiwi-builder` (`registry.suse.com/edge/[VERSION]/kiwi-builder` or `registry.opensuse.org/virtualization/appliances/images/kiwi:latest`).
  - Scaffolds `kiwi-config/config.xml` containing image description schema version 7.4.
  - Kiwi resolves packages from upstream update repositories and outputs a freshly patched base ISO directly into `base-images/` for EIB consumption.

### 3.4 Multi-Node Cluster Topology & NMState
- **Cluster Capacity**: Up to 3 nodes (Node 1: Master/Appliance Base, Node 2: Worker/Secondary, Node 3: Worker/Tertiary).
- **NMState Schema**: Each enabled node outputs an individual YAML file under `network/<nodename>.yaml` with:
  - `interfaces[].mac-address`: Physical MAC binding.
  - `interfaces[].ipv4.address[].ip` and `prefix-length`: Static CIDR.
  - `routes.config[].next-hop-address`: Default gateway.
  - `dns-resolver.config.server[]`: Upstream DNS servers array.

### 3.5 Target Storage Device Configuration
- Target installation disk path selectable between `/dev/nvme0n1` (NVMe), `/dev/sda` (SATA/SAS), `/dev/vda` (VirtIO), or custom block device string.
- Injected into `operatingSystem.installer.targetDevice` in `definition.yaml`.

### 3.6 Enterprise Corporate Proxy Layer
- Configurable `httpProxy`, `httpsProxy`, `noProxy`, and optional basic auth credentials.
- Injected into `build.sh` as shell exports AND passed to container runs using `-e HTTP_PROXY`, `-e HTTPS_PROXY`, and `-e NO_PROXY`.

---

## 4. Tested Component Baseline Reference (Internal Matrix)

Future updates to SUSE Edge releases must be recorded in `src/types/eib.ts` (`EDGE_VERSION_PRESETS`):

### SUSE Edge 3.6 (Current Release)
- **EIB Version**: `3.6.0`
- **Free OS**: openSUSE Leap Micro 6.0
- **Commercial OS**: SUSE Linux Enterprise Micro 6.0
- **Default Kubernetes**: RKE2 `v1.31.2+rke2r1` | K3s `v1.31.2+k3s1`
- **Validated CNI**: Cilium, Calico, Canal, Flannel
- **Recommended Helm Releases**: MetalLB 0.14.8, Longhorn 1.7.2, Ingress-NGINX 4.11.3

### SUSE Edge 3.5 (Previous Stable)
- **EIB Version**: `3.5.2`
- **Free OS**: openSUSE Leap Micro 5.5
- **Commercial OS**: SUSE Linux Enterprise Micro 5.5
- **Default Kubernetes**: RKE2 `v1.30.5+rke2r1` | K3s `v1.30.5+k3s1`
- **Validated CNI**: Cilium, Canal, Calico

---

## 5. File Structure & Component Mapping

```
├── .github/workflows/
│   └── release.yml            # CI test, lint, tar packaging & GitHub Releases
├── public/
│   ├── icon.svg               # Vector brand emblem (Hexagon Edge Chameleon)
│   ├── pwa-192x192.png        # PWA standard mobile icon
│   ├── pwa-512x512.png        # PWA high-res launch icon
│   ├── pwa-maskable-512x512.png # Maskable Android icon with safe padding
│   ├── apple-touch-icon.png   # iOS Safari 180x180 PNG icon
│   └── manifest.webmanifest   # PWA manifest with relative start_url
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Brand bar, mode badge, theme toggle & PWA install button
│   │   ├── TabsNav.tsx        # 5-step wizard tab navigator with completion badges
│   │   ├── TabEnvironment.tsx # Mode, Arch, Kiwi, Proxy, ISO & Hash configuration
│   │   ├── TabVersions.tsx    # Edge generation presets & version overrides
│   │   ├── TabKubernetes.tsx  # RKE2/K3s, token, Helm charts & OCI container list
│   │   ├── TabNodesStorage.tsx# Drive target & 3-node NMState network sub-forms
│   │   ├── TabExport.tsx      # File tree explorer, code previews & Web Crypto hash validator
│   │   ├── AboutModal.tsx     # AGPL-3.0 license, package matrix, changelog & docs
│   │   └── DocsModal.tsx      # In-app air-gap deployment & architecture guide
│   ├── hooks/
│   │   ├── usePWAInstall.ts   # PWA prompt and iOS Safari instructions hook
│   │   └── useTheme.ts        # Dark, light, and high-visibility contrast controller
│   ├── types/
│   │   └── eib.ts             # TypeScript models, state interfaces & presets
│   ├── utils/
│   │   ├── eibGenerator.ts    # Pure functions for definition.yaml, build.sh, NMState, Kiwi
│   │   ├── eibGenerator.test.ts # Node:test unit test suite
│   │   └── zipExporter.ts     # JSZip in-memory file assembly & download trigger
│   ├── App.tsx                # Main view controller & wizard step orchestrator
│   ├── index.css              # Tailwind CSS v4 directives & contrast accessibility
│   └── main.tsx               # React 19 application entry point
├── AI_MAINTENANCE_GUIDELINES.md # THIS MASTER SPECIFICATION
├── CHANGELOG.md               # Complete release changelog
├── LICENSE                    # GNU Affero General Public License v3.0
├── package.json               # Dependencies, scripts, and version identifier
├── tsconfig.json              # TypeScript compilation rules
└── vite.config.ts             # Vite bundler, PWA plugin, and relative base './'
```

---

## 6. How to Re-Create the Application From Scratch

If this codebase needs to be rebuilt or cloned into a fresh environment:

1. **Initialize React SPA on Vite & Tailwind**:
   ```bash
   npm install react react-dom lucide-react jszip js-yaml motion
   npm install -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss vite-plugin-pwa tsx typescript @types/node @types/react @types/react-dom @types/js-yaml
   ```

2. **Configure `vite.config.ts`**:
   - Ensure `base: './'` is set so assets resolve relatively.
   - Add `react()`, `tailwindcss()`, and `VitePWA({ registerType: 'autoUpdate', manifest: false, devOptions: { enabled: true } })`.

3. **Configure `index.html`**:
   - Add CDN scripts with SRI:
     - JSZip 3.10.1: `sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG`
     - js-yaml 4.1.0: `sha384-+pxiN6T7yvpryuJmE1gM9PX7yQit15auDb+ZwwvJOd/4be2Cie5/IuVXgQb/S9du`
   - Use relative `<link rel="manifest" href="./manifest.webmanifest" />`.

4. **Implement Generator & Unit Tests First**:
   - Implement `src/types/eib.ts` with strict typings.
   - Implement pure functions in `src/utils/eibGenerator.ts`.
   - Write comprehensive unit tests in `src/utils/eibGenerator.test.ts` using `node:test` and `node:assert/strict`.
   - Run tests: `npx --yes tsx --test src/utils/eibGenerator.test.ts`.

5. **Assemble Modular UI Components**:
   - Implement `Header`, `TabsNav`, `TabEnvironment`, `TabVersions`, `TabKubernetes`, `TabNodesStorage`, `TabExport`.
   - Integrate `AboutModal` with full dependency catalog and changelog tabs.
   - Wire in `usePWAInstall` and `useTheme`.

6. **Verify End-to-End**:
   - Run `npm run lint` (`tsc --noEmit`).
   - Run `npm test` (`tsx --test src/utils/eibGenerator.test.ts`).
   - Run `npm run build` (`vite build`).
   - Run Playwright CLI headless browser tests to inspect desktop and mobile viewports.

---

## 7. Maintenance & Release Checklist for Future Turns

Before finalizing any maintenance turn or submitting pull requests:

- [ ] **Increment Version**: Did you bump `"version"` in `package.json`?
- [ ] **Update CHANGELOG.md**: Did you add release notes for the new version in `CHANGELOG.md` and in `generateChangelogMarkdown()`?
- [ ] **Update About Catalog**: If new dependencies were added, are they documented in `PACKAGES_CATALOG` inside `src/components/AboutModal.tsx`?
- [ ] **Verify Subpath Integrity**: Did you keep `base: './'` in `vite.config.ts` and relative links in `index.html`?
- [ ] **Run Unit Tests**: Does `npm test` pass with 0 failures?
- [ ] **Compile & Lint**: Does `npm run lint` and `npm run build` pass cleanly?
- [ ] **Check Licenses**: Does every new file feature `@license SPDX-License-Identifier: AGPL-3.0-only`?
