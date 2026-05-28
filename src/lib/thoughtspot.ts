import { init, AuthType } from '@thoughtspot/visual-embed-sdk';

let isInitialized = false;

export const TS_HOST = 'https://upstart.thoughtspot.cloud';
export const UPSTART_LIVEBOARD_ID = '46cf1c34-4885-4ded-bdd0-bc6a1001b415';
export const UPSTART_LIVEBOARD_TAB_ID = '252531e6-cd9a-46af-aaff-a50f07d5cb4d';
export const UPSTART_MODEL_ID = '7abe3ebf-a1bc-4440-9c35-9b0583f97285';

// Spotter icon sprite — pinned to commit SHA so jsDelivr never serves a stale cached copy.
// Bump this when public/upstart-spotter-icon.svg changes.
export const UPSTART_SPOTTER_ICON_URL =
  'https://cdn.jsdelivr.net/gh/mmarco-ts/upstart-portal@f5f3762e28836c06054b44bb8471de4ce582bde7/public/upstart-spotter-icon.svg';

// Whitelabel strings — replaces ThoughtSpot terminology with Upstart-internal language.
export const UPSTART_WHITELABEL_STRINGS: Record<string, string> = {
  'Spotter': 'Insights AI',
  'Ask Spotter': 'Ask Insights AI',
  'Spotter session': 'Insights AI session',
  'Ask a question': 'Ask about your loan portfolio',
  'ThoughtSpot': 'Upstart Insights',
  'Powered by ThoughtSpot': '',
  'What do you want to know?': 'What would you like to analyze?',
};

// TS CSS variables to push Upstart palette into the embedded chrome.
// Convention from TS docs: secondary buttons use a LIGHT tint background
// so dark icons inside (chart picker, header actions) stay legible.
export const UPSTART_CSS_VARIABLES: Record<string, string> = {
  // Application chrome
  '--ts-var-application-color': '#06182c',
  '--ts-var-root-color': '#0f172a',
  '--ts-var-root-background': 'transparent',
  '--ts-var-viz-background': '#ffffff',
  '--ts-var-root-font-family': "'Inter', system-ui, -apple-system, sans-serif",

  // Primary buttons — orange CTA (Save, Pin)
  '--ts-var-button-border-radius': '6px',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary-background': '#ff6b00',
  '--ts-var-button--primary--hover-background': '#e65c00',
  '--ts-var-button--primary--font-family': "'Inter', system-ui, sans-serif",

  // Secondary buttons — light teal tint so dark icons inside stay visible.
  // This includes the chart-type picker rail and Liveboard header actions.
  '--ts-var-button--secondary-background': '#e6f1f4',
  '--ts-var-button--secondary--hover-background': '#cfe2e8',
  '--ts-var-button--secondary--active-background': '#b8d4dc',
  '--ts-var-button--secondary--font-family': "'Inter', system-ui, sans-serif",

  // Liveboard header action icons — keep them dark navy for contrast on light bg
  '--ts-var-liveboard-header-action-button-hover-color': '#06182c',

  // Chips/filters
  '--ts-var-chip-color': '#06182c',
  '--ts-var-chip-background': '#e6f1f4',
};

export const HIDE_TS_BRANDING_RULES: Record<string, Record<string, string>> = {
  '.footer-module__footerLogo': { display: 'none !important' },
  '.footer-module__footer': { display: 'none !important' },
  "[class*='footer-module']": { display: 'none !important' },
  "img[alt*='Powered by']": { display: 'none !important' },
  "img[alt*='ThoughtSpot']": { display: 'none !important' },
  '.bk-logo, .thoughtspot-logo, [class*=\'thoughtspotLogo\']': { display: 'none !important' },
  '.collapsible-item-response-module__customIconWrapper': { display: 'none !important' },
  '.button-module__buttonWrapper.chat-connector-resources-module__addConnectorResourceButton': { display: 'none !important' },
};

export function initThoughtSpot() {
  if (!isInitialized) {
    init({
      thoughtSpotHost: TS_HOST,
      authType: AuthType.None,
      customizations: {
        content: { strings: UPSTART_WHITELABEL_STRINGS },
        iconSpriteUrl: UPSTART_SPOTTER_ICON_URL,
        style: {
          customCSS: {
            variables: UPSTART_CSS_VARIABLES,
            rules_UNSTABLE: HIDE_TS_BRANDING_RULES,
          },
        },
      },
    });
    isInitialized = true;
    console.log('ThoughtSpot SDK initialized for Upstart');
  }
}

initThoughtSpot();
