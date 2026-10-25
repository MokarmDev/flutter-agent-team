---
name: ui-and-theming
description: Build screens and widgets with the project's theme tokens and shared widgets, give every screen its loading, empty, error and offline states, and keep rebuilds cheap. Use for any UI work.
---

# UI and theming

## Theme

- Colours, text styles, spacing and radii come from the theme (`Theme.of(context)`, the project's `AppColors`/`AppTextTheme` or design tokens). No hex values or one-off sizes in features.
- Support light and dark themes. Use Material 3 text style names (`titleLarge`, `bodyMedium`).
- If the project uses `flutter_screenutil`, size with `.w`, `.h`, `.sp` like the reference feature.

## Screen states

Every data screen handles all of these, using shared widgets first:

| State | Shows |
| --- | --- |
| Loading | the project's loading widget or a shimmer of the final layout |
| Empty | the project's empty-state widget with a helpful message |
| Error | message and Retry calling the state class |
| Offline | cached data with a "you are offline" notice, or an offline state |
| Success | the content |

## Widget structure

- Small `StatelessWidget` classes instead of `Widget _buildX()` helpers, so Flutter can skip rebuilding them.
- `const` constructors wherever possible.
- Lists: `ListView.builder` / `GridView.builder` / slivers; never a `Column` of many children.
- Images: cached network image widget with placeholder and error builder; decode at display size.

## Interaction

- Disable buttons while submitting; prevent double taps.
- Forms: `keyboardType`, `textInputAction`, `autofillHints`; show server field errors under fields.
- Touch targets at least 48 dp; semantic labels on icon buttons and images.

## Performance checks

- No heavy work in `build()`; precompute in the state class.
- Rebuild only what changes (`buildWhen`, `select`, splitting widgets).
- Profile with DevTools before optimising further.
