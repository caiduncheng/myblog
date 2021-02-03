---
date: '2020-12-01'
title: 'Vue源码学习（二）：找到Vue代码'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: ''
---
上篇文章我们找到了入口文件，该文件的`Vue`是在别的文件定义的，在开头有`import Vue from './runtime/index'`，我们来看下这个文件

```javascript
/* @flow */

import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
import platformComponents from './components/index'

// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}

export default Vue
```

我们看到`Vue`又是从别的文件导入的！大概看下这个文件做了什么

- 导入了配置文件 
- 导入了工具函数 
- 导入`mountComponent`和`patch`函数
- 导入组件和指令
- 将平台(web或weex)特有的工具函数赋值给`Vue.config`
- 给Vue.options.directives添加model,show属性，给Vue.options.components添加Transition,TransitionGroup属性
- 根据环境（是否在浏览器）挂载`patch`函数
- 定义了通用的`mount`方法
- 在控制台输出一些警告信息

如上面所示，这个文件只不过是给`Vue`添加了一些平台差异化的东西。

有两个比较重要的地方：

1. `Vue.prototype.__patch__ = inBrowser ? patch : noop`，我会在后面的章节中介绍`patch`，它的作用是更新我们的页面，也就是`patch`负责**对DOM的操作**
2. 这里又有一个`mount`方法，`mountComponent`的核心实现被封装了两层

另外我们可以在`platforms`目录下看到另一个平台`weex`，`weex`平台是类似React Native的框架，貌似是由阿里在开发维护

接着我们打开`core/index`

```javascript
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue

```

这个文件也没找到Vue，我们先看下这个文件，那这个文件其实就是做了一个事情，调用`initGlobalAPI(Vue)`，这边简单说一下就是这个`initGlobalAPI`给`Vue`添加了四个属性`components`,`filters`,`_base`和`directives`	，不过都是空对象，之后再把Vue赋值给`Vue.options._base`，把keepalive扩展进`Vue.options.components`。

也就是说`Vue`经过了两次包装，第一次包装发生在`initGlobalApi`第二次包装在`./runtime/index`,经过两次包装后，Vue构造函数的`options`属性就生成了，用一张图来表示吧

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/vueoptions.png" />

我们回来继续找我们的`Vue`,在`core/index`发现`Vue`又是从`./instance/index`导入进来的

```javascript
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
```

到这里我们终于找到了`Vue`的庐山真面目，这里就是`Vue`的核心实现。

在函数体外面有执行了五个`xxxmixin`

然后我们发现`Vue`构造函数的只有短短几行，除了控制台警告以外只有一行`this._init(options)`，我会在下篇文章介绍`init`的过程

总的来说，整个`Vue`函数经过了下面四个步骤之后合成而来

- Vue核心实现： 也就是`Vue`构造函数，调用了`this._init()`
- Mixins: 五个mixins，为`Vue`原型扩展了一些方法
- 平台(platform)相关：为`Vue`挂载了平台差异化的一些东西和一些公共的`mount`和`patch`函数
- 入口：为`Vue`定义了最外层的`mount`方法

我们发现整个`Vue`源码都被分割成了许多层和模块，这么做的好处有：

1. 解耦，不同模块负责不同的任务
2. 封装，每一层只专注于自己处理的事情
3. 复用性，让`Vue`更容易复用在不同的平台，在不同的环境进行构建

   

