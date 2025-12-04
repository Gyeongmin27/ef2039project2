'use client';

import { useState } from 'react';
import Image from 'next/image';
import ImageUpload, { TPO } from '@/components/ImageUpload';
import ScoreDisplay from '@/components/ScoreDisplay';
import ScoreChart from '@/components/ScoreChart';
import ImprovementList from '@/components/ImprovementList';
import { EvaluationScores } from '@/lib/ai/scoreCalculation';
import { ImprovementSuggestion } from '@/lib/ai/improvementSuggestions';
import { ProductRecommendations as ProductRecommendationsType } from '@/lib/ai/productRecommendations';

type AnalysisState = 'idle' | 'analyzing' | 'completed' | 'error';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tpo, setTpo] = useState<TPO>({ time: '', place: '', occasion: '' });
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [scores, setScores] = useState<EvaluationScores | null>(null);
  const [improvements, setImprovements] = useState<ImprovementSuggestion[]>([]);
  const [criticReview, setCriticReview] = useState<string | null>(null);
  const [productRecommendations, setProductRecommendations] = useState<ProductRecommendationsType | null>(null);

  const handleImageSelect = (file: File, selectedTpo: TPO) => {
    setSelectedImage(file);
    setTpo(selectedTpo);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysisState('idle');
    setScores(null);
    setImprovements([]);
    setCriticReview(null);
    setProductRecommendations(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalysisState('analyzing');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('tpo', JSON.stringify(tpo));

      const response = await fetch('/api/analyze-fashion', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('분석 실패');
      }

      const data = await response.json();
      setScores(data.scores);
      setImprovements(data.improvements);
      setCriticReview(data.criticReview || null);
      setProductRecommendations(data.productRecommendations || null);
      setAnalysisState('completed');
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisState('error');
    }
  };

  // 구매 추천 HTML 생성 함수
  const generateProductRecommendationsHTML = (recommendations: ProductRecommendationsType) => {
    const escapeHtml = (text: string) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const getCategoryLabel = (category: string) => {
      switch (category) {
        case 'top':
          return '상의';
        case 'bottom':
          return '하의';
        case 'accessory':
          return '액세서리';
        default:
          return category;
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'top':
          return 'bg-blue-100 text-blue-800';
        case 'bottom':
          return 'bg-green-100 text-green-800';
        case 'accessory':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return `
      ${recommendations.summary ? `
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-gray-800 font-medium">${escapeHtml(recommendations.summary)}</p>
        </div>
      ` : ''}
      <div class="space-y-4">
        ${recommendations.products.map((product, index) => {
          // 무신사 검색 시 색상 정보 제외
          const categoryLabel = product.category === 'top' ? '상의' : product.category === 'bottom' ? '하의' : '액세서리';
          const searchQuery = `${categoryLabel} ${product.name}`;
          const colorRgb = product.color && product.color.match(/^#[0-9A-Fa-f]{6}$/) 
            ? `RGB(${parseInt(product.color.slice(1, 3), 16)}, ${parseInt(product.color.slice(3, 5), 16)}, ${parseInt(product.color.slice(5, 7), 16)})`
            : '';
          return `
          <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="px-2 py-1 rounded text-xs font-medium ${getCategoryColor(product.category)}">
                    ${getCategoryLabel(product.category)}
                  </span>
                  <h4 class="font-bold text-lg text-gray-900">${escapeHtml(product.name)}</h4>
                </div>
                <p class="text-gray-700 mb-2 font-medium">${escapeHtml(product.description)}</p>
                ${product.color ? `
                  <div class="flex items-center space-x-3 mb-2">
                    <span class="text-sm text-gray-600">추천 색상:</span>
                    <div class="w-8 h-8 rounded border-2 border-gray-300 shadow-sm" style="background-color: ${escapeHtml(product.color)}"></div>
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-gray-900">${escapeHtml(product.color)}</span>
                      ${colorRgb ? `<span class="text-xs text-gray-500">${colorRgb}</span>` : ''}
                    </div>
                  </div>
                ` : ''}
                ${product.style ? `
                  <p class="text-sm text-gray-600 mb-2">
                    스타일: <span class="font-medium">${escapeHtml(product.style)}</span>
                  </p>
                ` : ''}
                ${product.estimatedPrice ? `
                  <p class="text-sm font-semibold text-blue-600 mb-2">
                    예상 가격: <span class="text-lg">${escapeHtml(product.estimatedPrice)}</span>
                  </p>
                ` : ''}
                <p class="text-sm text-gray-800 italic mt-2">💡 ${escapeHtml(product.reason)}</p>
              </div>
            </div>
            <button
              onclick="window.open('https://www.musinsa.com/search/musinsa/goods?q=' + encodeURIComponent('${escapeHtml(searchQuery)}'), '_blank')"
              class="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>무신사에서 검색하기</span>
            </button>
          </div>
        `;
        }).join('')}
      </div>
    `;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="로고"
                width={60}
                height={60}
                className="rounded-lg"
                priority
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                AI 패션 스타일 평가 시스템
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                상하의를 입고 있는 사진을 업로드하면 AI가 패션 스타일을 평가합니다
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 업로드 및 이미지 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="로고"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <h2 className="text-xl font-bold text-gray-900">사진 업로드</h2>
              </div>
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                imagePreview={imagePreview}
              />
              {selectedImage && (
                <button
                  onClick={handleAnalyze}
                  disabled={analysisState === 'analyzing'}
                  className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {analysisState === 'analyzing' ? '분석 중...' : '분석 시작'}
                </button>
              )}
            </div>

            {analysisState === 'analyzing' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">AI가 패션 스타일을 분석하고 있습니다...</p>
                </div>
              </div>
            )}

            {analysisState === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">분석 중 오류가 발생했습니다. 다시 시도해주세요.</p>
              </div>
            )}
          </div>

          {/* 오른쪽: 결과 */}
          <div className="space-y-6">
            {scores && (
              <>
                <ScoreDisplay scores={scores} />
                <ScoreChart scores={scores} criticReview={criticReview} />
                <ImprovementList improvements={improvements} />
                {productRecommendations && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <button
                      onClick={() => {
                        try {
                          // HTML 콘텐츠 생성
                          const logoUrl = `${window.location.origin}/logo.png`;
                          const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>구매 추천 아이템</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200">
        <img src="${logoUrl}" alt="로고" class="w-16 h-16 rounded-lg" onerror="this.style.display='none'" />
        <div>
          <h1 class="text-3xl font-bold text-gray-900">구매 추천 아이템</h1>
          <p class="text-sm text-gray-600 mt-1">AI가 추천하는 패션 개선 아이템</p>
        </div>
      </div>
      ${generateProductRecommendationsHTML(productRecommendations)}
    </div>
  </body>
</html>`;

                          // Blob URL 생성
                          const blob = new Blob([htmlContent], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          
                          // 새 창 열기
                          const newWindow = window.open(url, '_blank', 'width=900,height=1000,scrollbars=yes,resizable=yes');
                          
                          if (!newWindow) {
                            alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
                            return;
                          }
                          
                          // 창이 닫히면 URL 해제
                          newWindow.addEventListener('beforeunload', () => {
                            URL.revokeObjectURL(url);
                          });
                        } catch (error) {
                          console.error('구매 추천 창 열기 실패:', error);
                          alert('구매 추천 창을 열 수 없습니다. 다시 시도해주세요.');
                        }
                      }}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <span>구매 추천 아이템 보기</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {analysisState === 'idle' && !scores && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Image
                    src="/logo.png"
                    alt="로고"
                    width={120}
                    height={120}
                    className="rounded-lg opacity-20"
                  />
                  <p className="text-gray-500 text-lg font-medium">
                    사진을 업로드하고 분석을 시작하세요
                  </p>
                  <p className="text-sm text-gray-400">
                    AI가 당신의 패션 스타일을 전문적으로 평가해드립니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="로고"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <p className="text-sm text-gray-600">
                © 2025 AI 패션 스타일 평가 시스템
              </p>
            </div>
            <p className="text-xs text-gray-500">
              AI 기반 패션 스타일 종합 평가 서비스
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

