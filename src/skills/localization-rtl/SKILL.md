---
name: localization-rtl
description: Add translated strings and make layouts correct in Arabic and other right-to-left locales, with plurals, number and date formatting and large text. Use whenever user-facing text or layout direction is involved.
---

# Localization and RTL

## Strings

- Detect the project's system: `easy_localization` with generated `LocaleKeys` (reference apps) or Flutter's `gen-l10n` (ARB files). Use only that one.
- Add every new key to every locale file in the same change, then regenerate keys:
  - easy_localization: `dart run easy_localization:generate --source-dir ./assets/translations -f keys -o locale_keys.g.dart`
  - gen-l10n: `flutter gen-l10n`
- Keys describe meaning, not position: `orders_empty_title`, not `text3`.
- Plurals and genders use the system's plural support, never string concatenation.

## RTL layout

- Use directional APIs: `EdgeInsetsDirectional`, `AlignmentDirectional`, `PositionedDirectional`, `start`/`end` instead of `left`/`right`.
- Icons that imply direction (back, forward, chevrons, progress) mirror in RTL; media controls, logos and numbers do not.
- Never assume text width: Arabic and German change line length; allow wrapping and test truncation.
- Mixed content (phone numbers, codes, Latin brand names inside Arabic) may need explicit `TextDirection` or Unicode isolation.

## Numbers, dates, currency

- Format with `intl` (`NumberFormat`, `DateFormat`) using the current locale.
- Store and transmit in a neutral form (UTC timestamps, minor currency units); format only for display.

## Text scale and fonts

- Never clamp the system text scale to hide overflow; fix the layout.
- Arabic fonts need taller line height; check that the project's font supports Arabic glyphs.

## Verification

- Run the screen in Arabic and English, and at 1.3x text scale.
- Widget test at least one RTL case:

```dart
await tester.pumpWidget(
  const Directionality(textDirection: TextDirection.rtl, child: MyWidget()),
);
```
