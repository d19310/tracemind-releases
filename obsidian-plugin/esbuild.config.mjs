import esbuild from 'esbuild';

const production = process.argv[2] === 'production';

const config = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  target: 'es2022',
  outfile: 'main.js',
  format: 'cjs',
  platform: 'node',
  minify: production,
  sourcemap: production ? false : 'inline',
};

if (production) {
  esbuild.build(config).catch(() => process.exit(1));
} else {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  }).catch(() => process.exit(1));
}
