// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { JupyterLab } from '@fk-jupyterlab/application';

// The webpack public path needs to be set before loading the CSS assets.
import { PageConfig } from '@fk-jupyterlab/coreutils';
// eslint-disable-next-line
__webpack_public_path__ = PageConfig.getOption('fullStaticUrl') + '/';

// Load the CSS assets
const styles = import('./build/style.js');

// These extension and mimeExtension imports should match the list of extensions in package.json. They are listed
// separately in package.json so the webpack config Build.ensureAssets step can copy
// extension assets to the build directory. These import statements assume
// the JupyterLab plugins are the default export from each package.
const extensions = [
  import('@fk-jupyterlab/application-extension'),
  import('@fk-jupyterlab/apputils-extension'),
  import('@fk-jupyterlab/codemirror-extension'),
  import('@fk-jupyterlab/completer-extension'),
  import('@fk-jupyterlab/console-extension'),
  import('@fk-jupyterlab/csvviewer-extension'),
  import('@fk-jupyterlab/docmanager-extension'),
  import('@fk-jupyterlab/filebrowser-extension'),
  import('@fk-jupyterlab/fileeditor-extension'),
  import('@fk-jupyterlab/help-extension'),
  import('@fk-jupyterlab/imageviewer-extension'),
  import('@fk-jupyterlab/inspector-extension'),
  import('@fk-jupyterlab/launcher-extension'),
  import('@fk-jupyterlab/mainmenu-extension'),
  import('@fk-jupyterlab/markdownviewer-extension'),
  import('@fk-jupyterlab/mathjax2-extension'),
  import('@fk-jupyterlab/notebook-extension'),
  import('@fk-jupyterlab/rendermime-extension'),
  import('@fk-jupyterlab/running-extension'),
  import('@fk-jupyterlab/settingeditor-extension'),
  import('@fk-jupyterlab/shortcuts-extension'),
  import('@fk-jupyterlab/statusbar-extension'),
  import('@fk-jupyterlab/terminal-extension'),
  import('@fk-jupyterlab/theme-dark-extension'),
  import('@fk-jupyterlab/theme-light-extension'),
  import('@fk-jupyterlab/tooltip-extension'),
  import('@fk-jupyterlab/translation-extension'),
  import('@fk-jupyterlab/ui-components-extension')
];

const mimeExtensions = [
  import('@fk-jupyterlab/json-extension'),
  import('@fk-jupyterlab/pdf-extension')
];

window.addEventListener('load', async function () {
  // Make sure the styles have loaded
  await styles;

  // Initialize JupyterLab with the mime extensions and application extensions.
  const lab = new JupyterLab({
    mimeExtensions: await Promise.all(mimeExtensions)
  });
  lab.registerPluginModules(await Promise.all(extensions));

  /* eslint-disable no-console */
  console.log('Starting app');
  await lab.start();
  console.log('App started, waiting for restore');
  await lab.restored;
  console.log('Example started!');
});
