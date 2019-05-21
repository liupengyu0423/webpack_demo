import css from './index.css'
import less from './home.less'
import $ from './jquery.js'
// import home from './home.js'
import 'utils'
// import 'utils/a.js'//模糊匹配；等同于 import '[项目绝对路径]/src/utils/query.js'
import * as common from 'utils/common'
$('body').append('<div class="index">我是index页</div>')
console.log("Running App version " + VERSION);
console.log("process.env.NODE_ENV is " + process.env.NODE_ENV)

