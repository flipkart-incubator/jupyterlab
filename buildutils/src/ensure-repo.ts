/* -----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

/**
 * Ensure the integrity of the packages in the repo.
 *
 * Ensure the core package version dependencies match everywhere.
 * Ensure imported packages match dependencies.
 * Ensure a consistent version of all packages.
 * Manage the metapackage meta package.
 */
import * as path from 'path';
import * as fs from 'fs-extra';
import * as utils from './utils';
import {
  ensurePackage,
  ensureUiComponents,
  IEnsurePackageOptions
} from './ensure-package';

type Dict<T> = { [key: string]: T };

// Data to ignore.
const MISSING: Dict<string[]> = {
  '@fk-jupyterlab/coreutils': ['path'],
  '@fk-jupyterlab/buildutils': ['path', 'webpack'],
  '@fk-jupyterlab/builder': ['path'],
  '@fk-jupyterlab/testutils': ['fs', 'path'],
  '@fk-jupyterlab/vega5-extension': ['vega-embed']
};

const UNUSED: Dict<string[]> = {
  // url is a polyfill for sanitize-html
  '@fk-jupyterlab/apputils': ['@types/react', 'buffer', 'url'],
  '@fk-jupyterlab/application': ['@fortawesome/fontawesome-free'],
  '@fk-jupyterlab/apputils-extension': ['es6-promise'],
  '@fk-jupyterlab/builder': [
    '@lumino/algorithm',
    '@lumino/application',
    '@lumino/commands',
    '@lumino/coreutils',
    '@lumino/disposable',
    '@lumino/domutils',
    '@lumino/dragdrop',
    '@lumino/messaging',
    '@lumino/properties',
    '@lumino/signaling',
    '@lumino/virtualdom',
    '@lumino/widgets',

    // The libraries needed for building other extensions.
    '@babel/core',
    '@babel/preset-env',
    'babel-loader',
    'css-loader',
    'file-loader',
    'path-browserify',
    'process',
    'raw-loader',
    'style-loader',
    'svg-url-loader',
    'terser-webpack-plugin',
    'to-string-loader',
    'url-loader',
    'webpack-cli',
    'worker-loader'
  ],
  '@fk-jupyterlab/coreutils': ['path-browserify'],
  '@fk-jupyterlab/services': ['node-fetch', 'ws'],
  '@fk-jupyterlab/rendermime': ['@fk-jupyterlab/mathjax2'],
  '@fk-jupyterlab/testutils': [
    'node-fetch',
    'identity-obj-proxy',
    'jest-raw-loader',
    'markdown-loader-jest',
    'jest-junit',
    'jest-summary-reporter'
  ],
  '@fk-jupyterlab/test-csvviewer': ['csv-spectrum'],
  '@fk-jupyterlab/vega5-extension': ['vega', 'vega-lite'],
  '@fk-jupyterlab/ui-components': ['@blueprintjs/icons']
};

// Packages that are allowed to have differing versions
const DIFFERENT_VERSIONS: Array<string> = ['vega-lite', 'vega', 'vega-embed'];

