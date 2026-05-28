import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk';
import Header from '../components/Header';
import {
  UPSTART_LIVEBOARD_ID,
  UPSTART_LIVEBOARD_TAB_ID,
  HIDE_TS_BRANDING_RULES,
  UPSTART_CSS_VARIABLES,
} from '../lib/thoughtspot';
import { usePartner, buildRuntimeFilters, buildHiddenActions, buildHiddenTabs } from '../lib/partnerContext';
import '../lib/thoughtspot';

export default function Dashboard() {
  const { liveboardId: paramId } = useParams<{ liveboardId?: string }>();
  const liveboardId = paramId || UPSTART_LIVEBOARD_ID;
  const isDefault = liveboardId === UPSTART_LIVEBOARD_ID;
  const ctx = usePartner();

  const embedRef = useRef<HTMLDivElement>(null);
  const embedInstanceRef = useRef<LiveboardEmbed | null>(null);
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    embedInstanceRef.current = null;
    setMountKey(k => k + 1);
  }, [liveboardId, ctx.partner.id, ctx.view.id]);

  useEffect(() => {
    if (!embedRef.current || embedInstanceRef.current) return;

    const runtimeFilters = buildRuntimeFilters(ctx);
    const hiddenActions = buildHiddenActions(ctx.view);
    const hiddenTabs = buildHiddenTabs(ctx.view);

    const embed = new LiveboardEmbed(embedRef.current, {
      frameParams: { width: '100%', height: '100%' },
      liveboardId,
      ...(isDefault && UPSTART_LIVEBOARD_TAB_ID ? { activeTabId: UPSTART_LIVEBOARD_TAB_ID } : {}),
      hideLiveboardHeader: false,
      showLiveboardTitle: false,
      showLiveboardDescription: false,
      isLiveboardStylingAndGroupingEnabled: true,
      runtimeFilters,
      hiddenActions,
      ...(hiddenTabs.length > 0 ? { hiddenTabs } : {}),
      customizations: {
        style: {
          customCSS: {
            variables: {
              ...UPSTART_CSS_VARIABLES,
              '--ts-var-root-background': 'transparent',
            },
            rules_UNSTABLE: {
              ...HIDE_TS_BRANDING_RULES,
              '.pinboard-title-module__pinboardTitle': { display: 'none !important' },
              '.pinboard-header-module__title': { display: 'none !important' },
              '.pinboard-header-module__description': { display: 'none !important' },
              '.pinboard-header-module__pinboardInfo': { display: 'none !important' },
              "[data-testid='pinboard-title']": { display: 'none !important' },
              "[data-testid='pinboard-description']": { display: 'none !important' },
              'body, .bk-root, .sage-embed-module, *': {
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif !important",
              },
              body: { backgroundColor: 'transparent !important' },
              '.pinboard-background, .ReactGridLayout, .pinboard-content-module__pinboardContent, .pinboard-module__pinboard, .pinboard-page, .embed-module__embedContainer': {
                backgroundColor: 'transparent !important',
              },
              '.answer-module__answer, .viz-card-module__vizCard': {
                border: 'none !important',
                boxShadow: '0 10px 25px -5px rgba(6, 24, 44, 0.08), 0 8px 10px -6px rgba(6, 24, 44, 0.04) !important',
                borderRadius: '12px !important',
                overflow: 'hidden !important',
              },
              '.react-grid-item': { border: 'none !important' },
            },
          },
        },
      },
    });

    embedInstanceRef.current = embed;
    embed.render();

    return () => {
      embedInstanceRef.current = null;
    };
  }, [mountKey, liveboardId, isDefault, ctx]);

  return (
    <>
      <Header
        title="Lending Performance"
        subtitle={`${ctx.partner.name} · ${ctx.view.name}${ctx.partner.vintageLabel ? ` · ${ctx.partner.vintageLabel}` : ''}`}
      />
      <main className="main-content">
        <div className="page-container">
          <div className="embed-container" key={mountKey} ref={embedRef} />
        </div>
      </main>
    </>
  );
}
