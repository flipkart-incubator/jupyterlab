// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { InstanceTracker } from '@fk-jupyterlab/apputils';

import { IStateDB } from '@fk-jupyterlab/coreutils';

import { CommandRegistry } from '@phosphor/commands';

import { Token } from '@phosphor/coreutils';

import { FileBrowser } from './browser';

/* tslint:disable */
/**
 * The path tracker token.
 */
export const IFileBrowserFactory = new Token<IFileBrowserFactory>(
  '@fk-jupyterlab/filebrowser:IFileBrowserFactory'
);
/* tslint:enable */

/**
 * The file browser factory interface.
 */
export interface IFileBrowserFactory {
  /**
   * Create a new file browser instance.
   *
   * @param id - The widget/DOM id of the file browser.
   *
   * @param options - The optional file browser configuration object.
   *
   * #### Notes
   * The ID parameter is used to set the widget ID. It is also used as part of
   * the unique key necessary to store the file browser's restoration data in
   * the state database if that functionality is enabled.
   *
   * If, after the file browser has been generated by the factory, the ID of the
   * resulting widget is changed by client code, the restoration functionality
   * will not be disrupted as long as there are no ID collisions, i.e., as long
   * as the initial ID passed into the factory is used for only one file browser
   * instance.
   */
  createFileBrowser(
    id: string,
    options?: IFileBrowserFactory.IOptions
  ): FileBrowser;

  /**
   * The instance tracker used by the factory to track file browsers.
   */
  readonly tracker: InstanceTracker<FileBrowser>;

  /**
   * The default file browser for the application.
   */
  defaultBrowser: FileBrowser;
}

/**
 * A namespace for file browser factory interfaces.
 */
export namespace IFileBrowserFactory {
  /**
   * The options for creating a file browser using a file browser factory.
   *
   * #### Notes
   * In future versions of JupyterLab, some of these options may disappear,
   * which is a backward-incompatible API change and will necessitate a new
   * version release. This is because in future versions, there will likely be
   * an application-wide notion of a singleton command registry and a singleton
   * state database.
   */
  export interface IOptions {
    /**
     * The command registry used by the file browser.
     *
     * #### Notes
     * If no command registry is provided, the application default will be used.
     */
    commands?: CommandRegistry;

    /**
     * An optional `Contents.IDrive` name for the model.
     * If given, the model will prepend `driveName:` to
     * all paths used in file operations.
     */
    driveName?: string;

    /**
     * The state database to use for saving file browser state and restoring it.
     *
     * #### Notes
     * Unless the value `null` is set for this option, the application state
     * database will be automatically passed in and used for state restoration.
     */
    state?: IStateDB | null;
  }
}
