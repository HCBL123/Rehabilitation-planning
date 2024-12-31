import React, { useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

// Interfaces
interface AnalysisResult {
  final_probability: number;
  plane_probabilities: {
    axial: number;
    coronal: number;
    sagittal: number;
  };
  cam_visualizations: {
    axial: string;
    coronal: string;
    sagittal: string;
  };
  rehabPlan?: RehabPlan;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  target_area: string[];
  contraindications: string[];
  phase_compatibility: number[];
}

interface ExerciseParameters {
  sets: number;
  reps: number;
  rest: number;
}

interface RehabPlan {
  phase: number;
  severity: number;
  exercises: (Exercise & ExerciseParameters)[];
  warnings: string[];
  duration: number;
}

// Exercise Database
const BASE_EXERCISES: Exercise[] = [
  // ACL Recovery Exercises
  {
    id: 'acl1',
    name: 'Co cơ đẳng trường',
    description: 'Người tập ngồi thẳng trên sàn, chân duỗi thẳng, dùng cơ tứ đầu để ép đầu gối xuống sàn',
    difficulty: 1,
    target_area: ['acl'],
    contraindications: ['severe_pain'],
    phase_compatibility: [1]
  },
  {
    id: 'acl2',
    name: 'Kéo dãn gân kheo nhẹ',
    description: 'Người tập nằm ngửa, dùng dây kéo chân bị thương lên cao',
    difficulty: 1,
    target_area: ['acl'],
    contraindications: [],
    phase_compatibility: [1, 2]
  },
  {
    id: 'acl3',
    name: 'Gập gối có người hỗ trợ',
    description: 'Người trợ giúp gập chân người tập nhẹ nhàng',
    difficulty: 2,
    target_area: ['acl'],
    contraindications: ['severe_pain'],
    phase_compatibility: [1]
  },
  // Meniscus Recovery Exercises
  {
    id: 'men1',
    name: 'Nâng chân thẳng',
    description: 'Người tập nằm ngửa, nâng chân bị thương lên khoảng 30°',
    difficulty: 2,
    target_area: ['meniscus', 'general'],
    contraindications: [],
    phase_compatibility: [1, 2, 3]
  },
  {
    id: 'men2',
    name: 'Đứng thăng bằng trên chân bị tổn thương',
    description: 'Đứng trên chân bị thương, giữ thăng bằng trong 10 giây',
    difficulty: 3,
    target_area: ['meniscus', 'general'],
    contraindications: ['instability'],
    phase_compatibility: [2, 3]
  },
  {
    id: 'men3',
    name: 'Chuyển trọng lượng cơ thể',
    description: 'Đứng thẳng, từ từ chuyển trọng lượng cơ thể từ chân này sang chân kia',
    difficulty: 2,
    target_area: ['meniscus', 'general'],
    contraindications: [],
    phase_compatibility: [2, 3]
  },
  // General Exercises
  {
    id: 'gen1',
    name: 'Đạp xe cố định',
    description: 'Ngồi trên xe đạp cố định, đạp với tốc độ chậm',
    difficulty: 3,
    target_area: ['general'],
    contraindications: [],
    phase_compatibility: [2, 3]
  },
  {
    id: 'gen2',
    name: 'Squat nhẹ với ghế',
    description: 'Đứng trước ghế, hạ cơ thể sao cho đầu gối không vượt qua mũi chân',
    difficulty: 4,
    target_area: ['general'],
    contraindications: ['severe_pain'],
    phase_compatibility: [3]
  }
];

// Exercise Parameters by Phase
const BASE_EXERCISE_PARAMETERS = {
  early: {
    sets: 2,
    reps: 10,
    rest: 60
  },
  middle: {
    sets: 3,
    reps: 12,
    rest: 45
  },
  late: {
    sets: 3,
    reps: 15,
    rest: 30
  }
};

const ModelAnalysisPage = () => {
  const [files, setFiles] = useState<{
    axial?: File;
    coronal?: File;
    sagittal?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Utility Functions
  const calculateSeverityScore = (probability: number): number => {
    if (probability > 0.7) return 1;
    if (probability >= 0.3) return 0.5;
    return 0;
  };

  const calculateExerciseScore = (
    exercise: Exercise,
    phase: number,
    severity: number
  ): number => {
    const weights = {
      difficulty: 0.3,
      phase: 0.4,
      target: 0.2,
      contraindication: 0.1
    };

    return (
      weights.difficulty * (1 - exercise.difficulty / 5) +
      weights.phase * (exercise.phase_compatibility.includes(phase) ? 1 : 0) +
      weights.target * (exercise.target_area.includes('acl') ? 1 : 0.5) -
      weights.contraindication * (severity > 0.7 && exercise.contraindications.includes('severe_pain') ? 1 : 0)
    );
  };

  const calculateExerciseParameters = (
    baseParams: ExerciseParameters,
    severity: number
  ): ExerciseParameters => {
    return {
      sets: Math.max(Math.round(baseParams.sets * (1 - 0.2 * severity)), 2),
      reps: Math.max(Math.round(baseParams.reps * (1 - 0.3 * severity)), 5),
      rest: Math.round(baseParams.rest * (1 + 0.3 * severity))
    };
  };

  const generateRehabPlan = (probability: number): RehabPlan => {
    const severity = calculateSeverityScore(probability);
    const phase = severity === 1 ? 1 : severity === 0.5 ? 2 : 3;
    
    const targetAreas = ['general'];
    if (severity > 0.5) targetAreas.push('acl');
    if (severity > 0.3) targetAreas.push('meniscus');

    const baseParams = phase === 1 
      ? BASE_EXERCISE_PARAMETERS.early 
      : phase === 2 
      ? BASE_EXERCISE_PARAMETERS.middle 
      : BASE_EXERCISE_PARAMETERS.late;

    const recommendedExercises = BASE_EXERCISES
      .filter(ex => {
        if (!ex.phase_compatibility.includes(phase)) return false;
        if (severity > 0.7 && ex.contraindications.includes('severe_pain')) return false;
        return ex.target_area.some(area => targetAreas.includes(area));
      })
      .map(ex => ({
        ...ex,
        score: calculateExerciseScore(ex, phase, severity)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(ex => ({
        ...ex,
        ...calculateExerciseParameters(baseParams, severity)
      }));

    const warnings = [
      'Dừng ngay nếu cảm thấy đau nhói',
      'Tuân thủ nghiêm ngặt thời gian nghỉ giữa các hiệp',
      'Thực hiện động tác chậm và có kiểm soát',
      severity > 0.5 ? 'Cần có sự giám sát của chuyên gia vật lý trị liệu' : null,
      severity > 0.7 ? 'Chỉ tập với cường độ nhẹ và có người hỗ trợ' : null
    ].filter(Boolean) as string[];

    return {
      phase,
      severity,
      exercises: recommendedExercises,
      warnings,
      duration: severity === 1 ? 12 : severity === 0.5 ? 8 : 6
    };
  };

  // Event Handlers
  const handleFileChange = (plane: 'axial' | 'coronal' | 'sagittal', file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [plane]: file }));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!files.axial || !files.coronal || !files.sagittal) {
      setError('Please upload all three plane images');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('axial_file', files.axial);
    formData.append('coronal_file', files.coronal);
    formData.append('sagittal_file', files.sagittal);

    try {
      const response = await axios.post('http://localhost:8000/predict_acl', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const rehabPlan = generateRehabPlan(response.data.final_probability);
      
      setResult({
        ...response.data,
        rehabPlan
      });
    } catch (err) {
      setError('Failed to analyze the files. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = (plane: 'axial' | 'coronal' | 'sagittal') => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[plane];
      return newFiles;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Phân Tích ACL</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['axial', 'coronal', 'sagittal'] as const).map((plane) => (
              <div key={plane} className="flex flex-col items-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2 capitalize">
                  Mặt phẳng {plane === 'axial' ? 'ngang' : plane === 'coronal' ? 'đứng dọc' : 'đứng ngang'}
                </h3>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                  {files[plane] ? (
                    <div className="relative w-full h-full p-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          clearFile(plane);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex flex-col items-center justify-center h-full">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">{files[plane].name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Tải lên ảnh {
                        plane === 'axial' ? 'mặt phẳng ngang' : 
                        plane === 'coronal' ? 'mặt phẳng đứng dọc' : 
                        'mặt phẳng đứng ngang'
                      }</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".dcm"
                    onChange={(e) => handleFileChange(plane, e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!files.axial || !files.coronal || !files.sagittal || loading}
            className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-medium ${
              !files.axial || !files.coronal || !files.sagittal || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Đang phân tích...' : 'Phân tích ảnh'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Kết quả phân tích</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Dự đoán</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-lg font-semibold text-blue-600">
                      Xác suất cuối cùng: {(result.final_probability * 100).toFixed(2)}%
                    </p>
                    <div className="mt-2 space-y-1">
                      {/* {Object.entries(result.plane_probabilities).map(([plane, prob]) => (
                        <p key={plane} className="text-sm text-gray-600">
                          Mặt phẳng {
                            plane === 'axial' ? 'ngang' : 
                            plane === 'coronal' ? 'đứng dọc' : 
                            'đứng ngang'
                          }: {(prob * 100).toFixed(2)}%
                        </p>
                      ))} */}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh CAM</h3>
                  <div className="flex flex-col space-y-8">
                    {Object.entries(result.cam_visualizations).map(([plane, imageUrl]) => (
                      <div key={plane} className="relative">
                        <div className="aspect-w-16 aspect-h-9 w-full">
                          <img
                            src={imageUrl}
                            alt={`Hình ảnh CAM mặt phẳng ${
                              plane === 'axial' ? 'ngang' : 
                              plane === 'coronal' ? 'đứng dọc' : 
                              'đứng ngang'
                            }`}
                            className="rounded-lg object-contain w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-cam.png';
                              console.error(`Không thể tải hình ảnh CAM cho mặt phẳng ${plane}`);
                            }}
                          />
                        </div>
                        <p className="text-center text-lg text-gray-600 mt-2 capitalize">
                          Mặt phẳng {
                            plane === 'axial' ? 'ngang' : 
                            plane === 'coronal' ? 'đứng dọc' : 
                            'đứng ngang'
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Recommendation Section */}
            {result.final_probability >= 0.8 ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-red-900">Khuyến nghị phẫu thuật</h3>
                  <p className="mt-2 text-red-700">
                    Dựa trên xác suất cao ({(result.final_probability * 100).toFixed(1)}%) của tổn thương ACL,
                    khuyến nghị can thiệp phẫu thuật. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa chỉnh hình.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-red-900">Các bước tiếp theo:</h4>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li>Đặt lịch tư vấn với bác sĩ chuyên khoa chỉnh hình</li>
                      <li>Chụp thêm hình ảnh nếu được yêu cầu</li>
                      <li>Hạn chế các hoạt động chịu lực</li>
                      <li>Áp dụng phương pháp RICE (Nghỉ ngơi, Chườm đá, Băng ép, Nâng cao)</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kế hoạch phục hồi chức năng</h3>
                
                {/* Phase and Severity Information */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-800">
                        <span className="font-semibold">Giai đoạn:</span> {result.rehabPlan?.phase}/3
                      </p>
                      <p className="text-blue-800">
                        <span className="font-semibold">Thời gian:</span> {result.rehabPlan?.duration} tuần
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-800">
                        <span className="font-semibold">Mức độ:</span>{' '}
                        {result.rehabPlan?.severity === 1 ? 'Nặng' : 
                         result.rehabPlan?.severity === 0.5 ? 'Trung bình' : 'Nhẹ'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-4 mb-6">
                  {result.rehabPlan?.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-medium">{exercise.name}</h4>
                          <p className="text-sm text-gray-600">{exercise.description}</p>
                        </div>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                          Độ khó: {exercise.difficulty}/5
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="font-medium text-gray-700">Số hiệp</p>
                          <p className="text-blue-600">{exercise.sets}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="font-medium text-gray-700">Số lần</p>
                          <p className="text-blue-600">{exercise.reps}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <p className="font-medium text-gray-700">Nghỉ</p>
                          <p className="text-blue-600">{exercise.rest}s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings and Notes */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Lưu ý quan trọng</h4>
                  <ul className="space-y-1">
                    {result.rehabPlan?.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-800 flex items-start">
                        <span className="mr-2">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModelAnalysisPage;