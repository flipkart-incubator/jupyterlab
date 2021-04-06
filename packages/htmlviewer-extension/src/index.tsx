/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
/**
 * @packageDocumentation
 * @module htmlviewer-extension
 */

import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@fk-jupyterlab/application';

import { ICommandPalette, WidgetTracker } from '@fk-jupyterlab/apputils';

import { DocumentRegistry } from '@fk-jupyterlab/docregistry';

import {
  HTMLViewer,
  HTMLViewerFactory,
  IHTMLViewerTracker
} from '@fk-jupyterlab/htmlviewer';

import { ITranslator } from '@fk-jupyterlab/translation';

import { html5Icon } from '@fk-jupyterlab/ui-components';

/**
 * Command IDs used by the plugin.
 */
namespace CommandIDs {
  export const trustHTML = 'htmlviewer:trust-html';
}

/**
 * The HTML file handler extension.
 */
const htmlPlugin: JupyterFrontEndPlugin<IHTMLViewerTracker> = {
  activate: activateHTMLViewer,
  id: '@fk-jupyterlab/htmlviewer-extension:plugin',
  provides: IHTMLViewerTracker,
  requires: [ITranslator],
  optional: [ICommandPalette, ILayoutRestorer],
  autoStart: true
};

/**
 * Activate the HTMLViewer extension.
 */
function activateHTMLViewer(
  app: JupyterFrontEnd,
  translator: ITranslator,
  palette: ICommandPalette | null,
  restorer: ILayoutRestorer | null
): IHTMLViewerTracker {
  // Add an HTML file type to the docregistry.
  const trans = translator.load('jupyterlab');
  const ft: DocumentRegistry.IFileType = {
    name: 'html',
    contentType: 'file',
    fileFormat: 'text',
    displayName: trans.__('HTML File'),
    extensions: ['.html'],
    mimeTypes: ['text/html'],
    icon: html5Icon
  };
  app.docRegistry.addFileType(ft);

  // Create a new viewer factory.
  const factory = new HTMLViewerFactory({
    name: trans.__('HTML Viewer'),
    fileTypes: ['html'],
    defaultFor: ['html'],
    readOnly: true
  });

  // Create a widget tracker for HTML documents.
  const tracker = new WidgetTracker<HTMLViewer>({
    namespace: 'htmlviewer'
  });

  // Handle state restoration.
  if (restorer) {
    void restorer.restore(tracker, {
      command: 'docmanager:open',
      args: widget => ({ path: widget.context.path, factory: 'HTML Viewer' }),
      name: widget => widget.context.path
    });
  }

  app.docRegistry.addWidgetFactory(factory);
  factory.widgetCreated.connect((sender, widget) => {
    // Track the widget.
    void tracker.add(widget);
    // Notify the widget tracker if restore data needs to update.
    widget.context.pathChanged.connect(() => {
      void tracker.save(widget);
    });
    // Notify the application when the trust state changes so it
    // can update any renderings of the trust command.
    widget.trustedChanged.connect(() => {
      app.commands.notifyCommandChanged(CommandIDs.trustHTML);
    });

    widget.title.icon = ft.icon!;
    widget.title.iconClass = ft.iconClass ?? '';
    widget.title.iconLabel = ft.iconLabel ?? '';
  });

  // Add a command to trust the active HTML document,
  // allowing script executions in its context.
  app.commands.addCommand(CommandIDs.trustHTML, {
    label: trans.__('Trust HTML File'),
    isEnabled: () => !!tracker.currentWidget,
    isToggled: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return false;
      }
      const sandbox = current.content.sandbox;
      return sandbox.indexOf('allow-scripts') !== -1;
    },
    execute: () => {
      const current = tracker.currentWidget;
      if (!current) {
        return false;
      }
      current.trusted = !current.trusted;
    }
  });
  if (palette) {
    palette.addItem({
      command: CommandIDs.trustHTML,
      category: trans.__('File Operations')
    });
  }

  return tracker;
}
/**
 * Export the plugins as default.
 */
export default htmlPlugin;
