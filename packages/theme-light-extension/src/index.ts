// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JupyterLab, JupyterLabPlugin } from '@fk-jupyterlab/application';

import { IThemeManager } from '@fk-jupyterlab/apputils';

/**
 * A plugin for the Jupyter Light Theme.
 */
const plugin: JupyterLabPlugin<void> = {
  id: '@fk-jupyterlab/theme-light-extension:plugin',
  requires: [IThemeManager],
  activate: function(app: JupyterLab, manager: IThemeManager) {
    const style = '@fk-jupyterlab/theme-light-extension/index.css';

    manager.register({
      name: 'JupyterLab Light',
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
