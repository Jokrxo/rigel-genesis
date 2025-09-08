import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn()
    })),
    functions: {
      invoke: vi.fn()
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        getPublicUrl: vi.fn()
      }))
    }
  }
}));

// Mock router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to, ...props }: any) => ({ 
      $$typeof: Symbol.for('react.element'), 
      type: 'a', 
      props: { href: to, children, ...props }, 
      key: null, 
      ref: null 
    })
  };
});

// Mock chart components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'chart', children }, key: null, ref: null }),
  BarChart: ({ children }: any) => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'bar-chart', children }, key: null, ref: null }),
  PieChart: ({ children }: any) => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'pie-chart', children }, key: null, ref: null }),
  LineChart: ({ children }: any) => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'line-chart', children }, key: null, ref: null }),
  Bar: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'bar' }, key: null, ref: null }),
  Pie: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'pie' }, key: null, ref: null }),
  Line: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'line' }, key: null, ref: null }),
  XAxis: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'x-axis' }, key: null, ref: null }),
  YAxis: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'y-axis' }, key: null, ref: null }),
  CartesianGrid: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'grid' }, key: null, ref: null }),
  Tooltip: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'tooltip' }, key: null, ref: null }),
  Legend: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'legend' }, key: null, ref: null }),
  Cell: () => ({ $$typeof: Symbol.for('react.element'), type: 'div', props: { 'data-testid': 'cell' }, key: null, ref: null })
}));

// Mock window functions
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});