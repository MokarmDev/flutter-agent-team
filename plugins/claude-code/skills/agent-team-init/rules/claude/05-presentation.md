---
paths:
  - "lib/**/presentation/**"
  - "lib/shared/widgets/**"
  - "lib/config/theme/**"
---
<!-- UI rules for pages, widgets and theme -->

# Presentation

- Colours, text styles and spacing from the theme; no hex values or magic sizes in features.
- User-facing strings from the localization system; every key in every locale.
- Every data screen: loading, empty, error with retry, offline, success.
- Directional layout (`EdgeInsetsDirectional`, `start`/`end`); test RTL and large text.
- Lists use builders; images are cached with error builders.
- Navigation and one-off effects in listeners, not in builders.
