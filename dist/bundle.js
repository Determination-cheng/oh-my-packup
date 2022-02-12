;(function (modules) {
    //* 1.实现 require()
    function require(filePath) {
        const fn = modules[filePath]

        const module = {
            exports: {}
        }

        fn(require, module, module.exports)
        return module.exports
    }

    //* 2.执行入口文件
    require('./example/main.js')
})({

    './example/main.js': function (require, module, exports) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.main = main;

        //! 这里引用的是相对路径，但是映射中是绝对路径
        var _bar = require("./bar.js");

        console.log('main');

        function main() {
            console.log('main function');
        }

        (0, _bar.bar)();
        main();
    },

    '/Users/heweicheng/Desktop/oh-my-packup/example/bar.js': function (require, module, exports) {
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

});
