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

            var _user = require("./user.json");

            var _user2 = _interopRequireDefault(_user);

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {default: obj};
            }

            console.log('bar');

            function bar() {
                console.log('bar function');
                console.log(_user2.default);
            }
        },
        {"./user.json": 2}
    ],

    '2': [
        function (require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = "{\n  \"name\": \"chara\",\n  \"age\": 18\n}\n";
        },
        {}
    ],

});
