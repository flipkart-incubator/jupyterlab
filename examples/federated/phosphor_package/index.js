// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { Widget } from '@phosphor/widgets';
import { MainAreaWidget } from '@fk-jupyterlab/apputils';

const plugins = [
  {
    id: '@fk-jupyterlab/example-federated-phosphor',
    autoStart: true,
    activate: function (app) {
      const mywidget = new Widget();
      mywidget.node.textContent = 'Phosphor extension';
      mywidget.id = '@fk-jupyterlab/example-federated-phosphor';
      mywidget.title.label = 'Phosphor extension';
      const appwidget = new MainAreaWidget({ content: mywidget });
      app.restored.then(() => {
        app.shell.add(appwidget);
      });
    }
  }
];

export default plugins;
