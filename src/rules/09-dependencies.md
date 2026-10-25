---
description: Package choices
globs: ["pubspec.yaml"]
---

# Dependencies

- Use the packages already in `pubspec.yaml`; never add a second package for the same job.
- Adding, removing or upgrading a package needs approval, with: why, maintenance status, platform support, licence and alternatives.
- Keep generators in `dev_dependencies` and versions of a package and its generator compatible.
