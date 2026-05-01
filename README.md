# Trained Response landing page

Files included:
- `index.html`
- `styles.css`
- `success.html`
- `mascot.png`
- `netlify/functions/news-ticker.js`

## Deploy to Netlify
1. In Netlify, open your site dashboard.
2. Drag and drop all files in this folder into the deploy area, or connect a Git repo and upload them there.
3. Make sure your custom domain is added:
   - `trainedresponse.com`
   - `www.trainedresponse.com`
4. In CheapNames DNS:
   - A record: `@` -> `75.2.60.5`
   - CNAME: `www` -> `fluffy-truffle-cefe4d.netlify.app`
5. Netlify form submissions are enabled on the waitlist form.
6. The news ticker uses a Netlify Function and refreshes headlines every 15 minutes.
7. After deploy, test:
   - `/`
   - `/success.html`
   - `/.netlify/functions/news-ticker`

## Editing copy
Open `index.html` and update:
- headline
- feature copy
- form labels
- footer copy

## Editing design
Open `styles.css` and update:
- `--red` for brand red
- spacing, radii, and typography
