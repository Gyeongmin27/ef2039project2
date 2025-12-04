/**
 * 개선점 생성 시스템
 * 점수에 따라 구체적인 개선 방안을 생성합니다.
 */

import { EvaluationScores } from './scoreCalculation';

export interface ImprovementSuggestion {
  category: string;
  score: number;
  priority: 1 | 2 | 3; // 1: 높음, 2: 중간, 3: 낮음
  suggestion: string;
  tip?: string;
}

export function generateImprovements(scores: EvaluationScores): ImprovementSuggestion[] {
  const improvements: ImprovementSuggestion[] = [];

  // 색상 조화도 개선점 (18점 만점)
  if (scores.colorHarmony < 11) {
    const priority: 1 | 2 | 3 = scores.colorHarmony < 7 ? 1 : scores.colorHarmony < 9 ? 2 : 3;
    improvements.push({
      category: '색상 조화도',
      score: scores.colorHarmony,
      priority,
      suggestion: scores.colorHarmony < 10
        ? '색상 조합을 전면적으로 재검토하세요. 무지 아이템으로 시작하는 것을 권장합니다.'
        : scores.colorHarmony < 12.5
        ? '색상 조합이 충돌하고 있습니다. 중성색(검정, 흰색, 회색)을 활용해보세요.'
        : '상하의 색상 조화를 개선하세요. 보색 관계나 유사색 조합을 시도해보세요.',
      tip: '팁: 빨강-청록, 노랑-보라 같은 보색 조합이 시각적으로 매력적입니다.',
    });
  }

  // 스타일 일관성 개선점 (18점 만점)
  if (scores.styleConsistency < 11) {
    const priority: 1 | 2 | 3 = scores.styleConsistency < 7 ? 1 : scores.styleConsistency < 9 ? 2 : 3;
    improvements.push({
      category: '스타일 일관성',
      score: scores.styleConsistency,
      priority,
      suggestion: scores.styleConsistency < 10
        ? '스타일이 완전히 불일치합니다. 캐주얼 또는 포멀 중 하나로 통일하세요.'
        : scores.styleConsistency < 12.5
        ? '스타일이 혼재되어 있습니다. 한 가지 스타일로 통일하는 것을 권장합니다.'
        : '상하의 스타일을 더 일치시키면 통일감 있는 룩을 연출할 수 있습니다.',
    });
  }

  // 패턴 조합 개선점 (10점 만점)
  if (scores.patternCombination < 6) {
    const priority: 1 | 2 | 3 = scores.patternCombination < 4 ? 1 : scores.patternCombination < 5 ? 2 : 3;
    improvements.push({
      category: '패턴 조합',
      score: scores.patternCombination,
      priority,
      suggestion: scores.patternCombination < 6
        ? '패턴 조합을 전면적으로 재검토하세요. 무지 아이템으로 시작하는 것을 권장합니다.'
        : scores.patternCombination < 7.5
        ? '패턴이 충돌하고 있습니다. 한 가지 패턴만 사용하거나 무지 아이템으로 교체하세요.'
        : '패턴 조합을 개선하세요. 무지 아이템과 패턴 아이템을 조합하는 것을 권장합니다.',
    });
  }

  // 비율 및 실루엣 개선점 (10점 만점)
  if (scores.proportionSilhouette < 6) {
    const priority: 1 | 2 | 3 = scores.proportionSilhouette < 4 ? 1 : scores.proportionSilhouette < 5 ? 2 : 3;
    improvements.push({
      category: '비율 및 실루엣',
      score: scores.proportionSilhouette,
      priority,
      suggestion: scores.proportionSilhouette < 6
        ? '실루엣이 불균형합니다. 의류의 길이와 핏을 재검토하세요.'
        : scores.proportionSilhouette < 7.5
        ? '비율이 부적절합니다. 상의 또는 하의 길이를 조정해보세요.'
        : '상하의 길이 비율을 조정하면 더 균형잡힌 실루엣을 만들 수 있습니다.',
    });
  }

  // 텍스처 조화 개선점 (10점 만점)
  if (scores.textureHarmony < 6) {
    const priority: 1 | 2 | 3 = scores.textureHarmony < 4 ? 1 : 2;
    improvements.push({
      category: '텍스처 조화',
      score: scores.textureHarmony,
      priority,
      suggestion: scores.textureHarmony < 6
        ? '텍스처가 충돌하고 있습니다. 유사한 텍스처로 통일하거나 대비를 줄이세요.'
        : '텍스처 조합을 개선하세요. 면과 데님, 니트와 면 같은 조화로운 조합을 시도해보세요.',
    });
  }

  // 상황적합성 개선점 (30점 만점)
  if (scores.contextAppropriateness < 18) {
    const priority: 1 | 2 | 3 = scores.contextAppropriateness < 12 ? 1 : scores.contextAppropriateness < 15 ? 2 : 3;
    improvements.push({
      category: '상황적합성',
      score: scores.contextAppropriateness,
      priority,
      suggestion: scores.contextAppropriateness < 12
        ? '선택한 TPO(시간, 장소, 상황)에 맞지 않는 스타일입니다. 상황에 적합한 의류로 교체하세요.'
        : scores.contextAppropriateness < 15
        ? 'TPO에 부분적으로 맞지 않습니다. 더 적합한 스타일로 조정하세요.'
        : 'TPO에 대체로 적합하나, 더 나은 조화를 위해 스타일을 미세 조정하세요.',
      tip: '팁: 비즈니스 상황에는 포멀한 스타일, 캐주얼 상황에는 편안한 스타일을 선택하세요.',
    });
  }

  // 우선순위 순으로 정렬
  return improvements.sort((a, b) => a.priority - b.priority);
}

