/**
 * Gemini API를 사용한 이미지 분석
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// GoogleGenerativeAI 클라이언트 초기화
// 기본적으로 v1beta를 사용하지만, 모델명에 따라 자동으로 적절한 버전 선택
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GeminiAnalysisResult {
  topColors: string[];
  bottomColors: string[];
  topPattern: string;
  bottomPattern: string;
  topStyle: string;
  bottomStyle: string;
  topTexture?: string;
  bottomTexture?: string;
  season?: string;
}

/**
 * 이미지를 base64로 변환
 */
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * Gemini API를 사용하여 패션 이미지 분석
 */
export async function analyzeFashionWithGemini(
  imageFile: File
): Promise<GeminiAnalysisResult> {
  // API 키 검증
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY가 설정되지 않았습니다.');
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  // 이미지를 base64로 변환
  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type;
  
  console.log('Gemini API 호출 시작 - 이미지 크기:', imageFile.size, 'bytes, 타입:', mimeType);
  
  // pro 모델 먼저 시도, 실패하면 flash 모델 사용
  const modelsToTry = ['gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`모델 시도: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `이 이미지는 상하의를 입고 있는 사람의 사진입니다. 다음 정보를 분석하여 JSON 형식으로 응답해주세요:

1. 상의(top) 분석:
   - 주요 색상 3개를 HEX 코드로 (예: ["#FF0000", "#00FF00", "#0000FF"])
   - 패턴: "solid", "striped", "checked", "floral", "dot", "geometric" 중 하나
   - 스타일: "casual", "formal", "sporty", "vintage", "minimal" 중 하나
   - 텍스처: "cotton", "denim", "knit", "silk", "leather" 등 (선택사항)

2. 하의(bottom) 분석:
   - 주요 색상 2-3개를 HEX 코드로
   - 패턴: "solid", "striped", "checked", "floral", "dot", "geometric" 중 하나
   - 스타일: "casual", "formal", "sporty", "vintage", "minimal" 중 하나
   - 텍스처: "cotton", "denim", "knit", "silk", "leather" 등 (선택사항)

3. 계절성 (선택사항):
   - "spring", "summer", "fall", "winter" 중 하나 또는 null

다음 JSON 형식으로만 응답하세요 (다른 설명 없이):
{
  "topColors": ["#HEX1", "#HEX2", "#HEX3"],
  "bottomColors": ["#HEX1", "#HEX2"],
  "topPattern": "solid",
  "bottomPattern": "solid",
  "topStyle": "casual",
  "bottomStyle": "casual",
  "topTexture": "cotton",
  "bottomTexture": "denim",
  "season": "spring"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ]);

      const response = result.response;
      const text = response.text();
      
      console.log('Gemini API 응답 (원본):', text.substring(0, 200) + '...');
      
      // JSON 추출 (마크다운 코드 블록 제거)
      let jsonText = text.trim();
      
      // 마크다운 코드 블록 제거
      if (jsonText.includes('```')) {
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        } else {
          // 코드 블록이 있지만 매칭 실패 시 수동 제거
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
      }
      
      // JSON 객체만 추출 (앞뒤 텍스트 제거)
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      let analysis: GeminiAnalysisResult;
      try {
        analysis = JSON.parse(jsonText) as GeminiAnalysisResult;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw text:', text);
        throw new Error('Gemini API 응답 파싱 실패');
      }
      
      // 필수 필드 검증
      if (!analysis.topColors || !analysis.bottomColors || !analysis.topPattern || !analysis.bottomPattern) {
        console.error('필수 필드 누락:', analysis);
        throw new Error('Gemini API 응답에 필수 필드가 없습니다');
      }
      
      console.log('Gemini API 분석 성공 (모델:', modelName, '):', {
        topColors: analysis.topColors,
        bottomColors: analysis.bottomColors,
        topPattern: analysis.topPattern,
        bottomPattern: analysis.bottomPattern,
        topStyle: analysis.topStyle,
        bottomStyle: analysis.bottomStyle,
      });
      
      return analysis;
    } catch (err) {
      console.error(`모델 ${modelName} 실패:`, err instanceof Error ? err.message : String(err));
      lastError = err instanceof Error ? err : new Error(String(err));
      // 다음 모델 시도
      continue;
    }
  }
  
  // 모든 모델 실패
  throw new Error(`이미지 분석 실패: 모든 모델 시도 실패. 마지막 에러: ${lastError?.message || 'Unknown error'}`);
}

