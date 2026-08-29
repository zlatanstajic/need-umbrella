# Contributing

Contributions are welcome. To propose a change:

1. **Open an issue, fork, and branch.** Open or identify the issue for the
   change, fork the repository, then create a branch off `master`. Every
   contribution branch must use the `issues/` prefix; use
   `issues/<issue-number>-<short-description>`, all lowercase kebab-case (for
   example, `issues/12-fix-location-search`). Do not use `feature/`, `fix/`, or
   other branch prefixes.
2. **Edit the source files.** Application logic belongs in [`src/`](src/),
   markup in [`index.html`](index.html), and styles in
   [`assets/css/style.css`](assets/css/style.css). Never edit the generated
   [`assets/js/app.js`](assets/js/app.js) bundle by hand. Tests belong in
   [`tests/`](tests/) as `*.test.ts` files.
3. **Match the conventions.** Keep TypeScript strict and follow the existing
   module style (`var`, function declarations, string concatenation, and no
   template literals inside module bodies). Add every user-facing string to
   both the Serbian Latin and English bundles in
   [`src/strings.ts`](src/strings.ts). Reuse existing CSS custom properties,
   and use DOM methods rather than `innerHTML` when building UI. See
   [`CLAUDE.md`](CLAUDE.md) for the full architecture and conventions.
4. **Rebuild generated assets.** After changing TypeScript, run
   `npm run build` and include the regenerated `assets/js/app.js`. If the
   social-preview image changes, update
   [`scripts/gen-og-image.py`](scripts/gen-og-image.py), regenerate the image,
   and include the resulting `assets/img/og-image.png`.
5. **Test before submitting.** Run the same checks used by CI:

   ```bash
   npm ci
   npm run typecheck
   npm run test:coverage
   npm run build
   ```

   Then serve the app with `python3 -m http.server 8000` and exercise the
   affected behavior in a browser. For UI changes, check both languages,
   responsive layouts, persistence after reload, and the browser console.
6. **Open a pull request.** Push the `issues/` branch and open a PR against
   `master`. Keep the PR focused, link the issue (for example, `Fixes #123`),
   explain what changed and why, list the checks you ran, and include
   screenshots for visible UI changes.

By contributing, you agree that your contribution will be licensed under the
repository's [MIT License](LICENSE.md). Be respectful in issues and pull
requests.
