---
title: React入门
template: post
date: '2020-08-02'
tags: ['react']
thumbnail: react.png
categories: FrontPage
description: React 是一个用于构建用户界面的 JAVASCRIPT 库,React 起源于 Facebook 的内部项目，用来架设 Instagram 的网站，并于 2013 年 5 月开源。
---

### 1. 准备工作

在开始学习react之前，需要具备以下知识点：

- 熟悉HTML、CSS
- 熟悉JavaScript基础知识
- 了解DOM的基础知识
- 熟悉ES6语法和特性
- 已经安装Node.js和npm

### 2. 什么是React?

- React是一个目前最受欢迎JavaScript库之一，在Github上有超过100k的stars
- React并不是一个框架
- React是一个由Facebook开源的项目
- React是用来构造前端的UI界面
- React是MVC应用中的视图层

React最重要的一个特点是你可以创建**组件**。组件就像是自定义、可复用的HTML片段一样，可以快速地开发出用户界面。React使用**state**和**props**来更有效率地处理和存储数据。

### 3. 安装和配置

### 3.1 静态HTML

这种方式并不是目前最常用的React使用方式，也不是本文章要使用的方式，使用这种方式不需要Node.js环境。

首先创建一个基础的`index.html`。在头部`<head>`标签里加载三个CDN资源：React, React DOM和Babel。然后在`<body>`标签里创建一个id为`root`的标签，以及一个`<script>`标签，我们将在这个标签里编写我们的JS代码。

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />

    <title>Hello React!</title>

    <script src="https://unpkg.com/react@^16/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@16.13.0/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/babel-standalone@6.26.0/babel.js"></script>
  </head>

  <body>
    <div id="root"></div>

    <script type="text/babel">
      // react代码
    </script>
  </body>
</html>
```

`root`元素是我们整个应用的入口，`root`是一个约定俗成的命名。`<script>`标签里的`text/babel`是使用`Babel`所必须添加的。

我们先用ES6的class语法来编写我们的第一个代码块，这里我们创建了一个叫`App`的组件

```javascript
class App extends React.Component {
    // ...
}
```

接着添加`render()`方法，也是在class组件里唯一必不可少的方法，用来渲染DOM节点

```javascript
class App extends React.Component {
    render() {
        return (
            //...
        )
    }
}
```

在`return`里，我们可以写一些简单的HTML元素。注意，这里我们我们不需要返回字符串，所以不要加引号。这种语法叫JSX，我们等下会具体进行分析。

```javascript
class App extends React.Component {
    render() {
        return <h1>Hello World!</h1>
    }
}
```

然后调用ReactDOM的`render`方法来渲染我们在`root`标签里创建的`App`组件

```javascript
ReactDOM.render(<App />, document.getElementById('root'))
```

下面是`index.html`的完整代码

```javascript
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />

    <title>Hello React!</title>

    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/babel-standalone@6.26.0/babel.js"></script>
  </head>

  <body>
    <div id="root"></div>

    <script type="text/babel">
      class App extends React.Component {
        render() {
          return <h1>Hello world!</h1>
        }
      }

      ReactDOM.render(<App />, document.getElementById('root'))
    </script>
  </body>
</html>
```

在浏览器里打开`index.html`就可以看到`h1`标签已经被渲染进了DOM里。

<img src="https://upload-images.jianshu.io/upload_images/22390395-d2d8c3e69baac901.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240" style="zoom:33%;" />

第一个方式就讲到这，我们接下来介绍第二种方法

### 3.2 Create React App

上面第一种方法虽然使用起来很简单，但要加载各种库的时间太长，效率不高，而且这种写法难以维护。

Facebook团队开发了一个工具叫Create React App，一个用来创建已经预先配置好的环境来搭建你的React应用。这个工具会创建一个在线的开发服务器，使用`Webpack`来自动编译React、JSX，ES6，自动为css属性添加前缀，并使用ESLint来测试和警告代码里的错误，规范代码书写。

要使用`create-react-app`，首先要全局安装它

```
npm install create-react-app -g
```

安装好以后，在你的项目目录下运行

```
create-react-app react-tutorial
```

目录下就会为你创建好开发React应用所需要的各种配置，进入`react-tutorial`并运行

```
cd react-tutorial
npm run start
```

之后服务会在`localhost:3000`运行，浏览器会自动弹出并运行你的应用

![image.png](https://upload-images.jianshu.io/upload_images/22390395-ab93d2e59d36b722.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看下你的项目目录结构，你可以看到`/public`，`/src`，`node_modules`,`.gitignore`,`README.md`和`package.json`

在`/public`目录下，有一个非常重要的文件`index.html`，与我们之前创建的静态文件`index.html`很相似，只有一个`root`元素。不过不一样的是头部文件里没有载入各种外部文件，`/src`目录将会包含我们所有需要的代码。

在`/src`目录里我们只保留`index.css`和`index.js`，其他文件全部删除。

在`index.js`里，我们引入了React、ReactDOM、以及index.css

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
```

