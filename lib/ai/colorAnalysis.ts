/**
 * 색상 분석 유틸리티
 * ColorThief.js를 사용하여 이미지에서 색상을 추출하고 분석합니다.
 */

export interface ColorPalette {
  colors: string[];
  dominantColor: string;
  warmTone: boolean;
  coolTone: boolean;
}

/**
 * RGB를 HEX로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * HEX를 RGB로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 색상이 따뜻한 톤인지 차가운 톤인지 판단
 */
export function isWarmTone(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // 빨강과 노랑 성분이 많으면 따뜻한 톤
  return rgb.r > rgb.b && (rgb.r + rgb.g) > (rgb.b * 2);
}

/**
 * 두 색상 간의 유클리드 거리 계산
 */
export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return Infinity;
  
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * 색상 조화도 계산
 * 보색, 유사색, 단색 조합 등을 고려
 */
export function calculateColorHarmony(
  topColors: string[],
  bottomColors: string[]
): {
  harmonyScore: number; // 0-10
  contrastScore: number; // 0-8
  toneConsistencyScore: number; // 0-7
} {
  const topDominant = topColors[0];
  const bottomDominant = bottomColors[0];
  
  // 색상 조화 점수 계산 (간단한 버전)
  const colorDist = colorDistance(topDominant, bottomDominant);
  let harmonyScore = 0;
  
  // 적절한 거리면 높은 점수 (너무 가깝지도 멀지도 않음)
  if (colorDist > 50 && colorDist < 200) {
    harmonyScore = 8;
  } else if (colorDist > 30 && colorDist < 250) {
    harmonyScore = 6;
  } else {
    harmonyScore = 4;
  }
  
  // 대비 점수
  const contrast = Math.abs(
    (hexToRgb(topDominant)?.r || 0) - (hexToRgb(bottomDominant)?.r || 0)
  ) + Math.abs(
    (hexToRgb(topDominant)?.g || 0) - (hexToRgb(bottomDominant)?.g || 0)
  ) + Math.abs(
    (hexToRgb(topDominant)?.b || 0) - (hexToRgb(bottomDominant)?.b || 0)
  );
  
  let contrastScore = 0;
  if (contrast > 150 && contrast < 400) {
    contrastScore = 7;
  } else if (contrast > 100 && contrast < 500) {
    contrastScore = 5;
  } else {
    contrastScore = 3;
  }
  
  // 톤 일관성
  const topWarm = isWarmTone(topDominant);
  const bottomWarm = isWarmTone(bottomDominant);
  const toneConsistencyScore = topWarm === bottomWarm ? 6 : 3;
  
  return {
    harmonyScore: Math.min(10, harmonyScore),
    contrastScore: Math.min(8, contrastScore),
    toneConsistencyScore: Math.min(7, toneConsistencyScore),
  };
}

