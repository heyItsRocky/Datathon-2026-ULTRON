import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean; message: string }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ULTRON ErrorBoundary', error, info);
  }
  render() {
    if (this.state.hasError) return <main className="p-8"><ErrorState message={this.state.message} onRetry={() => this.setState({ hasError: false, message: '' })} /></main>;
    return this.props.children;
  }
}
