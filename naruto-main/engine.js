// --- UTILITIES ---
const $ = (id) => document.getElementById(id);
const audio = {
    clone: $('sfx-clone'),
    chidori: $('sfx-chidori'),
    rasengan: $('sfx-rasenshuriken')
};

// --- CORE STATE ---
let engineState = {
    mode: 'none', // 'clones', 'chidori', 'rasengan'
    isTraining: false,
    isReady: false,
    trainedModel: null,
    trainingData: [],
    trainingRound: 1,
    jutsuActive: false,
    currentJutsu: null,
    mask: null,
    cloneStartTime: 0,
    captureProgress: 0,
    cameraStarted: false,
    dimmingActive: false
};

const CLONE_CONFIG = [
    { x: -550, y: 180, scale: 0.65, delay: 100, smokeSpawned: false },
    { x: 550, y: 180, scale: 0.65, delay: 200, smokeSpawned: false },
    { x: -400, y: 120, scale: 0.75, delay: 300, smokeSpawned: false },
    { x: 400, y: 120, scale: 0.75, delay: 400, smokeSpawned: false },
    { x: -250, y: 60, scale: 0.85, delay: 500, smokeSpawned: false },
    { x: 250, y: 60, scale: 0.85, delay: 600, smokeSpawned: false },
    { x: 0,    y: 200, scale: 0.55, delay: 700, smokeSpawned: false },
];

const SMOKE_FOLDERS = ["smoke_1", "smoke_2", "smoke_3"];
let activeSmokes = [];

// --- UI TRIGGERS ---
function showSelection() {
    document.body.classList.add('show-selection');
}

function initEngine(mode) {
    engineState.mode = mode;
    $('selection-screen').style.opacity = '0';
    $('selection-screen').style.pointerEvents = 'none';
    $('engine-ui').style.display = 'block';
    
    updateStatus(`MODE: ${mode.toUpperCase()}`, 'ready');
    
    if (!engineState.cameraStarted) {
        startCamera();
    }

    if (mode === 'clones' && !engineState.trainedModel) {
        showTrainer();
    }
}

function backToSelection() {
    clearActiveJutsu();
    $('engine-ui').style.display = 'none';
    $('selection-screen').style.opacity = '1';
    $('selection-screen').style.pointerEvents = 'auto';
    engineState.mode = 'none';
}

function updateStatus(text, state) {
    $('status-text').textContent = text;
    $('status-dot').style.background = state === 'ready' ? '#44ff44' : '#ff4444';
    $('status-dot').style.boxShadow = `0 0 10px ${state === 'ready' ? '#44ff44' : '#ff4444'}`;
}

// --- MEDIAPIPE SETUP ---
const video = $('v_src');
const canvas = $('out_canvas');
const ctx = canvas.getContext('2d');

const selfie = new SelfieSegmentation({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`
});
selfie.setOptions({ modelSelection: 1 });
selfie.onResults(r => engineState.mask = r.segmentationMask);

const holistic = new Holistic({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${f}`
});
holistic.setOptions({ modelComplexity: 1, smoothLandmarks: true });

function startCamera() {
    const cam = new Camera(video, {
        onFrame: async () => {
            await selfie.send({ image: video });
            await holistic.send({ image: video });
        },
        width: 1280, height: 720
    });
    cam.start();
    engineState.cameraStarted = true;
}

// --- TRAINING LOGIC ---
function showTrainer() {
    $('trainer-overlay').classList.add('visible');
    engineState.isTraining = true;
    engineState.isReady = false;
}

function startTrainingSequence() {
    const btn = $('ready-btn');
    btn.disabled = true;
    engineState.isReady = true;
    btn.innerText = "SYNCHRONIZING...";
    updateStatus("RECORDING...", "busy");
}

