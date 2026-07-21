# BASS

BASS is a browser-based armour set search tool for the Monster Hunter games. The current version supports Monster Hunter Freedom Unite.

## Games

Currently, only Monster Hunter Freedom Unite (Portable 2nd G) is supported. It is planned to expand to Freedom and Freedom 2.

## Planned Features

- [ ] A set building mode, where a user can build a set manually
- [ ] Search limits to help facilitate handicapped builds (e.g., max rarity, certain pieces)
- [ ] More control over sorting the results (by free slots, etc)
- [ ] Result filtering to ignore certain monsters / hard to acquire resources
- [ ] PWA

## Contributing

This version of BASS supports localisation and translations. Currently only English is supported, but if you speak another language you can get involved and help out by providing translations for the application and the game data.

## Development

BASS has been built with `bun`, and it is recommended to use `bun` for development purposes, rather than trying to use `node` or another runtime.
Clone the repository, install the dependencies, and then run the development server;

```sh
git clone https://github.com/Delph/bass.git
cd bass
bun install
bun run dev
```

A test suite is included (`bun run test`), and there is some early work on a profiling system for optimising the search algorithm (`bun run profile`).

Pull request titles should follow Conventional Commit syntax because the release process uses Release Please. Individual commits on a branch do not need to follow this convention when the pull request is squash merged.

## Licensing and Legal

Original source code and project documentation are available under the [MIT License](LICENSE).

BASS is an unofficial, non-commercial fan project and is not affiliated with or endorsed by CAPCOM. The current interface includes game-derived reference artwork that is excluded from the project's MIT License and is planned to be replaced with original SVGs. See [NOTICE.md](NOTICE.md) for asset provenance and the complete fan-project notice. Software license information is generated with the production client bundle.
