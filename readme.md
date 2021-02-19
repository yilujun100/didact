### Webpack - 从0开始搭建项目配置

webpack作为前端最知名的打包工具，能够把散落的模块打包成一个完整的应用，大多数的知名框架 cli 都是基于 webpack 来编写。这些 cli 为使用者预设好各种处理配置，使用多了就会觉得理所当然，也就不在意内部是如何配置。如果脱离 cli 开发，可能就无从下手了。

#### 准备工作

快速生成 package.json

```bash
npm init -y
```

必不可少的 webpack 和 webpack-cli

```bash
npm i webpack webpack-cli -D
```

#### 入口、出口

webpack 的配置会统一放到配置文件中去管理，在根目录下新建一个名为 `webpack.config.js`的文件

```js
const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        // filename 定义打包的文件名称
        // [name] 对应entry配置中的入口文件名称
        // [hash] 根据文件内容生成的一段随机字符串
        filename: '[name].[hash].js',
        // path定义整个打包文件夹的路径, 文件夹名为dist
        path: path.join(__dirname, 'dist')
    }
}
```

#### 配置智能提示

webpack的配置项比较复杂，对于不熟悉的同学来说，如果在输入配置项能够提供智能提示，那开发的效率和准确性会大大提高。

默认 VSCode 并不知道 webpack配置对象的类型，通过import的方式导入webpack模块中的 Configuration 类型后，在书写配置项就会有智能提示了。

```js
/** @type {import('webpack').Configuration} */
module.exports = {
    
}
```

#### 环境变量

一般开发中会分开发和生产两种环境，而 webpack 的一些配置也会随环境的不同而变化。因此环境变量是很重要的一项功能，使用`cross-env`模块可以为配置文件注入环境变量。

安装模块`cross-env`:

```bash
npm i cross-env -D
```

修改 package.json 的命令传入变量

```json
"scripts": {
    "build": "cross-env NODE_EVN=production webpack --config webpack.config.js"
}
```

在配置文件中，就可以这样使用传入的变量：

```js
module.exports = {
    devtool: process.env.NODE_ENV === 'production' ? 'none' : 'source-map'
}
```

同理，在项目的js内也可以使用该变量。

#### 设置source-map

该选项能设置不同类型的`source-map`。代码经过压缩后，一旦报错不能准确定位到具体位置，而`source-map`就像一个地图，能够对应源代码的位置。这个选项能够帮助开发者增强调试过程，准确定位错误。

#### loader 与 plugin

loader 与 plugin 是 webpack 的灵魂。如果把 webpack 比作成一个食品加工厂，那么 loader 就像很多条流水线，对食品原料进行加工处理。plugins 则是在原有的功能上，添加其他功能。

#### 生成 html 文件

没有经过任何配置的webpack打包出来只有js文件，使用插件`html-webpack-plugin`可以自定义一个html文件作为模板，最终html会被打包到dist中，而js也会被引入其中。

安装`html-webpack-plugin`:

```bash
npm i html-webpack-plugin -D
```

配置plugins:

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    plugins: {
        // 使用html模板
        new HtmlWebpackPlugin({
        	// 配置html标题
        	title: 'React App',
        	// 模板路径
        	template: './public/index.html'
        	// 压缩
        	minify: true
    	})
    }
}
```

此时想要配置的标题生效还需要在html中为title标签插值：

```html
<title><%= htmlWebpackPlugin.options.title %></title>
```

#### 编译jsx

安装babel的相关模块：

```bash
npm i babel-loader @babel/cli @babel/core @babel/preset-env @babel/preset-react -D
```

`@babel/core`是babel的核心模块，`@babel/preset-env`内预设不同环境的语法转换插件，默认将es6转es5。

根目录下创建`.babelrc`文件：

```js
{
    "presets": [
        "@babel/env",
        "@babel/preset-react"
    ]
}
```

配置loader:

```js
rules: [
    {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    }
]
```

#### 解析css

安装loader:

```bash
npm i css-loader style-loader -D
```

`css-loader`只负责解析css文件，通常需要配合`style-loader`将解析的内容插入到页面，让样式生效。顺序是先解析后插入，所以`css-loader`放在最右边，第一个先执行。

```js
rules: [
    {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
    }
]
```

#### 分离css

经过上面的css解析，打包出来的样式会混在js中。某些场景下，我们希望把css单独打包出来，这时可以使用`mini-css-extract-plugin`分离css。

安装`mini-css-extract-plugin`:

```bash
npm i mini-css-extract-plugin -D
```

配置plugins:

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: 'css/[id].[hash].css'
        })
    ]
}
```

