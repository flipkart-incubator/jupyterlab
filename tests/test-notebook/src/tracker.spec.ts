// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Cell } from '@fk-jupyterlab/cells';

import { Context } from '@fk-jupyterlab/docregistry';

import {
  INotebookModel,
  NotebookPanel,
  NotebookTracker
} from '@fk-jupyterlab/notebook';

import { createNotebookContext, NBTestUtils } from '@fk-jupyterlab/testutils';

const namespace = 'notebook-tracker-test';

class TestTracker extends NotebookTracker {
  methods: string[] = [];

  protected onCurrentChanged(widget: NotebookPanel): void {
    super.onCurrentChanged(widget);
    this.methods.push('onCurrentChanged');
  }
}

describe('@fk-jupyterlab/notebook', () => {
  describe('NotebookTracker', () => {
    let context: Context<INotebookModel>;

    beforeEach(async () => {
      context = await createNotebookContext();
    });

    afterEach(async () => {
      await context.session.shutdown();
      context.dispose();
    });

    describe('#constructor()', () => {
      it('should create a NotebookTracker', () => {
        const tracker = new NotebookTracker({ namespace });
        expect(tracker).to.be.an.instanceof(NotebookTracker);
      });
    });

    describe('#activeCell', () => {
      it('should be `null` if there is no tracked notebook panel', () => {
        const tracker = new NotebookTracker({ namespace });
        expect(tracker.activeCell).to.be.null;
      });

      it('should be `null` if a tracked notebook has no active cell', () => {
        const tracker = new NotebookTracker({ namespace });
        const panel = NBTestUtils.createNotebookPanel(context);
        panel.content.model.cells.clear();
        tracker.add(panel);
        expect(tracker.activeCell).to.be.null;
      });

      it('should be the active cell if a tracked notebook has one', () => {
        const tracker = new NotebookTracker({ namespace });
        const panel = NBTestUtils.createNotebookPanel(context);
        tracker.add(panel);
        panel.content.model.fromJSON(NBTestUtils.DEFAULT_CONTENT);
        expect(tracker.activeCell).to.be.an.instanceof(Cell);
        panel.dispose();
      });
    });

    describe('#activeCellChanged', () => {
      it('should emit a signal when the active cell changes', () => {
        const tracker = new NotebookTracker({ namespace });
        const panel = NBTestUtils.createNotebookPanel(context);
        let count = 0;
        tracker.activeCellChanged.connect(() => {
          count++;
        });
        panel.content.model.fromJSON(NBTestUtils.DEFAULT_CONTENT);
        tracker.add(panel);
        expect(count).to.equal(1);
        panel.content.activeCellIndex = 1;
        expect(count).to.equal(2);
        panel.dispose();
      });
    });

    describe('#onCurrentChanged()', () => {
      it('should be called when the active cell changes', () => {
        const tracker = new TestTracker({ namespace });
        const panel = NBTestUtils.createNotebookPanel(context);
        tracker.add(panel);
        expect(tracker.methods).to.contain('onCurrentChanged');
      });
    });
  });
});
