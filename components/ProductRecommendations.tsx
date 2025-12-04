'use client';

import { useState } from 'react';
import type { RecommendedProduct, ProductRecommendations as ProductRecommendationsType } from '@/lib/ai/productRecommendations';

interface ProductRecommendationsProps {
  recommendations: ProductRecommendationsType;
}

export default function ProductRecommendations({ recommendations }: ProductRecommendationsProps) {
  const [searching, setSearching] = useState<Record<string, boolean>>({});

  const handleSearchMusinsa = async (product: RecommendedProduct) => {
    setSearching({ ...searching, [product.name]: true });

    try {
      // 무신사 검색 URL 생성 (색상 정보 제외)
      const categoryLabel = product.category === 'top' ? '상의' : product.category === 'bottom' ? '하의' : '액세서리';
      const searchQuery = `${categoryLabel} ${product.name}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      const searchUrl = `https://www.musinsa.com/search/musinsa/goods?q=${encodedQuery}`;

      // 새 창에서 무신사 검색 페이지 열기
      window.open(searchUrl, '_blank');
    } catch (error) {
      console.error('검색 오류:', error);
    } finally {
      setSearching({ ...searching, [product.name]: false });
    }
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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">구매 추천 아이템</h3>

      {recommendations.summary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-800 font-medium">{recommendations.summary}</p>
        </div>
      )}

      <div className="space-y-4">
        {recommendations.products.map((product, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                      product.category
                    )}`}
                  >
                    {getCategoryLabel(product.category)}
                  </span>
                  <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                </div>
                <p className="text-gray-700 mb-2 font-medium">{product.description}</p>
                {product.color && (
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-gray-600">추천 색상:</span>
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: product.color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{product.color}</span>
                      {product.color.match(/^#[0-9A-Fa-f]{6}$/) && (
                        <span className="text-xs text-gray-500">
                          RGB({parseInt(product.color.slice(1, 3), 16)}, {parseInt(product.color.slice(3, 5), 16)}, {parseInt(product.color.slice(5, 7), 16)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {product.style && (
                  <p className="text-sm text-gray-600 mb-2">
                    스타일: <span className="font-medium">{product.style}</span>
                  </p>
                )}
                {product.estimatedPrice && (
                  <p className="text-sm font-semibold text-blue-600 mb-2">
                    예상 가격: <span className="text-lg">{product.estimatedPrice}</span>
                  </p>
                )}
                <p className="text-sm text-gray-800 italic mt-2">💡 {product.reason}</p>
              </div>
            </div>
            <button
              onClick={() => handleSearchMusinsa(product)}
              disabled={searching[product.name]}
              className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {searching[product.name] ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>검색 중...</span>
                </>
              ) : (
                <>
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>무신사에서 검색하기</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

