// Canvas dimensions (4x6 at 300dpi)
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1800;
const PORTRAIT_SLOT = { width: 600, height: 900 };
const LANDSCAPE_SLOT = { width: 1200, height: 900 };

// State
let portraits = [];
let landscapes = [];
let generatedGrids = { portrait: [], landscape: [] };

// DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const stats = document.getElementById('stats');
const warning = document.getElementById('warning');
const actions = document.getElementById('actions');
const previewSection = document.getElementById('preview-section');
const downloadActions = document.getElementById('download-actions');
const portraitPreview = document.getElementById('portrait-preview');
const landscapePreview = document.getElementById('landscape-preview');

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
    portraits = [];
    landscapes = [];

    for (const file of files) {
        const img = await loadImage(file);
        if (img.height >= img.width) {
            portraits.push(img);
        } else {
            landscapes.push(img);
        }
    }

    updateStats();
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

function updateStats() {
    const portraitGrids = Math.ceil(portraits.length / 4);
    const landscapeGrids = Math.ceil(landscapes.length / 2);
    const totalGrids = portraitGrids + landscapeGrids;

    document.getElementById('portrait-count').textContent = portraits.length;
    document.getElementById('landscape-count').textContent = landscapes.length;
    document.getElementById('grid-count').textContent = totalGrids;

    stats.classList.remove('hidden');
    actions.classList.remove('hidden');

    // Check for uneven grids
    const warnings = [];
    const portraitRemainder = portraits.length % 4;
    const landscapeRemainder = landscapes.length % 2;

    if (portraitRemainder > 0) {
        const needed = 4 - portraitRemainder;
        warnings.push(`Portraits: add ${needed} more for even grids of 4 (or ${portraitRemainder} slot${portraitRemainder > 1 ? 's' : ''} will be empty)`);
    }
    if (landscapeRemainder > 0) {
        warnings.push('Landscapes: add 1 more for even grids of 2 (or 1 slot will be empty)');
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

function generateGrids() {
    generatedGrids = { portrait: [], landscape: [] };
    portraitPreview.innerHTML = '';
    landscapePreview.innerHTML = '';

    // Portrait grids (2x2)
    const portraitPositions = [
        { x: 0, y: 0 },
        { x: 600, y: 0 },
        { x: 0, y: 900 },
        { x: 600, y: 900 }
    ];

    for (let i = 0; i < portraits.length; i += 4) {
        const batch = portraits.slice(i, i + 4);
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        batch.forEach((img, j) => {
            const resized = resizeToFill(img, PORTRAIT_SLOT.width, PORTRAIT_SLOT.height);
            ctx.drawImage(resized, portraitPositions[j].x, portraitPositions[j].y);
        });

        generatedGrids.portrait.push(canvas);
        portraitPreview.appendChild(canvas.cloneNode(true));
        const previewCanvas = portraitPreview.lastChild;
        previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
    }

    // Landscape grids (2x1)
    const landscapePositions = [
        { x: 0, y: 0 },
        { x: 0, y: 900 }
    ];

    for (let i = 0; i < landscapes.length; i += 2) {
        const batch = landscapes.slice(i, i + 2);
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        batch.forEach((img, j) => {
            const resized = resizeToFill(img, LANDSCAPE_SLOT.width, LANDSCAPE_SLOT.height);
            ctx.drawImage(resized, landscapePositions[j].x, landscapePositions[j].y);
        });

        generatedGrids.landscape.push(canvas);
        landscapePreview.appendChild(canvas.cloneNode(true));
        const previewCanvas = landscapePreview.lastChild;
        previewCanvas.getContext('2d').drawImage(canvas, 0, 0);
    }

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
    portraits = [];
    landscapes = [];
    generatedGrids = { portrait: [], landscape: [] };
    fileInput.value = '';
    portraitPreview.innerHTML = '';
    landscapePreview.innerHTML = '';
    stats.classList.add('hidden');
    warning.classList.add('hidden');
    actions.classList.add('hidden');
    previewSection.classList.add('hidden');
    downloadActions.classList.add('hidden');
}
