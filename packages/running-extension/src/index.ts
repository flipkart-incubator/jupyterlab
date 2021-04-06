// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/**
 * @packageDocumentation
 * @module running-extension
 */

import {
  ILayoutRestorer,
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@fk-jupyterlab/application';

import {
  IRunningSessionManagers,
  RunningSessionManagers,
  RunningSessions
} from '@fk-jupyterlab/running';

import { ITranslator } from '@fk-jupyterlab/translation';

import { runningIcon } from '@fk-jupyterlab/ui-components';

import { addOpenTabsSessionManager } from './opentabs';

import { addKernelRunningSessionManager } from './kernels';

/**
 * The default running sessions extension.
 */
const plugin: JupyterFrontEndPlugin<IRunningSessionManagers> = {
  activate,
  id: '@fk-jupyterlab/running-extension:plugin',
  provides: IRunningSessionManagers,
  requires: [ITranslator],
  optional: [ILayoutRestorer, ILabShell],
  autoStart: true
};

/**
 * Export the plugin as default.
 */
export default plugin;

/**
 * Activate the running plugin.
 */
function activate(
  app: JupyterFrontEnd,
  translator: ITranslator,
  restorer: ILayoutRestorer | null,
  labShell: ILabShell | null
): IRunningSessionManagers {
  const trans = translator.load('jupyterlab');
  const runningSessionManagers = new RunningSessionManagers();
  const running = new RunningSessions(runningSessionManagers, translator);
  running.id = 'jp-running-sessions';
  running.title.caption = trans.__('Running Terminals and Kernels');
  running.title.icon = runningIcon;

  // Let the application restorer track the running panel for restoration of
  // application state (e.g. setting the running panel as the current side bar
  // widget).
  if (restorer) {
    restorer.add(running, 'running-sessions');
  }
  if (labShell) {
    addOpenTabsSessionManager(runningSessionManagers, translator, labShell);
  }
  addKernelRunningSessionManager(runningSessionManagers, translator, app);
  // Rank has been chosen somewhat arbitrarily to give priority to the running
  // sessions widget in the sidebar.
  app.shell.add(running, 'left', { rank: 200 });

  return runningSessionManagers;
}
