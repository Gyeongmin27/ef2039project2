'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { EvaluationScores } from '@/lib/ai/scoreCalculation';

interface ScoreChartProps {
  scores: EvaluationScores;
  criticReview?: string | null;
}

// 폴백 비평가 평가 생성 (AI 평가가 없을 경우)
function generateFallbackReview(scores: EvaluationScores): string {
  const { totalScore, colorHarmony, styleConsistency, patternCombination, textureHarmony, proportionSilhouette } = scores;
  
  // 가장 높은 점수와 가장 낮은 점수 찾기
  const scoreItems = [
    { name: '색상 조화도', score: colorHarmony, max: 25 },
    { name: '스타일 일관성', score: styleConsistency, max: 25 },
    { name: '패턴 조합', score: patternCombination, max: 15 },
    { name: '텍스처 조화', score: textureHarmony, max: 15 },
    { name: '비율 및 실루엣', score: proportionSilhouette, max: 15 },
  ];
  
  const sortedItems = scoreItems.sort((a, b) => (b.score / b.max) - (a.score / a.max));
  const strongest = sortedItems[0];
  const weakest = sortedItems[sortedItems.length - 1];
  
  let review = '';
  
  if (totalScore >= 90) {
    review = `이 룩은 색상, 스타일, 비율의 완벽한 조화를 보여주는 모범 사례입니다. ${strongest.name}에서 드러나는 세련미가 전체적인 완성도를 높이고 있으며, 패션 감각의 정점을 보여줍니다.`;
  } else if (totalScore >= 80) {
    review = `${strongest.name}에서 빛나는 강점이 인상적이며, 전체적인 스타일링이 우수한 수준입니다. 다만 ${weakest.name} 부분의 미세한 조정을 통해 더욱 완벽한 룩을 완성할 수 있을 것입니다.`;
  } else if (totalScore >= 70) {
    review = `전반적으로 균형잡힌 스타일링이지만, ${weakest.name}에서 아쉬움이 남습니다. ${strongest.name}의 강점을 살리면서 약점을 보완한다면 훨씬 더 매력적인 룩이 될 것입니다.`;
  } else if (totalScore >= 60) {
    review = `기본적인 스타일링은 갖추고 있으나, ${weakest.name}와 ${strongest.name} 사이의 불균형이 눈에 띕니다. 전체적인 조화를 위해 색상과 스타일의 통일성을 재검토할 필요가 있습니다.`;
  } else if (totalScore >= 50) {
    review = `스타일링의 기본기는 있으나, 색상 조화와 패턴 배치에서 개선의 여지가 많습니다. ${weakest.name}를 중심으로 전반적인 재구성이 필요해 보입니다.`;
  } else if (totalScore >= 40) {
    review = `현재 룩은 색상, 패턴, 스타일의 조화가 부족하여 전체적인 통일감이 떨어집니다. ${weakest.name}를 우선적으로 개선하고, 기본적인 색상 이론을 적용하는 것이 시급합니다.`;
  } else {
    review = `이 룩은 색상 조화, 스타일 일관성, 패턴 배치 등 핵심 요소들이 서로 충돌하고 있어 전면적인 재구성이 필요합니다. 기본적인 무지 아이템으로 시작하여 점진적으로 스타일을 구축하는 것을 권장합니다.`;
  }
  
  return review;
}

export default function ScoreChart({ scores, criticReview }: ScoreChartProps) {
  const data = [
    {
      subject: '색상\n조화도',
      score: (scores.colorHarmony / 18) * 100,
      fullMark: 100,
    },
    {
      subject: '스타일\n일관성',
      score: (scores.styleConsistency / 18) * 100,
      fullMark: 100,
    },
    {
      subject: '패턴\n조합',
      score: (scores.patternCombination / 10) * 100,
      fullMark: 100,
    },
    {
      subject: '비율 및\n실루엣',
      score: (scores.proportionSilhouette / 10) * 100,
      fullMark: 100,
    },
    {
      subject: '텍스처\n조화',
      score: (scores.textureHarmony / 10) * 100,
      fullMark: 100,
    },
    {
      subject: '상황\n적합성',
      score: (scores.contextAppropriateness / 30) * 100,
      fullMark: 100,
    },
    {
      subject: '전체적\n조화',
      score: (scores.overallHarmony / 4) * 100,
      fullMark: 100,
    },
  ];

  // AI로 생성된 평가가 있으면 사용, 없으면 폴백 평가 사용
  const displayReview = criticReview || generateFallbackReview(scores);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">종합 평가 차트</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12, fill: '#374151' }} 
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="점수"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* 패션 비평가 한줄 평 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold mb-2 text-gray-900">패션 비평가 평가</h4>
            <p className="text-gray-900 leading-relaxed font-medium italic">
              {'"'}{displayReview}{'"'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

