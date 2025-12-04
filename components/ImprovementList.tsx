'use client';

import { ImprovementSuggestion } from '@/lib/ai/improvementSuggestions';

interface ImprovementListProps {
  improvements: ImprovementSuggestion[];
}

const priorityColors = {
  1: 'bg-red-100 border-red-300',
  2: 'bg-yellow-100 border-yellow-300',
  3: 'bg-blue-100 border-blue-300',
};

const priorityLabels = {
  1: '높음',
  2: '중간',
  3: '낮음',
};

export default function ImprovementList({ improvements }: ImprovementListProps) {
  if (improvements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">개선점</h3>
        <p className="text-gray-800">모든 항목이 양호한 수준입니다! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">개선점</h3>
      <div className="space-y-4">
        {improvements.map((improvement, index) => (
          <div
            key={index}
            className={`border-l-4 rounded p-4 ${priorityColors[improvement.priority]}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{improvement.category}</h4>
                <p className="text-sm text-gray-700 font-medium">
                  현재 점수: {improvement.score.toFixed(1)}점
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  improvement.priority === 1
                    ? 'bg-red-500 text-white'
                    : improvement.priority === 2
                    ? 'bg-yellow-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                우선순위: {priorityLabels[improvement.priority]}
              </span>
            </div>
            <p className="text-gray-900 mb-2 font-medium">{improvement.suggestion}</p>
            {improvement.tip && (
              <p className="text-sm text-gray-700 italic font-medium">💡 {improvement.tip}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