const SKIP_CSS: Dict<string[]> = {
  '@fk-jupyterlab/application': ['@fk-jupyterlab/rendermime'],
  '@fk-jupyterlab/application-extension': ['@fk-jupyterlab/apputils'],
  '@fk-jupyterlab/builder': [
    '@lumino/algorithm',
    '@lumino/application',
    '@lumino/commands',
    '@lumino/coreutils',
    '@lumino/disposable',
    '@lumino/domutils',
    '@lumino/dragdrop',
    '@lumino/messaging',
    '@lumino/properties',
    '@lumino/signaling',
    '@lumino/virtualdom',
    '@lumino/widgets'
  ],
  '@fk-jupyterlab/codemirror-extension': ['codemirror'],
  '@fk-jupyterlab/completer': ['@fk-jupyterlab/codeeditor'],
  '@fk-jupyterlab/debugger': ['codemirror'],
  '@fk-jupyterlab/docmanager': ['@fk-jupyterlab/statusbar'], // Statusbar styles should not be used by status reporters
  '@fk-jupyterlab/docregistry': [
    '@fk-jupyterlab/codeeditor', // Only used for model
    '@fk-jupyterlab/codemirror', // Only used for Mode.findByFileName
    '@fk-jupyterlab/rendermime' // Only used for model
  ],
  '@fk-jupyterlab/documentsearch': [
    '@fk-jupyterlab/cells',
    '@fk-jupyterlab/codeeditor',
    '@fk-jupyterlab/codemirror',
    '@fk-jupyterlab/fileeditor',
    '@fk-jupyterlab/notebook',
    'codemirror'
  ],
  '@fk-jupyterlab/filebrowser': ['@fk-jupyterlab/statusbar'],
  '@fk-jupyterlab/fileeditor': ['@fk-jupyterlab/statusbar'],
  '@fk-jupyterlab/help-extension': ['@fk-jupyterlab/application'],
  '@fk-jupyterlab/metapackage': [
    '@fk-jupyterlab/ui-components',
    '@fk-jupyterlab/apputils',
    '@fk-jupyterlab/codeeditor',
    '@fk-jupyterlab/statusbar',
    '@fk-jupyterlab/codemirror',
    '@fk-jupyterlab/rendermime-interfaces',
    '@fk-jupyterlab/rendermime',
    '@fk-jupyterlab/docregistry',
    '@fk-jupyterlab/application',
    '@fk-jupyterlab/property-inspector',
    '@fk-jupyterlab/application-extension',
    '@fk-jupyterlab/docmanager',
    '@fk-jupyterlab/filebrowser',
    '@fk-jupyterlab/mainmenu',
    '@fk-jupyterlab/apputils-extension',
    '@fk-jupyterlab/attachments',
    '@fk-jupyterlab/outputarea',
    '@fk-jupyterlab/cells',
    '@fk-jupyterlab/notebook',
    '@fk-jupyterlab/celltags',
    '@fk-jupyterlab/celltags-extension',
    '@fk-jupyterlab/fileeditor',
    '@fk-jupyterlab/codemirror-extension',
    '@fk-jupyterlab/completer',
    '@fk-jupyterlab/console',
    '@fk-jupyterlab/completer-extension',
    '@fk-jupyterlab/launcher',
    '@fk-jupyterlab/console-extension',
    '@fk-jupyterlab/csvviewer',
    '@fk-jupyterlab/documentsearch',
    '@fk-jupyterlab/csvviewer-extension',
    '@fk-jupyterlab/debugger',
    '@fk-jupyterlab/debugger-extension',
    '@fk-jupyterlab/docmanager-extension',
    '@fk-jupyterlab/documentsearch-extension',
    '@fk-jupyterlab/extensionmanager',
    '@fk-jupyterlab/extensionmanager-extension',
    '@fk-jupyterlab/filebrowser-extension',
    '@fk-jupyterlab/fileeditor-extension',
    '@fk-jupyterlab/inspector',
    '@fk-jupyterlab/help-extension',
    '@fk-jupyterlab/htmlviewer',
    '@fk-jupyterlab/htmlviewer-extension',
    '@fk-jupyterlab/hub-extension',
    '@fk-jupyterlab/imageviewer',
    '@fk-jupyterlab/imageviewer-extension',
    '@fk-jupyterlab/inspector-extension',
    '@fk-jupyterlab/javascript-extension',
    '@fk-jupyterlab/json-extension',
    '@fk-jupyterlab/launcher-extension',
    '@fk-jupyterlab/logconsole',
    '@fk-jupyterlab/logconsole-extension',
    '@fk-jupyterlab/mainmenu-extension',
    '@fk-jupyterlab/markdownviewer',
    '@fk-jupyterlab/markdownviewer-extension',
    '@fk-jupyterlab/mathjax2',
    '@fk-jupyterlab/mathjax2-extension',
    '@fk-jupyterlab/nbconvert-css',
    '@fk-jupyterlab/notebook-extension',
    '@fk-jupyterlab/pdf-extension',
    '@fk-jupyterlab/rendermime-extension',
    '@fk-jupyterlab/running',
    '@fk-jupyterlab/running-extension',
    '@fk-jupyterlab/settingeditor',
    '@fk-jupyterlab/settingeditor-extension',
    '@fk-jupyterlab/statusbar-extension',
    '@fk-jupyterlab/terminal',
    '@fk-jupyterlab/terminal-extension',
    '@fk-jupyterlab/theme-dark-extension',
    '@fk-jupyterlab/theme-light-extension',
    '@fk-jupyterlab/toc',
    '@fk-jupyterlab/toc-extension',
    '@fk-jupyterlab/tooltip',
    '@fk-jupyterlab/tooltip-extension',
    '@fk-jupyterlab/translation-extension',
    '@fk-jupyterlab/ui-components-extension',
    '@fk-jupyterlab/vdom',
    '@fk-jupyterlab/vdom-extension',
    '@fk-jupyterlab/vega5-extension'
  ],
  '@fk-jupyterlab/rendermime-interfaces': ['@lumino/widgets'],
  '@fk-jupyterlab/shortcuts-extension': ['@fk-jupyterlab/application'],
  '@fk-jupyterlab/testutils': [
    '@fk-jupyterlab/apputils',
    '@fk-jupyterlab/codeeditor',
    '@fk-jupyterlab/codemirror',
    '@fk-jupyterlab/rendermime',
    '@fk-jupyterlab/docregistry',
    '@fk-jupyterlab/cells',
    '@fk-jupyterlab/notebook'
  ],
  '@fk-jupyterlab/ui-extension': ['@blueprintjs/icons']
};

