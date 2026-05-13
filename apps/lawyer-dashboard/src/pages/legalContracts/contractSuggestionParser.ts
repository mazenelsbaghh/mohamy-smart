export type GeneratedContractSuggestions = {
 assetDescription?: string;
 paymentTerms?: string;
 deliveryTerms?: string;
 guarantees?: string;
 terminationTerms?: string;
 jurisdiction?: string;
 customClauses?: string;
 clientObligations?: string;
 partyObligations?: string[];
};

const stripJsonCodeFence = (value: string) => value
 .trim()
 .replace(/^```(?:json)?\s*/i, '')
 .replace(/\s*```$/i, '')
 .trim();

const extractBalancedJsonObject = (value: string) => {
 const text = stripJsonCodeFence(value);
 const start = text.indexOf('{');
 if (start === -1) return text;

 let depth = 0;
 let inString = false;
 let escaped = false;

 for (let i = start; i < text.length; i += 1) {
 const char = text[i];

 if (inString) {
 if (escaped) {
 escaped = false;
 } else if (char === '\\') {
 escaped = true;
 } else if (char === '"') {
 inString = false;
 }
 continue;
 }

 if (char === '"') {
 inString = true;
 continue;
 }
 if (char === '{') depth += 1;
 if (char === '}') {
 depth -= 1;
 if (depth === 0) return text.slice(start, i + 1);
 }
 }

 return text.slice(start);
};

const escapeRawNewlinesInJsonStrings = (value: string) => {
 let output = '';
 let inString = false;
 let escaped = false;

 for (const char of value) {
 if (inString) {
 if (escaped) {
 output += char;
 escaped = false;
 continue;
 }
 if (char === '\\') {
 output += char;
 escaped = true;
 continue;
 }
 if (char === '"') {
 output += char;
 inString = false;
 continue;
 }
 if (char === '\n' || char === '\r') {
 output += '\\n';
 continue;
 }
 output += char;
 continue;
 }

 output += char;
 if (char === '"') inString = true;
 }

 return output;
};

export const parseGeneratedContractSuggestions = (raw: string): GeneratedContractSuggestions | null => {
 const candidate = extractBalancedJsonObject(raw)
 .replace(/[\u201C\u201D]/g, '"')
 .replace(/,\s*([}\]])/g, '$1');

 const attempts = [
 candidate,
 escapeRawNewlinesInJsonStrings(candidate),
 ];

 for (const attempt of attempts) {
 try {
 const parsed = JSON.parse(attempt) as unknown;
 if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
 return parsed as GeneratedContractSuggestions;
 }
 } catch {
 // Try the next repair strategy.
 }
 }

 return null;
};
