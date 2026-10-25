---
description: What needs the user's explicit approval first
always: true
---

# Approval gates

Stop and ask before:

- adding, removing or upgrading packages (`pubspec.yaml`, `pubspec.lock`)
- changing architecture, state management, DI or routing strategy, or a shared public API
- deleting or renaming files, or bulk code generation that can overwrite files
- changing platform config: Gradle, manifests, Info.plist, entitlements, signing, flavors, CI
- touching secrets, auth, token storage or environment config
- creating, moving or editing more than one ticket
- destructive git or shell commands (force push, hard reset, clean, rm -rf)

When asking, say: what changes, why, which files or systems, and the safer alternative if there is one.