配置loader:

```js
rules: [
    {
        test: /\.css$/,
        use: [
            // 插入到页面中
            'style-loader',
            {
               loader: MiniCssExtractPlugin.loader,
               options: {
                   // 为外部资源（如头像，文件等）指定自定义公共路径
                   publicPath: '../'
               }
            },
            'css-loader'
        ]
    }
]
```

经过上面配置后，打包后css就会被分离出来。

但是注意如果css文件不是很大的话，分离出来效果可能会适得其反，因为这样会多一次文件请求，一般来说单个css文件超过200kb再考虑分离。

#### css浏览器兼容前缀

安装相关依赖：

```bash
npm i postcss postcss-loader autoprefixer -D
```

项目根目录下创建`postcss.config.js`:

```js
module.exports = {
    plugins: [
        require('autoprefixer')()
    ]
}
```

`package.json`新增`browserslist`配置：

```json
{
    "browserslist": [
        "defaults",
        "not ie < 11",
        "last 2 versions",
        "> 1%",
        "iOS 7",
        "last 3 iOS versions"
    ]
}
```

最后配置`postcss-loader`

```js
rules: [
    {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
        ]
    }
]
```

#### 压缩css

webpack内部默认只对js文件进行压缩。css的压缩可以使用`optimize-css-assets-webpack-plugin`来完成。

安装`optimize-css-assets-webpack-plugin`:

```bash
npm i optimize-css-assets-webpack-plugin -D
```

配置plugins:

```js
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
    plugins: [
        new OptimizeCssAssetsWebpackPlugin()
    ]
}
```

#### 解析图片

项目中肯定少不了图片，对于图片资源，`webpack`也有相应的`url-loader`来解析。`url-loader`除了解析图片之外，还可以将比较小的图片转为base64，减少线上对图片的请求。

安装`url-loader`:

```bash
npm i url-loader -D
```

配置loader:

```js
rules: [
    {
        test: /\.(jpg|png|jpeg|gif)$/,
        use: [
            {
                loader: 'url-loader',
                // 小于50k的图片转为base64,超出的打包到images文件夹
                options: {
                    limit: 1024 * 50,
                    outputPath: './images/',
                    publicPath: './images/'
                }
            }
        ]
    }
]
```

配置完成后，只需要在入口文件内引入图片使用，`webpack`就可以帮助我们把图片打包出来了。

#### devServer提高开发效率

每次想运行项目时，都需要build完再去预览，这样的开发效率很低。

官方为此提供了插件`webpack-dev-server`，它可以本地开启一个服务器，通过访问本地服务器来预览项目，当项目文件发生变化时会热更新，无需再去手动刷新，以此提高开发效率。

安装`webpack-dev-server`:

```bash
npm i webpack-dev-server -D
```

配置`webpack.config.js`:

```js
const path = require('path')

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 3000,
        compress: true,
        open: true
    }
}
```

`webpack-dev-server`用法和其他插件不同，它可以不添加到plugins，只需将配置添加到`devServer`属性下即可。

添加启动命令`package.json`：

```json
{
    "scripts": {
        "dev": "cross-env NODE_ENV=development webpack serve"
    }
}
```

#### 打包前清除旧的dist

打包后文件一般都会带有哈希值，它是根据文件的内容来生成的。由于名称不同，可能会导致dist残留有上一次打包的文件，如果每次都手动去清除显得不那么智能。利用`clean-webpack-plugin`可以帮助我们将上一次的dist清除，保证无冗余文件。

安装`clean-webpack-plugin`:

```bash
npm i clean-webpack-plugin -D
```

配置plugins:

```js
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```

插件会默认清除`output.path`的文件夹。