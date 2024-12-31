const KEYPOINTS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
};

const ANGLE_THRESHOLD = 30; // More strict angle comparison
const MIN_VISIBILITY = 0.6; // Higher visibility requirement
const MIN_MOVEMENT_THRESHOLD = 0.1; // Minimum movement to be considered a pose

const isNeutralPose = (pose) => {
  try {
    const leftShoulder = pose[KEYPOINTS.LEFT_SHOULDER];
    const leftWrist = pose[KEYPOINTS.LEFT_WRIST];
    const rightShoulder = pose[KEYPOINTS.RIGHT_SHOULDER];
    const rightWrist = pose[KEYPOINTS.RIGHT_WRIST];

    if (!leftShoulder || !leftWrist || !rightShoulder || !rightWrist) {
      return true;
    }

    const isLeftArmDown = leftWrist.y > leftShoulder.y;
    const isRightArmDown = rightWrist.y > rightShoulder.y;

    return isLeftArmDown && isRightArmDown;
  } catch (error) {
    console.error('Error checking neutral pose:', error);
    return true;
  }
};

const normalizePose = (pose) => {
  // Get key points
  const leftShoulder = pose[KEYPOINTS.LEFT_SHOULDER];
  const rightShoulder = pose[KEYPOINTS.RIGHT_SHOULDER];
  const leftHip = pose[KEYPOINTS.LEFT_HIP];
  const rightHip = pose[KEYPOINTS.RIGHT_HIP];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return null;
  }

  // Calculate shoulder center
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2
  };

  // Calculate shoulder width for normalization
  const shoulderWidth = Math.sqrt(
    Math.pow(rightShoulder.x - leftShoulder.x, 2) +
    Math.pow(rightShoulder.y - leftShoulder.y, 2)
  );

  // If shoulder width is too small (person too far), return null
  if (shoulderWidth < 0.1) {
    return null;
  }

  // Normalize points relative to shoulder center and width
  const normalizePoint = (point) => ({
    x: (point.x - shoulderCenter.x) / shoulderWidth,
    y: (point.y - shoulderCenter.y) / shoulderWidth,
    z: (point.z - shoulderCenter.z) / shoulderWidth,
    visibility: point.visibility
  });

  return {
    leftShoulder: normalizePoint(leftShoulder),
    rightShoulder: normalizePoint(rightShoulder),
    leftElbow: normalizePoint(pose[KEYPOINTS.LEFT_ELBOW]),
    rightElbow: normalizePoint(pose[KEYPOINTS.RIGHT_ELBOW]),
    leftWrist: normalizePoint(pose[KEYPOINTS.LEFT_WRIST]),
    rightWrist: normalizePoint(pose[KEYPOINTS.RIGHT_WRIST])
  };
};

