import { useEffect, useRef, useState } from 'react';
import { SearchEmbed } from '@thoughtspot/visual-embed-sdk';
import { Search as SearchIcon, Lightbulb } from 'lucide-react';
import Header from '../components/Header';
import {
  UPSTART_MODEL_ID,
  HIDE_TS_BRANDING_RULES,
  UPSTART_CSS_VARIABLES,
} from '../lib/thoughtspot';
import { usePartner, buildRuntimeFilters, buildHiddenActions } from '../lib/partnerContext';
import '../lib/thoughtspot';

// Each entry pairs a human-readable label with the actual TS token string.
// Tokens must match column names in the model exactly and be wrapped in [brackets].
// Date columns can append .monthly / .quarterly / .yearly for bucketing.
interface StarterQuery {
  label: string;
  tokens: string;
}

const STARTER_TOKEN_QUERIES: StarterQuery[] = [
  { label: 'Loan count by origination month',     tokens: '[Loan Count] [Origination Date].monthly' },
  { label: 'Approval rate by state',              tokens: '[Approval Rate] [State]' },
  { label: 'Average APR by risk grade & product', tokens: '[Average APR] [Risk Grade] [Product Type]' },
  { label: 'Loan purpose by quarter',             tokens: '[Loan Purpose Category] [Origination Date].quarterly' },
  { label: 'Application count by channel',        tokens: '[Application Count] [Acquisition Channel]' },
];

const TIPS = [
  'Tokens auto-complete from the model — start typing a column name.',
  'Stack tokens: metric + dimension + time + filter.',
  'Pin any answer to your Liveboard for future reference.',
];

export default function Search() {
  const embedRef = useRef<HTMLDivElement>(null);
  const embedInstanceRef = useRef<SearchEmbed | null>(null);
  const [seedQuery, setSeedQuery] = useState<string | undefined>();
  const [mountKey, setMountKey] = useState(0);
  const ctx = usePartner();

  // Remount whenever partner / view / seed changes
  useEffect(() => {
    embedInstanceRef.current = null;
    setMountKey(k => k + 1);
  }, [ctx.partner.id, ctx.view.id, seedQuery]);

  useEffect(() => {
    if (!embedRef.current || embedInstanceRef.current) return;

    const runtimeFilters = buildRuntimeFilters(ctx);
    const hiddenActions = buildHiddenActions(ctx.view);

    const embed = new SearchEmbed(embedRef.current, {
      frameParams: { width: '100%', height: '100%' },
      dataSource: UPSTART_MODEL_ID,
      collapseDataSources: false,
      hideDataSources: false,
      runtimeFilters,
      hiddenActions,
      ...(seedQuery
        ? { searchOptions: { searchTokenString: seedQuery, executeSearch: true } }
        : {}),
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

  return (
    <>
      <Header
        title="Search"
        subtitle="Token-based ad-hoc analysis for power users · same model as the dashboard"
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
                <span>Token search</span>
              </div>

              <div className="spotter-side-section">
                <div className="spotter-side-eyebrow">
                  <SearchIcon size={13} />
                  Try a query
                </div>
                <div className="spotter-side-help">
                  Click a token query below to seed the search bar. Edit it to refine.
                </div>
                <div className="spotter-prompt-list">
                  {STARTER_TOKEN_QUERIES.map(q => (
                    <button
                      key={q.label}
                      className="spotter-prompt-card"
                      onClick={() => setSeedQuery(q.tokens)}
                      title={q.tokens}
                    >
                      <span className="spotter-prompt-text">{q.label}</span>
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
