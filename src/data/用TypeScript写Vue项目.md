---
title: '用TypeScript写Vue项目'
template: 'post'
tags: ['typescript', 'vue']
date: '2020-10-05'
thumbnail: 'typescript.png'
---

### 开始

首先使用`vue-cli`创建一个新的Vue项目

```
vue create typescript-vue
```

然后选择`manually select features`，选择如下配置

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/vue-typescript-app-configuration%20%281%29.png" />

等待配置完成，然后启动项目

```
cd typescript-vue
npm run serve
```

打开浏览器，输入localhost:8080，就可以看到启动的项目了

在这篇文章里，将在以下几个方面学习如何用TypeScript写一个Vue项目

1. 类组件
2. Data, props, computed, methods, watch, 以及emit
3. 生命周期钩子
4. 混入函数
5. Vuex

### 类组件

```javascript
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component
export default class HelloWorld extends Vue {
}
</script>

```

这段代码相当于以下JS代码

```js
<script>
   export default {
		name: 'HelloWorld'
   }
</script>
```

为了使用TypeScript，要给`<script>`标签的`lang`属性设置为`ts`

```javascript
<script lang="ts"></script>
```

### 引入组件

要在组件中引入组件，就要在`@Component`装饰器里写要注册的组件，如下

```javascript
<template>
  <div class="main">
    <Home />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Home from '@/components/Home.vue'
@Component({
  components: {
    Home
  }
})
export default class HelloWorld extends Vue {
}
</script>
```

相当于以下JS代码：

```javascript
<template>
  <div class="main">
    <Home />
  </div>
</template>
<script>
import Project from '@/components/Project.vue'
export default {
  name: 'HelloWorld',
  components: {
    Home
  }
})
```

### Data, props, computed, methods, watch和emit

### Data

要使用`Data`属性，我们可以直接声明成类变量

```javascript
@Component
export default class HelloWorld extends Vue {
    private msg: string = 'hello world'
	private list: Array<object> = [
        {
            name: 'john',
            age: 18
        }
    ]
}
```

等同于以下JS代码：

```javascript
export default {
    data() {
        return {
            msg: 'hello world',
            list: [
                {
                    name: 'john',
                    age: 18
                }
            ]
        }
    }
}
```

### Props

至于`Props`，可以在组件中使用`Props`装饰器。还可以给props添加额外的属性，像`required`,`default`, `type`。先从`vue-property-decorator`中引入`Prop`装饰器，然后像以下方式书写。

```javascript
export default Class HelloWorld extends Vue {
  @Prop({default: 'John'}) readonly name!: string  
  @Prop(String) readonly address!: string
  @Prop({required: false, type: String, default: 'Developer'}) readonly job!: string
}
```

### Computed

在TypeScript中，computed属性要在函数名前面加上`get`关键词。

```javascript
export default class HelloWorld extends Vue {
    get fullName(): string {
        return this.first + ' ' + this.last
    }
}
```

JS代码：

```javascript
export default {
    fullName() {
        return this.first + ' ' + this.last
    }
}
```

包含`getters`和`setters`的computed属性

```javascript
export default class HelloWorld extends Vue {
    get fullName(): string {
        return this.first + ' ' + this.last
    }
	set fullName(val: string): string {
        let names = val.split(' ')
        this.first = names[0]
        this.lastt = names[names.length - 1]
    }
}
```

上面代码相当于下面JS代码

```javascript
fullName: {
  get: function () {
    return this.first + ' ' + this.last
  },
  set: function (newValue) {
    let names = newValue.split(' ')
    this.first = names[0]
    this.last = names[names.length - 1]
  }
}
```

### Methods

TypeScript中的method，就像类一样，也有可选的修饰符

```typescript
export default class HelloWorld extends Vue {
    public clickMe(): void {
        console.log('clicked')
    }
}
```

JS代码：

```javascript
export default {
    methods: {
        clickMe() {
            consoe.log('clicked')
        }
    }
}
```

### watch

watch在用TS书写时，和用JS书写还是有比较大的区别的，在JS中，watch一般都这么写：

```javascript
watch: {
    name: function(newVal) {
      //...
    }
}
```

或者另一种比较少用的方式

```javascript
watch: {
    name: {
        handler: 'nameChanged'
    }
},
methods: {
	nameChanged (newVal) {
        //...
    }
}
```

然而TS版本的写法跟第二种（上面的）比较类似。在TS中，我们用`@Watch`装饰器，并把要监视的变量以参数的形式传给装饰器。

```javascript
@Watch('name')
nameChanged(newVal: string) {
	this.name = newVal
}
```

也可以设置`immediate`和`deep`属性

```javascript
@Watch('project', {
    immediate: true, deep: true
})
nameChanged(newVal: string, oldVal, string) {
    //...
}
```

上面等价的JS代码是

```java
watch: {
    person: {
        handler: 'nameChanged',
        immediate: true,
        deep: true
    }
}
methods: {
    nameChanged(newVal, oldVal) {
        // ...
    }
}
```

