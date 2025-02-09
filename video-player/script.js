const videoPlayer = document.getElementById("videoPlayer");
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const playPauseBtn = document.getElementById("playPause");
const rewind10sBtn = document.getElementById("rewind10s");
const forward10sBtn = document.getElementById("forward10s");
const rewind1mBtn = document.getElementById("rewind1m");
const forward1mBtn = document.getElementById("forward1m");
const seekBar = document.getElementById("seekBar");
const thumbnailPreview = document.getElementById("thumbnailPreview");

let lastUpdateTime = 0;
const thumbnailCache = {}; // Store pre-generated thumbnails

// 🎥 Handle file selection
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) loadVideo(file);
});

// 🎥 Handle drag-and-drop
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "green";
});
dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "white";
});
dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "white";
    const file = event.dataTransfer.files[0];
    if (file) loadVideo(file);
});

// 🎥 Load and play video, convert MKV if needed
async function loadVideo(file) {
    if (file.name.endsWith(".mkv")) {
        console.log("MKV file detected, converting...");
        const convertedVideoURL = await convertMKVtoMP4(file);
        videoPlayer.src = convertedVideoURL;
    } else {
        const fileURL = URL.createObjectURL(file);
        videoPlayer.src = fileURL;
    }
    videoPlayer.play();
}

// 🔄 Convert MKV to MP4 using FFmpeg
async function convertMKVtoMP4(file) {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    const fileName = "input.mkv";
    const outputFileName = "output.mp4";

    ffmpeg.FS("writeFile", fileName, await fetchFile(file));
    await ffmpeg.run("-i", fileName, outputFileName);

    const data = ffmpeg.FS("readFile", outputFileName);
    return URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
}

// ▶️ Play/Pause Toggle
playPauseBtn.addEventListener("click", () => {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playPauseBtn.innerText = "⏸️";
    } else {
        videoPlayer.pause();
        playPauseBtn.innerText = "▶️";
    }
});

// ⏪⏩ Forward & Rewind Controls
rewind10sBtn.addEventListener("click", () => videoPlayer.currentTime -= 10);
forward10sBtn.addEventListener("click", () => videoPlayer.currentTime += 10);
rewind1mBtn.addEventListener("click", () => videoPlayer.currentTime -= 60);
forward1mBtn.addEventListener("click", () => videoPlayer.currentTime += 60);

// 🔄 Sync seek bar with video progress
videoPlayer.addEventListener("timeupdate", () => {
    seekBar.value = (videoPlayer.currentTime / videoPlayer.duration) * 100;
});

// 📍 Seek the video when clicking the seek bar
seekBar.addEventListener("change", () => {
    videoPlayer.currentTime = (seekBar.value / 100) * videoPlayer.duration;
});

// 🎯 Show thumbnail preview on hover (without seeking)
seekBar.addEventListener("mousemove", (event) => {
    const now = Date.now();
    if (now - lastUpdateTime < 100) return; // Update every 300ms
    lastUpdateTime = now;

    const seekBarRect = seekBar.getBoundingClientRect();
    const seekTime = Math.floor((event.offsetX / seekBarRect.width) * videoPlayer.duration);
    const thumbnailTime = Math.floor(seekTime / 5) * 5; // Group into 5-sec intervals

    if (thumbnailCache[thumbnailTime]) {
        updateThumbnail(thumbnailCache[thumbnailTime], event);
    } else {
        generateThumbnail(thumbnailTime, event);
    }
});

// 🖼️ Generate a thumbnail without affecting the current video playback
function generateThumbnail(time, event) {
    if (thumbnailCache[time]) {
        updateThumbnail(thumbnailCache[time], event);
        return;
    }

    const video = document.createElement("video");
    video.src = videoPlayer.src;
    video.crossOrigin = "anonymous";
    video.currentTime = time;

    video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 160;
        canvas.height = 90;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL();
        thumbnailCache[time] = dataURL;

        updateThumbnail(dataURL, event);
    }, { once: true });
}

// 📍 Update thumbnail preview position
function updateThumbnail(dataURL, event) {
    const previewWidth = 120;
    const previewHeight = 70;

    // Position thumbnail above the mouse cursor
    let leftPos = event.pageX - previewWidth / 2;
    let topPos = event.pageY - previewHeight - 15; // 15px space above cursor

    // Prevent thumbnail from going off-screen
    if (leftPos < 0) leftPos = 0;
    if (leftPos + previewWidth > window.innerWidth) leftPos = window.innerWidth - previewWidth;
    if (topPos < 0) topPos = 0;

    // Apply new position
    thumbnailPreview.style.left = `${leftPos}px`;
    thumbnailPreview.style.top = `${topPos}px`;
    thumbnailPreview.style.backgroundImage = `url(${dataURL})`;
    thumbnailPreview.style.display = "block";
}



// 🚫 Hide thumbnail preview when leaving seek bar
seekBar.addEventListener("mouseleave", () => {
    thumbnailPreview.style.display = "none";
});

// 🎯 Seek the video when clicking the seek bar
seekBar.addEventListener("click", (event) => {
    const seekBarRect = seekBar.getBoundingClientRect();
    const seekTime = (event.offsetX / seekBarRect.width) * videoPlayer.duration;
    videoPlayer.currentTime = seekTime; // Seek only on click
});


const theaterModeBtn = document.getElementById("theaterMode");
const fullscreenModeBtn = document.getElementById("fullscreenMode");

// Toggle Theater Mode
theaterModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("theater-mode");
});

// Toggle Fullscreen Mode
fullscreenModeBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        videoPlayer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

const brightnessControl = document.getElementById("brightness");
const contrastControl = document.getElementById("contrast");

function updateFilters() {
    videoPlayer.style.filter = `brightness(${brightnessControl.value}) contrast(${contrastControl.value})`;
}

brightnessControl.addEventListener("input", updateFilters);
contrastControl.addEventListener("input", updateFilters);


const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(videoPlayer);
const gainNode = audioContext.createGain();
source.connect(gainNode);
gainNode.connect(audioContext.destination);

const audioBoostControl = document.getElementById("audioBoost");

audioBoostControl.addEventListener("input", () => {
    let boostValue = parseFloat(audioBoostControl.value);
    gainNode.gain.value = boostValue; // Boost up to 3x
});

const audioTracksSelect = document.getElementById("audioTracks");

videoPlayer.addEventListener("loadedmetadata", () => {
    audioTracksSelect.innerHTML = "";
    const tracks = videoPlayer.audioTracks;

    if (tracks && tracks.length > 1) {
        tracks.forEach((track, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = track.label || `Track ${index + 1}`;
            audioTracksSelect.appendChild(option);
        });

        audioTracksSelect.addEventListener("change", () => {
            tracks[audioTracksSelect.value].enabled = true;
        });
    } else {
        audioTracksSelect.style.display = "none";
    }
});
