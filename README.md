# BASS

BASS is a browser-based armour set search tool for Monster Hunter. The current version supports Monster Hunter Freedom Unite.

## Browser Support

The v1 browser baseline is:

- Chromium-based browsers 114 or later, including Android System WebView 114 or later.
- Firefox 128 or later.
- Safari 17 or later on macOS, iOS, and iPadOS.

These minimums cover the application's runtime feature requirements and match the JavaScript build targets in `nuxt.config.ts`. Older browsers are not supported. Minimum-version browser testing is required before the v1 release.

## V1 Limitations

V1 is a browser application, not an installable Progressive Web App. It does not include a service worker or guarantee offline operation. PWA installation and offline support are planned for a later release after the initial browser release has received user feedback.

V1 is intended for direct distribution and instructs search engines not to index it. Search discoverability can be reconsidered alongside a prerendered or server-rendered public landing page.

## Licensing and Legal

Original source code and project documentation are available under the [MIT License](LICENSE).

BASS is an unofficial, non-commercial fan project and is not affiliated with or endorsed by CAPCOM. The current interface includes game-derived reference artwork that is excluded from the project's MIT License and is planned to be replaced with original SVGs. See [NOTICE.md](NOTICE.md) for asset provenance, third-party icon licenses, and the complete fan-project notice.