function normalizeHand(lm) {
    if (!lm) return new Array(63).fill(0);
    const w = lm[0], mcp = lm[9];
    const scale = Math.sqrt((mcp.x - w.x)**2 + (mcp.y - w.y)**2) || 1;
    const out = [];
    for (let i = 0; i < 21; i++) {
        out.push((lm[i].x - w.x) / scale);
        out.push((lm[i].y - w.y) / scale);
        out.push((lm[i].z - w.z) / scale);
    }
    return out;
}

function processTraining(res) {
    if (!res.leftHandLandmarks || !res.rightHandLandmarks) {
        engineState.captureProgress = Math.max(0, engineState.captureProgress - 10);
    } else {
        engineState.captureProgress += 34; // INSTANT (3 frames)
    }
    
    $('capture-progress').style.width = `${engineState.captureProgress}%`;

    if (engineState.captureProgress >= 100) {
        engineState.captureProgress = 0;
        const data = [...normalizeHand(res.leftHandLandmarks), ...normalizeHand(res.rightHandLandmarks)];
        engineState.trainingData.push(data);
        $(`step-${engineState.trainingRound}`).classList.add('done');
        engineState.trainingRound++;

        if (engineState.trainingRound > 3) {
            finishTraining();
        } else {
            $(`step-${engineState.trainingRound}`).classList.add('active');
        }
    }
}

function finishTraining() {
    engineState.isTraining = false;
    $('trainer-overlay').classList.remove('visible');
    updateStatus("CHAKRA SYNCED", "ready");
    
    if (engineState.trainingData.length > 0) {
        engineState.trainedModel = engineState.trainingData[0].map((_, i) => 
          engineState.trainingData.reduce((acc, row) => acc + row[i], 0) / engineState.trainingData.length
        );
    }
}

function checkTrainedGesture(left, right) {
    if (!engineState.trainedModel || !left || !right) return false;
    const current = [...normalizeHand(left), ...normalizeHand(right)];
    let dist = 0;
    for (let i = 0; i < engineState.trainedModel.length; i++) {
        dist += (engineState.trainedModel[i] - current[i]) ** 2;
    }
    return Math.sqrt(dist) < 2.2;
}

// --- JUTSU TRIGGERS ---
function clearActiveJutsu() {
    engineState.jutsuActive = false;
    engineState.currentJutsu = null;
    $('fx-chidori').style.display = 'none';
    $('fx-chidori').pause();
    $('fx-rasengan').style.display = 'none';
    $('fx-rasengan').pause();
    $('engine-ui').classList.remove('jutsu-active');
}

function triggerClones() {
    if (engineState.currentJutsu === 'clones') return;
    engineState.jutsuActive = true;
    engineState.currentJutsu = 'clones';
    engineState.cloneStartTime = performance.now();
    audio.clone.currentTime = 0;
    audio.clone.play();
    CLONE_CONFIG.forEach(c => c.smokeSpawned = false);
    updateStatus("SHADOW CLONE JUTSU!", "ready");
    $('engine-ui').classList.add('jutsu-active');
}

function triggerChidori(x, y) {
    if (!engineState.jutsuActive || engineState.currentJutsu !== 'chidori') {
        engineState.jutsuActive = true;
        engineState.currentJutsu = 'chidori';
        audio.chidori.currentTime = 0;
        audio.chidori.play().catch(e => console.log(e));
        $('fx-chidori').style.display = 'block';
        $('engine-ui').classList.add('jutsu-active');
    }
    // High precision mapping - since video and canvas use object-fit cover,
    // we use percentage which aligns if they both have the same cover settings.
    updateFxPos($('fx-chidori'), x, y);
    $('fx-chidori').play().catch(e => console.log(e));
}

function triggerRasengan(x, y) {
    if (!engineState.jutsuActive || engineState.currentJutsu !== 'rasengan') {
        engineState.jutsuActive = true;
        engineState.currentJutsu = 'rasengan';
        audio.rasengan.currentTime = 0;
        audio.rasengan.play().catch(e => console.log(e));
        $('fx-rasengan').style.display = 'block';
        $('engine-ui').classList.add('jutsu-active');
    }
    updateFxPos($('fx-rasengan'), x, y);
    $('fx-rasengan').play().catch(e => console.log(e));
}

