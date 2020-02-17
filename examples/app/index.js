// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// ES6 Promise polyfill
require('es6-promise/auto');

window.addEventListener('load', function() {
  require('font-awesome/css/font-awesome.min.css');
  var JupyterLab = require('@fk-jupyterlab/application').JupyterLab;

  var mods = [
    require('@fk-jupyterlab/application-extension'),
    require('@fk-jupyterlab/apputils-extension'),
    require('@fk-jupyterlab/codemirror-extension'),
    require('@fk-jupyterlab/completer-extension'),
    require('@fk-jupyterlab/console-extension'),
    require('@fk-jupyterlab/csvviewer-extension'),
    require('@fk-jupyterlab/docmanager-extension'),
    require('@fk-jupyterlab/fileeditor-extension'),
    require('@fk-jupyterlab/faq-extension'),
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
    require('@fk-jupyterlab/tabmanager-extension'),
    require('@fk-jupyterlab/terminal-extension'),
    require('@fk-jupyterlab/theme-dark-extension'),
    require('@fk-jupyterlab/theme-light-extension'),
    require('@fk-jupyterlab/tooltip-extension')
  ];
  var lab = new JupyterLab({
    name: 'JupyterLab Example',
    namespace: 'lab-example',
    version: require('./package.json').version
  });
  lab.registerPluginModules(mods);
  lab.start();
});
