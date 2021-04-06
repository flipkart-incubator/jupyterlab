// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { toArray } from '@lumino/algorithm';

import { Widget } from '@lumino/widgets';

import { ISignal, Signal } from '@lumino/signaling';

import { ILabShell } from '@fk-jupyterlab/application';

import { IRunningSessions, IRunningSessionManagers } from '@fk-jupyterlab/running';

import { ITranslator } from '@fk-jupyterlab/translation';

import { fileIcon, LabIcon } from '@fk-jupyterlab/ui-components';

import { DocumentWidget } from '@fk-jupyterlab/docregistry';

/**
 * A class used to consolidate the signals used to rerender the open tabs section.
 */
class OpenTabsSignaler {
  constructor(labShell: ILabShell) {
    this._labShell = labShell;
    this._labShell.layoutModified.connect(this._emitTabsChanged, this);
  }

  /**
   * A signal that fires when the open tabs section should be rerendered.
   */
  get tabsChanged(): ISignal<this, void> {
    return this._tabsChanged;
  }

  /**
   * Add a widget to watch for title changing.
   *
   * @param widget A widget whose title may change.
   */
  addWidget(widget: Widget): void {
    widget.title.changed.connect(this._emitTabsChanged, this);
    this._widgets.push(widget);
  }

  /**
   * Emit the main signal that indicates the open tabs should be rerendered.
   */
  private _emitTabsChanged(): void {
    this._widgets.forEach(widget => {
      widget.title.changed.disconnect(this._emitTabsChanged, this);
    });
    this._widgets = [];
    this._tabsChanged.emit(void 0);
  }

  private _tabsChanged = new Signal<this, void>(this);
  private _labShell: ILabShell;
  private _widgets: Widget[] = [];
}

/**
 * Add the open tabs section to the running panel.
 *
 * @param managers - The IRunningSessionManagers used to register this section.
 * @param translator - The translator to use.
 * @param labShell - The ILabShell.
 */
export function addOpenTabsSessionManager(
  managers: IRunningSessionManagers,
  translator: ITranslator,
  labShell: ILabShell
) {
  const signaler = new OpenTabsSignaler(labShell);
  const trans = translator.load('jupyterlab');

  managers.add({
    name: trans.__('Open Tabs'),
    running: () => {
      return toArray(labShell.widgets('main')).map((widget: Widget) => {
        signaler.addWidget(widget);
        return new OpenTab(widget);
      });
    },
    shutdownAll: () => {
      toArray(labShell.widgets('main')).forEach((widget: Widget) => {
        widget.close();
      });
    },
    refreshRunning: () => {
      return void 0;
    },
    runningChanged: signaler.tabsChanged,
    shutdownLabel: trans.__('Close'),
    shutdownAllLabel: trans.__('Close All'),
    shutdownAllConfirmationText: trans.__(
      'Are you sure you want to close all open tabs?'
    )
  });

  class OpenTab implements IRunningSessions.IRunningItem {
    constructor(widget: Widget) {
      this._widget = widget;
    }
    open() {
      labShell.activateById(this._widget.id);
    }
    shutdown() {
      this._widget.close();
    }
    icon() {
      const widgetIcon = this._widget.title.icon;
      return widgetIcon instanceof LabIcon ? widgetIcon : fileIcon;
    }
    label() {
      return this._widget.title.label;
    }
    labelTitle() {
      let labelTitle: string;
      if (this._widget instanceof DocumentWidget) {
        labelTitle = this._widget.context.path;
      } else {
        labelTitle = this._widget.title.label;
      }
      return labelTitle;
    }

    private _widget: Widget;
  }
}
