/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import * as fs from 'fs-extra';
import * as path from 'path';
import * as utils from './utils';

if (require.main === module) {
  // Make sure we have required command line arguments.
  if (process.argv.length !== 3) {
    let msg = '** Must supply a source package name\n';
    process.stderr.write(msg);
    process.exit(1);
  }
  let name = process.argv[2];
  let pkgPath = path.resolve(path.join('.', 'packages', name));
  if (!fs.existsSync(pkgPath)) {
    console.error('Package does not exist: ', name);
    process.exit(1);
  }
  let dest = path.resolve(`./tests/test-${name}`);
  if (fs.existsSync(dest)) {
    console.error('Test package already exists:', dest);
    process.exit(1);
  }
  fs.copySync(path.resolve(path.join(__dirname, '..', 'test-template')), dest);
  let jsonPath = path.join(dest, 'package.json');
  let data = utils.readJSONFile(jsonPath);
  if (name.indexOf('@fk-jupyterlab/') === -1) {
    name = '@fk-jupyterlab/test-' + name;
  }
  data.name = name;
  utils.writePackageData(jsonPath, data);
  fs.ensureDir(path.join(dest, 'src'));
}
