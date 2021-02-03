---
date: '2020-12-01'
title: 'Vue源码学习（五）： render方法'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: ''
---

## Virutal DOM

在开始之前先介绍下`Virtual DOM`，我们都知道浏览器的DOM元素是很庞大的，拥有许多属性，如果频繁更新真实的DOM元素会非常消耗性能，所以引入了`Virtual DOM`的概念。而`Virual DOM`就是用原生的JS对象去描述一个DOM节点。在Vue中，Virual DOM就是用`VNode`这样一个类来描述的。一个`VNode`大概是这个样子的:

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610009535841-10574e73-c70f-42b7-9774-3719423c4c6e.png)



从VirtualDOM到真实DOM的过程会涉及到三个函数，`render`,`createElement`,`_update`

## _render

上一节调用了`updateComponent`，那调用这个方法会调用`vm._update()`，因为第一个参数是`vm._render()`，所以会先走进`vm._render`，来看下这个方法。

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

这个`initRender`在前面介绍的`init.js`中就已经调用过了，那这边有两个函数，`vm._c`和`vm.$createElement`几乎长得一样，唯一不同是最后一个参数。这个`vm._c`是被**编译**生成的render函数使用的方法，而`vm.$createElement`是我们手写`render`函数提供的生成vnode的方法。

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

这个函数最后调用了`_createElement`，所以`_createElement`真正创建了vnode，上面这个函数只不过是对参数做了一次封装。

```javascript
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> { 
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      "Avoid using observed data object as vnode data:" + JSON.stringify(data) +
      "Always create fresh vnode data objects in each render!",
      context
    )
    return createEmptyVNode() // 这个方法就是返回一个注释VNode
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
...
```

我们直接看`_createElement`中的这段代码，比较重要

```javascript
 if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
```

这里的`children`在我们上面的例子中，就是字符串'Hello Vue'，这里的`normalizeChildren`和`simpleNormalizeChildren`其实是要把`children`转成每个元素都是`VNode`的一维数组。这两个方法在`core/vdom/helpers/normalize-children.js`

```javascript
export function simpleNormalizeChildren (children: any) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

export function normalizeChildren (children: any): ?Array<VNode> {
  return isPrimitive(children)
    ? [createTextVNode(children)]  // 这个是返回一个文本VNode
    : Array.isArray(children) 
      ? normalizeArrayChildren(children)
      : undefined
}
```

首先看一下`simpleNormalizeChildren`，它会遍历`children`，然后如果`children`的某个元素也是个数组的话，就调用

```javascript
Array.prototype.concat.apply([], children)
```

这个其实是数组扁平化（也就是把嵌套数组转成一维数组）的一个技巧，可以学习一下。`simpleNormalizeChildren`只能对**深度为1**的数组进行扁平化。

`normalizeChildren`则可以将任意深度的数组扁平化。`nomralizeChildren`在判断`children`是一个数组后，会调用`normalizeArrayChildren`：

```javascript

function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
  const res = [] // 定义最终要返回的数组
  let i, c, lastIndex, last   
  for (i = 0; i < children.length; i++) { // 遍历children
    c = children[i]
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1 // 最后一个元素的下标
    last = res[lastIndex] // 最后一个元素
    ...
```

如果传进来的`children`依然是一个数组的话，比如`slot`，`v-for`，就会递归地调用自己

```javascript
if (Array.isArray(c)) {
  if (c.length > 0) {
  c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)       
  ...
```

这里是一个优化，如果最后一个处理的节点和下次处理的第一个节点都是文本节点就进行合并，这个代码下面的也是一些合并的逻辑，有兴趣可以自己去看看，这里就不贴出来了。

```javascript
if (isTextNode(c[0]) && isTextNode(last)) {
  res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
  c.shift()
}
```

总之，上面的两个`normalize`的目的都是**为了得到一维数组的`VNode`**，我们的例子中，在经过`normalize`后，我们的`children`变成了

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610552242491-44c7bbc6-6f9c-4a63-8633-844cf9da20c5.png)

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610552461812-dee1c00e-3746-4284-8c5b-5f60e939c440.png)

