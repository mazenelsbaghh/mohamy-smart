import React from 'react';
import { AnalysisStepShell, type AnalysisStepShellProps } from './AnalysisStepShell';
import {
  AnalysisStageLayout,
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
  AnalysisStageActionButton,
  AnalysisStageDocumentCard,
  AnalysisStageBanner,
  AnalysisStageListItem,
  AnalysisStageNumberedList,
} from './AnalysisStageLayout';

export type UnifiedStepShellProps = AnalysisStepShellProps & {
  title?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
};

export const UnifiedStepShell: React.FC<UnifiedStepShellProps> = ({
  isLoading,
  hasFailed,
  errorMessage,
  onRetry,
  loadingTitle,
  loadingSubtitle,
  steps,
  currentStepIndex,
  charge,
  title,
  actions,
  sidebar,
  children,
}) => {
  return (
    <AnalysisStepShell
      isLoading={isLoading}
      hasFailed={hasFailed}
      errorMessage={errorMessage}
      onRetry={onRetry}
      loadingTitle={loadingTitle}
      loadingSubtitle={loadingSubtitle}
      steps={steps}
      currentStepIndex={currentStepIndex}
      charge={charge}
    >
      {title && sidebar ? (
        <AnalysisStageLayout title={title} actions={actions} sidebar={sidebar}>
          {children}
        </AnalysisStageLayout>
      ) : (
        children
      )}
    </AnalysisStepShell>
  );
};

export {
  AnalysisStageSectionCard,
  AnalysisStageSidebarCard,
  AnalysisStageActionButton,
  AnalysisStageDocumentCard,
  AnalysisStageBanner,
  AnalysisStageListItem,
  AnalysisStageNumberedList,
};
