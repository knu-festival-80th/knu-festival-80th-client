import { Component, type ReactNode } from 'react';
import { ApiClientError } from '@/apis/error';
import ErrorFallback from './ErrorFallback';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackClassName?: string;
};

type State = {
  error: Error | null;
};

function isNetworkError(error: Error): boolean {
  if (error instanceof ApiClientError && error.status === 0) return true;
  return !navigator.onLine;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (error) {
      if (this.props.fallback) return this.props.fallback;
      const type = isNetworkError(error) ? 'network' : 'service';
      return (
        <ErrorFallback
          type={type}
          onRetry={type === 'network' ? this.handleRetry : undefined}
          className={this.props.fallbackClassName}
        />
      );
    }

    return this.props.children;
  }
}
