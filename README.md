# oh-my-packup
打包器核心原理



## 目标

**依赖**

index.html -> main.js -> bar.js

**目标**

将所有 js 文件打包成一个文件，并成功运行



## 创建文件依赖图

* @babel/parser —— 生成一个文件的抽象语法树

  https://babeljs.io/docs/en/babel-parser#docsNav
  https://astexplorer.net/

* @babel/traverse —— 根据一个文件的抽象语法树提取目标内容
  https://babeljs.io/docs/en/babel-traverse#docsNav

```js
import fs from 'fs'
import path from 'path'
import parser from '@babel/parser'
import traverse from '@babel/traverse'

// 获取每个文件的内容及其依赖
function getDependencies(filePath) {
    //* 文件内容
    const source = fs.readFileSync(filePath, {encoding: 'utf-8'})
    const ast = parser.parse(source, {sourceType: 'module'})

    //* 文件依赖
    const deps = []
    traverse.default(ast, {
        ImportDeclaration(path) {
            deps.push(path.node.source.value)
        }
    })

    return {source, deps}
}

// 生成依赖图
function createGraph() {
		// 入口文件
    const root = getDependencies('./example/main.js')
    const graph = [root]

    for (const {deps} of graph) {
        deps.forEach((dep) => {
            const filePath = path.resolve('./example', dep)
            const child = getDependencies(filePath)
            graph.push(child)
        })
    }

    return graph
}

createGraph()
```

