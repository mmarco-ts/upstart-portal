import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RuntimeFilterOp, Action } from '@thoughtspot/visual-embed-sdk';

/**
 * Capital partner profile — drives row-level security in the embed by
 * pushing matching runtimeFilters into the iframe at mount time.
 */
export interface Partner {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  /** Filter against current_creditor_name (latest_loan_ownerships). */
  creditorValues: string[];
  /** Optional filter against originating_lender_name (latest_loans / applications). */
  originatingLenderValues?: string[];
  /** Optional product_type subset filter. */
  productTypeValues?: string[];
  /**
   * Vintage cutoff — partner only sees loans originated on or after this ISO date.
   * Models "funding start date" per investor relationship.
   */
  vintageStartISO?: string;
  /** Human-readable vintage label for chips/UI. */
  vintageLabel?: string;
}

export interface View {
  id: string;
  name: string;
  description: string;
  /** Whether this user can edit the dashboard (Save, Edit, Make a Copy, Pin). */
  canEdit: boolean;
  /** Whether this user can access Spotter from within the dashboard. */
  canAskSpotter: boolean;
  /** Whether this user can drill down on a viz to break out by another dimension. */
  canDrillDown: boolean;
  /**
   * Whether this user can see borrower-level PII columns/tabs
   * (Annual Income, Borrower Fees Collected, etc.).
   * When false, tabs listed in PII_TAB_IDS get hidden via `hiddenTabs`.
   */
  canSeePII: boolean;
  /** Persona-tuned starter questions surfaced in the Spotter side panel. */
  prompts: string[];
}

export const PARTNERS: Partner[] = [
  {
    id: 'internal',
    name: 'Internal Demo',
    shortName: 'Internal',
    accent: '#06182c',
    creditorValues: [],
    // No vintage cutoff — internal users see the full origination history
  },
  {
    id: 'goldman',
    name: 'Goldman Sachs Capital',
    shortName: 'Goldman',
    accent: '#00617a',
    creditorValues: ['Goldman Sachs'],
    vintageStartISO: '2025-01-01',
    vintageLabel: 'Vintage ≥ Jan 2025',
  },
  {
    id: 'apollo',
    name: 'Apollo Fund I',
    shortName: 'Apollo',
    accent: '#ff6b00',
    creditorValues: ['Apollo'],
    productTypeValues: ['personal_loan', 'auto_refinance'],
    vintageStartISO: '2025-06-01',
    vintageLabel: 'Vintage ≥ Jun 2025',
  },
  {
    id: 'marlette',
    name: 'Marlette Funding',
    shortName: 'Marlette',
    accent: '#7c3aed',
    creditorValues: [],
    originatingLenderValues: ['Marlette'],
    vintageStartISO: '2024-09-01',
    vintageLabel: 'Vintage ≥ Sep 2024',
  },
];

export const VIEWS: View[] = [
  {
    id: 'exec',
    name: 'Executive',
    description: 'Full access — edit, save, ask AI, see PII',
    canEdit: true,
    canAskSpotter: true,
    canDrillDown: true,
    canSeePII: true,
    prompts: [
      'Loans originated MTD vs prior month',
      'Approval rate trend by application month over the last 12 months',
      'Average APR by product type and risk grade',
      'Loan purpose category breakdown this quarter',
      'Referral fee income QTD',
    ],
  },
  {
    id: 'capital',
    name: 'Capital Markets',
    description: 'Read + drill + ask AI · cannot edit',
    canEdit: false,
    canAskSpotter: true,
    canDrillDown: true,
    canSeePII: true,
    prompts: [
      '90+ day delinquency rate by loan vintage',
      'Average APR by risk grade for personal loans',
      'Outstanding principal by current creditor',
      'Total cash collected by month this year',
      'Average loan amount by income bracket',
    ],
  },
  {
    id: 'ops',
    name: 'Operations',
    description: 'View only · no drill, no AI, PII masked',
    canEdit: false,
    canAskSpotter: false,
    canDrillDown: false,
    canSeePII: false,
    prompts: [
      'Application to funded conversion rate by acquisition channel',
      'Average days application to funding by product type',
      'Approval rate by state',
      'Funded loans this quarter by acquisition channel',
      'Payment success rate by payment method',
    ],
  },
];

