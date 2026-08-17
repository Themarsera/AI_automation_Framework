/**
 * Extracts price from text containing currency symbols and optional commas.
 * Supports formats like "$19.99", "$1,234.56", etc.
 */
export function extractPrice(text: string | null, useCommas = false): number {
  if (!text) {
    return 0;
  }

  const pattern = useCommas ? /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/ : /\$(\d+(?:\.\d{2})?)/;
  const match = text.match(pattern);

  if (!match) {
    return 0;
  }

  return parseFloat(match[1].replace(/,/g, ''));
}
