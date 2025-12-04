/**
 * 점수 계산 시스템
 * PRD의 점수 체계에 따라 총점과 세부 점수를 계산합니다.
 */

export interface EvaluationScores {
  colorHarmony: number; // 0-18
  styleConsistency: number; // 0-18
  patternCombination: number; // 0-10
  proportionSilhouette: number; // 0-10
  textureHarmony: number; // 0-10
  contextAppropriateness: number; // 0-30
  overallHarmony: number; // 0-4
  totalScore: number; // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface AnalysisData {
  topColors: string[];
  bottomColors: string[];
  topPattern: string;
  bottomPattern: string;
  topStyle: string;
  bottomStyle: string;
  topTexture?: string;
  bottomTexture?: string;
  season?: string;
  tpo?: {
    time: string;
    place: string;
    occasion: string;
  };
}

/**
 * 색상 조화도 점수 계산 (18점 만점)
 */
function calculateColorHarmonyScore(
  topColors: string[],
  bottomColors: string[]
): number {
  // 간단한 구현: 색상 거리 기반
  const topDominant = topColors[0];
  const bottomDominant = bottomColors[0];
  
  // 색상 조화 (0-10점)
  const colorDist = Math.sqrt(
    Math.pow((parseInt(topDominant.slice(1, 3), 16) - parseInt(bottomDominant.slice(1, 3), 16)), 2) +
    Math.pow((parseInt(topDominant.slice(3, 5), 16) - parseInt(bottomDominant.slice(3, 5), 16)), 2) +
    Math.pow((parseInt(topDominant.slice(5, 7), 16) - parseInt(bottomDominant.slice(5, 7), 16)), 2)
  );
  
  let harmonyScore = 0;
  if (colorDist > 50 && colorDist < 200) {
    harmonyScore = 8;
  } else if (colorDist > 30 && colorDist < 250) {
    harmonyScore = 6;
  } else {
    harmonyScore = 4;
  }
  
  // 색상 대비 (0-8점)
  const contrast = Math.abs(parseInt(topDominant.slice(1, 3), 16) - parseInt(bottomDominant.slice(1, 3), 16)) +
    Math.abs(parseInt(topDominant.slice(3, 5), 16) - parseInt(bottomDominant.slice(3, 5), 16)) +
    Math.abs(parseInt(topDominant.slice(5, 7), 16) - parseInt(bottomDominant.slice(5, 7), 16));
  
  let contrastScore = 0;
  if (contrast > 150 && contrast < 400) {
    contrastScore = 7;
  } else if (contrast > 100 && contrast < 500) {
    contrastScore = 5;
  } else {
    contrastScore = 3;
  }
  
  // 톤 일관성 (0-7점) - 간단히 구현
  const toneConsistencyScore = 5;
  
  const colorHarmonyRaw = (harmonyScore * 0.4) + (contrastScore * 0.32) + (toneConsistencyScore * 0.28);
  return (colorHarmonyRaw / 10) * 18; // 18점 만점으로 변환
}

/**
 * 스타일 일관성 점수 계산 (18점 만점)
 */
function calculateStyleConsistencyScore(
  topStyle: string,
  bottomStyle: string,
  season?: string
): number {
  // 스타일 매칭 (0-8점)
  let styleMatchScore = 0;
  if (topStyle === bottomStyle) {
    styleMatchScore = 7;
  } else if (
    (topStyle === 'casual' && bottomStyle === 'casual') ||
    (topStyle === 'formal' && bottomStyle === 'formal')
  ) {
    styleMatchScore = 6;
  } else {
    styleMatchScore = 4;
  }
  
  // 전체적인 스타일 통일성 (0-7점)
  const unityScore = topStyle === bottomStyle ? 6 : 4;
  
  // 계절성 적합도 (0-5점)
  const seasonScore = season ? 4 : 3;
  
  const styleConsistencyRaw = (styleMatchScore * 0.4) + (unityScore * 0.35) + (seasonScore * 0.25);
  return (styleConsistencyRaw / 10) * 18; // 18점 만점으로 변환
}

/**
 * 패턴 조합 점수 계산 (10점 만점)
 */
function calculatePatternCombinationScore(
  topPattern: string,
  bottomPattern: string
): number {
  // 패턴 조합 적절성 (0-10점)
  let patternScore = 0;
  if (topPattern === 'solid' && bottomPattern !== 'solid') {
    patternScore = 9; // 무지+패턴 (최적)
  } else if (topPattern !== 'solid' && bottomPattern === 'solid') {
    patternScore = 9;
  } else if (topPattern === 'solid' && bottomPattern === 'solid') {
    patternScore = 7; // 무지+무지
  } else if (topPattern === bottomPattern) {
    patternScore = 5; // 유사 패턴
  } else {
    patternScore = 3; // 충돌 패턴
  }
  
  // 패턴 크기 조화 (0-5점)
  const sizeHarmonyScore = 4;
  
  const patternRaw = (patternScore * 0.67) + (sizeHarmonyScore * 0.33);
  return (patternRaw / 10) * 10; // 10점 만점으로 변환
}

/**
 * 비율 및 실루엣 점수 계산 (10점 만점)
 */
