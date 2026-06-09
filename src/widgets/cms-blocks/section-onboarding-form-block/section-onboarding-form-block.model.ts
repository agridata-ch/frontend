export interface SubheadingParts {
  before: string;
  linkText: string | null;
  after: string;
}

export const AGATE_URLS: Record<string, string> = {
  de: 'https://www.blw.admin.ch/de/anwendung-agate',
  fr: 'https://www.blw.admin.ch/fr/application-agate',
  it: 'https://www.blw.admin.ch/it/applicazione-agate',
};

export function parseSubheadingParts(translated: string): SubheadingParts {
  const open = translated.indexOf('[');
  const close = translated.indexOf(']', open);
  if (open === -1 || close === -1) return { before: translated, linkText: null, after: '' };
  return {
    before: translated.slice(0, open),
    linkText: translated.slice(open + 1, close),
    after: translated.slice(close + 1),
  };
}
