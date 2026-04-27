export type TClient = {
    id: string;
    clientName: string;
    phoneNumber: string;
    email: string | null;
    notes: string | null;
    address: string | null;
    nationalId: string | null;
    governorate: string | null;
    lawyerId: string;
    caseId: string | null;
    creationDate: string;
};

export type TDocumentRecord = {
  documentId: string;
  caseId: string | null;
  title: string;
  sourceType: 'uploaded_file' | 'ocr_extract' | 'generated_case_artifact';
  fileType: string;
  createdAt: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  extractedTextSnippet: string | null;
  availabilityState: 'available' | 'processing' | 'failed';
};

// List-level contract summary (matches LegalContractDto from backend)
export type TLegalContract = {
  contractId: string;
  contractType: string;
  clientName: string;
  status: 'Generated' | 'Failed' | 'DraftingRequested';
  createdAt: string;
  lastUpdatedAt: string | null;
  detailAvailable: boolean;
};

// Full contract details (returned after create or GET /LegalContracts/{id})
export type TLegalContractDetails = {
  contractId: string;
  contractTypeCode: string;
  contractTypeName: string;
  clientId: string;
  clientName: string;
  inputDetails: string;
  customClauses: string | null;
  generatedContent: string;
  status: 'Generated' | 'Failed' | 'DraftingRequested';
  aiStepType: number;
  modelIdentifier: string | null;
  createdAtUtc: string;
};

// Option item for contract type selector
export type TContractTypeOption = {
  code: string;
  displayNameAr: string;
  description: string | null;
  displayOrder: number;
};

// Request body for POST /LegalContracts
export type TCreateLegalContractRequest = {
  clientId: string;
  contractTypeCode: string;
  details: string;
  customClauses?: string;
};

export type TChatMessage = {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type TChatConversation = {
  conversationId: string | null;
  messages: TChatMessage[];
  availabilityState: 'available' | 'unavailable' | 'quota_exceeded' | 'error';
  lastUpdatedAt?: string;
};
