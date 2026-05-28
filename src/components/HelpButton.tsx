import { useEffect, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

const SLACK_CHANNEL = 'upstart-thoughtspot-embeding-poc';
const TEAM = ['Manuel', 'Divinity', 'Ron'];
const SLACK_WEB_URL = `https://slack.com/app_redirect?channel=${SLACK_CHANNEL}`;

export default function HelpButton() {
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
    <div className="help-button-wrap" ref={wrapRef}>
      <button
        className={`help-trigger ${open ? 'open' : ''}`}
        aria-label="Need help?"
        onClick={() => setOpen(o => !o)}
      >
        <HelpCircle size={16} />
        <span className="help-trigger-label">Need help?</span>
        <span className="help-trigger-dot" aria-hidden="true" />
      </button>

      {open && (
        <div className="help-pop" role="dialog">
          <div className="help-pop-title">Need a hand?</div>
          <div className="help-pop-body">
            Message{' '}
            {TEAM.map((name, i) => (
              <span key={name}>
                <span className="help-pop-mention">@{name}</span>
                {i < TEAM.length - 2 && ', '}
                {i === TEAM.length - 2 && ' and '}
              </span>
            ))}{' '}
            in Slack.
          </div>

          <a
            className="help-pop-slack-btn"
            href={SLACK_WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <SlackIcon />
            <span>Open #{SLACK_CHANNEL} in Slack</span>
          </a>
        </div>
      )}
    </div>
  );
}

function SlackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#E01E5A" d="M5 15a2 2 0 1 1 0-4h2v4H5Zm1-6a2 2 0 1 1 4 0v6a2 2 0 1 1-4 0V9Z" />
      <path fill="#36C5F0" d="M9 5a2 2 0 1 1 4 0v2H9V5Zm6 1a2 2 0 1 1 0 4H9a2 2 0 1 1 0-4h6Z" />
      <path fill="#2EB67D" d="M19 9a2 2 0 1 1 0 4h-2V9h2Zm-1 6a2 2 0 1 1-4 0V9a2 2 0 1 1 4 0v6Z" />
      <path fill="#ECB22E" d="M15 19a2 2 0 1 1-4 0v-2h4v2Zm-6-1a2 2 0 1 1 0-4h6a2 2 0 1 1 0 4H9Z" />
    </svg>
  );
}
