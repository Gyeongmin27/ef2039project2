import { NextRequest, NextResponse } from 'next/server';
import { calculateScores, AnalysisData } from '@/lib/ai/scoreCalculation';
import { generateImprovements } from '@/lib/ai/improvementSuggestions';
import { analyzeFashionWithGemini } from '@/lib/ai/geminiAnalysis';
import { generateCriticReviewWithGemini } from '@/lib/ai/geminiCriticReview';
import { generateProductRecommendations } from '@/lib/ai/productRecommendations';

/**
 * 패션 스타일 분석 API
 * Gemini API를 사용하여 이미지를 분석하고 점수를 계산합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const tpoString = formData.get('tpo') as string;
    
    if (!imageFile) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (20MB 제한)
    if (imageFile.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: '이미지 크기는 20MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // TPO 파싱
    let tpo = null;
    if (tpoString) {
      try {
        tpo = JSON.parse(tpoString);
      } catch (e) {
        console.warn('TPO 파싱 실패:', e);
      }
    }

    // Gemini API를 사용한 이미지 분석
    let geminiResult;
    try {
      geminiResult = await analyzeFashionWithGemini(imageFile);
      console.log('이미지 분석 완료:', {
        filename: imageFile.name,
        size: imageFile.size,
        topColors: geminiResult.topColors,
        bottomColors: geminiResult.bottomColors,
      });
    } catch (error) {
      console.error('이미지 분석 실패:', error);
      return NextResponse.json(
        { 
          error: '이미지 분석에 실패했습니다. API 키를 확인하거나 다시 시도해주세요.',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
    
    // AnalysisData 형식으로 변환
    const analysisData: AnalysisData = {
      topColors: geminiResult.topColors,
      bottomColors: geminiResult.bottomColors,
      topPattern: geminiResult.topPattern,
      bottomPattern: geminiResult.bottomPattern,
      topStyle: geminiResult.topStyle,
      bottomStyle: geminiResult.bottomStyle,
      topTexture: geminiResult.topTexture,
      bottomTexture: geminiResult.bottomTexture,
      season: geminiResult.season,
      tpo: tpo || undefined,
    };

    // 점수 계산
    const scores = calculateScores(analysisData);

    // 개선점 생성
    const improvements = generateImprovements(scores);

    // Gemini API를 사용한 패션 비평가 평가 생성
    const criticReview = await generateCriticReviewWithGemini(scores, analysisData);

    // 구매 추천 아이템 생성
    let productRecommendations = null;
    try {
      productRecommendations = await generateProductRecommendations(
        scores,
        analysisData,
        improvements
      );
    } catch (error) {
      console.error('구매 추천 생성 실패:', error);
      // 구매 추천 실패해도 계속 진행
    }

    return NextResponse.json({
      success: true,
      scores,
      improvements,
      analysis: analysisData,
      criticReview,
      productRecommendations,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

