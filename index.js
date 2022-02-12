import fs from 'fs'
import parser from '@babel/parser'

function run() {
    const entry = fs.readFileSync('./example/main.js', {encoding: 'utf-8'})
    //* 获取入口文件的 AST
    const ast = parser.parse(entry, {sourceType: 'module'})
    console.log(ast)

}

run()