function updateFxPos(el, x, y) {
    // In mirrored mode (scaleX(-1)), we must use (1 - x)
    el.style.left = `${(1 - x) * 100}%`;
    el.style.top = `${y * 100}%`;
    el.style.transform = `translate(-50%, -50%)`;
}

// --- RENDERING ENGINE ---
function spawnSmoke(x, y, scale) {
    const folder = SMOKE_FOLDERS[Math.floor(Math.random() * SMOKE_FOLDERS.length)];
    const frames = [];
    for (let i = 1; i <= 5; i++) {
        const img = new Image();
        img.src = `assets/${folder}/${i}.png`;
        frames.push(img);
    }
    activeSmokes.push({ x, y, scale: scale * 1.5, start: performance.now(), frames });
}

function grabPerson(video, mask) {
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;
    const tx = off.getContext("2d");
    tx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    tx.globalCompositeOperation = "source-in";
    tx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return off;
}

function drawClones(person) {
    const now = performance.now();
    const sorted = [...CLONE_CONFIG].sort((a, b) => b.delay - a.delay);

    sorted.forEach(cl => {
        if (now - engineState.cloneStartTime >= cl.delay) {
            if (!cl.smokeSpawned) {
                cl.smokeSpawned = true;
                spawnSmoke(cl.x + canvas.width / 2, cl.y + canvas.height / 2, cl.scale);
            }
            ctx.save();
            // In non-mirrored view, cl.x is used as is
            ctx.translate(cl.x + canvas.width * (1 - cl.scale) / 2, cl.y);
            ctx.scale(cl.scale, cl.scale);
            ctx.drawImage(person, 0, 0);
            ctx.restore();
        }
    });
    ctx.drawImage(person, 0, 0);
}

function drawSmokes() {
    const now = performance.now();
    for (let i = activeSmokes.length - 1; i >= 0; i--) {
        const s = activeSmokes[i];
        const frame = Math.floor((now - s.start) / 100);
        if (frame >= s.frames.length) {
            activeSmokes.splice(i, 1);
            continue;
        }
        const img = s.frames[frame];
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.scale(s.scale, s.scale);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    }
}

// --- MAIN LOOP ---
holistic.onResults((res) => {
    if (!engineState.mask) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const person = grabPerson(video, engineState.mask);

    if (engineState.isTraining) {
        if (engineState.isReady) processTraining(res);
        ctx.drawImage(person, 0, 0);
    } 
    else {
        // MODE LOGIC
        if (engineState.mode === 'clones') {
            if (checkTrainedGesture(res.leftHandLandmarks, res.rightHandLandmarks)) {
                triggerClones();
            } else if (!engineState.jutsuActive) {
                updateStatus("FORM THE SIGN", "ready");
            }
            
            if (engineState.currentJutsu === 'clones') {
                drawClones(person);
                drawSmokes();
            } else {
                ctx.drawImage(person, 0, 0);
            }
        } 
        else if (engineState.mode === 'chidori') {
            if (res.leftHandLandmarks) {
                triggerChidori(res.leftHandLandmarks[9].x, res.leftHandLandmarks[9].y);
            } else if (engineState.jutsuActive) {
                clearActiveJutsu();
            }
            ctx.drawImage(person, 0, 0);
        } 
        else if (engineState.mode === 'rasengan') {
            if (res.rightHandLandmarks) {
                triggerRasengan(res.rightHandLandmarks[9].x, res.rightHandLandmarks[9].y);
            } else if (engineState.jutsuActive) {
                clearActiveJutsu();
            }
            ctx.drawImage(person, 0, 0);
        }
        else {
            ctx.drawImage(person, 0, 0);
        }
    }
});
