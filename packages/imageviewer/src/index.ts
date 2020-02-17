// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { IInstanceTracker } from '@fk-jupyterlab/apputils';

import { IDocumentWidget } from '@fk-jupyterlab/docregistry';

import { Token } from '@phosphor/coreutils';

import { ImageViewer } from './widget';

import '../style/index.css';

export * from './widget';

/**
 * A class that tracks editor widgets.
 */
export interface IImageTracker
  extends IInstanceTracker<IDocumentWidget<ImageViewer>> {}

/* tslint:disable */
/**
 * The editor tracker token.
 */
export const IImageTracker = new Token<IImageTracker>(
  '@fk-jupyterlab/imageviewer:IImageTracker'
);
/* tslint:enable */
