---
title: CSS优先级
template: post
tags: ['css']
date: '2020-09-17'
thumbnail: CSS.png
---
当有多个CSS规则的目标都指向同一个HTML元素时，并且它们具有相同的CSS属性时，哪个CSS规则最终会应用到这个HTML元素呢？这里就涉及到了CSS的优先级。

### CSS优先级例子

在开始讲解CSS优先级规则之前，我们看一个例子：

```html	
<head>
    <style>
        body {
            font-family: Arial;
            font-size: 14px;
        }
        p {
            font-size: 16px;
        }
        .logo {
            font-family: Helvetica;
            font-size  : 20px;
        }

        
    </style>
</head>
    
<body>

  <div id="header">
    <span class="logo">Super Co</span>    
  </div>

  <div id="body">
    <p>
        This is the body of my page    
    </p>
  </div>
</body>
```

在这个例子中包含了三个CSS规则，这三个规则都设置了`font-size`属性，有两个规则设置了`font-family`属性。`body`的CSS规则同时被`div`、`span`、`p`元素所继承。另外，`span`元素还有一个CSS类`.logo`，p元素有一个目标为所有p元素的CSS规则。哪些样式最终会渲染到`span`和`p`元素上呢？

### CSS优先级规则

当浏览器解析哪些样式需要渲染到HTML元素上时，它会参考一系列的额CSS优先级规则，有了这些规则，浏览器就可以确定哪些样式被渲染。这些规则是：

1. CSS属性后面的`!important`
2. CSS选择器的权重
3. 声明顺序

这些规则我们后面再讲解。

注意，CSS优先级发生在CSS属性的层级上。也就是说，如果两条CSS规则的目标都是同一个元素，并且第一条规则优先于于第二条规则，那么所有在第一条规则当中声明的CSS属性会优先于在第二条规则中声明的CSS属性。然而，当第二条规则包含了第一条规则中没有声明的属性，那么这些属性仍然会被渲染。

#### !important

如果你需要某个CSS属性优先于其他所有设置了相同属性，并具有相同目标的CSS规则时，你可以在CSS属性后面加上`!important`。`!important`在所有优先级因素当中拥有最高的优先级。下面是一个例子：

```html
<style>
  div {
      font-family: Arial;
      font-size: 16px !important;
  }
  .specialText {
      font-size: 18px;
  }
</style>


<div class="specialText">
  This is special text.
</div>
```

这个例子有两条CSS规则，它们的目标元素都是`div`元素

通常，有类选择器的CSS规则拥有比元素选择器的规则更高的优先级，所以通常第二条规则(`.specialText{...}`)会优先于第一条规则(`div{...}`)。也就是说，`.specialText`规则会把`div`元素的`font-size`设置为`18px`。

然而，`div {...}`规则包含了的`font-size`属性后面设置了`!important`，所以这个属性就优先于所有目标元素相同，没带`!important`的属性。

#### CSS选择器的权重

有时，浏览器无法通过是否拥有`!important`来判断CSS或属性优先级。因为没有任何一个属性有`!important`或多个相同属性都有`!important`。在这种情况下，浏览器会通过CSS选择器的权重来决定哪条CSS属性会被优先使用。

CSS的权重取决于它的选择器，选择器越具体，该选择器下的CSS属性的权重就越高。

不同的CSS选择器类型有不同的权重。

| CSS选择器               | 描述                                                         |
| ----------------------- | ------------------------------------------------------------ |
| 继承的样式              | 拥有最低权重的选择器，这是因为被继承的样式的目标是元素的父元素，而不是元素本身 |
| *                       | 在直接以元素为目标的选择器当中权重最低                       |
| 元素选择器              | 拥有比通配符选择器和继承样式更高的权重                       |
| 属性选择器              | 拥有比元素选择器更高的权重                                   |
| 类选择器                | 拥有比属性选择器，元素选择器，和通配符选择器更高的权重       |
| ID选择器                | 拥有比类选择器更高的权重                                     |
| 通过style属性设置的样式 | 拥有比ID选择器更高的权重                                     |

通过表格来理解权重比较困难，用例子来讲解吧

```html
<body>

    <style>
        body     { font-size: 10px; }
        div      { font-size: 11px; }
        [myattr] { font-size: 12px; }
        .aText   { font-size: 13px; }
        #myId    { font-size: 14px; }
    </style>

    <div> Text 1 </div>
    <div myattr> Text 2 </div>
    <div myattr class="aText"> Text 3 </div>
    <div myattr class="aText" id="myId" > Text 4 </div>

</body>
```

这个例子有五个不同的CSS规则，它们的目标元素都是一个多个`div`元素

第一条CSS规则的目标元素是`body`，设置给`body`元素的样式`font-size`会被`div`继承。在这个CSS规则里设置的样式拥有最低的优先级。

第二条CSS规则的目标元素是`div`元素。这条规则比从`body`继承的样式来得更具体。所以权重也高于它。

第三条规则的目标元素是所有拥有`myattr`属性的元素。这个选择器会比选中所有`div`元素更具体一些，权重也更高。因此拥有`myattr`属性的`div`元素会使用这条规则下的样式。

第四条规则的目标元素是类名为`aText`的元素。CSS类选择器比`div`元素选择器和`[myattr]`属性选择器权重更高，所以类名为`aText`的`div`元素会使用这条规则下的样式。

第五条规则的目标元素是ID为`myId`的元素。ID选择器的权重高于元素选择器，属性选择器和类选择器，所以ID为`myId`的元素会使用这条规下的样式。

CSS的权重不止上面那么简单，我们有时会碰到比较复杂的场景，将多个类型的选择器组合在一起，他们的权重也会进行组合。比如：

```css
div { }
div[myattr]
div[myattr].aText { }  
```

第一个就是普通的选择器，第二个则将元素选择器和属性选择器组合在一起了。比第一个优先级高。第三个是元素选择器，属性选择器和类选择器的组合，这个组合比上面两种的优先级更高。

#### 如何计算权重？

可以用数字来表示权重，行内样式权重加上1000，ID选择器样式每个加上100，属性选择器加上10，类选择器或元素选择器加1。

例子：

```html
h1 {color: red}
#content h1 {color: green}
<div id="content"><h1 style="color: #ffffff">Heading</h1></div>
```

第一个的权重为1 （只有一个元素选择器）

第二个为101（一个ID选择器一个元素选择器）

第三个为1000 （行内样式）

因为 1 < 101 < 1000 所以最后一个规则会生效，即Heading的颜色为`#ffffff`

