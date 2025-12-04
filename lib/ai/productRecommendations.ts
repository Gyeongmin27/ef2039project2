/**
 * 구매 추천 아이템 생성
 * Gemini API를 사용하여 개선을 위한 구매 추천 아이템을 생성합니다.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationScores } from './scoreCalculation';
import { AnalysisData } from './scoreCalculation';
import { ImprovementSuggestion } from './improvementSuggestions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface RecommendedProduct {
  category: string; // 'top' | 'bottom' | 'accessory'
  name: string;
  description: string;
  color?: string;
  style?: string;
  reason: string;
  estimatedPrice?: string; // 예상 가격 (예: "30,000원 - 50,000원")
}

export interface ProductRecommendations {
  products: RecommendedProduct[];
  summary: string;
}

/**
 * Gemini API를 사용하여 구매 추천 아이템 생성
 */
export async function generateProductRecommendations(
  scores: EvaluationScores,
  analysisData: AnalysisData,
  improvements: ImprovementSuggestion[]
): Promise<ProductRecommendations> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  // 낮은 점수 항목 찾기
  const lowScoreCategories = improvements
    .filter(imp => imp.priority === 1 || imp.priority === 2)
    .map(imp => imp.category);

  const prompt = `당신은 패션 스타일리스트입니다. 다음 정보를 바탕으로 패션 스타일을 개선하기 위한 구매 추천 아이템을 제안해주세요.

현재 패션 분석:
- 상의 색상: ${analysisData.topColors.join(', ')}
- 하의 색상: ${analysisData.bottomColors.join(', ')}
- 상의 스타일: ${analysisData.topStyle}
- 하의 스타일: ${analysisData.bottomStyle}
- 상의 패턴: ${analysisData.topPattern}
- 하의 패턴: ${analysisData.bottomPattern}
- 개선이 필요한 항목: ${lowScoreCategories.join(', ')}

점수:
- 색상 조화도: ${scores.colorHarmony}/18
- 스타일 일관성: ${scores.styleConsistency}/18
- 패턴 조합: ${scores.patternCombination}/10
- 비율 및 실루엣: ${scores.proportionSilhouette}/10
- 텍스처 조화: ${scores.textureHarmony}/10
- 상황적합성: ${scores.contextAppropriateness}/30

개선 제안:
${improvements.map(imp => `- ${imp.category}: ${imp.suggestion}`).join('\n')}

다음 JSON 형식으로 응답해주세요:
{
  "products": [
    {
      "category": "top" | "bottom" | "accessory",
      "name": "아이템 이름 (예: 화이트 셔츠, 네이비 슬랙스)",
      "description": "아이템에 대한 간단한 설명",
      "color": "추천 색상 (HEX 코드 또는 색상명)",
      "style": "스타일 (casual, formal, sporty 등)",
      "reason": "이 아이템을 추천하는 이유",
      "estimatedPrice": "예상 가격 범위 (예: '30,000원 - 50,000원', '50,000원 - 80,000원')"
    }
  ],
  "summary": "전체적인 구매 추천 요약 (2-3문장)"
}

최대 3-5개의 아이템을 추천하고, 각 아이템은 구체적이고 실제로 구매 가능한 제품명을 사용해주세요. 
예상 가격은 한국 시장 기준으로 현실적인 가격 범위를 제시해주세요.`;

  // gemini-2.5-flash 모델만 사용
  const modelName = 'gemini-2.5-flash';
  
  try {
    console.log(`구매 추천 생성 시도 - 모델: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSON 추출
      let jsonText = text.trim();
      if (jsonText.includes('```')) {
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        } else {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const recommendations = JSON.parse(jsonText) as ProductRecommendations;

      if (!recommendations.products || !Array.isArray(recommendations.products)) {
        throw new Error('추천 아이템 형식이 올바르지 않습니다.');
      }

    console.log('구매 추천 생성 성공 (모델:', modelName, '):', recommendations.products.length, '개 아이템');
    return recommendations;
  } catch (err) {
    console.error(`구매 추천 생성 실패:`, err instanceof Error ? err.message : String(err));
    // 기본 추천 반환
    return {
      products: [
        {
          category: 'top',
          name: '기본 화이트 셔츠',
          description: '상하의 조화를 위한 기본 아이템',
          color: '#FFFFFF',
          style: 'casual',
          reason: '색상 조화도를 개선하기 위한 중성색 아이템',
          estimatedPrice: '30,000원 - 50,000원',
        },
      ],
      summary: '기본적인 무지 아이템으로 시작하여 점진적으로 스타일을 개선하세요.',
    };
  }
}

