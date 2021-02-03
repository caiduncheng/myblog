---
date: '2021-01-08'
title: 'Vue源码学习（六）：响应式原理'
tags: ['vue', 'javascript']
template: 'post'
thumbnail: vue.png
description: '前面讲了数据的渲染，但是都没介绍数据是如何变化的。数据驱动除了渲染DOM以外，还要在数据变化时触发DOM的更新。'
categories: FrontPage
---
前面讲了数据的渲染，但是都没介绍数据是如何变化的。数据驱动除了渲染DOM以外，还要在数据变化时触发DOM的更新。

看下下面这个例子

```javascript
<div id="app">
    {{ msg }}
	<button @click="change">click</button>
</div>

new Vue({
    el: '#app',
    data: {
    	message: 'Hello World!'
	},
  	methods: {
        changeMsg() {
          this.message = 'Hello!'
        }
  	}
})
```

当我们点击button修改`this.message`的手，我们发现视图上的`Hello World`变成了`Hello`了，我们接下来分析下Vue是怎么在我们修改数据后操作了DOM。

## Object.defineProperty

`Object.definePropery`会给一个对象添加一个新属性，或者修改一个对象的现有属性，然后返回这个对象。

[Object.defineProperty的定义](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

首先这个函数接受四个参数，第一个参数是要修改或添加属性的对象，第二个参数是要修改的属性的名称，第三个是属性描述符。其中第三个参数是关键，这个属性描述符有以下几种：

- **configurable**
- **enumerable**
- **value**
- **writable**
- **get**
- **set**

我们只关心`get`和`set`，`get`是一个函数，当你访问该属性时，就会调用这个函数。`set`也是一个函数，当属性被修改时，就会调用这个函数。

```javascript
var bValue = 38;

Object.defineProperty(o, "b", {
  get() { return bValue; },
  set(newValue) { bValue = newValue; },
  enumerable : true,
  configurable : true
});
```

一旦对象拥有了getter和setter，就可以认为这个对象是一个响应式对象，`Object.defineProperty`是`Vue`实现响应式对象的一个核心方法。

## 初始化

首先我们知道Vue初始化的时候会调用`initState`方法，`initState`会调用`initProps`和`initData`。`initProps`主要是初始化我们组件的`props`属性，然后在里面调用`defineReactive`就是把`props`变成响应式的

```javascript
defineReactive(props, key, value)
```

然后`initData`就是初始化我们组件的`data`，在里面会调用`observe`方法来观测`data`数据。

```js
 observe(data, true /* asRootData */)
```

## observe

响应式相关的代码都在`src/core/observer`目录下，`observe`方法在`index.js`中

```javascript
export function observe (value: any, asRootData: ?boolean): Observer | void {  
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value) // 4-5 看下Observer定义👆
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

参数`value`就是我们的`data`对象，`{ message: 'Hello World!'}`。首先会判断`value`是不是一个对象或者是`VNode`的一个实例，都不是的话就`return`

```javascript
if (!isObject(value) || value instanceof VNode) {
    return
}
```

判断我们的对象是否有`__ob__`属性有这个属性说明该对象是响应式的，直接给`ob`变量赋这个`__ob__`

```javascript
let ob: Observer | void
 if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
 }