const pkgData: Dict<any> = {};
const pkgPaths: Dict<string> = {};
const pkgNames: Dict<string> = {};
const depCache: Dict<string> = {};
const locals: Dict<string> = {};

/**
 * Ensure the metapackage package.
 *
 * @returns An array of messages for changes.
 */
function ensureMetaPackage(): string[] {
  const basePath = path.resolve('.');
  const mpPath = path.join(basePath, 'packages', 'metapackage');
  const mpJson = path.join(mpPath, 'package.json');
  const mpData = utils.readJSONFile(mpJson);
  const messages: string[] = [];
  const seen: Dict<boolean> = {};

  utils.getCorePaths().forEach(pkgPath => {
    if (path.resolve(pkgPath) === path.resolve(mpPath)) {
      return;
    }
    const name = pkgNames[pkgPath];
    if (!name) {
      return;
    }
    seen[name] = true;
    const data = pkgData[name];
    let valid = true;

    // Ensure it is a dependency.
    if (!mpData.dependencies[name]) {
      valid = false;
      mpData.dependencies[name] = data.version;
    }

    if (!valid) {
      messages.push(`Updated: ${name}`);
    }
  });

  // Make sure there are no extra deps.
  Object.keys(mpData.dependencies).forEach(name => {
    if (!(name in seen)) {
      messages.push(`Removing dependency: ${name}`);
      delete mpData.dependencies[name];
    }
  });

  // Write the files.
  if (messages.length > 0) {
    utils.writePackageData(mpJson, mpData);
  }

  // Update the global data.
  pkgData[mpData.name] = mpData;

  return messages;
}

/**
 * Ensure the jupyterlab application package.
 */
function ensureJupyterlab(): string[] {
  const basePath = path.resolve('.');
  const corePath = path.join(basePath, 'dev_mode', 'package.json');
  const corePackage = utils.readJSONFile(corePath);

  corePackage.jupyterlab.extensions = {};
  corePackage.jupyterlab.mimeExtensions = {};
  corePackage.jupyterlab.linkedPackages = {};
  // start with known external dependencies
  corePackage.dependencies = Object.assign(
    {},
    corePackage.jupyterlab.externalExtensions
  );
  corePackage.resolutions = {};

  const singletonPackages: string[] = corePackage.jupyterlab.singletonPackages;
  const coreData = new Map<string, any>();

  utils.getCorePaths().forEach(pkgPath => {
    const dataPath = path.join(pkgPath, 'package.json');
    let data: any;
    try {
      data = utils.readJSONFile(dataPath);
    } catch (e) {
      return;
    }

    coreData.set(data.name, data);

    // If the package has a tokens.ts file, make sure it is noted as a singleton
    if (
      fs.existsSync(path.join(pkgPath, 'src', 'tokens.ts')) &&
      !singletonPackages.includes(data.name)
    ) {
      singletonPackages.push(data.name);
    }
  });

  // These are not sorted when writing out by default
  singletonPackages.sort();

  // Populate the yarn resolutions. First we make sure direct packages have
  // resolutions.
  coreData.forEach((data, name) => {
    // Insist on a restricted version in the yarn resolution.
    corePackage.resolutions[name] = `${data.version}`;
  });

  // Then fill in any missing packages that should be singletons from the direct
  // package dependencies.
  coreData.forEach(data => {
    if (data.dependencies) {
      Object.entries(data.dependencies).forEach(([dep, version]) => {
        if (
          singletonPackages.includes(dep) &&
          !(dep in corePackage.resolutions)
        ) {
          corePackage.resolutions[dep] = version;
        }
      });
    }
  });

  // At this point, each singleton should have a resolution. Check this.
  const unresolvedSingletons = singletonPackages.filter(
    pkg => !(pkg in corePackage.resolutions)
  );
  if (unresolvedSingletons.length > 0) {
    throw new Error(
      `Singleton packages must have a resolved version number; these do not: ${unresolvedSingletons.join(
        ', '
      )}`
    );
  }

  coreData.forEach((data, name) => {
    // Determine if the package wishes to be included in the top-level
    // dependencies.
    const meta = data.jupyterlab;
    const keep = !!(
      meta &&
      (meta.coreDependency || meta.extension || meta.mimeExtension)
    );
    if (!keep) {
      return;
    }

    // Make sure it is included as a dependency.
    corePackage.dependencies[data.name] = `${data.version}`;

    // Handle extensions.
    ['extension', 'mimeExtension'].forEach(item => {
      let ext = meta[item];
      if (ext === true) {
        ext = '';
      }
      if (typeof ext !== 'string') {
        return;
      }
      corePackage.jupyterlab[`${item}s`][name] = ext;
    });
  });

  utils.getLernaPaths().forEach(pkgPath => {
    const dataPath = path.join(pkgPath, 'package.json');
    let data: any;
    try {
      data = utils.readJSONFile(dataPath);
    } catch (e) {
      return;
    }
    // Skip private packages.
    if (data.private === true) {
      return;
    }

    // watch all src, build, and test files in the Jupyterlab project
    const relativePath = utils.ensureUnixPathSep(
      path.join('..', path.relative(basePath, pkgPath))
    );
    corePackage.jupyterlab.linkedPackages[data.name] = relativePath;
  });

  // Write the package.json back to disk.
  if (utils.writePackageData(corePath, corePackage)) {
    return ['Updated dev mode'];
  }
  return [];
}