// Calculate angle between three points
const calculateAngle = (center, point1, point2) => {
  const vector1 = {
    x: point1.x - center.x,
    y: point1.y - center.y,
    z: point1.z - center.z
  };

  const vector2 = {
    x: point2.x - center.x,
    y: point2.y - center.y,
    z: point2.z - center.z
  };

  const dot = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
  const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y + vector1.z * vector1.z);
  const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y + vector2.z * vector2.z);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cosAngle = dot / (mag1 * mag2);
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));
  return Math.acos(clampedCos) * (180 / Math.PI);
};
const comparePoses = (userPose, samplePose) => {
  try {
    // First check if user is in neutral pose
    if (isNeutralPose(userPose)) {
      return {
        score: 0,
        details: {
          message: "Hãy giơ tay lên theo hướng dẫn"
        }
      };
    }

    // Normalize poses
    const normalizedUser = normalizePose(userPose);
    const normalizedSample = normalizePose(samplePose);

    if (!normalizedUser || !normalizedSample) {
      return { score: 0, details: {} };
    }

    // Compare angles for each arm - SWAPPED left and right for user pose
    const leftArmAngleUser = calculateAngle(
      normalizedUser.rightShoulder, // Changed from leftShoulder
      normalizedUser.rightElbow,    // Changed from leftElbow
      normalizedUser.rightWrist     // Changed from leftWrist
    );

    const leftArmAngleSample = calculateAngle(
      normalizedSample.leftShoulder,
      normalizedSample.leftElbow,
      normalizedSample.leftWrist
    );

    const rightArmAngleUser = calculateAngle(
      normalizedUser.leftShoulder,  // Changed from rightShoulder
      normalizedUser.leftElbow,     // Changed from rightElbow
      normalizedUser.leftWrist      // Changed from rightWrist
    );

    const rightArmAngleSample = calculateAngle(
      normalizedSample.rightShoulder,
      normalizedSample.rightElbow,
      normalizedSample.rightWrist
    );

    // Calculate scores with stricter thresholds
    const leftArmScore = Math.max(0, 1 - Math.abs(leftArmAngleUser - leftArmAngleSample) / ANGLE_THRESHOLD);
    const rightArmScore = Math.max(0, 1 - Math.abs(rightArmAngleUser - rightArmAngleSample) / ANGLE_THRESHOLD);

    // Check for minimum movement - SWAPPED for user pose
    const leftWristMovement = Math.abs(normalizedUser.rightWrist.y - normalizedUser.rightShoulder.y);  // Changed from left to right
    const rightWristMovement = Math.abs(normalizedUser.leftWrist.y - normalizedUser.leftShoulder.y);   // Changed from right to left

    if (leftWristMovement < MIN_MOVEMENT_THRESHOLD && rightWristMovement < MIN_MOVEMENT_THRESHOLD) {
      return {
        score: 0,
        details: {
          message: "Hãy di chuyển theo hướng dẫn"
        }
      };
    }

    // Calculate final score
    const finalScore = (leftArmScore + rightArmScore) / 2;

    return {
      score: finalScore,
      details: {
        leftArm: leftArmScore,
        rightArm: rightArmScore
      }
    };
  } catch (error) {
    console.error('Error in pose comparison:', error);
    return { score: 0, details: {} };
  }
};
let scoreHistory = new Array(3).fill(0);

const calculatePoseSimilarity = (() => {
  let lastUpdateTime = 0;
  let lastScore = null;

  return (userPose, samplePose) => {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < 100 && lastScore) {
      return lastScore;
    }

    try {
      const comparison = comparePoses(userPose.poseLandmarks, samplePose.poseLandmarks);

      // Update score history
      scoreHistory.push(comparison.score);
      scoreHistory.shift();

      //P = 50*(w1(1+cos(a))) + w2*(1-d/k)*(w1+w2);

      // Simple average without boosting
      const smoothedScore = scoreHistory.reduce((a, b) => a + b) / scoreHistory.length;

      // Generate feedback
      const feedback = [];
      if (smoothedScore < 0.2) {
        feedback.push({
          message: "Hãy bắt đầu tập theo hướng dẫn",
          score: smoothedScore
        });
      } else if (smoothedScore < 0.5) {
        feedback.push({
          message: "Cần điều chỉnh nhiều hơn",
          score: smoothedScore
        });
      } else if (smoothedScore < 0.8) {
        feedback.push({
          message: "Gần đúng rồi, điều chỉnh thêm một chút nữa",
          score: smoothedScore
        });
      } else {
        feedback.push({
          message: "Tốt lắm, giữ nguyên tư thế này",
          score: smoothedScore
        });
      }

      const result = {
        score: Math.round(smoothedScore * 100),
        feedback,
        details: comparison.details
      };

      lastUpdateTime = currentTime;
      lastScore = result;
      return result;
    } catch (error) {
      console.error('Error calculating pose similarity:', error);
      return lastScore || { score: 0, feedback: [] };
    }
  };
})();

export { calculatePoseSimilarity };
