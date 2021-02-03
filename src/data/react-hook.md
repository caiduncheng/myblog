---
title: 'React Hooks入门'
tags: ['react']
date: '2020-05-25'
template: 'post'
thumbnail: 'react.png'
categories: 'FrontPage'
description: 2019 年 2 月发布的 React 16.8 正式引入了 hook 的功能。它使得 `function` 组件也像 `class` 组件一样能维护状态，所有的组件都可以写成函数的形式，比起原有的以 class 的多个方法来维护组件生命周期的方式，简化了代码，也基本消除了因为 `this` 绑定的问题造成的难以发现的 bug。
---
### react hook 入门

>2019 年 2 月发布的 React 16.8 正式引入了 hook 的功能。它使得 `function` 组件也像 `class` 组件一样能维护状态，所有的组件都可以写成函数的形式，比起原有的以 class 的多个方法来维护组件生命周期的方式，简化了代码，也基本消除了因为 `this` 绑定的问题造成的难以发现的 bug。

#### 用法

官方demo，看起来也没什么高级的地方，就是简洁了一些吗。。。

```jsx
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

这个例子很简单，就是定义了一个`count`变量，点击`button`加一，同时视图也要做相应的变化，从这我们就可以看出这是一个有状态的组件，我们知道，如果使用纯的`Function Component `是实现不了的。用`Class Component`等价实现。

```jsx
class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <div>
        <p>You clicked {this.state.count} times</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Click me
        </button>
      </div>
    );
  }
}
```

说真的，确实简洁了不少，除了简洁就没有其他好处了吗？不急，且听我慢慢揭开。

#### [useState](https://react.docschina.org/docs/hooks-state.html)

`useState`应该是使用`hooks`时，最经常使用到的了，他的作用有点类似于`Clasee Component`中的`state`。

**用法**

```javascript
// 使用了es6的数组解构赋值
let [你的变量， 修改该变量的方法名] = useState(初始值)

// 修改变量这样做
修改该变量的方法名(想修改成的值)
// 对应state
this.setSate({
  你的变量: 想修改成的值
})
```

这其中的原理我们暂不探讨，毕竟是入门嘛。。。

#### [useEffect](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-effect.html)

`useEffect`也是hook中一个很重要的方法，它可以让你在函数组件中执行副作用操作。

> 如果你熟悉 React class 的生命周期函数，你可以把 `useEffect` Hook 看做`componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合。
> **componentDidMount**：该方法会在组件已经被渲染到 DOM 中后运行，对应于页面生命周期的`DOMContentLoaded`，此时文档已被加载和解析完成，但是像是 `img` 和样式表等外部资源可能并没有下载完毕。
>
> **componentDidUpdate**：会在组件更新后会被立即调用。首次渲染不会执行此方法。
>
> **componentWillUnmount**：会在组件卸载及销毁之前直接调用。在此方法中执行必要的清理操作，例如，清除 timer，取消网络请求或清除在 componentDidMount() 中创建的订阅等。

接下来写个例子来说明下`useEffect`为什么可以看做这三种方法的组合。

待做.........

#### [useRef](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-reference.html#useref)

**用法**

```javascript
const refContainer = useRef(initialValue);
```

我们在父组件，有时会出现需要拿到子组件的某个Dom对象，`useRef`就是为此而生的。

放一个官网例子:

```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` 指向已挂载到 DOM 上的文本输入元素
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

`inputEl`就是一个dom实例，但不推荐这种直接操作dom元素的方法。

#### [useImperativeHandle](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-reference.html#useimperativehandle)

**用法**

```javascript
useImperativeHandle(ref, createHandle, [deps])
```

有时你可能需要去调用子组件的一个方法，比如：我有一个表单页面，你将表单填写及逻辑封装在一个组件上。在你主页面点击提交的时候你希望你能拿到表单数据，这时候我们要怎么通知子组件把数据传给我们呢？(我是没其他方法)，所以只能在父组件直接操作子组件的提交数据方法了。`useImperativeHandle`就能帮上这个忙，不多说，举个例子：

