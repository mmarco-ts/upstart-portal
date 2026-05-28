import { useEffect, useRef, useState } from 'react';
import { SpotterEmbed, HostEvent, EmbedEvent } from '@thoughtspot/visual-embed-sdk';
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
  const embedReadyRef = useRef(false);
  const pendingQueryRef = useRef<string | null>(null);
  const [sentIdx, setSentIdx] = useState<number | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const ctx = usePartner();
  const starterPrompts = ctx.view.prompts;

  useEffect(() => {
    embedInstanceRef.current = null;
    embedReadyRef.current = false;
    setMountKey(k => k + 1);
  }, [ctx.partner.id, ctx.view.id]);

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
      customizations: {
        style: {
          customCSS: {
            variables: UPSTART_CSS_VARIABLES,
            rules_UNSTABLE: HIDE_TS_BRANDING_RULES,
          },
        },
      },
    });

    const markReady = () => {
      embedReadyRef.current = true;
      const pending = pendingQueryRef.current;
      if (pending) {
        pendingQueryRef.current = null;
        embed.trigger(HostEvent.SpotterSearch, { query: pending, executeSearch: true });
      }
    };
    embed.on(EmbedEvent.SpotterLoadComplete, markReady);
    embed.on(EmbedEvent.APP_INIT, markReady);

    embedInstanceRef.current = embed;
    embed.render();

    return () => {
      embedInstanceRef.current = null;
      embedReadyRef.current = false;
    };
  }, [mountKey, ctx]);

  const handlePromptClick = (prompt: string, idx: number) => {
    setSentIdx(idx);
    setTimeout(() => setSentIdx(null), 1600);

    if (embedInstanceRef.current && embedReadyRef.current) {
      embedInstanceRef.current.trigger(HostEvent.SpotterSearch, {
        query: prompt,
        executeSearch: true,
      });
    } else {
      pendingQueryRef.current = prompt;
    }
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
