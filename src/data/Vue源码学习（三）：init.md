---
date: '2020-12-01'
title: 'Vue源码学习（三）：init'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: ''
---

在这篇文章中，我将介绍：

- `mixin`都做了哪些事情
- 了解`init`的过程

## mixin都做了什么

现在看下`src/core/instance/index.js`

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

当`import`这个文件的时候，就会执行`function Vue`下面的五个`mixin`，我们来看看它们都做了什么，然后再进入`_init`函数来了解当我们执行`var app  = new Vue({...})`都发生了什么。

### initMixin

我们打开`./init.js`，

```javascript
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }
    ...
```

`initMixin`就是往`Vue`的原型挂载了`_init`函数，`function Vue`里面调用的`this._init(options)`就是在这里定义的，稍后我会介绍这个函数

### stateMixin

打开`./state.js`，找到`statemixin`

```javascript
export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ): Function {
    const vm: Component = this
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
```

这个函数定义了：

- `dataDef`以及它的getter
- `propsDef`以及它的getter
- 在生产环境下定义`dataDef`和`propsDef`的setter，作用是在控制台打印警告
- `Vue.prototype.$data`，通过`Object.defineProperty`从`dataDef`赋值而来
- `Vue.prototype.$props`，通过`Object.defineProperty`从`propsDef`赋值而来
- `Vue.prototype.$watch`

这里定义了`$data`,`$props`,`$set`,`$delete`和`$watch`这几个我们很熟悉的变量。在这个文件里还定义了`Watcher`，在后面的文章我会解释`Observer`,`Dep`和`Watcher`是怎么协作来实现我们数据的响应式。

### eventsMixin

打开`./events.js`，然后找到`eventsMixin`，文件比较长就不贴出来了，这个函数定义了一下变量

- `Vue.prototype.$on`
- `Vue.prototype.$once`
- `Vue.prototype.$off`
- `Vue.prototype.$emit`

都是我们在平常开发中经常用到的方法

### lifecycleMixin

打开`lifecycle.js`，找到`lifecycleMixin`

这个函数定义了：

- `Vue.prototype._update()`，DOM操作就是在这个函数完成的
- `Vue.prototype.$forceUpdate()`
- `Vue.prototype.$destroy()`

之前提到过的`mountComonent`也是在这里定义的,它是`$mount`方法实现的核心

### renderMixin

打开`./render.js`,找到`renderMixin`函数，这个函数定义了`Vue.prototype._render()`，这个函数后面也会讲解，目前就先记住我们初次看到这个函数是在`renderMixin`函数内

那简单地说，这五个mixin就是往Vue的原型上去挂载了一些函数，变量：

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/rendermixin.png" />

## 了解init的过程

现在我们回到我们的核心代码当中

```javascript
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

这里我们准备一个简单的demo比较好理解

```javascript
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

首先我们会调用`new Vue({...})`，意思就是

```javascript
options = {
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
}
```

然后就会执行构造函数的逻辑，也就是`this._init(options)`。还记得`_init()`是在哪里定义的的吗？在`./init.js`, 打开这个文件。`_init()`做了以下事情：

- 首先缓存当前的上下文到vm变量中

- 给`vm`赋值`_uid`，_uid属性是唯一的。当触发init方法，新建Vue实例时（当渲染组件时也会触发）uid都会递增。
- 给`vm`赋值`_isVue`
- 合并options，可以理解为把我们传入的`options`合并到`$options`当中，所以我们可以在demo中通过`this.$options.el`访问到挂载节点的id字符串`'#app'`
- 定义`vm._renderProxy`，在生产环境下就是`vm`本身
- 调用了一系列的初始化函数
- 调用`$mount()`来更新DOM

现在我们来看一下那些初始化函数

```javascript
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

### initLifeCycle

这个函数在`./lifecycle.js`

这个函数初始化vm实例中和生命周期相关的属性

### initEvents

这个函数在`./events.js`

这个函数作用是初始化组件中的事件

### initRender

这个函数在`./render.js`

这个函数初始化了`vnode`,`_staticTrees`和其他的一些变量和方法

这里我们首次接触到了`VNode`这个概念

什么是`VNode`？`VNode`是**虚拟节点**，就是用一个原生的 JS 对象去描述一个 DOM 节点，所以它比创建一个 DOM 的代价要小很多。Vue之所以选择`VNode`来表示DOM就是因为性能的问题

当我们的数据改变的时候，Vue需要更新页面，最简单的方法当然是渲染整个页面，但这会造成浏览器性能资源的浪费。我们通常只会修改一部分数据，所以为什么不只更新那部分数据呢？因此Vue在数据和视图之间加了一层`VNode`和`VDom`。

### initInjections

这个函数在`./inject.js`

这个函数很简短，作用就是处理在options中定义的`inject`然后将它们放到组件当中

这里我们还看到了`defineReactive`,Vue在数据变化的时候会自动更新视图，这个函数可以帮我们找到这个原理的一些线索，打开`../observer/index.js`,找到`defineReactive()`

这个函数首先定义了`const dep new Dep()`，做了一些校验，然后从属性中提取出getter和setter

```javascript
/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: Function
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
 
  let childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
        if (Array.isArray(value)) {
          dependArray(value)
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)
      dep.notify()
    }
  })
}
```

尽管我们还没开始讲解数据的响应式，但从这段代码也大概能猜出来一些，主要是为对象的属性定义getter和setter然后构造依赖关系，并发送通知来通知订阅者进行更新。

`defineReactive`在很多地方都有被调用，而不仅仅在`initInjections`中，我们会在后面介绍`Observer`,`Dep`和`Watcher`。

### initState

这个函数在`./state.js`

```javascript
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch) initWatch(vm, opts.watch)
}
```

这里根据条件执行了`initProps`,`initMethods`,`initData`,`initComputed`,`initWatch`,我们一个一个来看

#### initProps

会遍历props中的每个属性，然后进行类型验证，数据监测等（提供为props属性赋值就抛出警告的钩子函数）。

#### initData

同样对我们的`data`做了一些校验，然后调用用`proxy`来对我们的data做了一层代理，可以看下`proxy`的定义然后就能知道当我们访问`this.xxx`实际上是访问了`this._data[xxx]`

 在函数的最后可以看到`observe(data, true)`。我们会在后面介绍`Observer`，但这里我先解释一下这个参数`true`。每个被观测的对象有个属性叫做`vmCount`，这个属性意思是有多少个组件以这个对象作为根数据。当我们调用`observe`时传入了`true`,就会执行`vmCount++`，`vmCount`的初始值是`0`。

#### initComputed

这个函数提取出了你在`computed`对象中定义的函数作为getter然后用它来实例化一个`Watcher`并存放在`watchers`数组中。

#### initWatch

遍历我们传给Vue参数的`watch`中每一个key，调用`createWatcher`函数。其中针对回调函数是数组即多个函数处理程序的情况做处理。

#### initProvider

函数在`./inject.js`

函数很简单，提取出我们在组件上定义的`provide`然后调用。

### 总结

Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 