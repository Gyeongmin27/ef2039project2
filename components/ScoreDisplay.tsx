'use client';

import { EvaluationScores } from '@/lib/ai/scoreCalculation';

interface ScoreDisplayProps {
  scores: EvaluationScores;
}

const gradeColors: Record<string, string> = {
  S: 'bg-purple-500',
  A: 'bg-blue-500',
  B: 'bg-green-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

const gradeTextColors: Record<string, string> = {
  S: 'text-purple-600',
  A: 'text-blue-600',
  B: 'text-green-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  F: 'text-red-600',
};

export default function ScoreDisplay({ scores }: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full space-y-6">
      {/* 총점 및 등급 */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <span className={`text-6xl font-bold ${getScoreColor(scores.totalScore)}`}>
            {scores.totalScore.toFixed(1)}
          </span>
          <span className="text-2xl text-gray-500 ml-2">/ 100</span>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <span
            className={`px-6 py-2 rounded-full text-white font-bold text-xl ${gradeColors[scores.grade]}`}
          >
            {scores.grade} 등급
          </span>
        </div>
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${getProgressColor(scores.totalScore)}`}
              style={{ width: `${scores.totalScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 세부 점수 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">세부 점수</h3>
        <div className="space-y-4">
          {[
            { label: '색상 조화도', score: scores.colorHarmony, max: 18, weight: '18%' },
            { label: '스타일 일관성', score: scores.styleConsistency, max: 18, weight: '18%' },
            { label: '패턴 조합', score: scores.patternCombination, max: 10, weight: '10%' },
            { label: '비율 및 실루엣', score: scores.proportionSilhouette, max: 10, weight: '10%' },
            { label: '텍스처 조화', score: scores.textureHarmony, max: 10, weight: '10%' },
            { label: '상황적합성', score: scores.contextAppropriateness, max: 30, weight: '30%' },
            { label: '전체적 조화', score: scores.overallHarmony, max: 4, weight: '4%' },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-xs text-gray-600">(가중치: {item.weight})</span>
                </div>
                <span className={`font-bold ${getScoreColor((item.score / item.max) * 100)}`}>
                  {item.score.toFixed(1)} / {item.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor((item.score / item.max) * 100)}`}
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

