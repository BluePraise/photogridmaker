# Photo Grid Maker

Create print-ready **4×6** photo grids in your browser.

- **Portrait photos** → arranged into **2×2** grids (4 photos per sheet)
- **Landscape photos** → arranged into **2×1** stacks (2 photos per sheet)
- Export everything as a single **ZIP** containing high-quality JPGs

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
- Generates print-ready canvases sized for **4×6 at 300 DPI**
- One-click ZIP download (via JSZip)
- On-screen preview before download
- Helpful warnings when the number of photos doesn’t evenly fill a grid

## How it works

Each output image is rendered to a canvas:

- Canvas size: **1200 × 1800** pixels (4×6 inches at 300 DPI)
- Portrait slot size: **600 × 900** pixels
- Landscape slot size: **1200 × 900** pixels
- Images are resized using a **“cover”** strategy (cropped to fill the slot)

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
2. Drag & drop photos onto the drop zone (or click to browse).
3. Review the counts and any warnings.
4. Click **Generate Grids**.
5. Click **Download All (ZIP)**.

The ZIP will contain files like:

- `portrait_grid_01.jpg`, `portrait_grid_02.jpg`, …
- `landscape_grid_01.jpg`, `landscape_grid_02.jpg`, …

## Tips

- If you see a warning about “empty slots”, add more photos to fill the last grid evenly.
- Since the app uses a fill-and-crop approach, keep important subjects away from the edges if you want to avoid accidental cropping.

## Project structure

- `index.html` — UI + all logic (no build step)
- `sample-photos/` — example images to test with

## Dependencies

- [JSZip](https://stuk.github.io/jszip/) (loaded from a CDN) — used to create the downloadable ZIP

## Privacy

All processing happens locally in your browser.

- Photos are not uploaded to a server.
- Output is generated in-memory and downloaded directly.

## Future Features
- Date-based naming (e.g., january_2025_portrait_01.jpg)
- Option to choose grid size (4 or 6 portraits per page)
- Option for bigger photo size, 5x7
- A list of file names
    - Detect duplicate files
    - Option to remove duplicates/files from list
- Button to generate and download the photo grid as a PDF
- Styling for a clean, user-friendly interface

## License
No license. Feel free to use, misue and abuse it.
