# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.6.0 — 2022-03-25

### Added

- Event renaming: a simple but convenient change, you can now use `/event rename <event emoji> <new name>`

## 0.5.1 — 2021-10-24

### Fixed

- A couple backend changes that should make retrieving events more reliable

## 0.5.0 — 2021-10-06

### Added

- Support for multiple servers! 🎉
- Tons of project details in the [README](https://github.com/edwardshturman/register-bot/#readme)

### Changed

- Changed all "trips" branding to "events"
  - It sounds more consistent across the multiple use cases. I'll see how it sounds!

### Fixed

- Fixed bot crashing if there's no thumbnail found for `/event add`

## 0.4.0 — 2021-10-04

### Added

- Availability 🌟
  - With up to 4 dates, visualize who can go when with reactions, then decide with `/trip reschedule`!

### Fixed

- An edited embed after using `/trip reschedule` will now display the correct new date.

## 0.3.2 — 2021-09-26

### Fixed

- Now sends an error message for `/trip reschedule` and `/trip cancel` if the trip message can't be found

## 0.3.1 — 2021-09-25

### Changed

- `/trip reschedule` and `/trip cancel` now check for existing trips using the unique emoji
- Trip embed headers
- Trip message reactions are now ignored if by a bot

## 0.3.0 — 2021-09-22

### Added

- `/trip reschedule` functionality
- `/trip cancel` functionality
- A full README and changelog

### Changed

- `/trip add` now checks for existing trips using the unique emoji before adding
- New logo! ✨

### Fixed

- Reactions are now ignored on non-trip messages

## 0.2.0 — 2021-09-20

### Changed

- Moved to slash commands

### Removed

- Obsolete commands
- `messageCreate` listener — no longer responds to `r.` commands

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
