import { NextRequest, NextResponse } from 'next/server';

/**
 * 무신사 사이트에서 상품 검색
 * 실제로는 무신사 API가 없으므로, 검색어를 기반으로 무신사 검색 URL을 생성합니다.
 * 실제 크롤링은 클라이언트 측에서 iframe이나 새 창으로 열 수 있도록 링크를 제공합니다.
 */

interface MusinsaSearchResult {
  query: string;
  searchUrl: string;
  products: Array<{
    name: string;
    url: string;
    imageUrl?: string;
    price?: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    // 무신사 검색 URL 생성
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://www.musinsa.com/search/musinsa/goods?q=${encodedQuery}`;

    // 실제 크롤링은 클라이언트 측에서 할 수 없으므로 (CORS 문제),
    // 검색 URL과 기본 정보만 반환
    // 실제 구현에서는 서버 측 크롤링 라이브러리(puppeteer, cheerio 등)를 사용해야 합니다.

    const result: MusinsaSearchResult = {
      query,
      searchUrl,
      products: [
        // 실제 크롤링 결과가 없으므로 샘플 데이터
        // 실제로는 puppeteer나 cheerio를 사용하여 크롤링해야 합니다
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('무신사 검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 실제 크롤링을 위한 POST 엔드포인트
 * Puppeteer를 사용하여 무신사 사이트를 크롤링합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    // Puppeteer를 사용한 크롤링은 Vercel의 서버리스 함수에서 제한이 있을 수 있습니다.
    // 대안으로 무신사 검색 URL을 반환하고, 클라이언트에서 새 창으로 열도록 합니다.
    
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://www.musinsa.com/search/musinsa/goods?q=${encodedQuery}`;

    return NextResponse.json({
      query,
      searchUrl,
      message: '무신사 사이트에서 직접 검색해주세요. 크롤링은 서버 제한으로 인해 제공되지 않습니다.',
    });
  } catch (error) {
    console.error('무신사 검색 오류:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

