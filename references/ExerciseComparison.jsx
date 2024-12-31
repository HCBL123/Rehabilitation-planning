import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { Pose } from '@mediapipe/pose';
import { calculatePoseSimilarity } from './PoseComparison';
import { adviceManager } from '../utils/poseAdvice';
import { drawPoseResults } from './PoseDrawing';
import ExercisePerformance from '../utils/ExercisePerformance'; // Add this line

// Score Display Component
const ScoreDisplay = ({ score, feedback, advice }) => {
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className="w-full bg-white rounded-lg shadow p-4 mt-4">
      {/* Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-medium text-gray-700">Độ chính xác</div>
          <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-2000 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage < 40 ? '#ef4444' :
                percentage < 70 ? '#f59e0b' :
                  '#10b981',
              transition: 'width 2s ease-out, background-color 2s ease-out'
            }}
          />
        </div>
      </div>

      {/* Current Main Advice */}
      {advice && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-lg font-medium text-blue-800 mb-2">
            Hướng dẫn
          </div>
          <div className="text-blue-700">
            {advice}
          </div>
        </div>
      )}

      {/* Detailed Feedback */}
      {feedback && feedback.length > 0 && (
        <div>
          <div className="text-lg font-medium text-gray-700 mb-2">
            Chi tiết điều chỉnh
          </div>
          <div className="space-y-2">
            {feedback.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm border transition-all duration-500
                  ${item.score < 0.4
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : item.score < 0.7
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  }`}
              >
                {item.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedExerciseComparison = ({ exercise }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [actualScore, setActualScore] = useState(0);
  const [poseFeedback, setPoseFeedback] = useState([]);
  const [currentAdvice, setCurrentAdvice] = useState('');
  const [lastMotionTime, setLastMotionTime] = useState(Date.now());

  // All refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sampleVideoRef = useRef(null);
  const sampleCanvasRef = useRef(null);
  const poseRef = useRef(null);
  const samplePoseRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sampleAnimationFrameRef = useRef(null);
  const isCleanedUpRef = useRef(false);
  const lastPoseResultsRef = useRef(null);
  const lastSamplePoseResultsRef = useRef(null);
  const scoreAnimationRef = useRef(null);
  const scoreHistory = useRef([]);
  const lastScoreUpdateTime = useRef(0);
  const lastPoseRef = useRef(null);
  const performanceTrackerRef = useRef(null); // Add this line

  const [sessionData, setSessionData] = useState({
    scores: [],
    startTime: null,
    peakPerformance: 0,
    totalRepetitions: 0,
    consistencyScore: 0,
    areas: {
      leftArm: { score: 0, message: '' },
      rightArm: { score: 0, message: '' }
    }
  });

  // Add this with your other refs
  const scoreTracking = useRef({
    lastStableScore: 0,
    stableScoreTimer: null,
    repetitionCounted: false,
    lastUpdateTime: Date.now(),
    scoreBuffer: []
  });

  // Constants for motion detection
  const MOTION_THRESHOLD = 0.01;
  const INACTIVITY_PENALTY_RATE = 15;


  const getAreaMessage = (score) => {
    if (score >= 80) return 'Rất tốt, duy trì phong độ';
    if (score >= 60) return 'Tốt, cần giữ ổn định hơn';
    return 'Cần cải thiện độ chính xác';
  };

  const calculateImprovementRate = (scores) => {
    if (scores.length < 2) return 0;

    const firstScores = scores.slice(0, Math.min(3, Math.floor(scores.length / 3)));
    const lastScores = scores.slice(-Math.min(3, Math.floor(scores.length / 3)));

    const initialAvg = firstScores.reduce((a, b) => a + b, 0) / firstScores.length;
    const finalAvg = lastScores.reduce((a, b) => a + b, 0) / lastScores.length;

    return Math.round(((finalAvg - initialAvg) / initialAvg) * 100);
  };

  const updateSessionData = (newScore, details) => {
    setSessionData(prev => {
      // Update scores history
      const scores = [...prev.scores, newScore];

      // Update peak performance
      const peakPerformance = Math.max(prev.peakPerformance, newScore);

      // Calculate consistency score
      const recentScores = scores.slice(-10);
      const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const variance = recentScores.reduce((a, b) => a + Math.pow(b - avgScore, 2), 0) / recentScores.length;
      const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

      // Update area-specific scores and messages
      const leftArmScore = details?.leftArm * 100 || prev.areas.leftArm.score;
      const rightArmScore = details?.rightArm * 100 || prev.areas.rightArm.score;

      return {
        ...prev,
        scores,
        peakPerformance,
        consistencyScore,
        areas: {
          leftArm: {
            score: leftArmScore,
            message: getAreaMessage(leftArmScore)
          },
          rightArm: {
            score: rightArmScore,
            message: getAreaMessage(rightArmScore)
          }
        }
      };
    });
  };

  const detectMotionAndUpdateScore = (currentPose, similarity) => {
    const currentTime = Date.now();

    // Check for motion by comparing current pose with last pose
    let hasMotion = false;
    if (lastPoseRef.current) {
      const motionDiff = currentPose.poseLandmarks.reduce((acc, landmark, i) => {
        const lastLandmark = lastPoseRef.current.poseLandmarks[i];
        return acc + Math.abs(landmark.x - lastLandmark.x) + Math.abs(landmark.y - lastLandmark.y);
      }, 0) / currentPose.poseLandmarks.length;

      hasMotion = motionDiff > MOTION_THRESHOLD;
    }

    // Update motion timestamp if motion detected
    if (hasMotion) {
      setLastMotionTime(currentTime);
    }

    // Calculate inactivity duration
    const inactivityDuration = (currentTime - lastMotionTime) / 1000; // in seconds

    // Calculate score with inactivity penalty
    let adjustedScore = similarity.score;
    if (inactivityDuration > 2) { // Start decreasing after 2 seconds of inactivity
      adjustedScore = Math.max(0, adjustedScore - (INACTIVITY_PENALTY_RATE * (inactivityDuration - 2) / 100));
    } else
      if (adjustedScore >= 0.55) {
        adjustedScore = Math.min(1, adjustedScore * 1.9);
      }

    // Update last pose reference
    lastPoseRef.current = currentPose;

    return adjustedScore;
  };

  // Score animation with trend analysis
  useEffect(() => {
    const animateScore = () => {
      if (isCleanedUpRef.current) return;

      const currentTime = Date.now();

      // Update score history
      if (currentTime - scoreTracking.current.lastUpdateTime > 500) {
        // Add to score buffer
        scoreTracking.current.scoreBuffer.push(actualScore);

        // Keep buffer at reasonable size
        if (scoreTracking.current.scoreBuffer.length > 5) {
          const avgScore = scoreTracking.current.scoreBuffer.reduce((a, b) => a + b, 0) /
            scoreTracking.current.scoreBuffer.length;

          // Check if score is stable
          const isStable = scoreTracking.current.scoreBuffer.every(
            score => Math.abs(score - avgScore) < 10
          );

          if (isStable && !scoreTracking.current.repetitionCounted) {
            setSessionData(prev => ({
              ...prev,
              totalRepetitions: prev.totalRepetitions + 1
            }));
            scoreTracking.current.repetitionCounted = true;
          } else if (!isStable) {
            scoreTracking.current.repetitionCounted = false;
          }

          // Update session data with current performance
          updateSessionData(avgScore * 100, lastPoseResultsRef.current?.details);

          // Clear buffer
          scoreTracking.current.scoreBuffer = [];
        }

        scoreTracking.current.lastUpdateTime = currentTime;
      }

      setDisplayScore(prev => {
        const diff = actualScore - prev;
        const changeRate = scoreTracking.current.scoreBuffer.length > 0 ? 0.15 : 0.05;
        if (Math.abs(diff) < 0.1) return actualScore;
        return prev + diff * changeRate;
      });

      scoreAnimationRef.current = requestAnimationFrame(animateScore);
    };

    scoreAnimationRef.current = requestAnimationFrame(animateScore);

    return () => {
      if (scoreAnimationRef.current) {
        cancelAnimationFrame(scoreAnimationRef.current);
      }
    };
  }, [actualScore]);
  // Modify your mainPose.onResults handler
  const initializePoseDetectors = async () => {
    try {
      const mainPose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
        }
      });

      await mainPose.initialize();
      mainPose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      mainPose.onResults((results) => {
        if (!isCleanedUpRef.current) {
          drawPoseResults(results, canvasRef.current, videoRef.current, true);
          lastPoseResultsRef.current = results;

          if (lastSamplePoseResultsRef.current) {
            const similarity = calculatePoseSimilarity(results, lastSamplePoseResultsRef.current);
            if (similarity) {
              // Apply motion detection and inactivity penalty
              const adjustedScore = detectMotionAndUpdateScore(results, similarity);

              // Update performance tracker
              if (performanceTrackerRef.current) {
                performanceTrackerRef.current.updateMetrics(adjustedScore, similarity.details);
              }

              // Update score and feedback
              setActualScore(adjustedScore);
              setPoseFeedback(similarity.feedback);

              // Update advice based on adjusted score and motion state
              const currentTime = Date.now();
              const inactivityDuration = (currentTime - lastMotionTime) / 1000;

              const newAdvice = inactivityDuration > 2
                ? 'Hãy di chuyển theo hướng dẫn trong video'
                : adviceManager.getAdvice(adjustedScore, {
                  leftArmScore: similarity.details?.leftArm?.score,
                  rightArmScore: similarity.details?.rightArm?.score,
                  inactivity: inactivityDuration
                });

              setCurrentAdvice(newAdvice);
            }
          }
        }
      });
      const samplePose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
        }
      });

      await samplePose.initialize();
      samplePose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      samplePose.onResults((results) => {
        if (!isCleanedUpRef.current) {
          drawPoseResults(results, sampleCanvasRef.current, sampleVideoRef.current, false);
          lastSamplePoseResultsRef.current = results;
        }
      });

      poseRef.current = mainPose;
      samplePoseRef.current = samplePose;

      return { mainPose, samplePose };
    } catch (error) {
      console.error('Error initializing pose detectors:', error);
      throw error;
    }
  };

  const startDetectionLoop = async (video, pose, setAnimationFrame) => {
    if (!video || !pose || isCleanedUpRef.current) return;

    try {
      if (video.readyState === 4) {
        await pose.send({ image: video });
      }
      if (!isCleanedUpRef.current) {
        setAnimationFrame(requestAnimationFrame(() => startDetectionLoop(video, pose, setAnimationFrame)));
      }
    } catch (error) {
      if (!isCleanedUpRef.current) {
        console.error('Detection loop error:', error);
      }
    }
  };

  // Replace the existing startExercise function
  const startExercise = async () => {
    try {
      isCleanedUpRef.current = false;
      setFeedback({ type: 'info', message: 'Initializing...' });

      // Initialize performance tracker
      performanceTrackerRef.current = new ExercisePerformance();

      // Initialize session data
      setSessionData({
        scores: [],
        startTime: Date.now(),
        peakPerformance: 0,
        totalRepetitions: 0,
        consistencyScore: 0,
        areas: {
          leftArm: { score: 0, message: '' },
          rightArm: { score: 0, message: '' }
        }
      });

      const { mainPose, samplePose } = await initializePoseDetectors();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (sampleVideoRef.current && exercise?.sampleVideo) {
        sampleVideoRef.current.src = exercise.sampleVideo;
        await sampleVideoRef.current.play();
      }

      startDetectionLoop(videoRef.current, mainPose, (frame) => {
        animationFrameRef.current = frame;
      });

      startDetectionLoop(sampleVideoRef.current, samplePose, (frame) => {
        sampleAnimationFrameRef.current = frame;
      });

      setIsRecording(true);
      setFeedback({ type: 'success', message: 'Started! Follow the exercise video.' });

    } catch (error) {
      console.error('Error starting exercise:', error);
      setFeedback({
        type: 'error',
        message: `Failed to start: ${error.message}`
      });
      cleanupResources();
    }
  };
  // Update the cleanupResources function
  const cleanupResources = () => {
    isCleanedUpRef.current = true;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sampleAnimationFrameRef.current) {
      cancelAnimationFrame(sampleAnimationFrameRef.current);
      sampleAnimationFrameRef.current = null;
    }
    if (scoreAnimationRef.current) {
      cancelAnimationFrame(scoreAnimationRef.current);
      scoreAnimationRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (sampleVideoRef.current) {
      sampleVideoRef.current.pause();
      sampleVideoRef.current.src = '';
    }

    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    if (samplePoseRef.current) {
      samplePoseRef.current.close();
      samplePoseRef.current = null;
    }

    // Reset performance tracker
    performanceTrackerRef.current = null;

    setIsRecording(false);
  };
  // Replace the existing stopExercise function
  const stopExercise = () => {
    // Generate final performance report
    const finalReport = performanceTrackerRef.current?.generateReport() || {
      averageScore: 0,
      duration: '0:00',
      totalRepetitions: 0,
      peakPerformance: 0,
      consistencyScore: 0,
      improvementRate: 0,
      performanceOverTime: [],
      areas: {
        leftArm: { score: 0, message: '' },
        rightArm: { score: 0, message: '' }
      }
    };

    // Cleanup resources
    cleanupResources();

    // Navigate to results page with performance data
    navigate(`/results/${exercise?.id}`, {
      state: { sessionData: finalReport }
    });
  };
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Feeds */}
        <div className="space-y-6">
          {/* User Camera */}
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Camera người tập</h3>
            </div>
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <button
                    onClick={startExercise}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Bắt đầu tập
                  </button>
                </div>
              )}
            </div>

            {/* Score Display below video */}
            {isRecording && (
              <ScoreDisplay
                score={displayScore}
                feedback={poseFeedback}
                advice={currentAdvice}
              />
            )}
          </Card>
        </div>

        {/* Guide Video */}
        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold">Video hướng dẫn</h3>
          </div>
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={sampleVideoRef}
              className="absolute top-0 left-0 w-full h-full object-cover"
              loop
              playsInline
              muted
            />
            <canvas
              ref={sampleCanvasRef}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
        </Card>
      </div>

      {/* Controls */}
      {isRecording && (
        <div className="text-center mt-6">
          <button
            onClick={stopExercise}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Stop Exercise
          </button>
        </div>
      )}

      {/* Status Messages */}
      {feedback && (
        <Alert className={`mt-6 ${feedback.type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
          <AlertDescription>
            {feedback.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedExerciseComparison;
