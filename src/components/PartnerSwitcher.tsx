import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, UserCircle2, Check } from 'lucide-react';
import { PARTNERS, VIEWS, usePartner } from '../lib/partnerContext';

export default function PartnerSwitcher() {
  const { partner, view, setPartnerId, setViewId } = usePartner();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="partner-switcher" ref={wrapRef}>
      <button
        className="partner-switcher-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="partner-switcher-chip" style={{ background: partner.accent }}>
          {partner.shortName.slice(0, 2).toUpperCase()}
        </span>
        <span className="partner-switcher-labels">
          <span className="partner-switcher-partner">{partner.shortName}</span>
          <span className="partner-switcher-view">{view.name}</span>
        </span>
        <ChevronDown size={14} className={`partner-switcher-caret ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="partner-switcher-pop">
          <div className="partner-switcher-section">
            <div className="partner-switcher-section-head">
              <Building2 size={13} />
              <span>Capital Partner</span>
            </div>
            <div className="partner-switcher-list">
              {PARTNERS.map(p => (
                <button
                  key={p.id}
                  className={`partner-switcher-item ${p.id === partner.id ? 'active' : ''}`}
                  onClick={() => { setPartnerId(p.id); }}
                >
                  <span className="partner-switcher-dot" style={{ background: p.accent }}></span>
                  <span className="partner-switcher-item-name">{p.name}</span>
                  {p.id === partner.id && <Check size={14} className="partner-switcher-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="partner-switcher-section">
            <div className="partner-switcher-section-head">
              <UserCircle2 size={13} />
              <span>View as</span>
            </div>
            <div className="partner-switcher-list">
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  className={`partner-switcher-item ${v.id === view.id ? 'active' : ''}`}
                  onClick={() => { setViewId(v.id); }}
                >
                  <div className="partner-switcher-view-block">
                    <span className="partner-switcher-item-name">{v.name}</span>
                    <span className="partner-switcher-item-desc">{v.description}</span>
                  </div>
                  {v.id === view.id && <Check size={14} className="partner-switcher-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="partner-switcher-foot">
            Selections drive row-level security via runtime filters into the embed.
          </div>
        </div>
      )}
    </div>
  );
}
