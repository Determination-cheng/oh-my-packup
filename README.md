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

