const POSE_CONNECTIONS = [
  ['left_ear', 'left_eye_outer'],
  ['left_eye_outer', 'left_eye'],
  ['left_eye', 'left_eye_inner'],
  ['left_eye_inner', 'right_eye_inner'],
  ['right_eye_inner', 'right_eye'],
  ['right_eye', 'right_eye_outer'],
  ['right_eye_outer', 'right_ear'],
  ['left_ear', 'left_shoulder'],
  ['right_ear', 'right_shoulder'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
];

const drawPoseResults = (results, canvas, videoElement, isUserVideo = false) => {
  if (!results || !canvas || !videoElement) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set canvas size to match video dimensions
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw the video frame first
  ctx.save();
  if (isUserVideo) {
    // Flip the user's video horizontally for mirror effect
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
  }
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Draw landmarks
  if (results.poseLandmarks) {
    drawLandmarks(ctx, results.poseLandmarks, isUserVideo);
    drawConnections(ctx, results.poseLandmarks, isUserVideo);
  }
};

const drawLandmarks = (ctx, landmarks, isUserVideo) => {
  // Configure drawing style for landmarks
  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.strokeStyle = 'rgb(0, 255, 0)';
  ctx.lineWidth = 2;

  landmarks.forEach((landmark) => {
    // Skip landmarks with low visibility
    if (landmark.visibility && landmark.visibility < 0.5) return;

    const x = isUserVideo
      ? ctx.canvas.width - landmark.x * ctx.canvas.width
      : landmark.x * ctx.canvas.width;
    const y = landmark.y * ctx.canvas.height;

    // Draw landmark point
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });
};

const drawConnections = (ctx, landmarks, isUserVideo) => {
  // Configure drawing style for connections
  ctx.strokeStyle = 'rgb(0, 255, 0)';
  ctx.lineWidth = 2;

  POSE_CONNECTIONS.forEach(([startPoint, endPoint]) => {
    const start = landmarks.find(l => l.name === startPoint);
    const end = landmarks.find(l => l.name === endPoint);

    if (!start || !end) return;
    if ((start.visibility && start.visibility < 0.5) ||
      (end.visibility && end.visibility < 0.5)) return;

    const startX = isUserVideo
      ? ctx.canvas.width - start.x * ctx.canvas.width
      : start.x * ctx.canvas.width;
    const startY = start.y * ctx.canvas.height;
    const endX = isUserVideo
      ? ctx.canvas.width - end.x * ctx.canvas.width
      : end.x * ctx.canvas.width;
    const endY = end.y * ctx.canvas.height;

    // Draw connection line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
};

export { drawPoseResults };
