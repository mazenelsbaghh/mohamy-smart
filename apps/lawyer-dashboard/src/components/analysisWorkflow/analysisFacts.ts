const NUMBERED_FACT_MARKER = String.raw`(?:\d{1,3}|[٠-٩]{1,3})\s*[-.)]\s+`;
const ORDINAL_FACT_MARKER = String.raw`(?:أولاً|أولا|ثانياً|ثانيا|ثالثاً|ثالثا|رابعاً|رابعا|خامساً|خامسا|سادساً|سادسا|سابعاً|سابعا|ثامناً|ثامنا|تاسعاً|تاسعا|عاشراً|عاشرا)\s*[:：-]\s*`;
const BULLET_FACT_MARKER = String.raw`[-•*]\s+`;

const INLINE_FACT_MARKER = new RegExp(`\\s+(?=${NUMBERED_FACT_MARKER}|${ORDINAL_FACT_MARKER})`, 'gu');
const LINE_FACT_MARKER = new RegExp(`(?=(?:^|\\n)\\s*(?:${NUMBERED_FACT_MARKER}|${ORDINAL_FACT_MARKER}|${BULLET_FACT_MARKER}))`, 'gu');
const CONTINUATION_FRAGMENT = /^(?:[،؛,.]|(?:\d+|[٠-٩]+)(?:[.,٫]\d+|[٫][٠-٩]+)?\s*(?:متر|متراً|مترًا|سهم|قيراط|فدان|سم)|(?:و)?(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر)|(?:و)?(?:ذلك|كما|حيث|إذ|ثم|بذلك|والذي|والتي|وذلك))/u;

const normalizeFactText = (text: string) => text
 .replace(/\r\n?/g, '\n')
 .replace(/[ \t]+/g, ' ')
 .trim();

const collapseFactWhitespace = (text: string) => text
 .replace(/[ \t]*\n[ \t]*/g, ' ')
 .replace(/\s+/g, ' ')
 .trim();

const splitExplicitFacts = (paragraph: string) => {
 const prepared = paragraph.replace(INLINE_FACT_MARKER, '\n');
 return prepared
 .split(LINE_FACT_MARKER)
 .map((item) => item.trim())
 .filter(Boolean);
};

const mergeContinuationFragments = (items: string[]) => items.reduce<string[]>((acc, item) => {
 if (acc.length > 0 && CONTINUATION_FRAGMENT.test(item)) {
  acc[acc.length - 1] = `${acc[acc.length - 1]} ${item}`;
  return acc;
 }

 acc.push(item);
 return acc;
}, []);

export const parseCaseFacts = (facts: string | undefined): string[] => {
 if (!facts) return [];

 const normalized = normalizeFactText(facts);
 if (!normalized) return [];

 const candidates = normalized
 .split(/\n\s*\n+/)
 .flatMap(splitExplicitFacts);

 const parsedFacts = mergeContinuationFragments(candidates)
 .map(collapseFactWhitespace)
 .filter(item => item.length > 15);

 return parsedFacts.length > 0 ? parsedFacts : [collapseFactWhitespace(normalized)];
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
