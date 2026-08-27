export const DRAFT_VERSION = 'v1';
export const DRAFT_KEY_PREFIX = `rolemino:application-draft:${DRAFT_VERSION}:`;

export function draftKey(opportunityId: string | number): string {
  return `${DRAFT_KEY_PREFIX}${opportunityId}`;
}

/**
 * Fields safe to persist in sessionStorage.
 * Excluded: file objects, resume contents, document file metadata beyond reminder,
 * Terms acceptance, tokens, submission status, server ids, auth tokens.
 */
export type DraftPersistedFields = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  residentialAddress?: {
    streetName?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  countryOfBirth?: string;
  highestEducationLevel?: string;
  primarySpokenLanguage?: string;
  additionalLanguage?: string;
  availableHours?: number | string;
  additionalInformation?: string;
  // optional flag that resume was selected (non-authoritative, just to show reminder)
  _resumeReminder?: boolean;
};

const ALLOWED_KEYS = new Set([
  'firstName',
  'middleName',
  'lastName',
  'email',
  'phone',
  'phoneCountryCode',
  'residentialAddress',
  'countryOfBirth',
  'highestEducationLevel',
  'primarySpokenLanguage',
  'additionalLanguage',
  'availableHours',
  'additionalInformation',
  '_resumeReminder',
]);

export function sanitizeDraft(data: Record<string, unknown>): DraftPersistedFields {
  const out: Record<string, unknown> = {};
  for (const k of ALLOWED_KEYS) {
    if (k in data) {
      if (k === 'residentialAddress' && data[k] && typeof data[k] === 'object') {
        const addr = data[k] as Record<string, unknown>;
        out[k] = {
          streetName: typeof addr.streetName === 'string' ? addr.streetName : '',
          city: typeof addr.city === 'string' ? addr.city : '',
          state: typeof addr.state === 'string' ? addr.state : '',
          postalCode: typeof addr.postalCode === 'string' ? addr.postalCode : '',
          country: typeof addr.country === 'string' ? addr.country : '',
        };
      } else {
        out[k] = data[k];
      }
    }
  }
  return out as DraftPersistedFields;
}

export function saveDraft(opportunityId: string | number, data: Record<string, unknown>): void {
  try {
    const key = draftKey(opportunityId);
    const sanitized = sanitizeDraft(data);
    sessionStorage.setItem(key, JSON.stringify(sanitized));
  } catch {
    // storage unavailable or quota exceeded - silently ignore
  }
}

export function loadDraft(opportunityId: string | number): DraftPersistedFields | null {
  try {
    const key = draftKey(opportunityId);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // validate it's an object
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitizeDraft(parsed);
  } catch {
    // malformed json - clear it
    try {
      sessionStorage.removeItem(draftKey(opportunityId));
    } catch {
      // ignore
    }
    return null;
  }
}

export function clearDraft(opportunityId: string | number): void {
  try {
    sessionStorage.removeItem(draftKey(opportunityId));
  } catch {
    // ignore
  }
}

export function hasDraft(opportunityId: string | number): boolean {
  try {
    return sessionStorage.getItem(draftKey(opportunityId)) !== null;
  } catch {
    return false;
  }
}
