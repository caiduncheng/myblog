---
title: Vue封装组件对话框MessageBox
tags: ['Vue']
description: ''
template: 'post'
date: '2021-02-02'
thumbnail: vue.png
---

想开发一个组件，要求能通过以下几种方式调用方式显示出一个对话框

## 应用场景

现在想开发一个组件，要求能通过以下几种方式调用方式显示出一个对话框

通过传两个参数

```js
this.$messagebox('提示', '操作成功');
```

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/messagebox1.png"/>

传入一个对象

```js
this.$messagebox({
  title: '提示',
  message: '确定执行此操作?',
  showCancelButton: true
});
```

<img src="https://caidc.oss-cn-beijing.aliyuncs.com/messagebox2.png" />

下表为对象支持的参数

|                        |                              |         |        |        |
| ---------------------- | ---------------------------- | ------- | ------ | ------ |
| 参数                   | 说明                         | 类型    | 可选值 | 默认值 |
| title                  | 对话框的标题                 | String  |        |        |
| message                | 对话框的内容                 | String  |        |        |
| showConfirmButton      | 是否显示确认按钮             | Boolean |        | true   |
| showCancelButton       | 是否显示取消按钮             | Boolean |        | false  |
| confirmButtonText      | 确认按钮的文本               | String  |        |        |
| confirmButtonHighlight | 是否将确认按钮的文本加粗显示 | Boolean |        | false  |
| confirmButtonClass     | 确认按钮的类名               | String  |        |        |
| cancelButtonText       | 取消按钮的文本               | String  |        |        |
| cancelButtonHighlight  | 是否将取消按钮的文本加粗显示 | Boolean |        | false  |
| cancelButtonClass      | 取消按钮的类名               | String  |        |        |
| showInput              | 是否显示一个输入框           | Boolean |        | false  |
| showRadio              | 是否显示一个单选框           | Boolean |        | false  |
| inputType              | 输入框的类型                 | String  |        | 'text' |
| inputValue             | 输入框的值                   | String  |        |        |
| radioValue             | 单选按钮的默认值             | String  |        |        |
| inputPlaceholder       | 输入框的占位符               | String  |        |        |
| loadTime               | confirm/loading倒计时(单位s) | Number  |        |        |

## 编写代码

下面我用一个全局提示组件为例，演示一遍如何封装一个包含操作dom的的全局组件

在`components/Message`目录下新建`Message.vue`文件

```js
<template>
  <div class="msgbox" v-show="value" v-if="isNotLoading">
    <div class="msgbox-header" v-if="title !== ''">
      <div class="msgbox-title">{{ title }}</div>
    </div>
    <div class="msgbox-content">
      <div class="msgbox-message" v-if="message && message !== ''" v-html="message"></div>
      <div class="msgbox-input" v-show="showInput">
        <input v-model="inputValue" :placeholder="inputPlaceholder" ref="input">
        <div class="msgbox-errormsg" :style="{ visibility: !!editorErrorMessage ? 'visible' : 'hidden' }">{{ editorErrorMessage }}</div>
      </div>
      <div class="msgbox-radio" v-if="showRadio">
        <mt-radio
          v-model="radioValue"
          :options="radioOpts">
        </mt-radio>
      </div>
    </div>
    <div class="msgbox-btns">
      <div :class="[ cancelButtonClasses ]" v-show="showCancelButton" @click="handleAction('cancel')">
        {{ cancelButtonText }}
      </div>
      <div :class="[ confirmButtonClasses ]" v-show="showConfirmButton" @click="handleAction('confirm')">
        {{ confirmButtonText }}
        <span v-if="showCancelButton && loadTimeTxt && loadTimeTxt > 0">({{ loadTimeTxt }}s)</span>
      </div>
    </div>
  </div>
</template>
```