```

否则就判断多个条件：

- **shouldObserve**为true，该值只能被`toggleObserving`改变，
- 非服务端渲染
- value是一个数组或者对象
- 对象是否可扩展(Object.isExtensible)
- 非vue实例

以上满足才会调用`new Observer(value)`

```javascript
else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
) {
    ob = new Observer(value)
}
```

## Observer

这个`Observer`类可以理解成"观察者"，也是定义在`index.js`中。调用`new Observer`的时候会执行构造器的逻辑：

```javascript
constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
```

`Dep`后面会介绍，我们来看下`def(value, '__ob__', this)`，实际上就是对`Object.defineProperty`的封装

```javascript
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}
```

`def(value, '__ob__', this)`就是给我们的对象添加`__ob__`这样一个属性，并且值就是当前`Observer`的一个实例，这样我们对同一个对象执行`observe`函数的时候判断对象有`__ob__`属性就可以直接返回`ob`。有个问题，为什么不直接`value.__ob__ = this` 而是要调用`def`呢？ 这个稍后会解答

接着判断我们的`value`是不是数组，是数组就调用`augment`，这个后面再介绍

```javascript
if (Array.isArray(value)) {
	const augment = hasProto
		? protoAugment
		: copyAugment
	augment(value, arrayMethods, arrayKeys)
	this.observeArray(value)
}
```

接着又调用了`observeArray`,这个函数是在`Observe`类定义的方法，其实就是遍历我们传进去的数字，然后对每个元素调用`observe`方法

```javascript
observeArray (*items*: *Array*<*any*>) {
  for (*let* i = 0, l = *items*.length; i < l; i++) {
   observe(*items*[i])
  }
 }
```

就我们这个例子而言，我们不会调用`observeArray`方法，而是会调用`walk`

```javascript
this.walk(value) // value就是我们的data对象
```

`walk`也是`Observer`实例的一个方法，遍历我们传入的对象，然后对每个属性调用`defineReactive`。这里就可以解答上面的`def`问题了，因为上面调用`def`的时候，没有传第四个参数，所以`__ob__`属性的`enumerable`为false，所以下面`walk`就不会遍历到`__ob__`，因为我们没有必要对`__ob__`属性调用`defineReactive`

```javascript
 walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]) 
    }
  }
```

那现在来看看`defineReactive`的实现，是在`observer/index.js`中

```javascript
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
)
...
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610697994368-6100411a-a1c0-4d9d-acb0-536343eb11de.png)

实例化一个`Dep`

```javascript
const dep = new Dep() 
```

拿到对象属性的定义

```javascript
const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }
```

尝试拿到属性原生的getter和setter

```javascript
const getter = property && property.get
const setter = property && property.set
```

getter和setter不存在并且传入的参数只有两个的情况下，直接把对象的属性值赋值给val

```javascript
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
```

如果某个属性的值还是个对象的话，就递归调用`observe`方法，这样就能处理嵌套的对象

```javascript
let childOb = !shallow && observe(val)
```

然后也是很关键的一步，把我们的对象的属性通过`Object.defineProperty`一个响应式的。什么是响应式的呢？当我们获取这个属性值的时候，会触发getter，设置的时候会触发setter。getter做了依赖收集，setter做了派发更新，这两个过程会分别介绍。经过遍历和递归，data的每个属性都会变成响应式的。

我们首次渲染其实就会触发getter了，就是在render的过程中就会访问我们定义的data，就会首次触发getter

```javascript
Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    Watcher,
    get: function reactiveGetter () { // getter
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) { //setter
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
```

## 依赖收集

上面我们说过`getter`函数完成了依赖收集的过程，我们来看下getter都做了什么。

首先判断有没有`getter`变量，如果有就调用，没有就直接返回`val`也就是属性的值，因为访问这个属性最终还是要返回一个值的，这个value就是最终要返回的值

```javascript
const value = getter ? getter.call(obj) : val
```

然后下面就是依赖收集的过程

```javascript
if (Dep.target) { // 当前的Watcher，同一时间只能有一个Watcher
	dep.depend()
    if (childOb) {
        childOb.dep.depend()
        if (Array.isArray(value)) {
	        dependArray(value)
        }
    }
}
```

我们来看下`Dep`这个类，在`observer/dep.js`，这个类主要是建立数据和Watcher之间的桥梁，然后`Dep.target`是一个全局的`Watcher`，是一个`Watcher`的实例，同一时间只能有一个全局`Watcher`。另外还有两个私有属性，`id`和`subs`。`id`就是每次实例化`uid`递增之后的值，`uid`从0开始。`subs`就是存储所有`Watcher`的一个数组，订阅了数据变化的`Watcher`会保存到`subs`这个数组中

```javascript
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
```

