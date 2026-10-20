/**
 * `dsh-plugin-scaffold-service`: the plugin's host half.
 *
 * This row owns the host-side service that the browser half reaches over the
 * Connection channel declared in `./contract.ts`. Replace the placeholder API
 * with the real one when you build your plugin.
 *
 * It injects `dshPluginScaffoldCompat`, so on a refused installation the row
 * simply does not start and the bundle degrades to "plugin not installed".
 *
 * @module @dsh-electron/dsh-plugin-scaffold/service
 */

import { Service } from '@deepseek-ai/cordis'
import type {} from './compat.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    dshPluginScaffold: DshPluginScaffoldService
  }
}

/**
 * The `ctx.dshPluginScaffold` service: the host-side owner of this plugin's
 * behavior. The compatibility verdict is exposed read-only so the host
 * endpoints can always say which release they are running against.
 */
export default class DshPluginScaffoldService extends Service {
  static inject = ['dshPluginScaffoldCompat']

  /** The single DSH release this composition started under. */
  get release(): string | undefined {
    return this.ctx.dshPluginScaffoldCompat.release
  }
}
