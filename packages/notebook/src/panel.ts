// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Kernel, KernelMessage, Session } from '@fk-jupyterlab/services';

import { Token } from '@phosphor/coreutils';

import { Message } from '@phosphor/messaging';

import { ISignal, Signal } from '@phosphor/signaling';

import { IClientSession, showDialog, Dialog } from '@fk-jupyterlab/apputils';

import { DocumentWidget } from '@fk-jupyterlab/docregistry';

import { RenderMimeRegistry } from '@fk-jupyterlab/rendermime';

import { INotebookModel } from './model';

import { Notebook } from './widget';

/**
 * The class name added to notebook panels.
 */
const NOTEBOOK_PANEL_CLASS = 'jp-NotebookPanel';

const NOTEBOOK_PANEL_TOOLBAR_CLASS = 'jp-NotebookPanel-toolbar';

const NOTEBOOK_PANEL_NOTEBOOK_CLASS = 'jp-NotebookPanel-notebook';

/**
 * A widget that hosts a notebook toolbar and content area.
 *
 * #### Notes
 * The widget keeps the document metadata in sync with the current
 * kernel on the context.
 */
export class NotebookPanel extends DocumentWidget<Notebook, INotebookModel> {
  /**
   * Construct a new notebook panel.
   */
  constructor(options: DocumentWidget.IOptions<Notebook, INotebookModel>) {
    super(options);

    // Set up CSS classes
    this.addClass(NOTEBOOK_PANEL_CLASS);
    this.toolbar.addClass(NOTEBOOK_PANEL_TOOLBAR_CLASS);
    this.content.addClass(NOTEBOOK_PANEL_NOTEBOOK_CLASS);

    // Set up things related to the context
    this.content.model = this.context.model;
    this.context.session.kernelChanged.connect(this._onKernelChanged, this);
    this.context.session.statusChanged.connect(
      this._onSessionStatusChanged,
      this
    );

    this.revealed.then(() => {
      // Set the document edit mode on initial open if it looks like a new document.
      if (this.content.widgets.length === 1) {
        let cellModel = this.content.widgets[0].model;
        if (cellModel.type === 'code' && cellModel.value.text === '') {
          this.content.mode = 'edit';
        }
      }
    });
  }

  /**
   * A signal emitted when the panel has been activated.
   */
  get activated(): ISignal<this, void> {
    return this._activated;
  }

  /**
   * The client session used by the panel.
   */
  get session(): IClientSession {
    return this.context.session;
  }

  /**
   * The content factory for the notebook.
   *
   * TODO: deprecate this in favor of the .content attribute
   *
   */
  get contentFactory(): Notebook.IContentFactory {
    return this.content.contentFactory;
  }

  /**
   * The rendermime instance for the notebook.
   *
   * TODO: deprecate this in favor of the .content attribute
   *
   */
  get rendermime(): RenderMimeRegistry {
    return this.content.rendermime;
  }

  /**
   * The notebook used by the widget.
   */
  readonly content: Notebook;

  /**
   * The model for the widget.
   */
  get model(): INotebookModel {
    return this.content ? this.content.model : null;
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    this.content.dispose();
    super.dispose();
  }

  /**
   * Handle `'activate-request'` messages.
   */
  protected onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);

    // TODO: do we still need to emit this signal? Who is using it?
    this._activated.emit(void 0);
  }

  /**
   * Handle a change in the kernel by updating the document metadata.
   */
  private _onKernelChanged(
    sender: any,
    args: Session.IKernelChangedArgs
  ): void {
    if (!this.model || !args.newValue) {
      return;
    }
    let { newValue } = args;
    newValue.ready.then(() => {
      if (this.model) {
        this._updateLanguage(newValue.info.language_info);
      }
    });
    this._updateSpec(newValue);
  }

  private _onSessionStatusChanged(
    sender: IClientSession,
    status: Kernel.Status
  ) {
    // If the status is autorestarting, and we aren't already in a series of
    // autorestarts, show the dialog.
    if (status === 'autorestarting' && !this._autorestarting) {
      // The kernel died and the server is restarting it. We notify the user so
      // they know why their kernel state is gone.
      void showDialog({
        title: 'Kernel Restarting',
        body: `The kernel for ${
          this.session.path
        } appears to have died. It will restart automatically.`,
        buttons: [Dialog.okButton()]
      });
      this._autorestarting = true;
    } else if (status === 'restarting') {
      // Another autorestart attempt will first change the status to
      // restarting, then to autorestarting again, so we don't reset the
      // autorestarting status if the status is 'restarting'.
      /* no-op */
    } else {
      this._autorestarting = false;
    }
  }

  /**
   * Update the kernel language.
   */
  private _updateLanguage(language: KernelMessage.ILanguageInfo): void {
    this.model.metadata.set('language_info', language);
  }

  /**
   * Update the kernel spec.
   */
  private _updateSpec(kernel: Kernel.IKernelConnection): void {
    kernel.getSpec().then(spec => {
      if (this.isDisposed) {
        return;
      }
      this.model.metadata.set('kernelspec', {
        name: kernel.name,
        display_name: spec.display_name,
        language: spec.language
      });
    });
  }

  private _activated = new Signal<this, void>(this);

  /**
   * Whether we are currently in a series of autorestarts we have already
   * notified the user about.
   */
  private _autorestarting = false;
}

/**
 * A namespace for `NotebookPanel` statics.
 */
export namespace NotebookPanel {
  /**
   * A content factory interface for NotebookPanel.
   */
  export interface IContentFactory extends Notebook.IContentFactory {
    /**
     * Create a new content area for the panel.
     */
    createNotebook(options: Notebook.IOptions): Notebook;
  }

  /**
   * The default implementation of an `IContentFactory`.
   */
  export class ContentFactory extends Notebook.ContentFactory
    implements IContentFactory {
    /**
     * Create a new content area for the panel.
     */
    createNotebook(options: Notebook.IOptions): Notebook {
      return new Notebook(options);
    }
  }

  /**
   * Default content factory for the notebook panel.
   */
  export const defaultContentFactory: ContentFactory = new ContentFactory();

  /* tslint:disable */
  /**
   * The notebook renderer token.
   */
  export const IContentFactory = new Token<IContentFactory>(
    '@fk-jupyterlab/notebook:IContentFactory'
  );
  /* tslint:enable */
}
