export const parseCaseFacts = (facts: string | undefined): string[] => {
 if (!facts) return [];

 const normalized = facts
 .split(/\n{2,}|(?=\d+\s*[-.)])|(?=أولاً[:：])|(?=ثانياً[:：])|(?=ثالثاً[:：])|(?=رابعاً[:：])/)
 .map((item) => item.trim())
 .filter(item => item.length > 15);

 return normalized.length > 0 ? normalized : [facts.trim()];
};

export const buildAnalysisInput = <TExtra extends Record<string, unknown>>(
 caseId: string,
 selectedFacts: string[],
 extra?: TExtra,
) => JSON.stringify({
 caseId,
 facts: selectedFacts.join('\n\n'),
 selectedFacts,
 ...(extra ?? {}),
});
