---
description: Platform config and secrets
globs: ["android/**", "ios/**", "lib/config/**", "**/.env*", "**/key.properties"]
---

# Platform and secrets

- Never commit secrets, keystores, `key.properties`, `.env` files or service-account JSON; commit `*.example` files instead.
- Anything shipped in the app binary is public: real secrets belong on a server.
- Manifest, Info.plist, entitlements, Gradle, signing and flavor changes need approval.
- Release builds: obfuscation with split debug info, logging off.
