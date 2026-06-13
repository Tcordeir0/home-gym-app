// Selo "TESTE" — aparece SÓ no dev server (import.meta.env.DEV). Na build de
// produção (deploy) o import.meta.env.DEV é false → o componente nem renderiza.
import './DevBadge.css';

const DevBadge: React.FC = () => {
  if (!import.meta.env.DEV) return null;
  return <div className="dev-badge" aria-hidden="true">🧪 TESTE</div>;
};

export default DevBadge;
