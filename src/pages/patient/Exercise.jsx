import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { Play, Stop, ChevronRight } from 'lucide-react';

const Exercise = ({ exercise }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseData, setExerciseData] = useState(null);

  const startExercise = () => {
    setIsExercising(true);
    // Initialize exercise data
    setExerciseData({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      score: 0,
      duration: '0:00',
      repetitions: 0,
      accuracy: { average: 0 },
      feedback: []
    });
  };

  const stopExercise = () => {
    setIsExercising(false);
    // Simulate final exercise data
    const finalData = {
      ...exerciseData,
      score: 85, // Example score
      duration: '15:00',
      repetitions: 10,
      accuracy: { average: 80 },
      feedback: ['Great job!', 'Keep your back straight.']
    };
    navigate('/patient/results', { state: { exerciseData: finalData } });
  };

  return (
    <div className="exercise-page">
      <h1>{exercise.name}</h1>
      <button onClick={startExercise} disabled={isExercising}>
        <Play className="icon" /> Start
      </button>
      <button onClick={stopExercise} disabled={!isExercising}>
        <Stop className="icon" /> Stop
      </button>
    </div>
  );
};

export default Exercise; 