我们回到`_createElement`函数中，首先定义了`vnode`，然后判断标签是不是字符串（我们这里是'div'，符合)，然后再判断是不是保留标签（比如`<html>`,`<div>`,`<p>`)，都符合就直接实例化`VNode`，把上面的`children`作为参数传了进去

```javascript
let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag) 
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }      
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    }
    ...
```

下面还有一些判断，主要是对自定义组件的判断，这里就不介绍了，然后走到这个`createElement`的末尾，返回这个`vnode`

```javascript
if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
```

调试结果：

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610553307426-624ac95f-abe0-4661-b51f-76ec4980a68a.png)

回到我们的`updateComponent`方法，`vm._update`的第一个参数就是我们上面调用完后返回的`vnode`

```javascript
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

## _update

这个`_update`就是渲染的最后一步，它被调用的时机有两个，一个是首次渲染，一个是数据更新的时候。这里只分析首次渲染。`_update`的作用就是把`VNode`渲染成真实的 DOM，它定义在`core/instance/lifecycle.js`

```javascript
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const restoreActiveInstance = setActiveInstance(vm)
    vm._vnode = vnode
    ...
```

首先判断`prevVNode`,我们现在是初次渲染，所以是空，调用`vm.__patch__`

```javascript
if (!prevVnode) {
   // initial render
   vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
} else {
  // updates
  vm.$el = vm.__patch__(prevVnode, vnode)
}
```

`patch`方法定义在`platforms/web/runtime/index.js`

```javascript
Vue.prototype.__patch__ = inBrowser ? patch : noop
```

这里的`patch`在`./patch`，参数`nodeOps`是一些实际的DOM操作集合

```javascript
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

`createPatchFunction`又是在`core/vdom/patch.js`

```javascript
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}
  const { modules, nodeOps } = backend
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  ...
```

首先遍历`modules`，然后把`hooks`都保留到`cbs`对象中

```javascript
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']
```

这些`hooks`会在`patch`的不同阶段调用

`cbs `最后是这个样子的：

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610556639408-7fd21663-166a-4bed-bcb5-a84a29bdd4ab.png)

当然这个不重要，有个大概印象就行，然后下面就是定义了一堆辅助函数，最后return了patch函数

```javascript
 return function patch (oldVnode, vnode, hydrating, removeOnly) {    
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []
    ...
```

这个`patch`函数就是我们刚才提到的那个`patch`：

```javascript
export const patch: Function = createPatchFunction({ nodeOps, modules })
```

也就是我们上面提到的`vm.__patch`

```javascript
 vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
```

这个第一个参数是一个**真实DOM**，也就是我们的`<div id="app"></div>`第二个就是上面生产的Virtual DOM，第三个是false。

回到`patch`方法中，前面的一些逻辑先不用看，从这开始，这里有一大堆条件判断，我在代码里标识了我们目前的例子能走到的分支

```javascript
 if (isUndef(oldVnode)) { // 这个if走不到
	...
 } else {
   const isRealElement = isDef(oldVnode.nodeType) // 这里是true
   if (!isRealElement && sameVnode(oldVnode, vnode)) { // 这个if走不到
     ...
   } else {
     if (isRealElement) {
       if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) { // 走不到
         ...
       }
       if (isTrue(hydrating)) { // 走不到
           ...
       }
        // either not server-rendered, or hydration failed.
        // create an empty node and replace it
        oldVnode = emptyNodeAt(oldVnode) // 调用
      }
   }
```

这里`emptyNodeAt`在这个`patch`函数上面，作用是把真实DOM转化成`VNode`，第五个参数`eml`就是真实DOM，所以`oldVnode.elm`就可以访问到真实DOM

```javascript
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }
```

```javascript
const oldElm = oldVnode.elm // oldElm是真实DOM <div id="app">
const parentElm = nodeOps.parentNode(oldElm) // parentElm 也是真实DOM，<body>
```

接着往下走，就会调用`createElm`，

```javascript
createElm(
     vnode,
     insertedVnodeQueue,
     // extremely rare edge case: do not insert if old element is in a
     // leaving transition. Only happens when combining transition +
     // keep-alive + HOCs. (#4590)
     oldElm._leaveCb ? null : parentElm,
     nodeOps.nextSibling(oldElm)
)
```

