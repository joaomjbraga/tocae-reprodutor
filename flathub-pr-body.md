Tocaê Reprodutor is a minimalist video player for the desktop, built with Electron, React and TypeScript. It opens a video and plays it in sequence, with a playlist that can be reordered by dragging or with the keyboard. The interface speaks Portuguese (Brazil) and English, following the operating system language on first run.

### Please confirm your submission meets all the criteria

- [X] Please describe the application briefly. Tocaê Reprodutor is a minimalist video player for the desktop. It opens a video and plays it without fuss: the controls fade out during playback and come back as soon as you move the mouse. A playlist on the right holds the queue, and items can be reordered by dragging them or with `Alt+↑` / `Alt+↓`. The interface is available in Portuguese (Brazil) and English; the language follows the operating system on first run and can be changed at any time from the selector in the top bar.
- [X] Please attach a video showcasing the application on Linux using the Flatpak. https://github.com/joaomjbraga/tocae-reprodutor/releases/download/v0.0.3/tocae-reprodutor.mp4
- [X] The Flatpak ID follows all the rules listed in the [Application ID requirements][appid].
- [X] I have read and followed all the [Submission requirements][reqs] and the [Submission guide][reqs2] and I agree to them.
  - [X] The application has a meaningful development history, evidence of real-world use, and a clear commitment to ongoing maintenance, as required by the [development history requirements][history].
  - [X] I have disclosed any AI-generated material included in the application or its Flathub packaging, as required by the [Generative AI policy][ai]. **Affected parts and approximate extent:** the Flatpak manifest (`io.github.joaomjbraga.tocae-reprodutor.yaml`), the AppStream metadata file (`io.github.joaomjbraga.tocae-reprodutor.metainfo.xml`), the desktop file, and the internationalisation of the application (the text catalogues under `shared/i18n/` and the UI wiring in `src/i18n/` and `src/components/LanguageSwitcher.tsx`). The rest of the application — the player, the playlist, the media protocol and the packaging pipeline — was written without AI assistance.
  - [ ] I have not used AI tools or agents to generate or automate this submission pull request or its review interactions.
- [X] I am the author/developer/upstream contributor to the project. **Link:** https://github.com/joaomjbraga/tocae-reprodutor

### Notes for the reviewers

**Permissions.** The manifest requests `--filesystem=host:ro`. The player reads the video files through their real path, using a custom `media://` protocol, so that a file stays playable after being opened. The application never writes outside its own data directory (`~/.var/app/io.github.joaomjbraga.tocae-reprodutor`), so read-only access is enough. An exception for `finish-args-host-ro-filesystem-access` is requested separately.

No network access is requested: the application is entirely offline.

**Build.** The application source is taken from the upstream repository at the `v0.0.3` tag. The Electron runtime comes from `org.electronjs.Electron2.BaseApp`, which provides zypak, so the Chromium sandbox runs inside the Flatpak sandbox instead of requiring a setuid helper. Node.js comes from the `org.freedesktop.Sdk.Extension.node24` SDK extension, and the npm dependencies are vendored as build sources by `generated-sources.json`, so the build needs no network access.

**AI assistance.** See the disclosure in the checklist above.

<!-- ⚠️⚠️  Please DO NOT modify anything below this line ⚠️⚠️  -->

[appid]: https://docs.flathub.org/docs/for-app-authors/requirements#application-id
[reqs]: https://docs.flathub.org/docs/for-app-authors/requirements
[reqs2]: https://docs.flathub.org/docs/for-app-authors/submission
[history]: https://docs.flathub.org/docs/for-app-authors/requirements#insufficient-development-history
[ai]: https://docs.flathub.org/docs/for-app-authors/requirements#generative-ai-policy
