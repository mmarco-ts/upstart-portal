import { useEffect, useRef, useState } from 'react';
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk';
import { MessageSquare, Lightbulb, Send, Check } from 'lucide-react';
import Header from '../components/Header';
import {
  UPSTART_MODEL_ID,
  HIDE_TS_BRANDING_RULES,
  UPSTART_CSS_VARIABLES,
} from '../lib/thoughtspot';
import { usePartner, buildRuntimeFilters, buildHiddenActions } from '../lib/partnerContext';
import '../lib/thoughtspot';

const TIPS = [
  'Add a time range — "last 7 days", "this quarter".',
  'Slice with "by product type", "by risk grade", or "by state".',
  'Compare with "vs" — "this quarter vs last quarter".',
];

export default function Spotter() {
  const embedRef = useRef<HTMLDivElement>(null);
  const embedInstanceRef = useRef<SpotterEmbed | null>(null);
  const [sentIdx, setSentIdx] = useState<number | null>(null);
  const [seedQuery, setSeedQuery] = useState<string | undefined>(undefined);
  const [mountKey, setMountKey] = useState(0);
  const ctx = usePartner();
  const starterPrompts = ctx.view.prompts;

  // Remount the embed whenever tenant, view, or seed prompt change.
  // Remount-on-click is less elegant than HostEvent.SpotterSearch but
  // deterministic across SDK versions — the query lands every time.
  useEffect(() => {
    embedInstanceRef.current = null;
    setMountKey(k => k + 1);
  }, [ctx.partner.id, ctx.view.id, seedQuery]);

  useEffect(() => {
    if (!embedRef.current || embedInstanceRef.current) return;

    const runtimeFilters = buildRuntimeFilters(ctx);
    const hiddenActions = buildHiddenActions(ctx.view);

    const embed = new SpotterEmbed(embedRef.current, {
      frameParams: { width: '100%', height: '100%' },
      worksheetId: UPSTART_MODEL_ID,
      updatedSpotterChatPrompt: true,
      runtimeFilters,
      hiddenActions,
      ...(seedQuery ? { searchOptions: { searchQuery: seedQuery } } : {}),
      customizations: {
        style: {
          customCSS: {
            variables: UPSTART_CSS_VARIABLES,
            rules_UNSTABLE: HIDE_TS_BRANDING_RULES,
          },
        },
      },
    });

    embedInstanceRef.current = embed;
    embed.render();

    return () => {
      embedInstanceRef.current = null;
    };
  }, [mountKey, ctx, seedQuery]);

  const handlePromptClick = (prompt: string, idx: number) => {
    setSentIdx(idx);
    setTimeout(() => setSentIdx(null), 1600);
    // Append a no-op suffix when the same prompt is clicked twice so the
    // seedQuery state changes and the effect re-fires.
    setSeedQuery(prompt === seedQuery ? `${prompt} ` : prompt);
  };

  return (
    <>
      <Header
        title="Insights AI"
        subtitle="Ask questions in plain English about your loan portfolio, applications, and repayments"
      />
      <main className="main-content">
        <div className="page-container">
          <div className="spotter-layout">
            <div className="spotter-embed-wrap" key={mountKey}>
              <div className="embed-container" ref={embedRef} />
            </div>

            <aside className="spotter-side">
              <div className="spotter-side-status">
                <span className="status-dot"></span>
                <span>Active</span>
              </div>

              <div className="spotter-side-section">
                <div className="spotter-side-eyebrow">
                  <MessageSquare size={13} />
                  For {ctx.view.name}
                </div>
                <div className="spotter-side-help">
                  Questions tuned for your view. Click one to ask Insights AI, or type your own.
                </div>
                <div className="spotter-prompt-list">
                  {starterPrompts.map((p, i) => (
                    <button
                      key={p}
                      className="spotter-prompt-card"
                      onClick={() => handlePromptClick(p, i)}
                      title="Ask Insights AI this question"
                    >
                      <span className="spotter-prompt-text">{p}</span>
                      <span className="spotter-prompt-icon" aria-hidden="true">
                        {sentIdx === i ? <Check size={14} /> : <Send size={13} />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="spotter-side-section">
                <div className="spotter-side-eyebrow">
                  <Lightbulb size={12} />
                  Tips
                </div>
                <ul className="spotter-tips">
                  {TIPS.map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
