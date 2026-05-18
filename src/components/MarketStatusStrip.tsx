import type { MarketStatus } from '../types/market';

interface Props {
  statuses: MarketStatus[];
}

export function MarketStatusStrip({ statuses }: Props) {
  return (
    <div className="statusStrip">
      {statuses.map((status) => (
        <span className={`statusPill ${status.session.toLowerCase()}`} key={status.code}>
          <strong>{status.label}</strong>
          {status.session.replace('_', ' ')}
        </span>
      ))}
    </div>
  );
}