回到我们的`get`函数当中，首先会调用`dep.depend`，`dep.depend`会调用`Dep.target.addDep`，那`addDep`这个方法是`Watcher`的方法，我们来看一下这个方法，首先判断`newDepIds`有没有这个id，如果没有就给`newDepIds`和`newDeps`添加这个id，如果`depIds`也没有这个id的话，就调用`dep.addSub`把`this`传入，也就是这个`Watcher`实例

```javascript
addDep (dep: Dep) {
	const id = dep.id
    if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id)
        this.newDeps.push(dep)
        if (!this.depIds.has(id)) {
            dep.addSub(this)
        }
    }
}
```

`addSub`就把这个`Watcher`放进subs这个数组了，就相当于这个`Watcher`是这个数据的订阅者。这里可能会有点疑问，可以回顾一下我们在遍历我们的`data`的时候，会对每个`data`的属性调用`defineReactive`对吧，然后`defineReactive`又会实例化一个`Dep`，相当于每个属性都有一个dep实例。往dep的subs添加一个Watcher实例就相当于这个数据被这个Watcher订阅了。

```javascript
addSub (sub: Watcher) {
	this.subs.push(sub)
}
```

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610697404963-fd6094aa-0129-4ae0-bc7d-fb61056d5718.png)

这边做了个图来理解下这个过程

![image.png](https://cdn.nlark.com/yuque/0/2021/png/561995/1610697224291-6e2683ef-cd7a-4590-8406-068d6e448f02.png)

所以其实依赖收集实际上就是对`Watcher`的收集，依赖收集的目的是为了当这些数据发生变化，触发setter的时候，能知道应该去通知哪些订阅者去做相应的处理

## 派发更新

派发更新就是通知订阅者去更新数据，我们上面有说过getter完成了收集依赖的过程，那setter就负责完成对这些依赖派发更新。我们再来看下setter

```javascript
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
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
```

首先求值，就是修改前的值

```javascript
const value = getter ? getter.call(obj) : val
```

然后对比，如果新值旧值相等也就是这次修改没有任何变化，就直接返回

```javascript
  if (newVal === value || (newVal !== newVal && value !== value)) {
    return
  }
```

进行派发更新

```javascript
dep.notify()
```

我们看下`notify`的定义，在`observer/dep.js`，逻辑也很简单，就是遍历我subs，对subs里面的`Watcher`调用`update`方法

```javascript
class Dep {
    ...
    notify () {
        const subs = this.subs.slice()
        for (let i = 0, l = subs.length; i < l; i++) {
          subs[i].update()
        }
    }
}
```

看下`update`方法，对于`watcher`的不同状态，会执行不同的逻辑。前面两个条件都不会走到，对于组件数据的更新会调用`queueWatcher`

```js
class Watcher {
	...
    update() {
        if(this.computed) {
            ...
        } 
        else if (this.sync) {
            ...
        }
        else {
            queueWatcher(this)
        }
    }
}
```

`queueWatcher`定义在`observer/scheduler.js`,这个`queueWatcher`是一个队列的一个概念，先看一下`scheduler.js`中存储的一些全局变量

```js
const queue: Array<Watcher> = [] // watcher数组
const activatedChildren: Array<Component> = [] // 激活的children 
let has: { [key: number]: ?true } = {} // 判断能否重复添加
let circular: { [key: number]: number } = {} // 循环更新用的
let waiting = false // 标志位
let flushing = false // 标志位
let index = 0 // 当前Watcher的索引
```

然后来看下`queueWatcher`的定义，这里是一个队列的概念，Vue并不会每次数据改变都触发`watcher`回调，而是把这些`watcher`先添加到一个队列里

```javascript
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id // 拿到Watcher的唯一id
  if (has[id] == null) { 
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1     
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {        
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```

注意看下下面这个逻辑，为什么要这么做呢？假如说我们有好几个数据要更新，但他们都对应同一个Watcher，每个Watcher都会执行这样一次update的过程，执行多次update就执行多次`queueWatcher`，那执行多次`queueWatcher`的话对于同一个Watcher实际上只会push一次到queue中

```json
 if (has[id] == null) {
    has[id] = true
    if (!flushing) { // fulshing为false
      queue.push(watcher)
    }
    ...
 }    
```

然后下面这个逻辑会保证`nextTick(flushSchedulerQueue)`只会执行一次，这个`nextTick`后面会介绍，可以先理解为一个异步的过程。也就是下一个tick会执行这个`flushSchedulerQueue`

```js
 if (!waiting) {
    waiting = true
    if (process.env.NODE_ENV !== 'production' && !config.async) {
    	flushSchedulerQueue()
        return
    }
	nextTick(flushSchedulerQueue)
}
```

所以这个`queueWatcher`做的主要的事情就是把Watcher都push到`queue`里面，`flushSchedulerQueue`就是去遍历这个`queue`，然后，然后执行一些逻辑。``flushSchedulerQueue`的定义也在`observer/scheduler.js`

```js
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  flushing = true
  let watcher, id 
  queue.sort((a, b) => a.id - b.id)
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }
  const activatedQueue = activatedChildren.slice() // keep-alive 逻辑会执行
  const updatedQueue = queue.slice()

  resetSchedulerState()

  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}
