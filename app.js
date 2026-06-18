// Paper size presets (all at 300dpi). Slot sizes stay 600x900 (portrait)
// and 1200x900 (landscape) so photos keep the same crop proportions
// regardless of paper size; only the grid dimensions and margins change.
const PAPER_SIZES = {
    '4x6': {
        canvasWidth: 1200,
        canvasHeight: 1800,
        portrait: { slot: { width: 600, height: 900 }, cols: 2, rows: 2 },
        landscape: { slot: { width: 1200, height: 900 }, cols: 1, rows: 2 }
    },
    letter: {
        canvasWidth: 2550,
        canvasHeight: 3300,
        portrait: { slot: { width: 600, height: 900 }, cols: 4, rows: 3 },
        landscape: { slot: { width: 1200, height: 900 }, cols: 2, rows: 3 }
    }
};

// State
let fileEntries = []; // { id, name, img, orientation }
let nextId = 0;
let generatedGrids = { portrait: [], landscape: [] };

// DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const stats = document.getElementById('stats');
const warning = document.getElementById('warning');
const actions = document.getElementById('actions');
const previewSection = document.getElementById('preview-section');
const downloadActions = document.getElementById('download-actions');
const fileList = document.getElementById('file-list');
const fileListBody = document.getElementById('file-list-body');
const portraitPreview = document.getElementById('portrait-preview');
const landscapePreview = document.getElementById('landscape-preview');
const portraitPreviewTitle = document.getElementById('portrait-preview-title');
const landscapePreviewTitle = document.getElementById('landscape-preview-title');
const paperSizeInputs = document.querySelectorAll('input[name="paper-size"]');

function getPaperSize() {
    const checked = document.querySelector('input[name="paper-size"]:checked');
    return PAPER_SIZES[checked ? checked.value : '4x6'];
}

// Event listeners
if (!dropZone || !fileInput) {
    console.error('Required DOM elements are missing.');
}
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
document.getElementById('generate-btn').addEventListener('click', generateGrids);
document.getElementById('clear-btn').addEventListener('click', clearAll);
document.getElementById('download-btn').addEventListener('click', downloadZip);
paperSizeInputs.forEach(input => input.addEventListener('change', () => {
    if (fileEntries.length > 0) {
        updateStats();
    }
}));

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

async function processFiles(files) {
    for (const file of files) {
        const img = await loadImage(file);
        const orientation = img.height >= img.width ? 'portrait' : 'landscape';
        const thumb = createThumbnail(img, 40);
        fileEntries.push({ id: nextId++, name: file.name, img, orientation, thumb });
    }

    renderFileList();
    updateStats();
}

function createThumbnail(img, maxSize) {
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.7);
}

function removeFile(id) {
    fileEntries = fileEntries.filter(e => e.id !== id);
    renderFileList();
    if (fileEntries.length === 0) {
        fileList.classList.add('hidden');
        stats.classList.add('hidden');
        warning.classList.add('hidden');
        actions.classList.add('hidden');
        previewSection.classList.add('hidden');
        downloadActions.classList.add('hidden');
    } else {
        updateStats();
    }
}

