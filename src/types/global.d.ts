declare module 'react' {
  export function useState<T>(initialValue: T): [T, (value: T) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: any): T;
  export function createContext<T>(defaultValue: T): any;
  export function useRef<T>(initialValue: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export const Component: any;
  export const StrictMode: any;
  export interface ReactNode {}
  export type ReactElement = any;
  export type FC<T = {}> = (props: T) => ReactElement;
  export type ChangeEvent<T = Element> = {
    target: T;
  };
  export type FormEvent<T = any> = {
    target: T;
    preventDefault: () => void;
  };
  export type KeyboardEvent<T = Element> = {
    key: string;
    preventDefault: () => void;
  };
  export type DragEvent<T = Element> = {
    preventDefault: () => void;
    stopPropagation: () => void;
    dataTransfer: DataTransfer;
  };
  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'react-dom' {
  export function createRoot(container: Element): any;
}

declare module 'react-router-dom' {
  export function BrowserRouter(props: any): any;
  export function Routes(props: any): any;
  export function Route(props: any): any;
  export function Navigate(props: any): any;
  export function Link(props: any): any;
  export function Outlet(): any;
  export function useLocation(): any;
  export function useNavigate(): any;
}

declare module 'react-query' {
  export class QueryClient {
    constructor();
  }
  export function QueryClientProvider(props: { client: any; children: any }): any;
}

declare module 'react-hot-toast' {
  const toast: {
    success(message: string): void;
    error(message: string): void;
  };
  export default toast;
  export function Toaster(props: any): any;
}

declare module 'axios' {
  const axios: {
    get(url: string, config?: any): any;
    post(url: string, data?: any, config?: any): any;
    defaults: {
      headers: {
        common: { [key: string]: string };
      };
    };
  };
  export default axios;
}

declare module '@heroicons/react/24/outline' {
  export const HomeIcon: any;
  export const CurrencyDollarIcon: any;
  export const UserGroupIcon: any;
  export const DocumentTextIcon: any;
  export const UserIcon: any;
  export const MenuIcon: any;
  export const XMarkIcon: any;
  export const ArrowRightOnRectangleIcon: any;
}

// Global type declarations
declare global {
  interface Window {
    [key: string]: any;
  }
}
