/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { DataConnector } from '@fk-jupyterlab/statedb';

import { InspectionHandler, InspectorPanel } from '@fk-jupyterlab/inspector';

import {
  IRenderMimeRegistry,
  RenderMimeRegistry,
  standardRendererFactories
} from '@fk-jupyterlab/rendermime';

import { ISchemaValidator } from '@fk-jupyterlab/settingregistry';

import {
  nullTranslator,
  ITranslator,
  TranslationBundle
} from '@fk-jupyterlab/translation';

import { ReadonlyJSONObject } from '@lumino/coreutils';

import { RawEditor } from './raweditor';

/**
 * Create a raw editor inspector.
 */
export function createInspector(
  editor: RawEditor,
  rendermime?: IRenderMimeRegistry,
  translator?: ITranslator
): InspectorPanel {
  translator = translator || nullTranslator;
  const trans = translator.load('jupyterlab');
  const connector = new InspectorConnector(editor, translator);
  const inspector = new InspectorPanel({
    initialContent: trans.__('Any errors will be listed here'),
    translator: translator
  });
  const handler = new InspectionHandler({
    connector,
    rendermime:
      rendermime ||
      new RenderMimeRegistry({
        initialFactories: standardRendererFactories,
        translator: translator
      })
  });

  inspector.addClass('jp-SettingsDebug');
  inspector.source = handler;
  handler.editor = editor.source;

  return inspector;
}

/**
 * The data connector used to populate a code inspector.
 *
 * #### Notes
 * This data connector debounces fetch requests to throttle them at no more than
 * one request per 100ms. This means that using the connector to populate
 * multiple client objects can lead to missed fetch responses.
 */
class InspectorConnector extends DataConnector<
  InspectionHandler.IReply,
  void,
  InspectionHandler.IRequest
> {
  constructor(editor: RawEditor, translator?: ITranslator) {
    super();
    this.translator = translator || nullTranslator;
    this._editor = editor;
    this._trans = this.translator.load('jupyterlab');
  }

  /**
   * Fetch inspection requests.
   */
  fetch(
    request: InspectionHandler.IRequest
  ): Promise<InspectionHandler.IReply | undefined> {
    return new Promise<InspectionHandler.IReply | undefined>(resolve => {
      // Debounce requests at a rate of 100ms.
      const current = (this._current = window.setTimeout(() => {
        if (current !== this._current) {
          return resolve(undefined);
        }

        const errors = this._validate(request.text);

        if (!errors) {
          return resolve({
            data: { 'text/markdown': this._trans.__('No errors found') },
            metadata: {}
          });
        }

        resolve({ data: Private.render(errors), metadata: {} });
      }, 100));
    });
  }

  private _validate(raw: string): ISchemaValidator.IError[] | null {
    const editor = this._editor;
    if (!editor.settings) {
      return null;
    }
    const { id, schema, version } = editor.settings;
    const data = { composite: {}, user: {} };
    const validator = editor.registry.validator;

    return validator.validateData({ data, id, raw, schema, version }, false);
  }

  protected translator: ITranslator;
  private _trans: TranslationBundle;
  private _current = 0;
  private _editor: RawEditor;
}

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * Render validation errors as an HTML string.
   */
  export function render(
    errors: ISchemaValidator.IError[]
  ): ReadonlyJSONObject {
    return { 'text/markdown': errors.map(renderError).join('') };
  }

  /**
   * Render an individual validation error as a markdown string.
   */
  function renderError(error: ISchemaValidator.IError): string {
    switch (error.keyword) {
      case 'additionalProperties':
        return `**\`[additional property error]\`**
          \`${error.params?.additionalProperty}\` is not a valid property`;
      case 'syntax':
        return `**\`[syntax error]\`** *${error.message}*`;
      case 'type':
        return `**\`[type error]\`**
          \`${error.dataPath}\` ${error.message}`;
      default:
        return `**\`[error]\`** *${error.message}*`;
    }
  }
}
