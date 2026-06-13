import { Component, Fragment, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; key: number }

/** Captura crashes de reconciliação (ex.: extensões como KeePassXC/Google Translate
 *  que mexem no DOM e quebram o removeChild do React) e RE-MONTA a subárvore,
 *  recuperando sozinho em vez de mostrar tela branca. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, key: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch() {
    // re-monta com uma key nova (DOM limpo, sem o nó "fantasma" da extensão)
    requestAnimationFrame(() => this.setState((s) => ({ hasError: false, key: s.key + 1 })));
  }

  render() {
    if (this.state.hasError) return null; // brevíssimo, até re-montar
    return <Fragment key={this.state.key}>{this.props.children}</Fragment>;
  }
}

export default ErrorBoundary;
