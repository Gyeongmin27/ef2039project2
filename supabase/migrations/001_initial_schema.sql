-- Fashion Evaluations 테이블
CREATE TABLE IF NOT EXISTS fashion_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  total_score DECIMAL(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  grade VARCHAR(1) NOT NULL CHECK (grade IN ('S', 'A', 'B', 'C', 'D', 'F')),
  
  -- 세부 점수
  color_harmony_score DECIMAL(5,2) NOT NULL,
  style_consistency_score DECIMAL(5,2) NOT NULL,
  pattern_combination_score DECIMAL(5,2) NOT NULL,
  proportion_silhouette_score DECIMAL(5,2) NOT NULL,
  texture_harmony_score DECIMAL(5,2) NOT NULL,
  context_appropriateness_score DECIMAL(5,2) NOT NULL,
  overall_harmony_score DECIMAL(5,2) NOT NULL,
  
  -- 분석 결과 메타데이터
  analysis_metadata JSONB,
  
  -- 사용자 정보
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Improvement Suggestions 테이블
CREATE TABLE IF NOT EXISTS improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES fashion_evaluations(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  suggestion_text TEXT NOT NULL,
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_fashion_evaluations_user_id ON fashion_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_fashion_evaluations_session_id ON fashion_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_fashion_evaluations_total_score ON fashion_evaluations(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_fashion_evaluations_created_at ON fashion_evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_evaluation_id ON improvement_suggestions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_priority ON improvement_suggestions(priority);

-- Row Level Security 활성화
ALTER TABLE fashion_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Evaluations are viewable by everyone"
  ON fashion_evaluations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own evaluations"
  ON fashion_evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own evaluations"
  ON fashion_evaluations FOR DELETE
  USING (true);

CREATE POLICY "Suggestions are viewable by everyone"
  ON improvement_suggestions FOR SELECT
  USING (true);

CREATE POLICY "Suggestions can be inserted by anyone"
  ON improvement_suggestions FOR INSERT
  WITH CHECK (true);

