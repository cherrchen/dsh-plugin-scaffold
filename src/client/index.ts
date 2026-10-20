/**
 * Browser half of the plugin scaffold.
 *
 * Everything the browser surface needs arrives through services the
 * composition already provides — `slots` to contribute, `locale` for its copy,
 * and `connection` for the channel to the host half.
 *
 * `slots.inject` is the soft seam: a contribution registers only when the
 * sidebar declares that slot, so a runtime whose sidebar surface differs
 * simply shows no contribution instead of failing the client graph.
 *
 * The module stays a valid client row before a surface exists: the bare-name
 * loader row exists so `lib/client.js` reaches the browser, and an empty apply
 * is the honest shape while no slot contribution exists.
 *
 * @module @dsh-electron/dsh-plugin-scaffold/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: the CLIENT faces that publish `ctx.slots` / `ctx.locale` /
// `ctx.connection` on the browser context.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'

export { CHANNEL } from '../contract.ts'

/**
 * The client-side services the browser half consumes: `slots` to contribute
 * UI, `locale` for its copy, `connection` for `CHANNEL` to the host.
 * All three exist in the standard web composition; the empty apply mounts
 * nothing yet, so the injection is a declaration of the seam, not a new need.
 */
export const inject = ['slots', 'locale', 'connection']

/**
 * Register the browser half's contributions.
 *
 * FIXME: no contribution exists yet — build your plugin's surface here. The
 * empty apply keeps the bare-name anchor row honest: the module loads, mounts
 * nothing, and fails nothing.
 * @param _ctx - the client context.
 */
export function apply(_ctx: ClientContext): void {}
