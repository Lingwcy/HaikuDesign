import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',

  dts: true,  //生成类型声明文件（.d.ts），让 TS/IDE 能正确提示与类型检查。
  sourcemap: true,  //生成 sourcemap，方便调试时映射回源码
  clean: !options.watch, //非 watch 模式先清空 dist；watch 时不清空，避免每次重编译都抖动/变慢。
  treeshake: true, //开启 tree-shaking，尽量移除未被使用的导出代码（依赖于 ESM 语义、external 等）。
  splitting: false,  //关闭代码分割，尽量产出单文件（每种 format 一个文件）；更利于简单的 exports 映射和分发。

  platform: 'neutral', //不强制按 node/browser 注入特定 polyfill/内置处理；更适合“组件库”这种由使用方决定运行环境的包。
  target: 'es2018',  //输出 JS 的语法目标（降级到 ES2018）；越低兼容性越好，但产物可能更大/特性更少。

  external: ['react', 'react-dom', 'react/jsx-runtime'], //：这些包不打进产物里，运行时由使用方提供；与 peerDependencies 配合，避免把 React 打包成多份。

  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }; //自定义输出文件后缀；把 CJS 的输出后缀改成 .cjs（避免在 "type":"module" 包里 .js 被当成 ESM），ESM 保持 .js。
  },
}));
