import esbuild from 'esbuild';

const production = process.argv[2] === 'production';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  target: 'es2022',
  outfile: 'main.js',
  format: 'cjs',
  platform: 'browser',
  minify: production,
  sourcemap: production ? false : 'inline',
  watch: production ? false : {
    onRebuild(error) {
      if (error) console.error('Build failed:', error);
      else console.log('Build succeeded');
    }
  }
}).then(result => {
  if (!production) console.log('Watching for changes...');
}).catch(() => process.exit(1));
