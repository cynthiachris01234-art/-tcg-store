// Ensures process.cwd() is the project root so Tailwind resolves content paths correctly.
process.chdir(__dirname);
process.argv.splice(2, 0, 'dev');
require('./node_modules/next/dist/bin/next');
