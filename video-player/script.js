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