然后我们在这个文件里再创建一次`App`组件，这次我们用一个`div`标签来包裹`h1`。并且给`div`加一个类名。我们发现我们给`<div>`加类名用的是`className`而不是`class`这是因为我们实际写的是JSX而不是HTML

```javascript
class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Hello, React!</h1>
      </div>
    )
  }
}
```

然后进行渲染

```javascript
ReactDOM.render(<App />, document.getElementById('root'))
```

现在我们的`index.js`长这个样子

```javascript
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Hello, React!</h1>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
```

回到浏览器打开`localhost:3000`你就会看到**Hello, React!**

### 4 JSX: JavaScript + XML

我们在前面的代码中使用了类似HTML的写法，但其实准确来说这并不是HTML，而是**JSX**，表示JavaScript XML

我们可以将JSX赋给一个变量

```javascript
const heading = <h1 className="site-heading">Hello, React</h1>
```

在React项目中，使用JSX并不是必须的，它的原理其实是在底层为你运行了`createElement`方法，它包含标签名，一个对象，子组件。以下代码会输出和上面代码一样的内容。

```javascript
const heading = React.createElement('h1', { className: 'site-heading' }, 'Hello, React!')
```

JSX其实更接近JavaScript而不是HTML，在编写JSX的时候，有一些关键性的差异

- 添加css类名时，使用`className`而不是`class`，因为`class`在JavaScript里是保留字段
- 属性和方法在JSX里要使用驼峰命名法，`onclick`应该写成`onClick`
- 使用 / 来创建自闭合标签比如 `<img />`

JavaScript表达式可以用花括号{}来嵌进JSX里，包括变量，函数，属性

```javascript
const name = 'John'
const heading =  <h1>Hello, {name}</h1>
```

### 5. 组件

目前为止，我们创建了一个组件 - `App`组件。React的所有东西几乎都由组件组成，组件可以分为两种类型：类组件和函数组件。

大多数React应用都包含多个小的组件，然后所有东西最终都会载入到`App`组件中。

我们改进下上面的代码，从`index.js`里移除`App`类

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

ReactDOM.render(<App />, document.getElementById('root'))
```

然后创建一个新的文件`App.js`，把类组件放进这里

```javascript
import React, { Component } from 'react'

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Hello, React!</h1>
      </div>
    )
  }
}

export default App
```

我们把`App`组件分离出来并导入进了`index.js`。这样做并不是必须的，但将各个组件分离出去方放进一个单独的文件中是一个良好的编程习惯，并且在项目不断迭代变更的时候，这样也更易于维护。

### 5.1类组件

我们来创建另一个组件，一张表格。创建`Table.js`，然后编写代码：

```javascript
import React, { Component } from 'react'

