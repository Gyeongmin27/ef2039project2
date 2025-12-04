/**
 * Gemini API를 사용한 패션 비평가 평가 생성
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationScores } from './scoreCalculation';
import { AnalysisData } from './scoreCalculation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Gemini API를 사용하여 패션 비평가 스타일의 평가 생성
 */
export async function generateCriticReviewWithGemini(
  scores: EvaluationScores,
  analysisData: AnalysisData
): Promise<string> {
  // pro 모델 먼저 시도, 실패하면 flash 모델 사용
  const modelsToTry = ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`비평가 평가 모델 시도: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `당신은 전문 패션 비평가입니다. 다음 패션 스타일 평가 결과를 바탕으로 전문적이고 객관적인 한 줄 평가를 작성해주세요.

**평가 점수:**
- 총점: ${scores.totalScore.toFixed(1)}/100점 (${scores.grade} 등급)
- 색상 조화도: ${scores.colorHarmony.toFixed(1)}/18점
- 스타일 일관성: ${scores.styleConsistency.toFixed(1)}/18점
- 패턴 조합: ${scores.patternCombination.toFixed(1)}/10점
- 비율 및 실루엣: ${scores.proportionSilhouette.toFixed(1)}/10점
- 텍스처 조화: ${scores.textureHarmony.toFixed(1)}/10점
- 상황적합성: ${scores.contextAppropriateness.toFixed(1)}/30점
- 전체적 조화: ${scores.overallHarmony.toFixed(1)}/4점

**의류 분석 정보:**
- 상의 색상: ${analysisData.topColors.join(', ')}
- 하의 색상: ${analysisData.bottomColors.join(', ')}
- 상의 패턴: ${analysisData.topPattern}
- 하의 패턴: ${analysisData.bottomPattern}
- 상의 스타일: ${analysisData.topStyle}
- 하의 스타일: ${analysisData.bottomStyle}
- 상의 텍스처: ${analysisData.topTexture || '미분류'}
- 하의 텍스처: ${analysisData.bottomTexture || '미분류'}

**요구사항:**
1. 패션 비평가의 전문적이고 객관적인 톤으로 작성
2. 강점과 약점을 구체적으로 언급
3. 개선 방향을 제시
4. 2-3문장으로 구성 (약 100-150자)
5. 한국어로 작성
6. 따옴표나 마크다운 없이 순수 텍스트만 반환

평가를 작성해주세요:`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let review = response.text().trim();

      // 마크다운이나 따옴표 제거
      review = review.replace(/^["']|["']$/g, '').replace(/```/g, '').trim();

      console.log(`비평가 평가 생성 성공 (모델: ${modelName})`);
      return review;
    } catch (err) {
      console.error(`모델 ${modelName} 실패:`, err instanceof Error ? err.message : String(err));
      lastError = err instanceof Error ? err : new Error(String(err));
      // 다음 모델 시도
      continue;
    }
  }
  
  // 모든 모델 실패 시 폴백 평가 반환
  console.error('모든 모델 실패, 폴백 평가 사용');
  return generateFallbackReview(scores);
}

/**
 * 폴백 평가 생성 (에러 발생 시)
 */
function generateFallbackReview(scores: EvaluationScores): string {
  const { totalScore } = scores;
  
  if (totalScore >= 90) {
    return '이 룩은 색상, 스타일, 비율의 완벽한 조화를 보여주는 모범 사례입니다. 전체적인 완성도가 매우 높으며, 패션 감각의 정점을 보여줍니다.';
  } else if (totalScore >= 80) {
    return '전체적인 스타일링이 우수한 수준입니다. 미세한 조정을 통해 더욱 완벽한 룩을 완성할 수 있을 것입니다.';
  } else if (totalScore >= 70) {
    return '전반적으로 균형잡힌 스타일링이지만, 일부 항목에서 개선의 여지가 있습니다. 강점을 살리면서 약점을 보완한다면 더욱 매력적인 룩이 될 것입니다.';
  } else if (totalScore >= 60) {
    return '기본적인 스타일링은 갖추고 있으나, 전체적인 조화를 위해 색상과 스타일의 통일성을 재검토할 필요가 있습니다.';
  } else if (totalScore >= 50) {
    return '스타일링의 기본기는 있으나, 색상 조화와 패턴 배치에서 개선의 여지가 많습니다. 전반적인 재구성이 필요해 보입니다.';
  } else if (totalScore >= 40) {
    return '현재 룩은 색상, 패턴, 스타일의 조화가 부족하여 전체적인 통일감이 떨어집니다. 기본적인 색상 이론을 적용하는 것이 시급합니다.';
  } else {
    return '이 룩은 핵심 요소들이 서로 충돌하고 있어 전면적인 재구성이 필요합니다. 기본적인 무지 아이템으로 시작하여 점진적으로 스타일을 구축하는 것을 권장합니다.';
  }
}

