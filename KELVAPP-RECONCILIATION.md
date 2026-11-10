# deploy-studio: consolidated Kelvapp landing page

Review snapshot prepared 10 November 2026. This change does not authorize a production deployment.

- The root `index.html` is the consolidated app landing page.
- `_kelvapp/` contains the app's supporting pages and referenced shared assets.
- Relative URLs make this review copy work at a repository subpath. Canonical URLs remain on https://kelvapp.com/deploy-studio/.
- Other Kelvapp apps, shared policies and the portfolio homepage continue to link to Kelvapp.
- Existing repository files outside this payload are preserved, including legal pages and deep-link routes.

Preview this checkout with any static file server. Do not merge into a deployment branch until publication is approved. Existing public repositories may automatically publish GitHub Pages from `main`.

Validation: content text preserved from the consolidated candidate, all packaged local link/asset destinations resolve, and copied assets retain their original bytes. The web copy was checked against current public App Store descriptions. This is not a claim of exhaustive browser/device testing.
