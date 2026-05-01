export interface AiInsights {
  status: 'success' | 'error' | null;
  predicted_price: number;
  desirability_score: number;
  fraud_flag: boolean;
  similar_properties: { id: string; title: string; match_score: string }[];
}

export interface PropertyDetailData {
  property: {
    id: string;
    title: string;
    asking_price: number;
    specs: { sqft: number; bhk: number; bathrooms: number };
  };
  ai_insights: AiInsights;
}
