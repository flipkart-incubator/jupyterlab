// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { ArrayExt } from '@phosphor/algorithm';

import { CommandRegistry } from '@phosphor/commands';

import { JupyterLabMenu } from '@fk-jupyterlab/mainmenu';

describe('@fk-jupyterlab/mainmenu', () => {
  describe('JupyterLabMenu', () => {
    let commands: CommandRegistry;
    let menu: JupyterLabMenu;

    before(() => {
      commands = new CommandRegistry();
      commands.addCommand('run1', {
        label: 'Run 1',
        execute: () => void 0
      });
      commands.addCommand('run2', {
        label: 'Run 2',
        execute: () => void 0
      });
      commands.addCommand('run3', {
        label: 'Run 3',
        execute: () => void 0
      });
      commands.addCommand('run4', {
        label: 'Run 4',
        execute: () => void 0
      });
    });

    beforeEach(() => {
      menu = new JupyterLabMenu({ commands });
    });

    afterEach(() => {
      menu.dispose();
    });

    describe('#constructor()', () => {
      it('should construct a new main menu', () => {
        expect(menu).to.be.an.instanceof(JupyterLabMenu);
      });

      it('should accept useSeparators as an option', () => {
        const menu1 = new JupyterLabMenu({ commands }, false);
        const menu2 = new JupyterLabMenu({ commands }, true);
        menu1.addGroup([{ command: 'run1' }, { command: 'run2' }]);
        menu2.addGroup([{ command: 'run1' }, { command: 'run2' }]);

        expect(menu1.menu.items.length).to.equal(2);
        expect(menu2.menu.items.length).to.equal(4);
      });
    });

    describe('#addGroup()', () => {
      it('should add a new group to the menu', () => {
        menu.addGroup([{ command: 'run1' }, { command: 'run2' }]);

        const idx1 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run1'
        );
        const idx2 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run2'
        );

        expect(idx1 === -1).to.equal(false);
        expect(idx2 === -1).to.equal(false);
        expect(idx1 > idx2).to.equal(false);
      });

      it('should take a rank as an option', () => {
        menu.addGroup([{ command: 'run1' }, { command: 'run2' }], 2);
        menu.addGroup([{ command: 'run3' }, { command: 'run4' }], 1);

        const idx1 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run1'
        );
        const idx2 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run2'
        );
        const idx3 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run3'
        );
        const idx4 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run4'
        );
        expect(idx3 < idx4).to.equal(true);
        expect(idx4 < idx1).to.equal(true);
        expect(idx1 < idx2).to.equal(true);
      });

      it('should return a disposable that can be used to remove the group', () => {
        const group1 = [{ command: 'run1' }, { command: 'run2' }];
        const group2 = [{ command: 'run3' }, { command: 'run4' }];
        const disposable = menu.addGroup(group1);
        menu.addGroup(group2);
        disposable.dispose();

        const idx1 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run1'
        );
        const idx2 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run2'
        );
        const idx3 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run3'
        );
        const idx4 = ArrayExt.findFirstIndex(
          menu.menu.items,
          m => m.command === 'run4'
        );

        expect(idx1).to.equal(-1);
        expect(idx2).to.equal(-1);
        expect(idx3 === -1).to.equal(false);
        expect(idx4 === -1).to.equal(false);
      });
    });
  });
});