function renderFileList() {
    fileListBody.innerHTML = '';
    if (fileEntries.length === 0) {
        fileList.classList.add('hidden');
        return;
    }
    fileList.classList.remove('hidden');
    fileEntries.forEach(entry => {
        const tr = document.createElement('tr');
        const badgeClass = entry.orientation === 'portrait' ? 'portrait' : 'landscape';
        const label = entry.orientation === 'portrait' ? 'Portrait' : 'Landscape';
        tr.innerHTML = `
            <td><img class="file-thumb" src="${entry.thumb}" alt=""> ${escapeHtml(entry.name)}</td>
            <td><span class="orientation-badge ${badgeClass}">${label}</span></td>
            <td><button class="remove-btn" title="Remove">✕</button></td>
        `;
        tr.querySelector('.remove-btn').addEventListener('click', () => removeFile(entry.id));
        fileListBody.appendChild(tr);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function getPortraits() {
    return fileEntries.filter(e => e.orientation === 'portrait').map(e => e.img);
}

function getLandscapes() {
    return fileEntries.filter(e => e.orientation === 'landscape').map(e => e.img);
}

function updateStats() {
    const paperSize = getPaperSize();
    const portraitsPerGrid = paperSize.portrait.cols * paperSize.portrait.rows;
    const landscapesPerGrid = paperSize.landscape.cols * paperSize.landscape.rows;

    const portraits = getPortraits();
    const landscapes = getLandscapes();
    const portraitGrids = Math.ceil(portraits.length / portraitsPerGrid);
    const landscapeGrids = Math.ceil(landscapes.length / landscapesPerGrid);
    const totalGrids = portraitGrids + landscapeGrids;

    document.getElementById('portrait-count').textContent = portraits.length;
    document.getElementById('landscape-count').textContent = landscapes.length;
    document.getElementById('grid-count').textContent = totalGrids;

    stats.classList.remove('hidden');
    actions.classList.remove('hidden');

    // Check for uneven grids
    const warnings = [];
    const portraitRemainder = portraits.length % portraitsPerGrid;
    const landscapeRemainder = landscapes.length % landscapesPerGrid;

    if (portraitRemainder > 0) {
        const needed = portraitsPerGrid - portraitRemainder;
        warnings.push(`Portraits: add ${needed} more for even grids of ${portraitsPerGrid} (or ${portraitRemainder} slot${portraitRemainder > 1 ? 's' : ''} will be empty)`);
    }
    if (landscapeRemainder > 0) {
        const needed = landscapesPerGrid - landscapeRemainder;
        warnings.push(`Landscapes: add ${needed} more for even grids of ${landscapesPerGrid} (or ${landscapeRemainder} slot${landscapeRemainder > 1 ? 's' : ''} will be empty)`);
    }

    if (warnings.length > 0) {
        warning.innerHTML = '⚠️ ' + warnings.join('<br>⚠️ ');
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

function resizeToFill(img, targetWidth, targetHeight) {
    const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
    const newWidth = img.width * scale;
    const newHeight = img.height * scale;
    const offsetX = (newWidth - targetWidth) / 2;
    const offsetY = (newHeight - targetHeight) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, -offsetX, -offsetY, newWidth, newHeight);
    return canvas;
}

// Builds the (x, y) top-left position of each slot in a grid, centering
// the grid on the canvas when the slots don't fill it exactly.
function buildSlotPositions(canvasWidth, canvasHeight, slot, cols, rows) {
    const marginX = (canvasWidth - slot.width * cols) / 2;
    const marginY = (canvasHeight - slot.height * rows) / 2;
    const positions = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions.push({
                x: marginX + col * slot.width,
                y: marginY + row * slot.height
            });
        }
    }
    return positions;
}

function buildGrids(images, canvasWidth, canvasHeight, slot, positions, preview) {
    const grids = [];
    const perGrid = positions.length;

    for (let i = 0; i < images.length; i += perGrid) {
        const batch = images.slice(i, i + perGrid);
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        batch.forEach((img, j) => {
            const resized = resizeToFill(img, slot.width, slot.height);
            ctx.drawImage(resized, positions[j].x, positions[j].y);
        });

        grids.push(canvas);
        preview.appendChild(canvas.cloneNode(true));
        const previewCanvas = preview.lastChild;
        previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
    }

    return grids;
}

function generateGrids() {
    const paperSize = getPaperSize();
    const portraits = getPortraits();
    const landscapes = getLandscapes();
    generatedGrids = { portrait: [], landscape: [] };
    portraitPreview.innerHTML = '';
    landscapePreview.innerHTML = '';

    const portraitPositions = buildSlotPositions(
        paperSize.canvasWidth, paperSize.canvasHeight,
        paperSize.portrait.slot, paperSize.portrait.cols, paperSize.portrait.rows
    );
    portraitPreviewTitle.textContent = `Portrait Grids (${paperSize.portrait.cols}×${paperSize.portrait.rows})`;
    generatedGrids.portrait = buildGrids(
        portraits, paperSize.canvasWidth, paperSize.canvasHeight,
        paperSize.portrait.slot, portraitPositions, portraitPreview
    );

    const landscapePositions = buildSlotPositions(
        paperSize.canvasWidth, paperSize.canvasHeight,
        paperSize.landscape.slot, paperSize.landscape.cols, paperSize.landscape.rows
    );
    landscapePreviewTitle.textContent = `Landscape Grids (${paperSize.landscape.cols}×${paperSize.landscape.rows})`;
    generatedGrids.landscape = buildGrids(
        landscapes, paperSize.canvasWidth, paperSize.canvasHeight,
        paperSize.landscape.slot, landscapePositions, landscapePreview
    );

    previewSection.classList.remove('hidden');
    downloadActions.classList.remove('hidden');
}

async function downloadZip() {
    const zip = new JSZip();

    generatedGrids.portrait.forEach((canvas, i) => {
        const data = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
        zip.file(`portrait_grid_${String(i + 1).padStart(2, '0')}.jpg`, data, { base64: true });
    });

    generatedGrids.landscape.forEach((canvas, i) => {
        const data = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
        zip.file(`landscape_grid_${String(i + 1).padStart(2, '0')}.jpg`, data, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo_grids.zip';
    a.click();
    URL.revokeObjectURL(url);
}

function clearAll() {
    fileEntries = [];
    nextId = 0;
    generatedGrids = { portrait: [], landscape: [] };
    fileInput.value = '';
    fileListBody.innerHTML = '';
    portraitPreview.innerHTML = '';
    landscapePreview.innerHTML = '';
    fileList.classList.add('hidden');
    stats.classList.add('hidden');
    warning.classList.add('hidden');
    actions.classList.add('hidden');
    previewSection.classList.add('hidden');
    downloadActions.classList.add('hidden');
}
