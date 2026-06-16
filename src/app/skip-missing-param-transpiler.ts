import { Injectable } from '@angular/core';
import { DefaultTranspiler } from '@jsverse/transloco';

/**
 * Extends DefaultTranspiler to preserve unresolved {{placeholders}} instead
 * of replacing them with an empty string.
 *
 * CommentLastReviewed: 2026-06-16
 */
@Injectable()
export class SkipMissingParamTranspiler extends DefaultTranspiler {
  override transpile(opts: Parameters<DefaultTranspiler['transpile']>[0]): unknown {
    const { value, params = {}, translation, key } = opts;
    if (typeof value !== 'string') {
      return super.transpile(opts);
    }

    const matcher = this.interpolationMatcher;
    let parsedValue = value;
    let paramMatch: RegExpExecArray | null;

    while ((paramMatch = matcher.exec(parsedValue)) !== null) {
      const [fullMatch, paramValue] = paramMatch;
      const paramKey = paramValue.trim();

      if (paramKey in params) {
        parsedValue = parsedValue.replace(fullMatch, () => String(params[paramKey]));
        matcher.lastIndex = 0;
      } else if (paramKey in translation) {
        parsedValue = parsedValue.replace(
          fullMatch,
          () =>
            this.transpile({ params, translation, key, value: translation[paramKey] }) as string,
        );
        matcher.lastIndex = 0;
      }
      // Param not found: leave placeholder as-is, regex advances naturally
    }

    return parsedValue;
  }
}
