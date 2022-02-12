function mainjs(require, module, exports) {
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
}

function barjs(require, module, exports) {
    console.log('bar')

    function bar() {
        console.log('bar function')
    }

    module.exports = {bar}
}

//* 1.实现 require()
function require(filePath) {
    const map = {
        './bar.js': barjs,
        './main.js': mainjs,
    }

    const fn = map[filePath]

    const module = {
        exports: {}
    }

    fn(require, module, module.exports)
    return module.exports
}

//* 2.执行入口文件
require('./main.js')
