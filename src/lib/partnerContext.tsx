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
  /** Persona-tuned starter questions surfaced in the Spotter side panel. */
  prompts: string[];
}

// Values below are real strings from the Upstart data — verified against
// Current Creditor Name, Originating Lender Name, and Product Type distinct lists.
export const PARTNERS: Partner[] = [
  {
    id: 'internal',
    name: 'Internal Demo',
    shortName: 'Internal',
    accent: '#06182c',
    creditorValues: [],
  },
  {
    id: 'velocity',
    name: 'Velocity Investments',
    shortName: 'Velocity',
    accent: '#00617a',
    creditorValues: ['Velocity Investments'],
    vintageStartISO: '2023-01-01',
    vintageLabel: 'Vintage ≥ Jan 2023',
  },
  {
    id: 'crown',
    name: 'Crown Asset Management',
    shortName: 'Crown',
    accent: '#ff6b00',
    creditorValues: ['Crown Asset Management LLC'],
    productTypeValues: ['personal_loan', 'auto_refinance'],
    vintageStartISO: '2024-06-01',
    vintageLabel: 'Vintage ≥ Jun 2024',
  },
  {
    id: 'crossriver',
    name: 'Cross River Bank',
    shortName: 'Cross River',
    accent: '#7c3aed',
    creditorValues: [],
    originatingLenderValues: ['Cross River Bank'],
    vintageStartISO: '2022-01-01',
    vintageLabel: 'Vintage ≥ Jan 2022',
  },
];

export const VIEWS: View[] = [
  {
    id: 'exec',
    name: 'Executive',
    description: 'Full access — edit, drill, ask AI',
    canEdit: true,
    canAskSpotter: true,
    canDrillDown: true,
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
    description: 'View only — no edit, no drill, no AI',
    canEdit: false,
    canAskSpotter: false,
    canDrillDown: false,
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

/** Build runtimeFilters for the active partner. */
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

  // Vintage cutoff — per-partner funding-start date.
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
 * Map a View's permissions to a list of Liveboard/Spotter actions to hide.
 * Hidden actions disappear from the UI entirely.
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
