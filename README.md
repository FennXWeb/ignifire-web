# Ignifire for Web

This directory is the production static web player for `https://ignifire.app`.

The `main` branch is automatically synchronized from the `web-player/` directory on the full Ignifire app's `beta` branch. The scheduled workflow checks every 15 minutes and can also be run manually from GitHub Actions. Repository-specific deployment files are preserved during synchronization.

It intentionally includes only:

- mandatory Ignifire account sign-in;
- read-only Home, Albums, Songs, and Playlists views;
- library search;
- authenticated streaming from Ignifire cloud storage;
- basic play, pause, previous, next, shuffle, repeat, seek, and volume controls;
- a stable Windows download button and account-settings link.

It intentionally excludes imports, library editing, Shelf Mode, Suno and AI tools, advanced customization, cloud mutations, and beta-channel switching.

## Deployment order

1. Redeploy the matching `Ignifire-Cloud-Server-<version>.zip` to `accounts.ignifire.app`.
2. Add `PUBLIC_WEB_URL=https://ignifire.app` to that Node app's environment variables and use **Settings and redeploy**.
3. Confirm `https://accounts.ignifire.app/health` returns an object with `"ok": true`.
4. In Hostinger, add `ignifire.app` as a new static/custom HTML website.
5. Upload the contents of `Ignifire-Web-<version>.zip` to the website root. `index.html` must be at the root, not inside an extra directory.
6. Connect the `ignifire.app` domain and wait for Hostinger's SSL certificate to become active.
7. Visit `https://ignifire.app`, sign in, and verify that a synced cloud track plays and can seek.

The account and web origins are hard-coded to their production HTTPS domains. Do not publish this build at a different origin without updating the account-service allowlist and the web player's Content Security Policy.

## Hostinger Git deployment

Connect this public repository's `main` branch to the `ignifire.app` website in Hostinger. Use `npm run build` as the build command and `dist` as the output directory. Hostinger will then redeploy when the synchronization workflow pushes an updated web player to `main`.
