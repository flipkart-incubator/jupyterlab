// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig, URLExt } from '@fk-jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

import '@fk-jupyterlab/application/style/index.css';
import '@fk-jupyterlab/terminal/style/index.css';
import '@fk-jupyterlab/theme-light-extension/style/index.css';
import '../index.css';

import { DockPanel, Widget } from '@lumino/widgets';

import { TerminalManager } from '@fk-jupyterlab/services';

import { Terminal } from '@fk-jupyterlab/terminal';

async function main(): Promise<void> {
  const dock = new DockPanel();
  dock.id = 'main';

  // Attach the widget to the dom.
  Widget.attach(dock, document.body);

  // Handle resize events.
  window.addEventListener('resize', () => {
    dock.fit();
  });

  const manager = new TerminalManager();
  const s1 = await manager.startNew();
  const term1 = new Terminal(s1, { theme: 'light' });
  term1.title.closable = true;
  dock.addWidget(term1);

  const s2 = await manager.startNew();
  const term2 = new Terminal(s2, { theme: 'dark' });
  term2.title.closable = true;
  dock.addWidget(term2, { mode: 'tab-before' });

  console.debug('Example started!');
}

window.addEventListener('load', main);
