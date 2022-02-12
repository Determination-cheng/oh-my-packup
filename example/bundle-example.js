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
    require(1)
})({
    1: [
        function (require, module, exports) {
            //* import 只能用在文件的顶层作用域，否则会报错
            //* 因此此处需要转成 commonJS 格式
            // import {bar} from './bar.js';
            const {bar} = require('./bar.js')

            console.log('main')

            function main() {
                console.log('main function')
            }

            bar()
            main()

            module.exports = {main}
        },
        {'./bar.js': 2}
    ],
    2: [
        function (require, module, exports) {
            console.log('bar')

            function bar() {
                console.log('bar function')
            }

            module.exports = {bar}
        },
        {}
    ],
});
