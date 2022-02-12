import fs from 'fs'
import path from 'path'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import {transformFromAst} from 'babel-core'
import ejs from 'ejs'

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

//* 整个项目的依赖图
const graph = createGraph()

//* 构建 bundle
function build(graph) {
    //* ejs 模板
    const template = fs.readFileSync('./bundle.ejs', {encoding: 'utf-8'})

    //* 提供给 ejs 模板的信息
    const data = graph.map(({depMap, code, id}) => {
        return {
            id,
            code,
            depMap,
        }
    })

    //* 生成的 bundle 文件内容
    const code = ejs.render(template, {data})

    //* 生成 bundle 文件
    fs.writeFileSync('./dist/bundle.js', code)
}

build(graph)
