export interface PurposeSublabelParts {
  before: string;
  linkText: string | null;
  after: string;
}

export const PURPOSE_PDF_FILENAMES: Record<string, string> = {
  de: 'leitlinie_bearbeitungszweck.pdf',
  fr: 'directive_finalite_du_traitement.pdf',
  it: 'linea_guida_finalita_del_trattamento.pdf',
};

export function parsePurposeSublabel(translated: string): PurposeSublabelParts {
  const open = translated.indexOf('[');
  const close = translated.indexOf(']', open);
  if (open === -1 || close === -1) return { before: translated, linkText: null, after: '' };
  return {
    before: translated.slice(0, open),
    linkText: translated.slice(open + 1, close),
    after: translated.slice(close + 1),
  };
}
