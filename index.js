import fs from 'fs'
import path from 'path'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import {transformFromAst} from 'babel-core'
import ejs from 'ejs'

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

    //* 将 esm 转换成 cjs 的代码
    const {code} = transformFromAst(ast, null, {presets: ['env']})

    return {filePath, deps, code}
}

function createGraph() {
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

const graph = createGraph()

function build(graph) {
    const template = fs.readFileSync('./bundle.ejs', {encoding: 'utf-8'})

    const data = graph.map(({filePath, code}) => {
        return {
            filePath,
            code,
        }
    })

    const code = ejs.render(template, {data})

    fs.writeFileSync('./dist/bundle.js', code)
}

build(graph)
