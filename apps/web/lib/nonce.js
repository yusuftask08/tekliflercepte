import { headers } from "next/headers";

/** Reads the per-request CSP nonce middleware.js generated (undefined in
 *  dev / anywhere middleware didn't run — a page's inline <script nonce=
 *  {undefined}> is just a script with no nonce attribute, harmless when
 *  there's no CSP requiring one). Pages with an inline JSON-LD <script>
 *  need this so that script survives once CSP_ENFORCE flips on. */
export async function getNonce() {
  const headerList = await headers();
  return headerList.get("x-nonce") ?? undefined;
}
