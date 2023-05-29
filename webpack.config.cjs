const packageJson = require('./package.json');
const version = packageJson.version;
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {

    const conf = {
        mode: 'development',
        devServer: {
            host: 'localhost',
            port: 3000,

            open: {
                target: ["index.html"],
            },
            allowedHosts: "all",
            static:
                [
                    {
                        directory: path.join(__dirname, `example`),
                        publicPath: "/",
                        serveIndex: false,
                        watch: true,
                    },
                ],

        },
        entry: {
            'index': ['./src/index.js'],
        },
        output: {
            path: path.join(__dirname, 'lib'),
            publicPath: '/',
            filename: '[name].js',
            globalObject: 'this',
            library: {
                name: 'ChatStream',
                type: 'umd',
            },

        },
        optimization: {
            minimize: (argv.mode === 'production' ? true : false),
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        mangle: {},
                        sourceMap: false,
                        compress: {
                            drop_console: (argv.mode === 'production' ? true : false),
                        },
                        output: {},
                    },
                }),

            ],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    ['@babel/preset-env']
                                ],
                            }
                        }
                    ],

                },
            ],

        },
        resolve: {
            alias: {}
        },
        plugins: [
            new webpack.BannerPlugin(`ChatStream v${version} Copyright (c) 2023 riversun.org@gmail.com`),

        ],
        externals: {}
    };

    if (argv.mode !== 'production') {
        conf.devtool = 'inline-source-map';
    }

    return conf;

};
