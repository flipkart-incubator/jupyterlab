// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { editorServices } from '@fk-jupyterlab/codemirror';

import { CodeConsole, ConsolePanel } from '@fk-jupyterlab/console';

import { defaultRenderMime } from '@fk-jupyterlab/testutils';

export const editorFactory = editorServices.factoryService.newInlineEditor.bind(
  editorServices.factoryService
);

export const mimeTypeService = editorServices.mimeTypeService;

export const rendermime = defaultRenderMime();

/**
 * Create a console content factory.
 */
export function createConsoleFactory(): CodeConsole.IContentFactory {
  return new CodeConsole.ContentFactory({ editorFactory });
}

/**
 * Create a panel content factory.
 */
export function createConsolePanelFactory(): ConsolePanel.IContentFactory {
  return new ConsolePanel.ContentFactory({ editorFactory });
}
