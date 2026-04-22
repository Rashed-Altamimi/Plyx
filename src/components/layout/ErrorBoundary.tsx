import { Component, type ReactNode, type ErrorInfo } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw, Home } from '../../icons'

interface Props extends WithTranslation {
  children: ReactNode
  /** Reset boundary state when this value changes (e.g. route pathname) */
  resetKey?: string
}

interface State {
  error: Error | null
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('Tool error:', error, info.componentStack)
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const { t } = this.props
      return (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              {t('common.somethingWrong')}
            </h2>
            <p className="text-sm text-red-700 mb-1">
              {t('common.unexpectedError')}
            </p>
            <p className="text-xs text-red-600/80 font-mono mb-6 break-all">
              {this.state.error.message}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.reset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                {t('common.tryAgain')}
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Home size={14} />
                {t('common.backHome')}
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner)
