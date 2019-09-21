const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',

    output: {
        path: path.join(__dirname, "dist"),
        filename: "index.js",
        library: 'Calc',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader'
        }]
    },
    resolve: {
        modules: [
            "node_modules",
        ],
        extensions: [
            '.ts',
            '.js'
        ]
    }
};