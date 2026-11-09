# HVPgg — Hardware to Value Project ("green generation")

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-emerald.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![PWA Ready](https://img.shields.io/badge/PWA-Compliant-blue.svg)](https://web.dev/progressive-web-apps/)
[![Lineage: HVPgg](https://img.shields.io/badge/Lineage-HVP_%E2%86%92_HVPng_%E2%86%92_HVPgg-emerald.svg)](https://github.com/suse-edge/edge-image-builder)

> ### ⚠️ IMPORTANT NOTICE & DISCLAIMER
> **Independent Community Tool — Not an Official SUSE Product**:
> This project is an independent, community-driven tool and is **neither affiliated with, sponsored by, nor officially endorsed by SUSE**.
> - **No Official Support Path**: There is **neither explicit nor implied support path** provided by SUSE or the maintainers of this tool.
> - **Verification of Commercial Supportability**: Even when using official SUSE Customer Center (SCC) credentials, registration codes, or commercial repositories (e.g. for SLE Micro), the **actual supportability of any resulting build artifacts, images, and deployed systems must be verified directly with SUSE** under your applicable enterprise subscription agreements.
> - **Trademarks & Attributions**: "SUSE", "SUSE Linux Enterprise", "SLE Micro", "Rancher", and "openSUSE" are trademarks or registered trademarks of SUSE LLC or its affiliates. References to "SUSE EIB" or related projects are made strictly for descriptive attribution and compatibility purposes.

**HVPgg** (**Hardware to Value Project "green generation"**) provides an opinionated, complete, ready-to-be-used on-premises IT infrastructure appliance for Small-Medium (and mostly Small-to-very-very-Small) Business enterprises that have minimal-to-nonexistent IT teams or outsource IT entirely, enabling them to focus exclusively on business value produced.

---

## 1. Project Evolutionary Lineage

1. **HVP (Heretic oVirt Project)**: The original ancestor aimed at the same turnkey small-business goal, but was built before Kubernetes on legacy virtualization (oVirt/KVM), legacy shared storage, and an Active Directory based infrastructure.
2. **HVPng (Heretic oVirt Project "next generation")**: Modernized the stack to containers using a heterogeneous mix of technologies (Fedora CoreOS + K3s), but suffered from overly broad scope and required extensive technical expertise from end-users.
3. **HVPgg (Hardware to Value Project "green generation")**: The SUSE-technology-flavoured ("green" chameleon heritage) evolution: unified, appliance-grade, automated with Kiwi & EIB, delivering a complete turnkey 6-layer business stack from 1 or 3 nodes.

---

## 2. The 6-Layer HVPgg Value Stack

HVPgg orchestrates a 6-layer infrastructure appliance:
1. **Layer 1: Immutable Host OS**: openSUSE Leap Immutable (Free Mode) or SLE Micro (Commercial Mode), built via containerized Kiwi & EIB.
2. **Layer 2: Cloud-Native K8s Foundation**: Embedded-etcd 1-node or 3-node HA quorum (RKE2 or K3s), Longhorn distributed storage, Cilium/Calico CNI, MetalLB VIP, backup, and monitoring.
3. **Layer 3: Modern Identity & Access (OIDC)**: Centralized OpenID-Connect SSO and role-based access control.
4. **Layer 4: Cloud Workspace Suite**: Shared team storage, messaging/chat, web-based Office suite, and unified searching.
5. **Layer 5: Complete Business ERP & Data Services**: Production-grade relational database, message queue, key-value store, and integrated ERP.
6. **Layer 6: Fleet Device Management (MDM)**: Modern workstation, laptop, and mobile fleet management.

---

## 3. Architectural Highlights & Key Features

- **User-Centric Minimal Interface**: Asks only user-known facts (machine count, resource profile, support tier, IP addresses). Low-level choices (exact engine versions, Edge baseline presets) are delegated to subtitles or the on-demand Component Engine dialog.
- **Embedded-etcd Quorum Invariant**: Strictly enforces either 1 Node (Solo Appliance) or 3 Nodes (HA Quorum). Two-node setups are disallowable under Raft quorum principles.
- **100% Stateless & Client-Side**: No backend servers or tracking. Configuration state and ISO recipe generation occur in browser memory with PWA offline caching.
- **Dynamic ZIP Workspace Compilation**: Uses `JSZip` to compile and export a complete, executable deployment bundle including `definition.yaml`, hardened `build.sh`, NMState network declarations, repository configurations, and optional Kiwi appliance specifications.
- **Multi-Architecture (x86_64 & ARM64 / aarch64) with Cross-Compilation Emulation**:
  - Automatically adapts ISO download endpoints and expected SHA-256 hashes when switching between architectures.
  - The generated `build.sh` script detects host architecture mismatches (`uname -m` vs `aarch64`) and automatically registers QEMU user-static binfmt binaries via `multiarch/qemu-user-static`.
- **Upstream Image Upgrade Pipeline: Containerized SUSE Kiwi Integration**:
  - Optional toggle to compile a freshly patched, updated base OS ISO using containerized `kiwi-builder`, automatically exporting `kiwi-config/config.xml`.
- **Enterprise Corporate Proxy Layer**:
  - Configurable HTTP, HTTPS, and No Proxy parameters with optional basic authentication.
  - Automatically exported in `build.sh` and injected into container runtimes via `-e` flags.
- **Multi-Node NMState Declarations (1 or 3 Nodes)**:
  - Granular hardware MAC address mapping, static IPv4 assignments, gateway, and DNS resolvers output to individual `network/*.yaml` files.
- **Target Storage Device Specification**:
  - Configurable target drive path (`/dev/nvme0n1`, `/dev/sda`, `/dev/vda`, or custom) for automated unattended disk partitioning.
- **PWA & Accessibility Standards**:
  - Full PWA manifest and service worker integration with in-app install prompt and live version detection.

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
- **Strict Accessibility Standards (a11y)**: Full keyboard navigation, visible focus rings, ARIA roles, and universal <kbd>Escape</kbd> modal dismissal via `useModalDismiss`.
- **Minimal Dependencies & Zero-Slop Discipline**: Maintain a lean, pruned package manifest without heavy unnecessary runtimes, keeping the in-app license catalog strictly in sync with `package.json`.
- **Viewport Ergonomics & Clean UI Design**: Responsive sticky navigation on desktop with mobile viewport protection, unified bottom navigation dock, and standard W3C `overscroll-behavior: none` containment against elastic screen bouncing.
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

