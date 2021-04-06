// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/**
 * @packageDocumentation
 * @module theme-dark-extension
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@fk-jupyterlab/application';

import { IThemeManager } from '@fk-jupyterlab/apputils';

import { ITranslator } from '@fk-jupyterlab/translation';

/**
 * A plugin for the Jupyter Dark Theme.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@fk-jupyterlab/theme-dark-extension:plugin',
  requires: [IThemeManager, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    manager: IThemeManager,
    translator: ITranslator
  ) => {
    const trans = translator.load('jupyterlab');
    const style = '@fk-jupyterlab/theme-dark-extension/index.css';
    manager.register({
      name: 'JupyterLab Dark',
      displayName: trans.__('JupyterLab Dark'),
      isLight: false,
      themeScrollbars: true,
      load: () => manager.loadCSS(style),
      unload: () => Promise.resolve(undefined)
    });
  },
  autoStart: true
};

export default plugin;
