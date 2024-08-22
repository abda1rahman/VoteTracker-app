// Ensure elements are found
let form = document.querySelector("form");
let candidate = document.querySelector("#candidate_id");
let vote_result = document.querySelector(".total_vote");

// Ensure all necessary elements are present
if (!form || !candidate || !vote_result) {
  console.error('One or more required elements are missing.');
  throw new Error('One or more required elements are missing.');
}

// Parse query parameters
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// Initialize socket connection
const socket = io();

// Handle successful WebSocket connection
socket.on("connect", () => {
  console.log("connection successfully ✅");
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  console.log("candidate_id", candidate.value);

  // Emit the new candidate ID
  socket.emit("new_candidate", candidate.value);
});

// Handle WebSocket events
socket.on("get_result", (data) => {
  console.log("get_result:", data); // Log data for debugging

  if (data !== undefined) {
    vote_result.textContent = data; // Update the HTML element with the new data
  }
});
