# Preferences and secure storage

## shared_preferences

- Only small, non-sensitive values: theme, locale, onboarding seen, feature flags cache.
- Keys are constants in one file (for example `StorageKeys`).

## flutter_secure_storage

- Access and refresh tokens, and any identifier you would not print in a log.
- iOS: use an accessibility such as `first_unlock_this_device` so Keychain items do not migrate to another device.
- Android: exclude secure-storage files from auto backup (`backup_rules.xml`, `data_extraction_rules.xml`), otherwise restored backups can hold unreadable encrypted data.
- Clear tokens on logout.
