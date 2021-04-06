// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/**
 * @packageDocumentation
 * @module celltags-extension
 */

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@fk-jupyterlab/application';

import { INotebookTools, INotebookTracker } from '@fk-jupyterlab/notebook';

import { TagTool } from '@fk-jupyterlab/celltags';

import { ITranslator } from '@fk-jupyterlab/translation';

/**
 * Initialization data for the celltags extension.
 */
const celltags: JupyterFrontEndPlugin<void> = {
  id: '@fk-jupyterlab/celltags',
  autoStart: true,
  requires: [INotebookTools, INotebookTracker, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    tools: INotebookTools,
    tracker: INotebookTracker,
    translator: ITranslator
  ) => {
    const tool = new TagTool(tracker, app, translator);
    tools.addItem({ tool: tool, rank: 1.6 });
  }
};

export default celltags;