interface PartnerCtx {
  partner: Partner;
  view: View;
  setPartnerId: (id: string) => void;
  setViewId: (id: string) => void;
  creditorField: string;
  originatingLenderField: string;
  productTypeField: string;
}

const PartnerContext = createContext<PartnerCtx | null>(null);

const LS_PARTNER = 'upstart.partner';
const LS_VIEW = 'upstart.view';

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [partnerId, setPartnerIdState] = useState<string>(() => localStorage.getItem(LS_PARTNER) || 'internal');
  const [viewId, setViewIdState] = useState<string>(() => localStorage.getItem(LS_VIEW) || 'exec');

  useEffect(() => { localStorage.setItem(LS_PARTNER, partnerId); }, [partnerId]);
  useEffect(() => { localStorage.setItem(LS_VIEW, viewId); }, [viewId]);

  const partner = PARTNERS.find(p => p.id === partnerId) ?? PARTNERS[0];
  const view = VIEWS.find(v => v.id === viewId) ?? VIEWS[0];

  return (
    <PartnerContext.Provider
      value={{
        partner,
        view,
        setPartnerId: setPartnerIdState,
        setViewId: setViewIdState,
        creditorField: 'Current Creditor Name',
        originatingLenderField: 'Originating Lender Name',
        productTypeField: 'Product Type',
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error('usePartner must be used inside PartnerProvider');
  return ctx;
}

/** Build runtimeFilters for the active partner — RLS only, no date filter. */
export function buildRuntimeFilters(ctx: PartnerCtx) {
  const filters: Array<{ columnName: string; operator: RuntimeFilterOp; values: (string | number)[] }> = [];

  if (ctx.partner.creditorValues.length > 0) {
    filters.push({
      columnName: ctx.creditorField,
      operator: RuntimeFilterOp.IN,
      values: ctx.partner.creditorValues,
    });
  }

  if (ctx.partner.originatingLenderValues && ctx.partner.originatingLenderValues.length > 0) {
    filters.push({
      columnName: ctx.originatingLenderField,
      operator: RuntimeFilterOp.IN,
      values: ctx.partner.originatingLenderValues,
    });
  }

  if (ctx.partner.productTypeValues && ctx.partner.productTypeValues.length > 0) {
    filters.push({
      columnName: ctx.productTypeField,
      operator: RuntimeFilterOp.IN,
      values: ctx.partner.productTypeValues,
    });
  }

  // Vintage cutoff — per-partner funding-start date. Filter is partner-driven,
  // NOT view/persona-driven, so it stays stable when "View as" changes.
  if (ctx.partner.vintageStartISO) {
    const startSec = Math.floor(new Date(ctx.partner.vintageStartISO).getTime() / 1000);
    if (!Number.isNaN(startSec)) {
      filters.push({
        columnName: 'Origination Date',
        operator: RuntimeFilterOp.GE,
        values: [startSec],
      });
    }
  }

  return filters;
}

/**
 * Tab IDs to hide for views that don't have PII access. Populate with the
 * IDs of tabs in the Lending Performance liveboard that contain borrower-level
 * columns (Annual Income, Borrower Fees Collected, Charged Off Amount, etc.).
 * Find a tab ID by opening the liveboard and copying it from the URL:
 *   /pinboard/<liveboardId>/tab/<TAB_ID_HERE>
 */
export const PII_TAB_IDS: string[] = [
  // 'TODO-borrower-detail-tab-id',
];

/** Returns the list of tab IDs to hide based on the active view's PII permissions. */
export function buildHiddenTabs(view: View): string[] {
  return view.canSeePII ? [] : PII_TAB_IDS;
}

/**
 * Map a View's permissions to a list of Liveboard/Spotter actions to hide.
 * Actions hidden disappear from the UI entirely (not just disabled).
 */
export function buildHiddenActions(view: View): Action[] {
  const hidden: Action[] = [];

  if (!view.canEdit) {
    hidden.push(
      Action.Edit,
      Action.Save,
      Action.MakeACopy,
      Action.Pin,
      Action.EditTML,
    );
  }

  if (!view.canAskSpotter) {
    hidden.push(Action.AskAi, Action.SpotIQAnalyze);
  }

  if (!view.canDrillDown) {
    hidden.push(Action.DrillDown);
  }

  return hidden;
}
