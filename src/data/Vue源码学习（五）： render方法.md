---
date: '2020-12-01'
title: 'Vue源码学习（五）： render方法'
tags: ['Vue', 'JavaScript']
template: 'post'
thumbnail: vue.png
description: ''
---

# Vue源码学习（五）： render方法

## Virutal DOM

在开始之前先介绍下`Virtual DOM`，我们都知道浏览器的DOM元素是很庞大的，拥有许多属性，如果频繁更新真实的DOM元素会非常消耗性能，所以引入了`Virtual DOM`的概念。而`Virual DOM`就是用原生的JS对象去描述一个DOM节点。在Vue中，Virual DOM就是用`VNode`这样一个类来描述的。一个`VNode`大概是这个样子的:

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610009535841-10574e73-c70f-42b7-9774-3719423c4c6e.png)

## render

上一节调用了`updateComponent`，那调用这个方法会调用`vm._update()`，因为第一个参数是`vm._render()`，所以会先走进`vm._render`，这节来看下这个方法。

这个方法在`core/instance/render.js`

```javascript
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options // 拿到render函数,_parentVnode之后再介绍

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }
    ...
```

这个render函数，可以我们自己在调用`new Vue({...})`的时候自己写，也可以通过编译生成。

之后调用`render`,并把`vm._renderProxy`作为上下文传入

```javascript
vnode = render.call(vm._renderProxy, vm.$createElement)
```

这第一个参数`vm._renderProxy`是的取值也是发生在`init.js`中。

生产环境下就直接把`vm`赋值给`vm._renderProxy`，开发环境下会调用`initProxy`，这个`initProxy`可以自己去看，代码比较简单，就是对我们`vm`对象访问做一个劫持，如果访问了不在`vm`中的数据就报错。

```javascript
// init.js
if (process.env.NODE_ENV !== 'production') {
	initProxy(vm)
} else {
	vm._renderProxy = vm
}
```


第二个参数`vm.$createElement`定义在同一个文件下的`initRender`中

```javascript
export function initRender (vm: Component) {
  ...
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  ...
}
```

这个`initRender`在`init.js`中就已经调用了，那这边有两个函数，`vm._c`和`vm.$createElement`几乎长得一样，唯一不同是最后一个参数。这个`vm._c`是被**编译**生成的render函数使用的方法，而`vm.$createElement`是我们手写`render`函数提供的生产vnode的方法。

这里我们先把我们的例子做个改动，我们手写一个render函数

注意下面`render`函数的参数`createElement`函数其实就是上面的`vm.$createElement`，这个`render`函数就是上面的`render.call(...)`

```javascript
new Vue({
	el: '#app',
	render(createElement) {
		return createElement('div'{
			attrs: {
            	id: 'container'                 
            }
		}, this.message)
	},
    data() {
        return {
            message: 'Hello Vue!'
        }
	}
})
```

运行后

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610006163713-2aa9e3b4-a10e-4480-9439-0582703a1574.png)

可以看到这里是直接替换了我们在`index.html`中写的`<div id="#app"></div>`，所以这就是为什么不能挂载到`<body>`或者`<html>`的原因

我们回到我们的`_render`函数中，函数在执行完`render.call(...)`获得vnode后，中间就是一些错误的捕获，最后就是返回了`vnode`

```
return vnode
```

## createElement

我们知道调用`render`方法会返回`vnode`,而调用的这个`render`函数又调用了`createElement`方法，其实`createElement`才是真正创建`vnode`的地方。我们现在就来看这个函数，在`src/core/vdom/create-element.js`

```javascript
export function createElement (
  context: Component, // vm实例
  tag: any, // vnode标签
  data: any, // vnode数据
  children: any, // 子vnode
  normalizationType: any, 
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) { // 这里做了个参数的重载，如果data为数组类型，说明data这个位置传的就是children，后面的参数也要往前移动一位
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

这个函数最后调用了`_createElement`，所以`_createElement`才是真正创建vnode，上面这个函数只不过是对参数做了一次封装。

```

```

