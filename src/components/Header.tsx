import PartnerSwitcher from './PartnerSwitcher';
import HelpButton from './HelpButton';
import { TS_HOST } from '../lib/thoughtspot';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <div className="header-breadcrumb">
              <span>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
      <div className="header-right">
        <PartnerSwitcher />
        <a
          className="header-action header-action-ts"
          href={TS_HOST}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open ThoughtSpot in a new tab"
          title="Open ThoughtSpot"
        >
          <TSLogo />
        </a>
        <HelpButton />
      </div>
    </header>
  );
}

function TSLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#1B1F2C" />
      <rect x="6" y="9.5" width="20" height="3.5" rx="0.5" fill="#FFFFFF" />
      <rect x="14.25" y="9.5" width="3.5" height="14" rx="0.5" fill="#FFFFFF" />
      <rect x="6" y="9.5" width="6" height="3.5" rx="0.5" fill="#22D3A6" />
    </svg>
  );
}
