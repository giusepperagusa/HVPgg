# Edge Image Builder - Provisioning & Execution Assistant (EIB-PEA)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-emerald.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![PWA Ready](https://img.shields.io/badge/PWA-Compliant-blue.svg)](https://web.dev/progressive-web-apps/)
[![Community Project](https://img.shields.io/badge/Project-Community_Driven-green.svg)](https://github.com/suse-edge/edge-image-builder)

> ### ⚠️ IMPORTANT NOTICE & DISCLAIMER
> **Independent Community Tool — Not an Official SUSE Product**:
> This project is an independent, community-driven tool and is **neither affiliated with, sponsored by, nor officially endorsed by SUSE**.
> - **No Official Support Path**: There is **neither explicit nor implied support path** provided by SUSE or the maintainers of this tool.
> - **Verification of Commercial Supportability**: Even when using official SUSE Customer Center (SCC) credentials, registration codes, or commercial repositories (e.g. for SLE Micro), the **actual supportability of any resulting build artifacts, images, and deployed systems must be verified directly with SUSE** under your applicable enterprise subscription agreements.
> - **Trademarks & Attributions**: "SUSE", "SUSE Linux Enterprise", "SLE Micro", "Rancher", and "openSUSE" are trademarks or registered trademarks of SUSE LLC or its affiliates. References to "SUSE EIB" or related projects are made strictly for descriptive attribution and compatibility purposes.

An interactive, secure, and client-side Progressive Web Application (PWA) acting as a **Provisioning & Execution Assistant (PEA)** for the **SUSE Edge Image Builder (EIB)**.

This assistant automates the end-to-end recipe configuration for generating custom bootable ISO images capable of deploying pre-configured, air-gapped on-premises Kubernetes appliance clusters.

---

## 1. Architectural Highlights & Key Features

- **100% Stateless & Client-Side**: No backend servers, external tracking, or third-party databases. All cryptographic operations and file assembly occur directly in browser memory.
- **Dynamic ZIP Workspace Compilation**: Uses `JSZip` to compile and export a complete, executable deployment bundle including `definition.yaml`, hardened `build.sh`, NMState network declarations, repository configurations, and optional Kiwi appliance specifications.
- **Environment Modes**:
  - **Free Mode (openSUSE Leap Immutable)**: Sets `image.baseImage` to `leap-base.iso`, bypasses commercial registration checks, targets public openSUSE mirrors, and dynamically generates `rpms/opensuse-leap.repo`.
  - **Commercial Mode (SUSE Linux Enterprise Micro / SLM-ICEO)**: Sets `image.baseImage` to `sl-micro-base.iso`, enables SUSE Customer Center (SCC) authentication tokens, and configures authenticated update repository mirrors.
- **Multi-Architecture (x86_64 & ARM64 / aarch64) with Cross-Compilation Emulation**:
  - Automatically adapts ISO download endpoints and expected SHA-256 hashes when switching between architectures.
  - The generated `build.sh` script detects host architecture mismatches (`uname -m` vs `aarch64`) and automatically registers QEMU user-static binfmt binaries via `multiarch/qemu-user-static` to ensure cross-compiled containers run cleanly on x86_64 host processors.
- **Upstream Image Upgrade Pipeline: Containerized SUSE Kiwi Integration**:
  - Optional toggle to compile a freshly patched, updated base OS ISO using containerized `kiwi-builder` (`registry.suse.com/edge/[VERSION]/kiwi-builder`), automatically exporting `kiwi-config/config.xml`.
- **Enterprise Corporate Proxy Layer**:
  - Configurable HTTP, HTTPS, and No Proxy parameters with optional basic authentication.
  - Automatically exported in `build.sh` and injected into container runtimes via `-e` flags.
- **Supply-Chain Security & Integrity Verification**:
  - Subresource Integrity (SRI) hashes and `crossorigin="anonymous"` for all CDN libraries.
  - Embedded SHA-256 verification via `sha256sum --check --status` inside `build.sh`.
  - Interactive In-Browser File Hash Calculator utilizing the streaming Web Crypto API (`crypto.subtle.digest`) for zero-upload local file validation.
- **Multi-Node NMState Declarations (Up to 3 Nodes)**:
  - Granular hardware MAC address mapping, static IPv4 assignments, gateway, and DNS resolvers output to individual `network/*.yaml` files.
- **Target Storage Device Specification**:
  - Configurable target drive path (`/dev/nvme0n1`, `/dev/sda`, `/dev/vda`, or custom) for automated unattended disk partitioning.
- **PWA & Accessibility Standards**:
  - Full PWA manifest and service worker integration with in-app install prompt.
  - Automatic adaptation to dark/light/high-contrast settings with an accessible 4-way switcher (System, Dark, Light, High Contrast).

---

## 2. Tested SUSE Edge Component Baseline

| Component | SUSE Edge 3.6 (Current) | SUSE Edge 3.5 (Previous Stable) |
|---|---|---|
| **EIB Tooling Engine** | v3.6.0 | v3.5.2 |
| **Community Base OS** | openSUSE Leap Immutable | openSUSE Leap Immutable |
| **Enterprise Base OS** | SUSE Linux Enterprise Micro 6.0 | SUSE Linux Enterprise Micro 5.5 |
| **Default RKE2 Version**| `v1.31.2+rke2r1` | `v1.30.5+rke2r1` |
| **Default K3s Version** | `v1.31.2+k3s1` | `v1.30.5+k3s1` |
| **Tested CNI Plugins**  | Cilium, Calico, Canal, Flannel | Cilium, Canal, Calico |
| **Pre-bundled Charts**  | MetalLB 0.14.8, Longhorn 1.7.2, Ingress-NGINX 4.11.3 | MetalLB 0.13.12, Longhorn 1.6.2 |

---

## 3. Exported Workspace Bundle Structure

```text
.
├── definition.yaml            # EIB master recipe specification
├── build.sh                   # Hardened automated runner script (chmod 755)
├── manifests/                 # Pre-configured Helm chart values & manifests
│   └── helm-charts.yaml       # Embedded Helm release declarations
├── network/                   # NMState node-specific network configurations
│   ├── node1.yaml             # Node 1 (Master / Appliance Base) NMState definition
│   ├── node2.yaml             # Node 2 (Worker / Secondary Node)
│   └── node3.yaml             # Node 3 (Worker / Tertiary Node)
├── rpms/                      # Zypper repository configuration (.repo)
│   └── opensuse-leap-micro.repo # (or sle-micro.repo for commercial mode)
├── kiwi-config/               # SUSE Kiwi image definition (if Kiwi pre-patch enabled)
│   └── config.xml             # Boilerplate appliance description
├── README.md                  # Detailed deployment guide
├── CHANGELOG.md               # Version history
└── LICENSE                    # GNU Affero General Public License v3.0
```

---

## 4. Quickstart Execution Guide

### On the Build Host:
1. Ensure `podman`, `curl`, and `sha256sum` are installed.
2. Unzip your bundle:
   ```bash
   unzip eib-recipe-*.zip -d edge-build/ && cd edge-build/
   ```
3. Execute the automated builder:
   ```bash
   ./build.sh
   ```

---

## 5. Development & AI Assistant Maintenance Guidelines

For developers, maintainers, and future AI assistants, see the comprehensive [AI_MAINTENANCE_GUIDELINES.md](./AI_MAINTENANCE_GUIDELINES.md) document. It outlines:
- Complete re-creation instructions from scratch.
- Universal subpath publishing (`base: './'`).
- Multi-architecture QEMU binfmt emulation rules.
- Pinned SRI CDN hashes and supply-chain integrity controls.
- Tested component matrix updates and version bump enforcement.

---

## 6. Continuous Integration & GitHub Releases

Automated workflows are located in [`.github/workflows/release.yml`](./.github/workflows/release.yml). On every version tag push (`v*`) or manual workflow dispatch, the pipeline:
1. Runs static type checking (`npm run lint`).
2. Executes the unit test suite (`npm test`).
3. Compiles the production build with relative asset paths (`npm run build`).
4. Generates compressed distribution tarballs (`eib-pea-dist-v${VERSION}.tar.gz` and `eib-pea-src-v${VERSION}.tar.gz`).
5. Automatically creates and publishes a GitHub Project Release with release notes extracted from `CHANGELOG.md`.

---

## 7. Official References & Upstream Documentation

- **SUSE Edge Official Documentation**: [https://documentation.suse.com/edge/](https://documentation.suse.com/edge/)
- **EIB GitHub Project**: [https://github.com/suse-edge/edge-image-builder](https://github.com/suse-edge/edge-image-builder)
- **NMState Network Declarations**: [https://nmstate.io/](https://nmstate.io/)
- **openSUSE Leap Portal**: [https://en.opensuse.org/Portal:Leap](https://en.opensuse.org/Portal:Leap)
- **SUSE Linux Enterprise Micro**: [https://www.suse.com/products/micro/](https://www.suse.com/products/micro/)
- **SUSE KIWI Image System**: [https://osinside.github.io/kiwi/](https://osinside.github.io/kiwi/)

---

## 8. License

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU Affero General Public License** as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See the [LICENSE](./LICENSE) file for details.

