/**
 * 사용 가능한 Gemini 모델 목록 확인
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function listAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  try {
    const models = await genAI.listModels();
    console.log('사용 가능한 모델 목록:');
    models.forEach((model) => {
      console.log(`- ${model.name}: ${model.supportedGenerationMethods?.join(', ')}`);
    });
    return models;
  } catch (error) {
    console.error('모델 목록 조회 실패:', error);
    throw error;
  }
}

