# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.1.2 — 2021-09-20

### Changed

- Moved to slash commands

### Removed

- Obsolete commands
- `messageCreate` listener — no longer responds to `r.` commands

## 0.1.1 — 2021-09-19

### Security

- Updated dependencies
- Upgraded to Discord API v13

## 0.1.0 — 2021-08-09

### Added

- `messageReactionAdd` and `messageReactionRemove` listeners, gives/removes trip role accordingly

### Removed

- Manual fetching of trip messages

## 0.0.3 — 2021-08-03

### Added

- `trip` command now automatically creates a role based on the trip name and emoji

## 0.0.2 — 2021-08-02

### Added

- Unsplash thumbnail of trip name to embeds

### Changed

- `trip-schema` now requires a message ID and optional planning link

## 0.0.1 — 2021-08-01

### Added

- `trip` command
