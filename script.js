// Constants
const CREDIT_CARD_HEIGHT_MM = 53.98;
const RULER_REFERENCE_MM = 50; // 5cm reference

// State
let calibratedPixelsPerMM = 0;
let currentCalibrationType = null;

// DOM Elements
const cardCalibration = document.getElementById('cardCalibration');
const rulerCalibration = document.getElementById('rulerCalibration');
const ringSizer = document.getElementById('ringSizer');
const toggleButtons = document.querySelectorAll('.toggle-btn');

// Calibration elements
const cardSizeSlider = document.getElementById('cardSizeSlider');
const rulerSizeSlider = document.getElementById('rulerSizeSlider');
const cardGuide = document.querySelector('.card-guide');
const ruler = document.querySelector('.ruler');

// Ring sizer elements
const ring = document.querySelector('.ring');
const sizeSlider = document.getElementById('sizeSlider');
const sizeLabel = document.querySelector('.size-label');
const sizeValue = document.querySelector('.size-value');
const decreaseBtn = document.getElementById('decreaseSize');
const increaseBtn = document.getElementById('increaseSize');
const recalibrateBtn = document.getElementById('recalibrate');

// Helper Functions
function getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
}

function setCalibratedPixelsPerMM(pixels, referenceSize, type) {
    calibratedPixelsPerMM = pixels / referenceSize;
    currentCalibrationType = type;
    localStorage.setItem('calibratedPixelsPerMM', calibratedPixelsPerMM.toString());
    localStorage.setItem('calibrationType', type);
}

function calculatePixelsPerMM() {
    const stored = localStorage.getItem('calibratedPixelsPerMM');
    const storedType = localStorage.getItem('calibrationType');

    if (stored && storedType) {
        const value = parseFloat(stored);
        if (!isNaN(value) && value > 0) {
            calibratedPixelsPerMM = value;
            currentCalibrationType = storedType;
            return value;
        }
    }
    return 0;
}

function mmToPixels(mm) {
    const ppmm = calculatePixelsPerMM();
    if (!ppmm) {
        throw new Error('Device not calibrated');
    }
    return mm * ppmm;
}

// UI Functions
function showSection(section) {
    [cardCalibration, rulerCalibration, ringSizer].forEach(s => {
        s.classList.add('hidden');
    });
    section.classList.remove('hidden');
}

function updateCardGuide(height) {
    cardGuide.style.height = `${height}px`;
    const display = cardGuide.closest('.calibration-content').querySelector('.size-display');
    display.textContent = `Height: ${height}px`;
}

function updateRuler(width) {
    ruler.style.width = `${width}px`;
    const display = ruler.closest('.calibration-content').querySelector('.size-display');
    display.textContent = `Width: ${width}px`;

    // Clear existing marks
    ruler.innerHTML = '';

    // Add ruler markings
    for (let i = 0; i <= 50; i++) {
        const mark = document.createElement('div');
        mark.style.position = 'absolute';
        mark.style.left = `${(i / 50) * 100}%`;
        mark.style.width = '1px';
        mark.style.backgroundColor = 'black';
        
        if (i % 10 === 0) {
            mark.style.height = '100%';
            const label = document.createElement('span');
            label.style.position = 'absolute';
            label.style.bottom = '-20px';
            label.style.left = '50%';
            label.style.transform = 'translateX(-50%)';
            label.style.fontSize = '12px';
            label.textContent = `${i / 10 * 5}cm`;
            mark.appendChild(label);
        } else if (i % 5 === 0) {
            mark.style.height = '75%';
        } else {
            mark.style.height = '50%';
        }
        
        ruler.appendChild(mark);
    }
}

function updateRingSize(size) {
    try {
        const diameter = mmToPixels(size);
        ring.style.width = `${diameter}px`;
        ring.style.height = `${diameter}px`;
        sizeLabel.textContent = `${size.toFixed(1)} mm`;
        sizeValue.textContent = `${size.toFixed(1)} mm`;
        sizeSlider.value = size;
    } catch (e) {
        showSection(cardCalibration);
    }
}

// Event Listeners
toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
        toggleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const method = button.dataset.method;
        if (method === 'card') {
            showSection(cardCalibration);
        } else {
            showSection(rulerCalibration);
        }
    });
});

cardSizeSlider.addEventListener('input', (e) => {
    updateCardGuide(e.target.value);
});

rulerSizeSlider.addEventListener('input', (e) => {
    updateRuler(e.target.value);
});

document.getElementById('confirmCardCalibration').addEventListener('click', () => {
    setCalibratedPixelsPerMM(parseFloat(cardSizeSlider.value), CREDIT_CARD_HEIGHT_MM, 'card');
    showSection(ringSizer);
    updateRingSize(15); // Initial size
});

document.getElementById('confirmRulerCalibration').addEventListener('click', () => {
    setCalibratedPixelsPerMM(parseFloat(rulerSizeSlider.value), RULER_REFERENCE_MM, 'ruler');
    showSection(ringSizer);
    updateRingSize(15); // Initial size
});

sizeSlider.addEventListener('input', (e) => {
    updateRingSize(parseFloat(e.target.value));
});

decreaseBtn.addEventListener('click', () => {
    const currentSize = parseFloat(sizeSlider.value);
    updateRingSize(Math.max(10, currentSize - 0.1));
});

increaseBtn.addEventListener('click', () => {
    const currentSize = parseFloat(sizeSlider.value);
    updateRingSize(Math.min(30, currentSize + 0.1));
});

recalibrateBtn.addEventListener('click', () => {
    showSection(cardCalibration);
});

// Initialize
window.addEventListener('load', () => {
    const ppmm = calculatePixelsPerMM();
    if (ppmm > 0) {
        showSection(ringSizer);
        updateRingSize(15);
    } else {
        showSection(cardCalibration);
    }
    
    // Initial updates
    updateCardGuide(cardSizeSlider.value);
    updateRuler(rulerSizeSlider.value);
});
