# Photo Grid Maker

Create print-ready photo grids in your browser for **4×6** or **Letter (8.5×11)** paper.

**4×6 paper:**
- **Portrait photos** → **2×2** grids (4 photos per sheet)
- **Landscape photos** → **2×1** stacks (2 photos per sheet)

**Letter paper (8.5×11):**
- **Portrait photos** → **4×3** grids (12 photos per sheet)
- **Landscape photos** → **2×3** stacks (6 photos per sheet)

Export everything as a single **ZIP** containing high-quality JPGs

This is a lightweight, static project: everything lives in `index.html`.

## About this project and where it is used.
Every month I gather about 40 images and I print them with a [Liene Photo Printer](https://amzn.to/3M8dACE).
I add the photos to our family album/journal. This album serves to keeps memories of our year as a family and also generates gratitude. To save money on the photopaper, I put these images in a grid layout so I can print multiple images on one sheet. When creating these grids, I spent a lot of time on Canva or Figma sorting out portrait and landscape images in a grid. Trying to find the most optimum way to utilize photo paper. It cost me in time, though.

Here's a shot of our photo album.

![Image of Album](album-example.png)

I utilized my development experience to create this tool built in pure JavaScript. It has been one of the best things I have ever built. ✨
You can see it working on my website: [magaliechetrit.com/photo-grid-maker](https://magaliechetrit.com/photo-grid-maker).

## Features

- Drag & drop or file picker upload
- Automatically sorts photos into portrait vs landscape
- Choose paper size: **4×6** or **Letter (8.5×11)** — toggle before generating
- Generates print-ready canvases at **300 DPI**
- One-click ZIP download (via JSZip)
- On-screen preview before download
- Helpful warnings when the number of photos doesn’t evenly fill a grid

## How it works

Each output image is rendered to a canvas at 300 DPI. Photo slot sizes stay the same across paper sizes — only the number of slots per sheet changes.

| Paper | Canvas (px) | Portrait grid | Landscape grid |
|-------|-------------|---------------|----------------|
| 4×6 | 1200 × 1800 | 2×2 (4 photos) | 1×2 (2 photos) |
| Letter 8.5×11 | 2550 × 3300 | 4×3 (12 photos) | 2×3 (6 photos) |

- Portrait slot size: **600 × 900** pixels
- Landscape slot size: **1200 × 900** pixels
- On Letter paper, slots are centered with equal margins on all sides
- Images are resized using a **”cover”** strategy (cropped to fill the slot)

## Run locally

Because this is a single HTML file, you can open it directly in a browser. For best results (and more consistent behavior across browsers), run a tiny local server.

### Option A: Python

```bash
cd photo-grid-maker
python3 -m http.server 8000
```

Then open:

- http://localhost:8000

### Option B: Node

```bash
npx serve .
```

## Usage

1. Open the app in your browser.
2. Select your paper size: **4×6** or **Letter 8.5×11**.
3. Drag & drop photos onto the drop zone (or click to browse).
4. Review the counts and any warnings.
5. Click **Generate Grids**.
6. Click **Download All (ZIP)**.

The ZIP will contain files like:

- `portrait_grid_01.jpg`, `portrait_grid_02.jpg`, …
- `landscape_grid_01.jpg`, `landscape_grid_02.jpg`, …

## Tips

- If you see a warning about “empty slots”, add more photos to fill the last grid evenly.
- Since the app uses a fill-and-crop approach, keep important subjects away from the edges if you want to avoid accidental cropping.

## Project structure

- `index.html` — markup and UI controls
- `app.js` — all grid generation logic
- `styles.css` — styles
- `sample-photos/` — example images to test with

## Dependencies

- [JSZip](https://stuk.github.io/jszip/) (loaded from a CDN) — used to create the downloadable ZIP

## Privacy

All processing happens locally in your browser.

- Photos are not uploaded to a server.
- Output is generated in-memory and downloaded directly.

## Future Features
- Detect duplicate files and offer to remove them
- Date-based naming (e.g., january_2025_portrait_01.jpg) for files and folders
- Option to choose grid size (4 or 6 portraits per page)
- Option for 5×7 photo size
- Button to generate and download the photo grid as a PDF

## License
No license. Feel free to use, misue and abuse it.