这个方法很重要，作用就是把`VNode`挂载到真实DOM上，这个函数也是在`createPatchFunction`里面定义的

```javascript
function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
) {    
	...
}
```

我们直接看这边，这里是做一个检测，这个警告我们应该都不陌生，在没有注册组件的时候就在模板写了这个组件就会报这个错误。

```javascript
// createElm

if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          creatingElmInVPre++
        }
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }
    ...
```

之后就会调用`nodeOps.createElement`

```javascript
// createElm

vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
```

这个`nodeOps.createElement`在`platforms/web/runtime/node-ops.js`，其实就是对原生API的封装，很简单，就是创建并返回一个真实DOM

```javascript
export function createElement (tagName: string, vnode: VNode): Element {
  const elm = document.createElement(tagName)
  if (tagName !== 'select') {
    return elm
  }
  ...
  return elm
}
```

我们回到`createElm`函数，后面就是weex平台的逻辑，走不到，不用看，直接看这里，顾名思义，`createChildren`这个方法就是创建子节点

```javascript
// createElm

createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue) // 3-12 这里有一个插入insertVnodeQueue的调用，可以去看看
        }
        // 2-14 最终插入节点，注意这里插入顺序是先插入子，再插入父，可以看下这个函数
        insert(parentElm, vnode.elm, refElm)
```

`createChildren`的定义，其实也很简单，就是判断children是不是数组，这里的children其实就是我们上面讲过的经过`normalize`的`Hello Vue`节点，现在是一个一维数组。然后递归调用`createElm`，这是一种常用的深度优先的遍历算法，然后把当前的`vnode.elm`（`<div id="vue"></div>`)作为父容器的 DOM 节点占位符传给`createElm`。否则，如果当前`vnode.text`只是个原始类型的话，就直接调用`nodeOps.appendChild`进行插入。

```javascript
function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(children)
      }
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
  }
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610611369173-3d875059-50a5-4643-ad3c-12873b0b011d.png)

然后递归调用之后就又会调用这个`createChildren`就这样一层层地传入(我们的例子只会递归一次，因为只有一层深度的子节点），然后最终在`createElm`会调用`insert`方法把DOM插入到父节点中。因为是递归调用，子元素会优先调用 `insert`，所以整个 `vnode` 树节点的插入顺序是先子后父。直到最外层的节点插入到`<body>`中。来看一下 `insert` 方法，它的定义在 `src/core/vdom/patch.js` 上。

```javascript
function insert (parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
}
```

`insert`方法也很简单，就是调用`nodeOps`的一些方法把子节点插入父节点，他们的定义都在`platforms/web/runtime/node-ops.js`

```javascript
export function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function appendChild (node: Node, child: Node) {
  node.appendChild(child)
}
```

在 `createElm` 过程中，如果 `vnode` 节点不包含 `tag`，则它有可能是一个注释或者纯文本节点，可以直接插入到父元素中。在我们这个例子中，最内层就是一个文本 `vnode`，它的 `text` 值取的就是之前的 `this.message` 的值 `Hello Vue!`。

```javascript
else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else { // 我们的例子会走这里
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
```

`insert`结束后，我们的页面就出现了`Hello Vue`

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610594987712-d1ea2754-ea30-40f9-9b88-43a7654fa3a9.png)

然后最后`patch`方法返回了，这个`vnode.elm`就是已经插入了子节点的`<div id="vue">`

```javascript
return vnode.elm
```

## 总结

首先就是我们给`new Vue`传入了render函数，这个render函数在`vm._render`里面调用，render函数调用`createElement`，在`createElement`根据传入的参数创建`VNode`，并返回，返回的这个vnode其实就是`vm._update`的第一个参数，然后调用`vm._update`，里面又调用了`patch`，`patch`调用了`createElm`，在`createChildren`中递归调用`createElm`完成DOM的插入，然后先子后父，最终插入到body当中完成渲染

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610610680789-54871bf5-e3ec-4923-9431-c9811a081908.png)