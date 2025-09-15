import React from 'react'

type S = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, S> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): S {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">خطا در برنامه</h2>
            <button onClick={() => location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">بازنشانی</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}