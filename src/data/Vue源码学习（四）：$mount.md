---
date: '2020-12-01'
title: 'Vue源码学习（四）：$mount'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: ''
---

上一节介绍了`init`方法，其中调用了`vm.$mount`，那这个`$mount`的定义在`platforms/web/entry-runtime-with-compiler.js`

这里我们写一个简单的`demo`来配合源码进行介绍：

```javascript
new Vue({
  el: '#app',
  data() {
    return {
      message: 'hello world'
    }
  },
  mounted() {
    console.log(this.message)
  }
})
```

下面是`platforms/web/entry-runtime-with-compiler.js`

```javascript
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
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```

首先检查是否存在`el`参数并调用`query`方法并传入`el`，这里的`el`就是我们`new Vue({...})`的时候传的`el`选项，比如`'#app'`，`query`函数在`./util/index`中，这里就不贴`query`的代码了，这个方法会调用`document.querySelector(el)`，然后将选中的元素返回，所以这里的`el`现在就是一个DOM元素了。

```javascript
el = el && query(el)
```

如果要挂载的元素为`<body>`或者`<html>`，就会报错，因为这会破坏文档的结构，所以你的`Vue`不能直接挂载到这两个元素上

```javascript
 if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
 }
```

然后接着判断是否有写`render`函数，我们这里没有写，所以就进入这个逻辑

```javascript
if (!options.render) {
...
```

我们也没有写`template`，就走下面这个逻辑

```javascript
let template = options.template
if (template) {
    // 不会走到这个逻辑...
} else if (el) {
    template = getOuterHTML(el)
}
```

`getOuterHTML`的逻辑也很简单，就是返回`el`元素的`getOuterHTML`属性，也就是返回了这个**字符串**

```javascript
'<div id="app"></div>'
```

然后下面这个是编译相关的，后面会再介绍编译的内容，主要就是把我们传入的`template`编译成`render`函数

```javascript
if (template) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    	mark('compile')
	}
...
```

最后调用了`mount`方法

```javascript
return mount.call(this, el, hydrating)
```

这个`mount`就是文件开头的

```javascript
const mount = Vue.prototype.$mount
```

因为有分为`runtime-only`版本和带有`compiler`的版本，所以这个`$mount$`才定义了两遍，那上面这个`mount`

是在`./runtime/index`的下面这个函数

```javascript
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

也就是接着对`el`进行是否是浏览器的判断并调用`query(el)`后，就又调用了`mountComponent`方法，该方法在

`core/instance/lifecycle`

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
...
```

首先会给把`el`也就是`<div id="app">`这个**元素**赋值给`vm.$el`，然后判断有没有`render`函数，我们没有写`render`所以就进入这个逻辑。

在`runtime-only`版本下如果没有写了`template`就会发出警告说目前用的版本是不带编译的版本，`template`不可编译。	

```javascript
vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
```

之后就调用钩子函数，这个后面再讲

```javascript
callHook(vm, 'beforeMount')
```

和性能埋点相关，这里就直接跳过吧。不是很重要

```javascript
 if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
		...
    }
  }
```

否则，定义`updateComponent`，第一个参数会调用`_render`来生成一个`VNode`,第二个参数和服务端渲染有关，这里默认为false。这个updateComponent其实就是渲染的入口，首次和之后每次更新都会执行。

```javascript
else {
    updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
```

接下来就是调用`new Watcher`，`Watcher`这个类很重要，是和响应式原理相关的一个类，这里创建的是一个**渲染Watcher**，这个概念很重要，后面会提到。第一个参数是`vm`实例，第二个参数就是上面定义的函数，第三个`noop`其实就是个空函数，第四个就是配置，也是一个对象。第五个参数是`isRenderWatcher`一个布尔值，是否是渲染Watcher。

```javascript
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
    }
}, true /* isRenderWatcher */)
```

`Watcher`的定义在`./observer/watcher`，看下它构造函数的逻辑，只挑比较重要的来讲，代码就不全部贴出来了，直接看源代码就好。

把Watcher实例赋值给`vm._watcher`

```javascript
if (isRenderWatcher) { // 这里是true
    vm._watcher = this
}
```

这里的`expOrFn`就是上面的`updateComponent`，是个函数，所以赋值给`this.getter`，下面else逻辑以后会说明

```javascript
if (typeof expOrFn === 'function') {
    this.getter = expOrFn
} else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
            `Failed watching path: "${expOrFn}" ` +
            'Watcher only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.',
            vm
        )
    }
}
```

这里`this.lazy`为undefined，所以调用`this.get`

```javascript
this.value = this.lazy
      ? undefined
      : this.get()
```

`get`方法在构造函数下面

```javascript
  get () {
    pushTarget(this) // 和依赖收集相关，以后会介绍
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm) // 这里就调用了getter，也就是之前介绍过的updateComponent
    } catch (e) {
    ...
```

那就会调用函数体内的`vm._update`

```javascript
updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
```

`vm_update`调用完后就会将虚拟DOM渲染成真实DOM了，也就实现了挂载，`_update`和`_render`会在下一节介绍。

## 总结

