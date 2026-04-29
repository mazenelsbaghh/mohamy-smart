import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SmartAnalysisLoader from '../SmartAnalysisLoader';

describe('SmartAnalysisLoader conflict state', () => {
  it('should show reload and retry actions without auto-submit when hasConflict is true', () => {
    const onRetry = vi.fn();
    const onReload = vi.fn();

    render(
      <SmartAnalysisLoader
        hasConflict={true}
        jobStatus="Failed"
        onRetry={onRetry}
        onReload={onReload}
        conflictMessage="حدث تعارض في تحديث سير العمل. يرجى إعادة المحاولة."
      />
    );

    expect(screen.getByText('حدث تعارض في تحديث سير العمل. يرجى إعادة المحاولة.')).toBeInTheDocument();
    expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
    expect(screen.getByText('إعادة التحميل')).toBeInTheDocument();
  });

  it('should not show auto-submit indicators during conflict', () => {
    const onRetry = vi.fn();
    const onReload = vi.fn();

    const { container } = render(
      <SmartAnalysisLoader
        hasConflict={true}
        jobStatus="Failed"
        onRetry={onRetry}
        onReload={onReload}
      />
    );

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBe(0);
  });
});
