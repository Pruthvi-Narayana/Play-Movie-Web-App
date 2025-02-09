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

const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

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
