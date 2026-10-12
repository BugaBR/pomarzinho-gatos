# FARMCAT

A tiny pixel-art farm. Click the field to help the trees grow; their height stops at the final stage. A cat appears after a different, randomly chosen number of clicks each session. Every click plays a short synthesized cat meow.

## Run locally

Open `index.html` in a browser. No dependencies are required.

## Token contract address

Set `TOKEN_CA` near the top of `script.js` to the contract address you want to show in the popup. The field stays blank until an address is provided, and the Copy button becomes available when it is set.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the site whenever `main` is updated. Under **Settings → Pages**, keep **Build and deployment → Source** set to **GitHub Actions**.
