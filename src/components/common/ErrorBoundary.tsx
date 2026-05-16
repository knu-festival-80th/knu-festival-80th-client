import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-4 px-5 py-16">
            <p className="font-wanted-sans text-body1 text-gray">오류가 발생했습니다.</p>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-full border border-black px-5 py-2.5 font-wanted-sans text-sm text-ink"
            >
              다시 시도
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
