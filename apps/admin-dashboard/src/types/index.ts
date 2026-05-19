export type TAdminUser = {
 userId: string;
 fullName: string;
 roles: string[];
 email?: string;
 phone?: string;
};

export interface AdminProfile {
 lawyerId: string;
 applicationUserId: string;
 fullName: string;
 email: string;
 phoneNumber: string;
 officeName: string | null;
 address: string | null;
}

// Update Admin Profile Payload
export interface UpdateAdminProfileDto {
 fullName: string;
 email: string;
 phoneNumber: string;
 officeName: string | null;
 address: string | null;
}

// Change Admin Password Payload
export interface ChangeAdminPasswordDto {
 currentPassword?: string;
 newPassword?: string;
 confirmPassword?: string;
}

// Notifications
export interface NotificationItem {
 notificationId: string;
 title: string;
 message: string;
 type: string;
 isRead: boolean;
 createdAt: string;
 receiverId?: string;
}

// Admin Settings State
export interface AdminSettingsState {
  profile: AdminProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isPasswordLoading: boolean;
  error: string | null;
}

// Notification State
export interface NotificationState {
 items: NotificationItem[];
 unreadCount: number;
 lastSyncedAt: string | null;
 isLoading: boolean;
 error: string | null;
}

// AI Model Config
export interface AiStageModelConfig {
 stepType: number;
 stepTypeName: string;
 displayName: string;
 category: string;
 modelIdentifier: string;
 modelDisplayName: string;
 updatedAt: string;
 updatedBy: string | null;
}

export interface AiModelOption {
 identifier: string;
 displayName: string;
 description: string;
 documentationUrl?: string | null;
 pricingNotes?: string | null;
}

export interface AiStageInfo {
 stepType: number;
 stepTypeName: string;
 displayName: string;
 category: string;
 categoryOrder: number;
}

export interface AiModelConfigState {
 configs: AiStageModelConfig[];
 models: AiModelOption[];
 stages: AiStageInfo[];
 isLoading: boolean;
 error: string | null;
}

export interface UpdateAiModelConfigItem {
 stepType: number;
 modelIdentifier: string;
}

export interface UpdateAiModelConfigRequest {
 configs: UpdateAiModelConfigItem[];
}

export interface AiUsageSummary {
 totalCostUsd: number;
 aiCostUsd: number;
 ocrCostUsd: number;
 totalRequests: number;
 aiRequests: number;
 ocrRequests: number;
 chargedPointTransactions: number;
 noChargePointTransactions: number;
 restoredPointTransactions: number;
 chargedPoints: number;
 restoredPoints: number;
 totalInputTokens: number;
 totalOutputTokens: number;
 perModel: ModelUsage[];
}

export interface ModelUsage {
 modelIdentifier: string;
 displayName: string;
 requestCount: number;
 totalCostUsd: number;
 inputTokens: number;
 outputTokens: number;
}

export interface LawyerUsage {
 lawyerId: string;
 lawyerName: string;
 totalCostUsd: number;
 aiCostUsd: number;
 ocrCostUsd: number;
 totalRequests: number;
 aiRequests: number;
 ocrRequests: number;
}

export interface LawyerUsageDetail extends LawyerUsage {
 perStep: StepUsage[];
 perModel: ModelUsage[];
 dailyCosts: DailyCost[];
 perCaseWorkflows: CaseWorkflowUsage[];
 standaloneCosts: WorkflowUsage[];
}

export interface StepUsage {
 stepType: number;
 stepName: string;
 modelDisplayName: string;
 requestCount: number;
 totalCostUsd: number;
}

export interface WorkflowUsage {
	 workflowKey: string;
	 workflowName: string;
	 workflowId?: number | null;
	 workflowRunId?: string | null;
	 isLegacyAggregate?: boolean;
	 requestCount: number;
	 totalCostUsd: number;
	 steps: StepUsage[];
}

export interface CaseWorkflowUsage {
 caseId: string;
 caseTitle: string;
 caseNumber: string;
 usedWorkflowCount: number;
 totalWorkflowCount: number;
 totalCostUsd: number;
 workflows: WorkflowUsage[];
}

export interface DailyCost {
 date: string;
 aiCost: number;
 ocrCost: number;
 requests: number;
}

export interface AiUsageState {
 summary: AiUsageSummary | null;
 lawyers: LawyerUsage[];
 lawyerDetail: LawyerUsageDetail | null;
 modelUsage: ModelUsage[];
 isLoadingSummary: boolean;
 isLoadingModels: boolean;
 isLoadingLawyers: boolean;
 isLoadingLawyerDetail: boolean;
 error: string | null;
 dateFrom: string | null;
 dateTo: string | null;
 lastFetchedAt: number | null;
}