```jsx
// 子组件
import React, { useState, useImperativeHandle, forwardRef } from "react";

function Child(props, ref) {
    const [value, setValue] = useState("");
	const inputChange = e => {
		setValue(e.target.value);
	};
	useImperativeHandle(ref, () => {
		return {
            value: value
        }
	});
	return <input value={value} onChange={inputChange}></input>;
}

Child = forwardRef(Child);

export default Child;
```

```jsx
import React, { useState, useRef } from "react";
import Child from "./child";

function App() {
	const inputEl = useRef(null);
	const onButtonClick = () => {
    // 可以在input.current拿到子组件暴露出来的属性或者方法
		console.log(inputEl.current.value);
	};
	return (
		<>
			<Child ref={inputEl}></Child>
			<button onClick={onButtonClick}>提交</button>
		</>
	);
}

export default App;
```

#### [自定义hook](https://react.docschina.org/docs/hooks-custom.html)

有时候我们可能会想在不同组件中复用一些有状态的逻辑，写两遍肯定不是我们的风格，在`class component`中我们可以通过高阶来实现，在`hook`中我们也可以通过自定义hook来实现。下面用一个计数的方法来作为例子：

定义一个自定义的hook

```javascript
import { useState } from "@tarojs/taro";

// 函数名必须以use开头,规范
function useCounter(initCount) {
  const [count, setCount] = useState(initCount);
  const decrease = () => {
    setCount(count - 1);
  };
  const increase = () => {
    setCount(count + 1)
  };
  return [count, decrease, increase];
}

export default useCounter;

```

使用自定义hook

```javascript
import { View } from "@tarojs/components";
import useCounter from "./counter";
import "./index.scss";

export default () => {
  const [count, decrease, increase] = useCounter(5);
  return <View>
    <View className="count">{count}</View>
    <View className="decrease" onClick={decrease}>-</View>
    <View className="increase" onClick={increase}>+</View>
  </View>;
};
```

可以发现，我们点击加号页面的数字会跟着加1，点击减号减1，说明是一个有状态的组件。

#### 使用hooks的优点

**1.不用关系this的指向了**

在`class component`，要在函数中使用`this`要这样使用

```jsx
// 方法一，在构造函数中绑定this
class Test extends React.Component {
  constructor(props) {
    super(props);
    // 为了在回调中使用 `this`，这个绑定是必不可少的
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log(this)
  }
}

// 方法二，使用箭头函数
class Test extends React.Component {
  constructor(props) {
    super(props);
    // 为了在回调中使用 `this`，这个绑定是必不可少的
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = () => {
		console.log(this)
  }
}
```

在`react hooks`中就没这么麻烦了

```jsx
function Test () {
  handleClick = () => {
		console.log(this)
  }
}
```

**2. 更容易复用代码**

这点应该是`react hooks`最大的优点，它通过自定义hooks来复用状态，从而解决了类组件有些时候难以复用逻辑的问题。附网上一个例子：

比如A页面与B页面都有一个登录状态需要同步，在原先我们的做法需要主动去关注状态与渲染之间的关系：

```jsx
class A extends Component {
  state = {
    isLogin: getLoginState()
  }
  componenetDidMount() {
    LoginManager.on('status', (status) => { this.setState({isLogin: status})})
  }
  render() {
    return {this.state.isLogin ? <span>A</span> : null }
  }
}

class B extends Component {
  state = {
    isLogin: getLoginState()
  }
  componenetDidMount() {
    LoginManager.on('status', (status) => { this.setState({isLogin: status})})
  }
  render() {
    return {this.state.isLogin ? <span>B</span> : null }
  }
}
```

可以明显的察觉到两个页面为了做登录状态同步的事情，感觉 80% 的代码都是冗余重复的，如果使用 Hooks 就是完全不同的情形：

```jsx
function useLogin(){
  const [isLogin, setLogin] = useState(getLoginState());
  LoginManager.on('status', (status) => { setLogin(status)});
  return isLogin;
}

function A() {
  const isLogin = useLogin();
  return {isLogin ? <span>A</span> : null }
}

function B() {
  const isLogin = useLogin();
  return {isLogin ? <span>B</span> : null }
}
```

  我自己用下来事没太大感觉，不懂是不是还没遇到场景，还是思考不够深入。

**3.陷入标签嵌套地狱的情形**

