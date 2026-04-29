import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 42 }), type: 'mock/dispatch' });

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'case-123' }),
    useLocation: () => ({ pathname: '/cases/case-123/analysis', state: 'واقعة تجريبية', search: '' }),
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock('../../../../hooks/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockRootState()),
}));

vi.mock('../../../../redux/cases/thunk/thunkGetSingleCase', () => ({
  default: Object.assign(vi.fn(), {
    pending: { type: 'cases/thunkGetSingleCase/pending' },
    fulfilled: { type: 'cases/thunkGetSingleCase/fulfilled' },
    rejected: { type: 'cases/thunkGetSingleCase/rejected' },
  }),
}));

vi.mock('../../../../redux/aiJobs/aiJobsSlice', () => ({
  resetAiJobs: () => ({ type: 'aiJobs/resetAiJobs' }),
}));

let _caseOverrides: Record<string, unknown> | null = null;

function mockRootState() {
  return {
    cases: {
      singleCase: _caseOverrides ? { id: 'case-123', title: 'قضية تجريبية', status: 'Active', facts: 'واقعة تجريبية', ..._caseOverrides } : null,
      loading: _caseOverrides ? 'succeeded' : 'idle',
    },
    aiJobs: { jobs: {}, loading: 'idle', error: null, activeRunId: null },
  };
}

function makeStore() {
  return configureStore({
    reducer: {
      cases: () => mockRootState().cases,
      aiJobs: () => ({ jobs: {}, loading: 'idle', error: null, activeRunId: null }),
    },
  });
}

function renderDocumentSelection(searchParams?: string) {
  const entry = searchParams
    ? `/cases/case-123/analysis?${searchParams}`
    : '/cases/case-123/analysis';

  return render(
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/cases/:id/analysis" element={<DocumentSelection />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

let DocumentSelection: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  _caseOverrides = null;

  vi.resetModules();

  vi.doMock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
      ...actual,
      useNavigate: () => mockNavigate,
      useParams: () => ({ id: 'case-123' }),
      useLocation: () => ({ pathname: '/cases/case-123/analysis', state: 'واقعة تجريبية', search: '' }),
      useSearchParams: () => [new URLSearchParams()],
    };
  });

  const mod = await import('../DocumentSelection');
  DocumentSelection = mod.default;
});

describe('DocumentSelection lifecycle', () => {
  it('T081: start action on a case with no progress creates a first run at stage 1', async () => {
    _caseOverrides = {
      id: 'case-123',
      title: 'قضية تجريبية',
      status: 'Active',
      facts: 'واقعة تجريبية',
    };

    renderDocumentSelection();

    const startButtons = screen.getAllByText('ابدأ الإعداد');
    expect(startButtons.length).toBeGreaterThan(0);

    await import('react').then((react) => {
      return react.act(async () => {
        fireEvent.click(startButtons[0]);
      });
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);

    const navigatedPath = mockNavigate.mock.calls[0][0] as string;
    expect(navigatedPath).toContain('fresh=1');
  });

  it('T082: resume navigates without fresh=1, start-new navigates with fresh=1', async () => {
    _caseOverrides = {
      id: 'case-123',
      title: 'قضية تجريبية',
      status: 'Active',
      facts: 'واقعة تجريبية',
    };

    renderDocumentSelection();

    const resumeButtons = screen.getAllByText('استكمال الإصدار الحالي');
    expect(resumeButtons.length).toBeGreaterThan(0);

    fireEvent.click(resumeButtons[0]);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const resumePath = mockNavigate.mock.calls[0][0] as string;
    expect(resumePath).not.toContain('fresh=1');

    mockNavigate.mockClear();

    const startNewButtons = screen.getAllByText('بدء إصدار جديد');
    expect(startNewButtons.length).toBeGreaterThan(0);

    fireEvent.click(startNewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const startNewPath = mockNavigate.mock.calls[0][0] as string;
    expect(startNewPath).toContain('fresh=1');
  });

  it('T082: resume and start-new produce different navigation intents', async () => {
    _caseOverrides = {
      id: 'case-123',
      title: 'قضية تجريبية',
      status: 'Active',
      facts: 'واقعة تجريبية',
    };

    renderDocumentSelection();

    const resumeButtons = screen.getAllByText('استكمال الإصدار الحالي');
    fireEvent.click(resumeButtons[0]);
    const resumePath = mockNavigate.mock.calls[0][0] as string;

    mockNavigate.mockClear();

    const startNewButtons = screen.getAllByText('بدء إصدار جديد');
    fireEvent.click(startNewButtons[0]);
    const startNewPath = mockNavigate.mock.calls[0][0] as string;

    expect(resumePath).not.toBe(startNewPath);
    expect(startNewPath).toContain('fresh=1');
    expect(resumePath).not.toContain('fresh=1');
  });
});
