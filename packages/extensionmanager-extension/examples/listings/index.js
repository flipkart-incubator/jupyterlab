// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig } from '@fk-jupyterlab/coreutils';
// eslint-disable-next-line
__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';

// This must be after the public path is set.
// This cannot be extracted because the public path is dynamic.
require('./build/imports.css');

window.addEventListener('load', async function () {
  var JupyterLab = require('@fk-jupyterlab/application').JupyterLab;

  var mods = [
    require('@fk-jupyterlab/application-extension'),
    require('@fk-jupyterlab/apputils-extension'),
    require('@fk-jupyterlab/codemirror-extension'),
    require('@fk-jupyterlab/completer-extension'),
    require('@fk-jupyterlab/console-extension'),
    require('@fk-jupyterlab/csvviewer-extension'),
    require('@fk-jupyterlab/docmanager-extension'),
    require('@fk-jupyterlab/extensionmanager-extension'),
    require('@fk-jupyterlab/fileeditor-extension'),
    require('@fk-jupyterlab/filebrowser-extension'),
    require('@fk-jupyterlab/help-extension'),
    require('@fk-jupyterlab/imageviewer-extension'),
    require('@fk-jupyterlab/inspector-extension'),
    require('@fk-jupyterlab/launcher-extension'),
    require('@fk-jupyterlab/mainmenu-extension'),
    require('@fk-jupyterlab/markdownviewer-extension'),
    require('@fk-jupyterlab/mathjax2-extension'),
    require('@fk-jupyterlab/notebook-extension'),
    require('@fk-jupyterlab/rendermime-extension'),
    require('@fk-jupyterlab/running-extension'),
    require('@fk-jupyterlab/settingeditor-extension'),
    require('@fk-jupyterlab/shortcuts-extension'),
    require('@fk-jupyterlab/statusbar-extension'),
    require('@fk-jupyterlab/terminal-extension'),
    require('@fk-jupyterlab/theme-dark-extension'),
    require('@fk-jupyterlab/theme-light-extension'),
    require('@fk-jupyterlab/tooltip-extension'),
    require('@fk-jupyterlab/ui-components-extension')
  ];
  var lab = new JupyterLab();
  lab.registerPluginModules(mods);
  /* eslint-disable no-console */
  console.log('Starting app');
  await lab.start();
  console.log('App started, waiting for restore');
  await lab.restored;
  console.log('Example started!');
});