比如下面用到 Context 的场景就非常典型，看着眼花缭乱。在数据同步场景里，因为需要通知更新所有引用数据的地方，所以通过 `Context.Consumer` ，使用到越多的 `Context` 就会导致嵌套越多的层级，这简直是噩梦。

使用`class component`获取数据

```jsx
<ThemeContext.Consumer>
  {theme => (
    <LanguageContext.Consumer>
      {language => (
        <div>
          theme: {theme},language: {language}
        </div>
      )}
    </LanguageContext.Consumer>
  )}
</ThemeContext.Consumer>
```

使用`react hook`获取数据

```jsx
const theme = useContext(ThemeContext);
const language = useContext(LanguageContext);
return (
  <div>
    theme: {theme},language: {language}
  </div>
);
```

一样的效果，但是`hook`实现会是代码更加扁平化，也更简洁。

**4.  代码简洁**

这个就没啥好在举例了



### 进阶

**1.每一次渲染都会有自己的 Props and State**

我们来看一个计数器组件`Counter`

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

我们的组件第一次渲染的时候，从`useState()`拿到`count`的初始值`0`。当我们调用`setCount(1)`，React会再次渲染组件，这一次`count`是`1`。当我们更新状态的时候，React会重新渲染组件。每一次渲染都能拿到独立的`count` 状态，这个状态值是函数中的一个常量。

```jsx
<p>You clicked {count} times</p>
```

**它仅仅只是在渲染输出中插入了count这个数字。**这个数字由React提供。当`setCount`的时候，React会带着一个不同的`count`值再次调用组件。然后，React会更新DOM以保持和渲染输出一致。

这里关键的点在于任意一次渲染中的`count`常量都不会随着时间改变。渲染输出会变是因为我们的组件被一次次调用，而每一次调用引起的渲染中，它包含的`count`值独立于其他渲染。

**2.每一次渲染都有它自己的事件处理函数**

到目前为止一切都还好。那么事件处理函数呢？

看下面的这个例子。它在三秒后会alert点击次数`count`：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  function handleAlertClick() {   
    setTimeout(() => {      
      alert('You clicked on: ' + count);    
    }, 3000);  
  }
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      <button onClick={handleAlertClick}> Show alert</button>
    </div>
  );
}
```

如果按照下面的步骤去操作：

- **点击增加**counter到3
- **点击一下** “Show alert”
- **点击增加** counter到5并且在定时器回调触发前完成

`alert`会弹出3，这是因为每一次渲染都有一个“新版本”的`handleAlertClick`。每一个版本的`handleAlertClick`“记住” 了它自己的 `count`。

**3.hooks每次set整个组件都会被重新渲染，为什么更新后，上一次的state值还在**

比如：

```js
const [name, setName] = useState("Mary");
const [age, setAge] = useState(20);

const onClick = () => {
	setAge(25);
}

useEffect(() => {
  setName("Linda");
}, [])
```

调用了`onClick`组件重新渲染后，`name`的值还是`Linda`，不是应该重置吗？？

这里我们了解下 `useState` 的工作原理，看如下 `useState` 实现原理的示例代码，引擎通过代码上 `useState` 的执行顺序在内部维护一个 `stateIndex` 来识别当前是哪一个 `state`，并且只在第一次 `render` 时的才接受 `initState`,  重新渲染的时候从内部维护 `state` 存储器中获取上一次的 `state` 值。

```jsx
let stateIndex = 0;
let currentComponentInstance = null;
let isComponentDidMount = false;

function useState(initState) {
  const index = ++stateIndex;
  const privateStateStore = currentComponentInstance._state;
  if (!isComponentDidMount) {
    privateStateStore[index] = initState;
  }

  // 示例代码只考虑简单的数据类型
  const stateUpdater = (state) => privateStateStore[index] = state;

  const [privateStateStore[index], stateUpdater];
}
```

### 参考文献

[useEffect 完整指南](https://overreacted.io/zh-hans/how-does-the-development-mode-work/)

[议 Function Component 与 Hooks](https://fed.taobao.org/blog/taofed/do71ct/hooks-and-function-component/?spm=taofed.blogs.blog-list.3.76ef5ac8GsOTU6)

