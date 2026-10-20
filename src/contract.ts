/**
 * Wire contract shared by the host and client halves.
 *
 * `CHANNEL` names the Connection channel the browser half opens to reach the
 * host-side `dsh-plugin-scaffold-service` service. Both halves import it from
 * here so the spelling has exactly one home; the client bundle inlines it at
 * build time.
 *
 * @module @dsh-electron/dsh-plugin-scaffold/contract
 */

/** The Connection channel between the client half and the host service. */
export const CHANNEL = '/dsh-plugin-scaffold'
