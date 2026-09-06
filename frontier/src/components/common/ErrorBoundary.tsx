import * as React from 'react';

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Uncaught error in ${this.props.componentName || 'a component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 m-4 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-lg flex flex-col items-center justify-center text-center w-full h-full min-h-[200px]">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Something went wrong.</h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            The <strong>{this.props.componentName || 'component'}</strong> failed to load.
            Don't worry, the rest of the application is still running smoothly.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