```

这里会对`queue`里面的id进行从小到大的排序，为什么要从小到大排序？ 其实是因为有三种不同的场景（源码注释里也有介绍）

- 因为组件的更新是由父到子的，所以要保证父的Watcher在前面
- 当用户定义了一个`UserWatcher`，就是组件定义了watch属性或者调用了`this.$watch`都会创建`UserWatcher`,`UserWatcher`要先于渲染Watcher执行
- 当一个组件的销毁过程是在父组件的Watcher的回调中执行的时候，那子组件的Watcher就会被跳过

```javascript
queue.sort((a, b) => a.id - b.id)
```

然后接着就是一个循环，为什么这里要不断对`queue.length`求值，而不是把这个值缓存起来？为什么每一次循环都要对它求值呢？那是因为在循环的过程中，这个`queue`是有可能发生变化的。

```js
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }
```

每次循环都会取出`queue`里面的watcher，然后执行`watcher.run()`，这个`run`在`obesrver/watcher.js`会调用`this.getAndInvoke`方法，把回调作为参数传过去

```js
run() {
	if(this.active) {
		this.getAndInvoke(this.cb)
	}
}
```

`getAndInvoke`也在`watcher.js`。

首先通过`this.get()`去求值，也就是新的值，然后在if语句的条件里用这个如果旧的值和新的值不一样，或者新值是一个对象，或者`this.deep`为true才会执行。`this.user`就是UserWatcher，就是用户在组件定义的watch对象

```js
getAndInvoke (cb: Function) {
    const value = this.get()
    if(
    	value !== this.value ||
        isObject(value) ||
        this.deep
    ) {
        const oldValue = this.value
        this.value = value
        this.dirty = false
        if (this.user) {
            try {
                cb.call(this.vm, value, oldValue)
            } catch (e) {
                handleError(e, this.vm, `callback for watcher`)
            }
        }
    }
}
```

对于渲染Watcher而言，参数`cb`其实是一个空函数。因为渲染Watcher的参数为`noop`

```js
new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }
```

在执行`this.get`的时候就会执行`getter`

```js
get() {
	value = this.getter.call(vm, vm)
}
```

还记得吗？这个`getter`就是`updateComponent`，然后这个`updateComponent`又会执行我们的`vm._render`,`vm._update`方法去做渲染，这就是当我们去修改组件相关的响应式数据的时候，会触发组件重新渲染的原因。

在`flushSchedulerQueue`的循环结束以后，还有下面一些逻辑

```js
const activatedQueue = activatedChildren.slice() // keep-alive相关，这里先不讲
const updatedQueue = queue.slice() // keep-alive相关

resetSchedulerState() // 对全局的一些变量进行重置

// call component updated and activated hooks
callActivatedHooks(activatedQueue)
callUpdatedHooks(updatedQueue)
```

`callUpdatedHooks`就在`flushSchedulerQueue`下面，就是遍历我们的`queue`，如果是渲染Watcher就调用我们的updated钩子

```js
function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}
```