### Emit

要从子组件emit一个方法给父组件，使用`@Emit`装饰器

```javascript
@Emit()
addCount(n: number) {
    this.count += n
}
@Emit('resetData')
resetCount() {
    this.count = 0
}
```

在第一个例子中，因为`@Emit`装饰器里没有参数，所以函数名`addCount`会被转化成`add-count`。

第二个例子中，传了参数`resetData`,所以emit的事件名称就是`resetData`

这里借助以下谷歌浏览器的插件Vue开发者工具来看一下

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/emit2.png" />

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/emit.png" />

### 生命周期函数

TS版本的生命周期函数基本和JS版本一致，因为在函数中不需要接受参数也不需要返回数据。

```javascript
export default class HelloWorld extends Vue {
    mounted() {
        // ...
    }
    beforeUpate() {
        
    }
}
```

JS代码

```javascript
export default {
    mounted() {
        
    }
    beforeUpdate() {
        
    }
}
```

### 混入

首先在项目中创建一个文件`mixin.ts`，包含一个表示项目名称的变量和更新项目名称的方法

```javascript
import { Component, Vue } from 'vue-property-decorator'
@Component
class ProjectMixin extends Vue {
	public projName: string = 'My Project'
	public setProjName(newVal: string): void {
        this.projName = newVal
    }
}
export default ProjectMixin
```

JS代码

```javascript
export default {
  data() {
    return {
      projName: 'My project'
    }
  },
  methods: {
    setProjName(newVal) {
      this.projName = newVal
    }
  }
}
```

要在组件中使用混入函数的话，我们需要导入从依赖`vue-property-decorator`和我们刚才创建的混入，然后写下面的代码

```javascript
<template>
  <div class="project-detail">
    {{ projectDetail }}
  </div>
</template>
<script lang="ts">
import { Component, Vue, Mixins } from 'vue-property-decorator'
import ProjectMixin from '@/mixins/ProjectMixin'
@Component
export default class Project extends Mixins(ProjectMixin) {
  get projectDetail(): string {
    return this.projName
  }
}
</script>
```

等价的JS代码

```javascript
<template>
  <div class="project-detail">
    {{ projectDetail }}
  </div>
</template>
<script>
import ProjectMixin from '@/mixins/ProjectMixin'
export default {
  mixins: [ ProjectMixin ],
  computed: {
    projectDetail() {
      return this.projName
    }
  }
}
</script>
```

### Vuex

要在Vuex中用TS，首先安装两个依赖

```
npm install vuex-module-decorators -D
npm install vuex-class -D
```

在`store`文件夹里，我们创建一个`module`文件夹来存放我们不同模块的store

在`module`文件夹底下创建一个叫`user.ts`的文件，来管理用户状态

```javascript
// user.ts
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
@Module({ namespaced: true })
class User extends VuexModule {
  public name: string = ''
  get nameUpperCase() {
    return this.name.toUpperCase()
  }
  @Mutation
  public setName(newName: string): void {
    this.name = newName
  }
  @Action
  public updateName(newName: string): void {
    this.context.commit('setName', newName)
  }
}
export default User
```

`vuex-module-decorators`为`Module`、`Mutation`和 `Actions`提供了装饰器。`state`变量可以直接声明，就像类变量一样。在`mutations`和`actions`的函数中不需要用`state`和`context`作为第一个参数，我们下载的依赖库会去处理它们。

下面是等价的JS代码

```javascript
export default {
  namespaced: true,
  state: {
    name: ''
  },
  mutations: {
    setName(state, newName) {
      state.name = newName
    }
  },
  actions: {
    updateName(context, newName) {
      context.commit('setName', newName)
    }
  }
}
```

在`store`文件夹底下，我们需要创建`index.ts`文件来初始化`vuex`和注册`module`

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import User from '@/store/modules/user'
Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    User
  }
})
export default store
```

### 在组件中使用Vuex

为了使用`Vuex`，我们要使用第三方库`vuex-class`。它提供了绑定`state, Getter, Mutation和Action`的装饰器

因为我们使用了模块化的Vuex，所以我们首先从`vuex-class`中引入`namespace`然后把模块的名字传过去，就可以访问该模块。

```javascript
<template>
  <div class="details">
    <div class="username">User: {{ nameUpperCase }}</div>
    <input :value="name" @keydown="updateName($event.target.value)" />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
const user = namespace('User')
@Component
export default class User extends Vue {
  @user.State
  public name!: string

  @user.Getter
  public nameUpperCase!: string

  @user.Action
  public updateName!: (newName: string) => void
}
</script>
```

JS代码：

```javascript
<template>
  <div class="details">
    <div class="username">User: {{ nameUpperCase }}</div>
    <input :value="name" @keydown="updateName($event.target.value)" />
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions} from 'vuex'
export default  {
  computed: {
    ...mapState('user', ['name']),
    ...mapGetters('user', ['nameUpperCase'])
  }  
  methods: {
    ...mapActions('user', ['updateName'])
  }
}
</script>
```

