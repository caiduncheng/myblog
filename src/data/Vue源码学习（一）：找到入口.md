---
date: '2020-12-01'
title: 'Vue源码学习（一）：找到入口'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: ''
---

## 获取源码

要进行源码的学习我们先要获取源码，首先打开[Vue的GitHub页面](https://github.com/vuejs/vue)在code按钮下下载源码的zip文件或者用命令行输入

```
git clone https://github.com/vuejs/vue.git
```

这样就把代码下载到本地了

## 找入口

首先我们看着源码一大堆的文件，我们遇到了我们的第一个问题：该从哪里开始？

Vue是一个属于npm的一个package，所以我们可以先打开`package.json`看看

```json
{
  "name": "vue",
  "version": "2.6.12",
  "description": "Reactive, component-oriented view layer for modern web interfaces.",
  "main": "dist/vue.runtime.common.js",
  "module": "dist/vue.runtime.esm.js",
  "unpkg": "dist/vue.js",
  "jsdelivr": "dist/vue.js",
  "typings": "types/index.d.ts",
  "files": [
    "src",
    "dist/*.js",
    "types/*.d.ts"
  ],
  "sideEffects": false,
  "scripts": {
    "dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev --sourcemap",
    "dev:cjs": "rollup -w -c scripts/config.js --environment TARGET:web-runtime-cjs-dev",
    "dev:esm": "rollup -w -c scripts/config.js --environment TARGET:web-runtime-esm",
    "dev:test": "karma start test/unit/karma.dev.config.js",
    "dev:ssr": "rollup -w -c scripts/config.js --environment TARGET:web-server-renderer",
    "dev:compiler": "rollup -w -c scripts/config.js --environment TARGET:web-compiler ",
    "dev:weex": "rollup -w -c scripts/config
    ...
```

首先是`name`,`version`和`description`，这三个无需解释

然后我们在`main`,`module`和`unpkg`都看到了`dist/`，说明他们是和打包后的文件有关，不是我们要找的

`typings`是TypeScript的类型定义，可以在`types/index.d.ts`找到这些定义，继续找

`files`虽然指出了`src`是源码的所在目录，但范围还是太大了

接着看看`scripts`，我们终于找到了一个`dev`脚本，我们可以从这里找出入口的所在位置

```
rollup -w -c scripts/config.js --environment TARGET:web-full-dev --sourcemap
```

`rollup`其实是类似`webpack`的打包工具，意思就是加载`config.js`这个构建的配置文件进行输出。我们看下这个`scripts/config.js`，并且找到`web-full-dev`

```javascript
'web-full-dev': {
  entry: resolve('web/entry-runtime-with-compiler.js'),
  dest: resolve('dist/vue.js'),
  format: 'umd',
  env: 'development',
  alias: { he: './entity-decoder' },
  banner
},
```

这个就是构建的配置，我们可以从`entry`可以知道，我们的入口在`'web/entry-runtime-with-compiler.js`!

但是我们并没看到`web`目录，可以看到`entry`前面还有`resolve`函数，这个函数就在这个`config.js`开头

```javascript
const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}
```

参数`p`就是`web/entry-runtime-with-compiler.js`，`base`是`web`，然后看看这个同目录下的`alias.js`文件

```javascript
const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
```

这里我们找到`web`的值是`src/platforms/web`，然后和上面的拼接起来就是`src/platforms/web/entry-runtime-with-compiler.js`

```javascript
/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {	
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
...
```

终于，我们把入口给找出来了，当然要注意的是这里并不是真正的Vue代码，这里只是入口文件,当我们的代码执行 `import Vue from 'vue'` 的时候，就是从这个入口执行代码来初始化 Vue。

