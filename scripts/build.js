const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;
const name = packageJson.name.replace('@craigmiller160/', '');

const cwd = process.cwd();
const buildDirPath = path.resolve(cwd, 'build');
const outputFilePath = path.resolve(cwd, `build/${name}-${version}.zip`);

const deleteBuildDir = () => {
    if (fs.existsSync(buildDirPath)) {
        fs.readdirSync(buildDirPath)
            .forEach((file) => {
                const fullPath = path.resolve(buildDirPath, file);
                fs.unlinkSync(fullPath);
            });
        fs.rmdirSync(buildDirPath);
    }
};

const createBuildDir = () => {
    if (!fs.existsSync(buildDirPath)) {
        fs.mkdirSync(buildDirPath);
    }
};

const createArchive = () => {
    const output = fs.createWriteStream(path.resolve(cwd, `build/${name}-${version}.zip`));
    const archive = archiver('zip');

    archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
            console.log(err);
        } else {
            throw err;
        }
    });
    archive.on('error', (err) => {
        throw err;
    });
    archive.pipe(output);

    archive.directory(path.resolve(cwd, 'src'), 'src');
    archive.file(path.resolve(cwd, 'package.json'), { name: 'package.json' });

    archive.finalize();
};

deleteBuildDir();
createBuildDir();
createArchive();