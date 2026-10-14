# Resume sources

| Source file          | Generates                     | Command                 |
| -------------------- | ----------------------------- | ----------------------- |
| `simple-resume.html` | `public/Deepanshu_Saini_V1.pdf`  | `npm run resume:simple` |
| `fancy-resume.html`  | `public/Deepanshu_Saini_V2.pdf`     | `npm run resume:fancy`  |

`npm run resume` builds both.

## Updating a resume

1. Edit the HTML file. Open it in Chrome to preview while you edit.
2. Run the command from the table above (be online so the fancy resume's Google Fonts load).
3. Open the generated PDF and check it, then commit and push.

Notes:
- **Simple** flows onto as many A4 pages as it needs, and never splits a bullet or education entry across pages.
- **Fancy** is two fixed A4 sheets. If you add content, check that nothing is cut off at the bottom of a page —
  move a sidebar block between pages or trim text if it is.
- The build uses your installed Chrome (or Edge). Set `CHROME_PATH` if it can't be found.