function calculateProportionSilhouetteScore(): number {
  // 실제 구현에서는 이미지 분석이 필요하지만, 여기서는 기본값 반환
  // 향후 이미지 분석 결과를 받아서 계산
  return 7; // 기본 점수
}

/**
 * 텍스처 조화 점수 계산 (10점 만점)
 */
function calculateTextureHarmonyScore(
  topTexture?: string,
  bottomTexture?: string
): number {
  if (!topTexture || !bottomTexture) {
    return 6; // 기본 점수 (10점 만점의 60%)
  }
  
  // 조화로운 조합
  const harmoniousCombos = [
    ['cotton', 'denim'],
    ['knit', 'cotton'],
    ['cotton', 'cotton'],
  ];
  
  let combinationScore = 0;
  const combo = [topTexture, bottomTexture].sort().join('+');
  if (harmoniousCombos.some(c => c.sort().join('+') === combo)) {
    combinationScore = 5;
  } else {
    combinationScore = 3;
  }
  
  const contrastScore = 3;
  
  const textureRaw = (combinationScore * 0.6) + (contrastScore * 0.4);
  return (textureRaw / 10) * 10; // 10점 만점으로 변환
}

/**
 * 상황적합성 점수 계산 (30점 만점)
 */
function calculateContextAppropriatenessScore(
  topStyle: string,
  bottomStyle: string,
  tpo?: { time: string; place: string; occasion: string }
): number {
  if (!tpo || !tpo.time || !tpo.place || !tpo.occasion) {
    return 20; // TPO 정보가 없으면 중간 점수
  }

  let score = 0;

  // Time 적합성 (0-10점)
  const timeScore = tpo.time ? 8 : 0;
  
  // Place 적합성 (0-10점)
  let placeScore = 0;
  if (tpo.place === 'office' && (topStyle === 'formal' || bottomStyle === 'formal')) {
    placeScore = 9;
  } else if (tpo.place === 'casual' && (topStyle === 'casual' || bottomStyle === 'casual')) {
    placeScore = 9;
  } else if (tpo.place === 'party' && (topStyle !== 'sporty' && bottomStyle !== 'sporty')) {
    placeScore = 8;
  } else {
    placeScore = 6;
  }

  // Occasion 적합성 (0-10점)
  let occasionScore = 0;
  if (tpo.occasion === 'business' && (topStyle === 'formal' || bottomStyle === 'formal')) {
    occasionScore = 9;
  } else if (tpo.occasion === 'casual' && (topStyle === 'casual' || bottomStyle === 'casual')) {
    occasionScore = 9;
  } else if (tpo.occasion === 'date' && (topStyle !== 'sporty' && bottomStyle !== 'sporty')) {
    occasionScore = 8;
  } else if (tpo.occasion === 'formal' && (topStyle === 'formal' && bottomStyle === 'formal')) {
    occasionScore = 10;
  } else {
    occasionScore = 6;
  }

  score = timeScore + placeScore + occasionScore;
  return Math.min(score, 30); // 최대 30점
}

/**
 * 전체적 조화 점수 계산 (4점 만점)
 */
function calculateOverallHarmonyScore(): number {
  // 종합적인 시각적 조화
  return 3; // 기본 점수
}

/**
 * 등급 계산
 */
function calculateGrade(totalScore: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (totalScore >= 90) return 'S';
  if (totalScore >= 80) return 'A';
  if (totalScore >= 70) return 'B';
  if (totalScore >= 60) return 'C';
  if (totalScore >= 50) return 'D';
  return 'F';
}

/**
 * 총점 및 세부 점수 계산
 */
export function calculateScores(data: AnalysisData): EvaluationScores {
  const colorHarmony = calculateColorHarmonyScore(data.topColors, data.bottomColors);
  const styleConsistency = calculateStyleConsistencyScore(
    data.topStyle,
    data.bottomStyle,
    data.season
  );
  const patternCombination = calculatePatternCombinationScore(
    data.topPattern,
    data.bottomPattern
  );
  const proportionSilhouette = calculateProportionSilhouetteScore();
  const textureHarmony = calculateTextureHarmonyScore(
    data.topTexture,
    data.bottomTexture
  );
  const contextAppropriateness = calculateContextAppropriatenessScore(
    data.topStyle,
    data.bottomStyle,
    data.tpo
  );
  const overallHarmony = calculateOverallHarmonyScore();
  
  // 총점 = 부분 점수들의 합 (가중치 적용 없이)
  const totalScore = 
    colorHarmony +
    styleConsistency +
    patternCombination +
    proportionSilhouette +
    textureHarmony +
    contextAppropriateness +
    overallHarmony;
  
  return {
    colorHarmony: Math.round(colorHarmony * 100) / 100,
    styleConsistency: Math.round(styleConsistency * 100) / 100,
    patternCombination: Math.round(patternCombination * 100) / 100,
    proportionSilhouette: Math.round(proportionSilhouette * 100) / 100,
    textureHarmony: Math.round(textureHarmony * 100) / 100,
    contextAppropriateness: Math.round(contextAppropriateness * 100) / 100,
    overallHarmony: Math.round(overallHarmony * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    grade: calculateGrade(totalScore),
  };
}

