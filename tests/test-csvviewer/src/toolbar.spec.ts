// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Widget } from '@phosphor/widgets';

import { simulate } from 'simulate-event';

import { CSVDelimiter } from '@fk-jupyterlab/csvviewer';

const DELIMITERS = [',', ';', '\t'];

describe('csvviewer/toolbar', () => {
  describe('CSVDelimiter', () => {
    describe('#constructor()', () => {
      it('should instantiate a `CSVDelimiter` toolbar widget', () => {
        const widget = new CSVDelimiter({ selected: ',' });
        expect(widget).to.be.an.instanceof(CSVDelimiter);
        expect(Array.from(widget.node.classList)).to.contain('jp-CSVDelimiter');
        widget.dispose();
      });

      it('should allow pre-selecting the delimiter', () => {
        const wanted = DELIMITERS[DELIMITERS.length - 1];
        const widget = new CSVDelimiter({ selected: wanted });
        expect(widget.selectNode.value).to.equal(wanted);
        widget.dispose();
      });
    });

    describe('#delimiterChanged', () => {
      it('should emit a value when the dropdown value changes', () => {
        const widget = new CSVDelimiter({ selected: ',' });
        let delimiter = '';
        const index = DELIMITERS.length - 1;
        const wanted = DELIMITERS[index];
        widget.delimiterChanged.connect((s, value) => {
          delimiter = value;
        });
        Widget.attach(widget, document.body);
        widget.selectNode.selectedIndex = index;
        simulate(widget.selectNode, 'change');
        expect(delimiter).to.equal(wanted);
        widget.dispose();
      });
    });

    describe('#selectNode', () => {
      it('should return the delimiter dropdown select tag', () => {
        const widget = new CSVDelimiter({ selected: ',' });
        expect(widget.selectNode.tagName.toLowerCase()).to.equal('select');
        widget.dispose();
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources held by the widget', () => {
        const widget = new CSVDelimiter({ selected: ',' });
        expect(widget.isDisposed).to.equal(false);
        widget.dispose();
        expect(widget.isDisposed).to.equal(true);
      });

      it('should be safe to call multiple times', () => {
        const widget = new CSVDelimiter({ selected: ',' });
        expect(widget.isDisposed).to.equal(false);
        widget.dispose();
        widget.dispose();
        expect(widget.isDisposed).to.equal(true);
      });
    });
  });
});
