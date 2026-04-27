import api from'../../APIs/api';

export interface ClarifyFactsQuestion {
 questionText: string;
 suggestedOptions: string[];
}

export interface ClarifyFactsResponse {
 questions: ClarifyFactsQuestion[];
}

interface ApiResult<T> {
 data: T;
 succeeded: boolean;
 message?: string;
}

/**
 * Calls POST /api/ClarifyFacts/evaluate to get pre-flight clarification questions.
 * Returns an empty array if the case facts are comprehensive.
 */
export async function evaluateFactsGaps(caseId: string): Promise<ClarifyFactsQuestion[]> {
 const res = await api.post<ApiResult<ClarifyFactsResponse>>('/ClarifyFacts/evaluate', { caseId });
 return res.data.data?.questions ?? [];
}
