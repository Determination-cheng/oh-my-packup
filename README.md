# oh-my-packup
打包器核心原理



## 目标

**依赖**

index.html -> main.js -> bar.js

**目标**

将所有 js 文件打包成一个文件，并成功运行



## 创建文件依赖图

**依赖**

* @babel/parser —— 生成一个文件的抽象语法树

  https://babeljs.io/docs/en/babel-parser#docsNav
  https://astexplorer.net/

* babel-core

  * transformFromAst —— 将 esm 文件转成 cjs

    ```js
    //* 将 esm 转换成 cjs 的代码
    const {code} = transformFromAst(ast, null, {presets: ['env']})
    ```

    使用该 API 需要同时安装 `babel-preset-env`

* @babel/traverse —— 根据一个文件的抽象语法树提取目标内容
  https://babeljs.io/docs/en/babel-traverse#docsNav

**实现**

```js
let id = 0

//* 获得单个文件的依赖及相关信息
function getDependencies(filePath) {
  //* 文件内容
  const source = fs.readFileSync(filePath, {encoding: 'utf-8'})
  const ast = parser.parse(source, {sourceType: 'module'})

  //* 文件依赖
  const deps = [] // string[] 依赖名称
  traverse.default(ast, {
    ImportDeclaration(path) {
      deps.push(path.node.source.value)
    }
  })

  //* 将 esm 转换成 cjs 的代码
  const {code} = transformFromAst(ast, null, {presets: ['env']})

  return {
    filePath,
    deps,
    code,
    id: id++,
    depMap: {},
  }
}

//* 创建整个项目的依赖图
function createGraph() {
  const root = getDependencies('./example/main.js')
  const graph = [root]

  for (const asset of graph) {
    // deps: string[]  依赖文件对 id 的映射
    asset.deps.forEach((dep) => {
      const filePath = path.resolve('./example', dep)
      const child = getDependencies(filePath)
      asset.depMap[dep] = child.id // { path: id }
      graph.push(child)
    })
  }

  return graph
}
```



## bundle 范式

```js
;(function (modules) {
  //* 1.实现 require()
  function require(id) {
    const [fn, depMap] = modules[id]

    const module = {
      exports: {}
    }

    //* 在模块文件中调用 require() 的时候会先进入当前函数
    //* 然后根据得到的 id 执行本函数
    function localRequire(filePath) {
      const id = depMap[filePath]
      return require(id)
    }

    fn(localRequire, module, module.exports)
    return module.exports
  }

  //* 2.执行入口文件
  require(0)
})({
  // modules
  // { [id: number]: [fn: Function, depMap: { [filePath: string]: number }] }
  '0': [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.main = main;

      var _bar = require("./bar.js");

      console.log('main');

      function main() {
        console.log('main function');
      }

      (0, _bar.bar)();
      main();
    },
    {"./bar.js": 1}
  ],

  '1': [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.bar = bar;
      console.log('bar');

      function bar() {
        console.log('bar function');
      }
    },
    {}
  ],

});

```



## loader

由于 webpack 只认识 js，因此 loader 的使命就是将非 js 文件转换成 js

**loader 配置**

```js
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: jsonLoader,
      }
    ]
  }
}

```

```js
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader], // 多个 loader 串联处理
      }
    ]
  }
}

```

loader 遵循单一职责原则

因此有时需要使用一系列 loader 来处理文件，要使用多个 loader 时，use 需要写成数组

如 less -> css -> style -> js

**jsonLoader**

```js
export default function jsonLoader(source) {
  return `export default ${JSON.stringify(source)}`
}

```

**使用 loader**

```js
//* 文件内容
let source = fs.readFileSync(filePath, {encoding: 'utf-8'})

//* loader
const loaders = webpackConfig.module.rules
loaders.forEach(({test, use}) => {
  if (test.test(filePath)) {
    if (Array.isArray(use)) {
      source = use.reduceRight((preResult, curLoader) => {
        return curLoader(preResult)
      }, source)
      return
    }
    source = use(source)
  }
})

//* 将 source(文件模块内容) 交给 parser 处理为 AST ...

```

