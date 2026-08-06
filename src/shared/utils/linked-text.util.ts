export interface LinkedTextParts {
  before: string;
  linkText: string | null;
  after: string;
  urlSchema?: string;
}

/**
 * Splits a translated string containing a single bracketed link placeholder
 * (e.g. `"Please check [agate] for details."`) into the text before the link,
 * the link text itself, and the text after. Uses the first `[...]` pair; when no
 * complete pair is present the whole string is returned as `before` and
 * `linkText` is `null`.
 * it also supports mailto and tel links which will be sliced out and returned as urlSchema
 *
 * CommentLastReviewed: 2026-07-21
 *
 * @param translated The translated string, optionally containing one `[...]` pair.
 * @returns The parsed parts of the string.
 */
export function parseLinkedText(translated: string): LinkedTextParts {
  const open = translated.indexOf('[');
  const close = translated.indexOf(']', open);
  if (open === -1 || close === -1) return { before: translated, linkText: null, after: '' };

  let linkText = translated.slice(open + 1, close);
  let urlSchema: string | undefined;

  if (linkText.startsWith('mailto:') || linkText.startsWith('tel:')) {
    const config = linkText.indexOf(':');
    urlSchema = linkText.slice(0, config);
    linkText = linkText.slice(config + 1);
  }

  return {
    before: translated.slice(0, open),
    linkText,
    after: translated.slice(close + 1),
    urlSchema,
  };
}
