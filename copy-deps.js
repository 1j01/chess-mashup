const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;

function packageRoot(packageName) {
	const resolvedEntry = require.resolve(packageName);
	let currentDir = path.dirname(resolvedEntry);

	while (currentDir !== path.dirname(currentDir)) {
		const packageJsonPath = path.join(currentDir, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}

	throw new Error(`Could not find package root for ${packageName}`);
}

const roots = {
	three: packageRoot('three'),
	esModuleShims: packageRoot('es-module-shims'),
	seedrandom: packageRoot('seedrandom'),
};

const copyMap = [
	{ from: path.join(roots.three, 'build', 'three.js'), to: path.join('lib', 'three.js') },
	{ from: path.join(roots.three, 'build', 'three.min.js'), to: path.join('lib', 'three.min.js') },
	{ from: path.join(roots.three, 'build', 'three.module.js'), to: path.join('lib', 'three.module.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'loaders', 'STLLoader.js'), to: path.join('lib', 'STLLoader.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'libs', 'stats.module.js'), to: path.join('lib', 'stats.module.js') },
	{
		from: path.join(roots.three, 'examples', 'jsm', 'utils', 'BufferGeometryUtils.js'),
		to: path.join('lib', 'BufferGeometryUtils.js'),
		transform: (source) => `${source}\n\n// Back-compat wrapper for existing app imports.\nexport function getBufferGeometryUtils() {\n\tconst merge = typeof mergeBufferGeometries !== 'undefined' ? mergeBufferGeometries : mergeGeometries;\n\treturn {\n\t\tmergeBufferGeometries: merge,\n\t\tmergeGeometries: merge,\n\t\tmergeVertices,\n\t};\n}\n`,
	},
	{ from: path.join(roots.three, 'examples', 'jsm', 'postprocessing', 'Pass.js'), to: path.join('lib', 'postprocessing', 'Pass.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'postprocessing', 'SSAOPass.js'), to: path.join('lib', 'postprocessing', 'SSAOPass.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'math', 'SimplexNoise.js'), to: path.join('lib', 'math', 'SimplexNoise.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'shaders', 'CopyShader.js'), to: path.join('lib', 'shaders', 'CopyShader.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'shaders', 'SSAOShader.js'), to: path.join('lib', 'shaders', 'SSAOShader.js') },
	{ from: path.join(roots.three, 'examples', 'jsm', 'renderers', 'Projector.js'), to: path.join('lib', 'renderers', 'Projector.js') },
	{ from: path.join(roots.seedrandom, 'seedrandom.min.js'), to: path.join('lib', 'seedrandom.min.js') },
	{ from: path.join(roots.esModuleShims, 'dist', 'es-module-shims.js'), to: path.join('lib', 'es-module-shims.js') },
];

let copiedCount = 0;

for (const entry of copyMap) {
	const destination = path.join(rootDir, entry.to);
	fs.mkdirSync(path.dirname(destination), { recursive: true });

	if (!fs.existsSync(entry.from)) {
		throw new Error(`Missing source file: ${entry.from}`);
	}

	const sourceText = fs.readFileSync(entry.from, 'utf8');
	const outputText = entry.transform ? entry.transform(sourceText) : sourceText;
	fs.writeFileSync(destination, outputText, 'utf8');
	copiedCount += 1;
	console.log(`Copied ${entry.from} -> ${entry.to}`);
}

console.log(`Done. Copied ${copiedCount} files.`);