class Table extends Component {
  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Job</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Charlie</td>
            <td>Janitor</td>
          </tr>
          <tr>
            <td>Mac</td>
            <td>Bouncer</td>
          </tr>
          <tr>
            <td>Dee</td>
            <td>Aspiring actress</td>
          </tr>
          <tr>
            <td>Dennis</td>
            <td>Bartender</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export default Table
```

在`App.js`里导入`Table.js`

```javascript
import Table from './Table'
```

将`App.js`的render方法里将` <h1>Hello, React!</h1>`替换为`<Table />`，然后再看下浏览器，这时表格已经渲染出来了。

这里我已经把自定义组件介绍完了，如上面的Table组件，我们可以重复地利用这个组件，减少了维护成本和大量重复代码。

### 5.2函数组件

组件的另一种形式是函数组件，顾名思义，该组件本质上是一个函数。这种组件不使用关键字`class`来声明一个组件。我们来为`Table`组件创建两个函数组件——一个表头和一个表格主体。

我这里使用ES6箭头函数来创建函数组件，首先创建表头

```javascript
const TableHeader = () => (
    return (
    	<thead>
    		<tr>
    			<th>Name</th>
    			<th>Job</th>
   			</tr>
	)
)
```

表格主体

```javascript
const TableBody = () => {
  return (
    <tbody>
      <tr>
        <td>Charlie</td>
        <td>Janitor</td>
      </tr>
      <tr>
        <td>Mac</td>
        <td>Bouncer</td>
      </tr>
      <tr>
        <td>Dee</td>
        <td>Aspiring actress</td>
      </tr>
      <tr>
        <td>Dennis</td>
        <td>Bartender</td>
      </tr>
    </tbody>
  )
}
```

这里我把这两个组件都放在同一个文件里，然后都被`Table`组件使用

```javascript
const TableHeader = () => { ... }
const TableBody = () => { ... }

class Table extends Component {
  render() {
    return (
      <table>
        <TableHeader />
        <TableBody />
      </table>
    )
  }
}
```

这样一切应该都和抽离组件之前的显示结果相同。注意，类组件应该包含一个`render()`方法，并且`return`只能返回一个根元素

### 6. Props

现在我们有了一个`Table`组件， 但数据目前都是被写死的。每个组件都有一个属性，叫`props`，它负责处理数据，传递数据。

首先我们把`TableBody`组件的内容清空

```javascript
const TableBody = () => {
  return <tbody />
}
```

在`App.js`的`render()`方法里，创建一个数组，里面包含人物数据

```javascript
class App extends Component {
  render() {
    const characters = [
      {
        name: 'Charlie',
        job: 'Janitor',
      },
      {
        name: 'Mac',
        job: 'Bouncer',
      },
      {
        name: 'Dee',
        job: 'Aspring actress',
      },
      {
        name: 'Dennis',
        job: 'Bartender',
      },
    ]

    return (
      <div className="container">
        <Table />
      </div>
    )
  }
}
```

现在我们要把数据通过属性传给子组件（`Table`组件），就像我们使用“data-”属性一样。我们可以给属性任意取一个名字除了保留字段以外的名字。在这里，我用`characterData`。我要把`characters`变量传过去，所以要在它周围写上花括号。

```javascript
return (
    <div className="container">
    	<Table characterData={characters} />
    </div>
)
```

现在数据传过去了，开始在Table组件干活

```java
// src/Table.js
class Table extends Component {
    render() {
        const { characterData } = this.props // 在这里拿到了传过来的数据
         
        return (
            <table>
            	<TableHeader />
            	<TableBody characterData={characterData} />
            </table>
        )
    }
}
```

我们可以通过`this.props`对象里获取到我们的数据，这里我只传递了一个数据，所以用`this.props.characterData`来获取数据。

`Table`组件还包含了两个组件，我要再次把从`App`传过来的数据通过`props`传递给`TableBody`

目前，`TableBody`只有一个自闭合标签

```javascript
const TableBody = () => {
    return <tbody />
}
```

我们要把props写进参数里，然后通`map`方法去遍历`characterData`，返回数组中每一个对象来构成每一行表格行。这些数据会保存在`rows`变量中。

```javascript
const TableBody = props = {
    const rows = props.characterData.map((row, index) => {
    	return (
            <tr key={index}>
            	<td>{row.name}</td>
				<td>{row.job}</td>
            </tr>
        )  
    })
    
    return <tbody>{rows}</tbody>
}
```

上面这种用map来循环渲染一组元素，在react中非常常见，相当于vue的`v-if`。

props是传递数据给组件的一种有效方式，然而，组件无法改变props——它们是只读的。

### 7. State

目前，我们使用数组变量来保存我们的人物数据，然后再通过props传递给其他组件。但如果我们想要删除其中一个数据怎么办？这时轮到`State`登场了，有了state，我们就可以通过组件更新组件的私有变量。

你可以把State想象成需要被暂时存储和修改但不需要保存在数据库中的变量，比如说，在下单前往购物车中添加或从购物中删除物品。

我们先创建一个state对象

```javascript
class App exnteds Component {
    state = {
        characters: [
            {
                name: 'Charlie',
                // 和上面的数据一样
            }
        ]
    }
}
```

现在我们的数据都已经保存在了我们的state中了，为了实现删除功能，我们在`App`组件中添加`removeCharacter`方法。

我们用`this.state.characters`来获取数据，用内置方法`this.setState()`来更新数据，根据我们传入给`removeCharacter`的参数`index`来对数组进行过滤，返回过滤后的数组，也就是不包含。

```javascript
removeCharacter = index => {
    const { characters } = this.state
    
    this.setState({
        characters: characters.filter((character, i) => {
            return i !== index
        })
    })
}
```

然后通过`prop`把它传给`Table`，再传给`TableBody`。在`TableBody`里，我们可以看到我们在`App`里定义的`removeCharacter`的index就是从这里来的，通过`onClick`点击事件来获取相应的index，达到删除对应行的数据的目的。

```jsx
<tr key={index}>
  <td>{row.name}</td>
  <td>{row.job}</td>
  <td>
    <button onClick={() => props.removeCharacter(index)}>Delete</button>
  </td>
</tr>
```

### 提交表单

前面我们可以在state里存储数据，也可以删除数据，接下来是如何添加新的数据。

既然要添加新的数据，把`characters`的初始数据先清空掉，从一个空数组开始。

```javascript
class App extends Component {
  state = {
    characters: [],
  }
}
```

我们在`Form.js`里创建一个新的组件`Form`，给`Form`组件的state设一些初始值。

```javascript
import React, { Component } from 'react'

class Form extends Component {
  initialState = {
    name: '',
    job: '',
  }

