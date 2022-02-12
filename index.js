import fs from 'fs'
import path from 'path'
import parser from '@babel/parser'
import traverse from '@babel/traverse'

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

function run() {
    createGraph()
}

run()
