const path = require('path')//nodejs模块，用于操作路径
const UglifyPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');//html-webpack-plugin通过自动注入所有生成的包来为应用程序生成HTML文件。调用这个才能动态改变index.html引入的js名称
// const ProgressPlugin = require('webpack-progress-plugin')
const webpack = require('webpack');//使用webpck插件必须安装webpack
const ExtractTextPlugin = require('extract-text-webpack-plugin')//定义分离css插件
const debug = process.env.NODE_ENV !== 'production'
const CopyWebpackPlugin = require('copy-webpack-plugin')
const mock = require('./mock')

module.exports = {
  // entry:'./src/index.js',
  // 相当于==》
  // entry:{
  //     main:'./src/index.js'  
  //  },
  entry: {
        foo:'./src/index.js',
        bar:'./src/home.js',
        // mock:'./mock.js'
      },
  // entry: {
  //   main: [
  //     './src/index.js',
  //     './src/home.js'
  //   ]
  // },
  // output: {//自定义出口文件
  //   path:path.resolve(__dirname,'dist'),
  //   filename:'bundle.js'
  // },
  output: {//多个入口生成不同文件
    path:__dirname+'/dist',
    filename:'[name].js'
  },
  // output: {
  //   path:__dirname+'/dist/[hash]',//路径中使用 hash，每次构建时会有一个不同 hash 值，避免发布新版本时线上使用浏览器缓存
  //   publicPath: debug ? '/' : '../',
  //   filename:'[name].js'
  // },
  // output:{
  //   path:path.resolve(__dirname, './dist/'),
  //   filename:'build.js'
  // },
  resolve:{//解析代码模块路径
    alias:{//经常编写相对路径很麻烦，可以配置某个模块的别名
      utils:path.resolve(__dirname,'src/utils'),//模糊匹配，在index.js导入时只要模块路径中携带了 utils 就可以被替换掉
      // utils$:path.resolve(__dirname,'src/utils'),//精确匹配，在index.js只会匹配 import 'utils'
    },
    // 在进行模块路径解析时，webpack 会尝试帮你补全那些后缀名来进行查找，例如有了上述的配置，当你在 src/utils/ 目录下有一个 common.js 文件时，就可以这样来引用：import * as common from './src/utils/common'
    //css无法解析，可以import时加上css后缀名，也可在extensions中添加
    extensions:['.wasm', '.mjs', '.js', '.json', '.jsx','.css'],// 这里的顺序代表匹配后缀的优先级，例如对于 index.js 和 index.jsx，会优先选择 index.js
    // modules: ['node_modules'],
    modules: [//对于直接声明依赖名的模块（如 react ），webpack 会类似 Node.js 一样进行路径搜索，搜索 node_modules 目录，这个目录就是使用 resolve.modules 字段进行配置的
    //如果可以确定项目内所有的第三方依赖模块都是在项目根目录下的 node_modules 中的话，那么可以在 node_modules 之前配置一个确定的绝对路径：
      path.resolve(__dirname, 'node_modules'), // 指定当前目录下的 node_modules 优先查找
      'node_modules', // 如果有一些类库是放在一些奇怪的地方的，你可以添加自定义的路径或者目录
    ],
    //并不是一定有 package.json 文件则按照文件中 main 字段的文件名来查找文件
    // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
    mainFields: ['browser', 'module', 'main'],//可以进行调整；当引用的是一个模块或者一个目录时，会使用 package.json 文件的哪一个字段下指定的文件，
    // target 的值为其他时，mainFields 默认值为：
    // mainFields: ["module", "main"],
    mainFiles: ['index'], // 当目录下没有 package.json 文件时，我们说会默认使用目录下的 index.js 这个文件，你可以添加其他默认使用的文件名
  },
  module:{
    rules:[
      {
        test:/\.jsx?/,//匹配文件路径的正则表达式，通常我们都是匹配文件类型后缀
        include:[
          path.resolve(__dirname,'src')// 指定哪些路径下的文件需要经过 loader 处理****必须保证path定义******注意是绝对路径
        ],
        use:'babel-loader' // 指定使用的 loader，*******需要安装babel-loader，同时要安装babel-core，是babel-loader编译器的核心*********
      },
      // {
      //   test:/\.css$/,//构建时并不会生成css文件，如果需要单独把 CSS 文件分离出来，我们需要使用 extract-text-webpack-plugin 插件，未发布支持 webpack 4.x 的正式版本，安装的时候需要指定npm install extract-text-webpack-plugin@next -D
      //   include: [
      //     path.resolve(__dirname,'src'),
      //   ],
      //   use:['style-loader',//负责解析 CSS 代码，主要是为了处理 CSS 中的依赖，例如 @import 和 url() 等引用外部文件的声明；
      //   'css-loader']//将 css-loader 解析的结果转变成 JS 代码，运行时动态插入 style 标签来让 CSS 代码生效。
      // }
      {
        test: /\.css$/,
        // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
        use: ExtractTextPlugin.extract({ 
          fallback: 'style-loader',
          use: 'css-loader',
        }), 
      },
      {
        test:/\.less$/,
        use: ExtractTextPlugin.extract({
          fallback:'style-loader',
          use:[
            'css-loader',
            'less-loader'//一个模块文件可以经过多个 loader 的转换处理，执行顺序是从最后配置的 loader 开始，一步步往前
          ]
        })
      },
      {
        test:/\.(png|jpg|gif)$/,
        use:[
          {
            loader:'file-loader',//处理图片的 loader 配置 file-loader;可以用于处理很多类型的文件，它的主要作用是直接输出文件，把构建后的文件路径返回。
            options:{
              context:'',//指定自定义文件上下文。
              name: '[path][name].[ext]'
            }
          }
        ]
      },
      // {
      //   test:/\.(png|jpg|gif)$/,
      //   use:[
      //     {
      //       loader:'url-loader',//如果图片较多，会发很多http请求，会降低页面性能。这个问题可以通过url-loader解决。因此url-loader提供了一个limit参数，小于limit字节的文件会被转为DataURl，大于limit的还会使用file-loader进行copy。
      //       options: {  
      //         limit: '1024'  
      //       } 
      //     }
      //   ]
      // }
    ]
  },
  plugins:[//插件：多次使用插件用于不同目的，所以要用new运算符调用他们的实例;模块代码转换的工作由 loader 来处理，除此之外的其他任何工作都可以交由 plugin 来完成
    new UglifyPlugin(),//压缩 JS 代码的 uglifyjs-webpack-plugin 插件
    new HtmlWebpackPlugin({//将 HTML 引用路径和我们的构建结果关联起来；不定义时会默认生成index.html，其中会引用构建出来的 JS 文件；实际项目要自定义index.html
      filename:'index.html',// 配置输出文件名和路径,
      template:'index.html',// 配置文件模板
      chunks : ['foo'],//多页面应用时用；决定使用哪些生成的 js 文件。打包时只打包index文件,注意使用chunks时模板index.html文件里面不允许有script标签，即使注释掉也会报错
      inject: true//inject:true(默认值，script标签位于html文件的 body 底部);inject:body(同 true);inject:head(script 标签位于 head 标签内);inject:false(不插入生成的 js 文件，只是单纯的生成一个 html 文件)
    }),//html-webpack-plugin通过自动注入所有生成的包来为应用程序生成HTML文件。调用这个才能动态改变index.html引入的js名称
    new HtmlWebpackPlugin({//将 HTML 引用路径和我们的构建结果关联起来；不定义时会默认生成index.html，其中会引用构建出来的 JS 文件；实际项目要自定义index.html
      filename:'home.html',// 配置输出文件名和路径,
      template:'home.html',// 配置文件模板
      chunks : ['bar'],//打包时只打包home文件
      inject: true
    }),
    new webpack.ProgressPlugin(),//显示进度插件
    new ExtractTextPlugin('style.[hash].css'),//引入分离css插件
    // new ExtractTextPlugin('[name].[hash].css'),//当有多个入口文件时，可生成不同的css文件用于不同的入口
    new webpack.DefinePlugin({//DefinePlugin 是 webpack 内置的插件，可以使用 webpack.DefinePlugin 直接获取；用于创建一些在编译时可以配置的全局常量，可以在应用代码文件中，访问配置好的变量
      PRODUCTION: JSON.stringify(true), // const PRODUCTION = true
      VERSION: JSON.stringify('5fa3b9'), // const VERSION = '5fa3b9'
      BROWSER_SUPPORTS_HTML5: true, // const BROWSER_SUPPORTS_HTML5 = 'true'
      TWO: '1+1', // const TWO = 1 + 1,
      CONSTANTS: {
        APP_VERSION: JSON.stringify('1.1.2') // const CONSTANTS = { APP_VERSION: '1.1.2' }
      }
    }),
    new CopyWebpackPlugin([//有些没有经过webpack处理的文件，直接copy到可供发布的目录中，可以自定义文件目录
      { from: 'src/file.txt', to: 'file.txt', }, // 顾名思义，from 配置来源，to 配置目标路径
      { from: 'src/*.ico', to: 'build/*.ico' }, // 配置项可以使用 glob
      // 可以配置很多项复制规则
    ]),
    // 参数:第一个是匹配引入模块路径的正则表达式，第二个是匹配模块的对应上下文，即所在目录名。
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)//忽略某些特定的模块，让 webpack 不把这些指定的模块打包进去，例如 moment.js，打包后有很多我们不需要的代码，所以设置忽略打包
  ],
  // devServer: {
    // public:'http://localhost:2343',//指定静态服务的域名，默认是 http://localhost:8080/ ，当你使用 Nginx 来做反向代理时，应该就需要使用该配置来指定 Nginx 配置使用的服务域名。
    // port: '1234',//指定静态服务的端口,默认是 8080，通常情况下都不需要改动
    // publicPath:'assets/' //指定构建好的静态文件在浏览器中用什么路径去访问，默认是 /
    // before(app){//before 在 webpack-dev-server 静态资源中间件处理之前，可以用于拦截部分请求返回特定内容，或者实现简单的数据 mock。
    //   app.get('/some/path', function(req, res) { // 当访问 /some/path 路径时，返回自定义的 json 数据
    //     res.json({ code: 200, message: 'hello world' })
    //   })
    // },
    // proxy: {//配置 webpack-dev-server 将特定 URL 的请求代理到另外一台服务器上。当你有单独的后端开发服务器用于请求 API 时，这个配置相当有用
    //   '/ktvsky': {
    //     target: "http://localhost:1234", // 将 URL 中带有 /ktvsky 的请求代理到本地的 1234 端口的服务上
    //     pathRewrite: { '^/ktvsky': '' }, // 把 URL 中 path 部分的 `ktvsky` 移除掉
    //   },
    // }
    // before(app) {
    //   mock(app) // 调用 mock 函数
    // }
  // },
}


/*****
 * create-react-app
 * vue-cli
 * angular-cli
 * ******/ 