  state = this.initialState
}
```

我们的目的是网页上的表单的值改变的话，state相对应的值也要跟着改变，然后当我们点击提交按钮，会把数据传给`App`组件，然后去更新`Table`。

首先，创建一个能在每次输入框改变时调用的函数。`event`包含了输入框的值和id。

```javascript
handleChange = event => {
  const { name, value } = event.target

  this.setState({
    [name]: value,
  })
}
```

在`render`函数里，我们要从state中获取到`name`和`job`，然后将它们绑定到表单中相对应的输入框，将上面写的`handleChange`函数绑定到输入框的onChange属性中。

```javascript
render() {
  const { name, job } = this.state;

  return (
    <form>
      <label htmlFor="name">Name</label>
      <input
        type="text"
        name="name"
        id="name"
        value={name}
        onChange={this.handleChange} />
      <label htmlFor="job">Job</label>
      <input
        type="text"
        name="job"
        id="job"
        value={job}
        onChange={this.handleChange} />
    </form>
  );
}

export default Form;
```

在`App.js`中，在表格底下渲染`Form`组件

```javascript
import Form from './Form';
```

```javascript
return (
  <div className="container">
    <Table characterData={characters} removeCharacter={this.removeCharacter} />
    <Form />
  </div>
)
```

最后一步就是提交表单，然后对父组件更新状态。在`App`组件创建一个函数`handleSubmit`

```javascript
handleSubmit = character => {
  this.setState({ characters: [...this.state.characters, character] })
}
```

把上面这个函数传给`Form`组件

```html
<Form handleSubmit={this.handleSubmit} />
```

在`Form`组件中，创建`submitForm`函数，该函数会调用`handleSubmit`，把表单内容作为character参数传递过去。然后把表单内容重置为初始值。

```javascript
submitForm = () => {
  this.props.handleSubmit(this.state)
  this.setState(this.initialState)
}
```

最后，添加提交表单的按钮。

```javascript
<input type="button" value="Submit" onClick={this.submitForm} />
```

这样就用react完成了我们的第一个应用！