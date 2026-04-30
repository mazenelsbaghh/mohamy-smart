// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDispatch = vi.fn();
let mockSingleCase: { facts?: string } | null = null;

vi.mock('../reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector({
    cases: { singleCase: mockSingleCase },
  }),
}));

vi.mock('../../redux/cases/thunk/thunkUpdateCaseFacts', () => ({
  default: vi.fn(),
}));

vi.mock('../../redux/cases/thunk/thunkGetSingleCase', () => ({
  default: vi.fn(),
}));

describe('useWorkflowFacts', () => {
  beforeEach(() => {
    localStorage.clear();
    mockDispatch.mockClear();
    mockSingleCase = {
      facts: '1- وقع العقد بتاريخ 2022/12/21 بين الطرفين وتضمن بيع حصة عقارية ثابتة.\n\n2- سدد المدعي جزءا من الثمن ولم يتم نقل الملكية حتى الآن.',
    };
  });

  it('selects all case facts for a fresh workflow run', async () => {
    const { useWorkflowFacts } = await import('../useWorkflowFacts');

    const { result } = renderHook(() =>
      useWorkflowFacts({
        workflowPrefix: 'preparingStatementOfClaims',
        caseId: 'case-1',
        runId: 'run-1',
      }),
    );

    await waitFor(() => expect(result.current.selectedFacts).toHaveLength(2));
    expect(result.current.caseFacts).toEqual(result.current.selectedFacts);
  });

  it('resetForNewRun reselects the current case facts instead of leaving selection empty', async () => {
    const { useWorkflowFacts } = await import('../useWorkflowFacts');

    const { result } = renderHook(() =>
      useWorkflowFacts({
        workflowPrefix: 'preparingStatementOfClaims',
        caseId: 'case-1',
        runId: 'run-old',
      }),
    );

    await waitFor(() => expect(result.current.selectedFacts).toHaveLength(2));

    act(() => {
      result.current.setSelectedFacts([]);
      result.current.resetForNewRun('run-new');
    });

    expect(result.current.selectedFacts).toHaveLength(2);
    expect(localStorage.getItem('preparingStatementOfClaims_selected_facts_case-1_run-new')).toContain('وقع العقد');
  });
});
