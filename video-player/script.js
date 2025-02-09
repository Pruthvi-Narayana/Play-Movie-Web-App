const videoPlayer = document.getElementById("videoPlayer");
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");

// Handle file input selection
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        loadVideo(file);
    }
});

// Handle drag-and-drop
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
    if (file) {
        loadVideo(file);
    }
});

// Function to load and play the video
function loadVideo(file) {
    const fileURL = URL.createObjectURL(file);
    videoPlayer.src = fileURL;
    videoPlayer.play();
}

// const { createFFmpeg, fetchFile } = FFmpeg;
// const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
// const ffmpeg = createFFmpeg({ log: true });
// const ffmpeg = FFmpeg.createFFmpeg({ log: true });

async function convertMKVtoMP4(file) {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    const fileName = "input.mkv";
    const outputFileName = "output.mp4";

    ffmpeg.FS("writeFile", fileName, await fetchFile(file));
    await ffmpeg.run("-i", fileName, outputFileName);

    const data = ffmpeg.FS("readFile", outputFileName);
    const mp4Blob = new Blob([data.buffer], { type: "video/mp4" });

    return URL.createObjectURL(mp4Blob);
}

// Modify `loadVideo` function to handle MKV files
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

// Ensure all buttons are correctly selected
const playPauseBtn = document.getElementById("playPause");
const rewind10sBtn = document.getElementById("rewind10s");
const forward10sBtn = document.getElementById("forward10s");
const rewind1mBtn = document.getElementById("rewind1m");
const forward1mBtn = document.getElementById("forward1m");
const seekBar = document.getElementById("seekBar");

// Debugging: Check if elements exist
console.log(playPauseBtn, rewind10sBtn, forward10sBtn, rewind1mBtn, forward1mBtn);

// Play/Pause Toggle
playPauseBtn.addEventListener("click", () => {
    if (videoPlayer.paused) {
        videoPlayer.play();
        playPauseBtn.innerText = "⏸️";
    } else {
        videoPlayer.pause();
        playPauseBtn.innerText = "▶️";
    }
    console.log("Play/Pause Clicked"); // Debugging
});

// Forward & Rewind Controls
rewind10sBtn.addEventListener("click", () => {
    console.log("Rewind 10s Clicked");
    videoPlayer.currentTime -= 10;
});

forward10sBtn.addEventListener("click", () => {
    console.log("Forward 10s Clicked");
    videoPlayer.currentTime += 10;
});

rewind1mBtn.addEventListener("click", () => {
    console.log("Rewind 1m Clicked");
    videoPlayer.currentTime -= 60;
});

forward1mBtn.addEventListener("click", () => {
    console.log("Forward 1m Clicked");
    videoPlayer.currentTime += 60;
});

// Seek Bar Functionality
videoPlayer.addEventListener("timeupdate", () => {
    seekBar.value = (videoPlayer.currentTime / videoPlayer.duration) * 100;
});

seekBar.addEventListener("input", () => {
    videoPlayer.currentTime = (seekBar.value / 100) * videoPlayer.duration;
});
