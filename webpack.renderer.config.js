
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const spawn = require('child_process').spawn;
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    target: 'electron-renderer',
    entry: {
        renderer: ['./src/renderer/renderer.ts']
        // menu: ['./src/renderer/menu/menu.ts']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: __dirname + '/dist/',
        filename: '[name].js'
    },
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ],
                exclude: /(?:node_modules)/,
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin({ verbose: true }),
        new ForkTsCheckerWebpackPlugin({
            reportFiles: ['./src/renderer/**/*']
        }),
        new webpack.NamedModulesPlugin(),
        // new HtmlWebpackPlugin({
        //     chunks: ['menu'],
        //     filename: 'menu.html',
        //     template: 'src/renderer/menu/menu.html'
        //   }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    devtool: 'source-map',
    devServer: {
        writeToDisk:true,
        contentBase: path.join(__dirname, './dist'),
        publicPath : path.join(__dirname, './dist'),
        port: 2003,
        compress: true,
        noInfo: false,
        inline: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false
        },
        before() {
            if (process.env.START_HOT) {
                console.log('Starting main process');
                spawn('npm', ['run', 'start-main-dev'], {
                    shell: true,
                    env: process.env,
                    stdio: 'inherit'
                })
                    .on('close', code => process.exit(code))
                    .on('error', spawnError => console.error(spawnError));
            }
        }
    }
};