/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
/**
 * @packageDocumentation
 * @module mathjax2-extension
 */

import { JupyterFrontEndPlugin } from '@fk-jupyterlab/application';

import { PageConfig } from '@fk-jupyterlab/coreutils';

import { ILatexTypesetter } from '@fk-jupyterlab/rendermime';

import { MathJaxTypesetter } from '@fk-jupyterlab/mathjax2';

/**
 * The MathJax latexTypesetter plugin.
 */
const plugin: JupyterFrontEndPlugin<ILatexTypesetter> = {
  id: '@fk-jupyterlab/mathjax2-extension:plugin',
  autoStart: true,
  provides: ILatexTypesetter,
  activate: () => {
    const url = PageConfig.getOption('fullMathjaxUrl');
    const config = PageConfig.getOption('mathjaxConfig');

    if (!url) {
      const message =
        `${plugin.id} uses 'mathJaxUrl' and 'mathjaxConfig' in PageConfig ` +
        `to operate but 'mathJaxUrl' was not found.`;

      throw new Error(message);
    }

    return new MathJaxTypesetter({ url, config });
  }
};

/**
 * Export the plugin as default.
 */
export default plugin;