/**
 * Ensure buildutils and builder bin files are symlinked
 */
function ensureBuildUtils() {
  const basePath = path.resolve('.');
  ['builder', 'buildutils'].forEach(packageName => {
    const utilsPackage = path.join(basePath, packageName, 'package.json');
    const utilsData = utils.readJSONFile(utilsPackage);
    for (const name in utilsData.bin) {
      const src = path.join(basePath, packageName, utilsData.bin[name]);
      const dest = path.join(basePath, 'node_modules', '.bin', name);
      try {
        fs.lstatSync(dest);
        fs.removeSync(dest);
      } catch (e) {
        // no-op
      }
      fs.symlinkSync(src, dest, 'file');
      fs.chmodSync(dest, 0o777);
    }
  });
}

/**
 * Ensure the repo integrity.
 */
export async function ensureIntegrity(): Promise<boolean> {
  const messages: Dict<string[]> = {};

  // Pick up all the package versions.
  const paths = utils.getLernaPaths();

  // These two are not part of the workspaces but should be kept
  // in sync.
  paths.push('./jupyterlab/tests/mock_packages/extension');
  paths.push('./jupyterlab/tests/mock_packages/mimeextension');

  const cssImports: Dict<string[]> = {};
  const cssModuleImports: Dict<string[]> = {};

  // Get the package graph.
  const graph = utils.getPackageGraph();

  // Gather all of our package data and other metadata.
  paths.forEach(pkgPath => {
    // Read in the package.json.
    let data: any;
    try {
      data = utils.readJSONFile(path.join(pkgPath, 'package.json'));
    } catch (e) {
      console.error(e);
      return;
    }

    pkgData[data.name] = data;
    pkgPaths[data.name] = pkgPath;
    pkgNames[pkgPath] = data.name;
    locals[data.name] = pkgPath;
  });

  // Build up an ordered list of CSS imports for each local package.
  Object.keys(locals).forEach(name => {
    const data = pkgData[name];
    const deps: Dict<string> = data.dependencies || {};
    const skip = SKIP_CSS[name] || [];
    // Initialize cssData with explicit css imports if available
    const cssData: Dict<string[]> = {
      ...(data.jupyterlab && data.jupyterlab.extraStyles)
    };
    const cssModuleData: Dict<string[]> = {
      ...(data.jupyterlab && data.jupyterlab.extraStyles)
    };

    // Add automatic dependency css if package is not a theme package
    if (!(data.jupyterlab && data.jupyterlab.themePath)) {
      Object.keys(deps).forEach(depName => {
        // Bail for skipped imports and known extra styles.
        if (skip.includes(depName) || depName in cssData) {
          return;
        }

        const depData = graph.getNodeData(depName) as any;
        if (typeof depData.style === 'string') {
          cssData[depName] = [depData.style];
        }
        if (typeof depData.styleModule === 'string') {
          cssModuleData[depName] = [depData.styleModule];
        } else if (typeof depData.style === 'string') {
          cssModuleData[depName] = [depData.style];
        }
      });
    }

    // Get our CSS imports in dependency order.
    cssImports[name] = [];
    cssModuleImports[name] = [];

    graph.dependenciesOf(name).forEach(depName => {
      if (depName in cssData) {
        cssData[depName].forEach(cssPath => {
          cssImports[name].push(`${depName}/${cssPath}`);
        });
      }
      if (depName in cssModuleData) {
        cssModuleData[depName].forEach(cssModulePath => {
          cssModuleImports[name].push(`${depName}/${cssModulePath}`);
        });
      }
    });
  });

  // Update the metapackage.
  let pkgMessages = ensureMetaPackage();
  if (pkgMessages.length > 0) {
    const pkgName = '@fk-jupyterlab/metapackage';
    if (!messages[pkgName]) {
      messages[pkgName] = [];
    }
    messages[pkgName] = messages[pkgName].concat(pkgMessages);
  }

  // Validate each package.
  for (const name in locals) {
    // application-top is handled elsewhere
    if (name === '@fk-jupyterlab/application-top') {
      continue;
    }
    const unused = UNUSED[name] || [];
    // Allow jest-junit to be unused in the test suite.
    if (name.indexOf('@fk-jupyterlab/test-') === 0) {
      unused.push('jest-junit');
    }

    const options: IEnsurePackageOptions = {
      pkgPath: pkgPaths[name],
      data: pkgData[name],
      depCache,
      missing: MISSING[name],
      unused,
      locals,
      cssImports: cssImports[name],
      cssModuleImports: cssModuleImports[name],
      differentVersions: DIFFERENT_VERSIONS
    };

    if (name === '@fk-jupyterlab/metapackage') {
      options.noUnused = false;
    }

    const pkgMessages = await ensurePackage(options);
    if (pkgMessages.length > 0) {
      messages[name] = pkgMessages;
    }
  }

  // ensure the icon svg imports
  pkgMessages = await ensureUiComponents(
    pkgPaths['@fk-jupyterlab/ui-components']
  );
  if (pkgMessages.length > 0) {
    const pkgName = '@fk-jupyterlab/ui-components';
    if (!messages[pkgName]) {
      messages[pkgName] = [];
    }
    messages[pkgName] = messages[pkgName].concat(pkgMessages);
  }

  // Handle the top level package.
  const corePath = path.resolve('.', 'package.json');
  const coreData: any = utils.readJSONFile(corePath);
  if (utils.writePackageData(corePath, coreData)) {
    messages['top'] = ['Update package.json'];
  }

  // Handle the refs in the top level tsconfigdoc.json
  const tsConfigDocExclude = [
    'application-extension',
    'metapackage',
    'nbconvert-css'
  ];
  const tsConfigdocPath = path.resolve('.', 'tsconfigdoc.json');
  const tsConfigdocData = utils.readJSONFile(tsConfigdocPath);
  tsConfigdocData.references = utils
    .getCorePaths()
    .filter(pth => !tsConfigDocExclude.some(pkg => pth.includes(pkg)))
    .map(pth => {
      return { path: './' + path.relative('.', pth) };
    });
  utils.writeJSONFile(tsConfigdocPath, tsConfigdocData);

  // Handle buildutils
  ensureBuildUtils();

  // Handle the JupyterLab application top package.
  pkgMessages = ensureJupyterlab();
  if (pkgMessages.length > 0) {
    messages['@application/top'] = pkgMessages;
  }

  // Handle any messages.
  if (Object.keys(messages).length > 0) {
    console.debug(JSON.stringify(messages, null, 2));
    if (process.argv.indexOf('--force') !== -1) {
      console.debug(
        '\n\nPlease run `jlpm run integrity` locally and commit the changes'
      );
      process.exit(1);
    }
    utils.run('jlpm install');
    console.debug('\n\nMade integrity changes!');
    console.debug('Please commit the changes by running:');
    console.debug('git commit -a -m "Package integrity updates"');
    return false;
  }

  console.debug('Repo integrity verified!');
  return true;
}

if (require.main === module) {
  void ensureIntegrity();
}
