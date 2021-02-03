---
title: 'CSS Flex Box 教程'
thumbnail: 'CSS.png'
template: 'post'
date: '2019-10-05'
tags: ['css']
categories: 'FrontPage'
description: Flexbox是css3引入的新的布局方式，通过这种布局方式，可以很轻松地将多个元素以不同的方向或顺序进行对齐、排列。Flexbox的主要思想是赋予容器的子元素扩展和收缩的能力，以最大化利用可使用的空间。
---

### 介绍

`Flexbox`是`css3`引入的新的布局方式，通过这种布局方式，可以很轻松地将多个元素以不同的方向或顺序进行对齐、排列。

`Flexbox`的主要思想是赋予容器的子元素扩展和收缩的能力，以最大化利用可使用的空间。

`Flexbox`一定程度上取代了`浮动`布局，并且代码的可读性和逻辑性也更好。

### 使用

要实现`flex`布局很简单，给一个容器赋予属性：`display:flex`，该容器就成为了一个`flex`容器，`flex`容器的直接子元素则会自动成为`flex`项目（flex items）。项目在容器内的排列方向称为主轴（main axis），而交叉轴（cross axis）则总是垂直于主轴。

![](https://caidc.oss-cn-beijing.aliyuncs.com/c%26ek%3D1%26kp%3D1%26pt%3D0%26bo%3DRQUpAwAAAAARF0o%21%26tl%3D3%26vuin%3D396984937%26tm%3D1584273600%26sce%3D60-2-2%26rf%3D0-0.jpg)

### 属性

我们将`flex`布局的属性分为两大类：**容器属性**和**项目属性**。顾名思义，**容器属性**是属于元素的`display`属性为`flex`的元素，**项目属性**是`flex`项目的属性。

![avatar](https://caidc.oss-cn-beijing.aliyuncs.com/c%26ek%3D1%26kp%3D1%26pt%3D0%26bo%3D1QaVAgAAAAARF2Q%21%26t%3D5%26tl%3D3%26vuin%3D396984937%26tm%3D1584273600%26sce%3D60-2-2%26rf%3D0-0.jpg)

为了方便演示，以下属性会结合图片进行解释，我们先设计这样一个flex容器以及项目：

```html
<div class="container">
    <div class="item">1</div>
    <div class="item">2</div>
    <div class="item">3</div>
    <div class="item">4</div>
    <div class="item">5</div>
</div>
```

```css
.container {
    background-color: #ccc;
    padding: 10px;
    display: flex;
}

.item {
    background-color: #f1425d;
    padding: 30px;
    margin: 30px;
    color: #FFFFFF;
    font-size: 40px;
}
```

![avatar](https://caidc.oss-cn-beijing.aliyuncs.com/b%26amp%3Bbo%3DCQUvAQAAAAARBxI%21%26amp%3Brf%3Dviewer_4.jpg)

由于属性默认值的原因，在我们将容器设为flex的时候，项目就已经获取了项目属性的默认值，所以会如图所示排列。

#### 容器属性

##### flex-direction

该属性定义了主轴的方向。

可选值有：

- row: 默认值，主轴的方向为从左向右
- row-reverse: 主轴的方向为从右向左
- column: 主轴的方向从上到下
- column-reverse: 主轴的方向为从下到上

![avatar](E:\图片\b&bo=IgeeAQAAAAARB4o!&rf=viewer_4.jpg)

![avatar](E:\图片\b&bo=Lwe1AQAAAAARF7w!&rf=viewer_4.jpg)

![avatar](E:\图片\b&bo=HQeCAwAAAAARF7s!&rf=viewer_4.jpg)

![avatar](E:\图片\b&bo=HAeMAwAAAAARF7Q!&rf=viewer_4.jpg)

如图，我们通过改变**flex-direction**的值改变了主轴的方向，因此各个项目的排列方式均发生了变化。其实项目的位置也同时受到了**justify-content**的默认值**flex-start**的影响，所以每个项目都总是在主轴的起点上对齐。

##### flex-wrap



该属性定义在容器空间不足的时候，项目是否自动换行。

可选值有

- nowrap: 默认值，不换行
- wrap:  换行，方向为从上到下
- wrap-reverse: 换行，方向为从下到上

当容器控件不足时，多出来的项目会被挤出容器(flex-wrap: nowrap)

![UTOOLS1588088790225.png](https://caidc.oss-cn-beijing.aliyuncs.com/1a9aa4973c1bf0a836778434ec94d27e.jpg)

给`flex-wrap`属性设置为wrap:

![image-20200428234854156](E:\图片\image-20200428234854156.png)

原本被挤出的项目会换到新的一行，并出现在原来那一行的下边。

wap-reverse: 

![UTOOLS1588089003401.png](E:\图片\7891d18747c06d58d1b5aa686d5a9af5.jpg)

新的一行在上边。

##### justify-content

该属性定义项目在主轴上应该如何对齐

可选值有

- flex-start: 默认值，项目在主轴的起点对齐
- flex-end: 项目在主轴的终点对齐
- center: 项目在主轴的中心对齐
- space-between: 将容器的剩余空间平均分布在项目与项目之间
- space-around: 将容器的剩余空间分配在每个项目的左右两边
- space-evenly: 让项目之间以及第一个项目的左边和最后一个项目的右边的空间相同

如图，图中`flex-direction`的值均为`row`

![avatar](E:\图片\b&bo=LAdAAwAAAAARB1g!&rf=viewer_4.jpg)

##### align-items

定义项目在交叉轴上如何对齐

- stretch: 默认值，项目在交叉轴上延伸
- flex-start: 项目在交叉轴的起点对齐
- flex-end: 项目在交叉轴的终点对齐
- center: 项目在交叉轴的中心对齐
- baseline: 项目基于交叉轴的基线对齐

下图中，我们把二号的高度设为200px

![img](E:\图片\b&bo=HAcVAgAAAAARBzw!&rf=viewer_4.jpg)

![img](E:\图片\b&bo=gAMdA4ADHQMRBzA!&rf=viewer_4.jpg)

为了能看清楚`align-items:base-line`的效果，我把四号字体放大了，可以看到，项目是在基于黄线对齐。

上面都是在`flex-direction`为row的情况，接下来我们看看`flex-direction`为column的情况

![UTOOLS1588081013675.png](E:\图片\bedf9d0657edec3a02daab25756e3e08.jpg)

可以看到，把`flex-direction`设置为`column`的作用主要是把主轴的方向改成竖直方向，因为交叉轴始终垂直于主轴，所以交叉轴会变为横向。

##### align-content

该属性在项目多于一行的话才起作用，定义这些行在有剩余空间的情况下在交叉轴上如何对齐。

- stretch
- flex-start
- flex-end
- center
- space-between
- space-around

#### 项目属性

##### align-self

定义单个项目在交叉轴上的对齐方式

- auto
- stretch
- flex-start
- flex-end
- center
- baseline

![UTOOLS1588081754758.png](E:\图片\caf10801b796bec6ccdee7630f433601.jpg)

##### order: \<integer\>

定义该项目相对于其他项目的摆放顺序，默认值为0，拥有较小值order属性的项目将放在较大值的前面。

![UTOOLS1588081963088.png](E:\图片\dc70092503df21e5e5d5a76c8be25515.jpg)

##### flex-grow: \<interger\>

默认值0，定义项目占据剩余空间的能力。

我们首先将每个项目的`flex-grow`属性设为1

![UTOOLS1588082304074.png](E:\图片\6aa013b2862eefa2695f112772966041.jpg)

可以看到原本`flex-grow`为0的时候，剩余空间是没有被分配的，然后给每个项目设置`flex-grow`为1，容器就将剩余的空间平均分配（因为每个都是1）给了这五个项目，项目之间的间隙是因为设置了外边距。

在保持其他项目flex-grow为1的情况下，我们把2号的flex-grow设置为2。

![UTOOLS1588082891452.png](E:\图片\d416e1d1afd3795ac27914a15926a1c3.jpg)

可以发现，2号相比其他分配到了更多的空间。注意，这里并不是说2号的宽度是其他的两倍，而是分配到的空间是其他值的两倍。我们假设`flex-grow`为0的时候，每个项目的宽度为100px，容器宽度为2000px，这时的剩余空间就为: 2000 - 100 * 5 = 1500px

这时如果`flex-grow`都为1的话，那每个项目的实际宽度为：100 + 1500 / 5 = 400px

这时把`flex-grow`设为2的话，那2号的宽度就为：100 + 1500 * 2/6 =  600px，其他宽度为1500 * 1 / 6 + 100 = 350px

##### flex-basis: \<length\>

默认值auto，项目的宽度，如果项目同时有`flex-grow`的话，那容器在分配空间之前会先减去`flex-basis`的值。

假设容器宽度为2000px,项目宽度为100px, 2号的`flex-basis`的值为600px的话，那剩余空间就剩下2000 - 600 -  100 * 4 = 1000px。然后再用这1000px去分配给项目。每个项目的`flex-grow`为1的话，那除了2号以外的项目宽度就为100 + 1000 / 5 = 300px，2号的宽度为600 + 1000 / 5 = 800px

另外，`flex-basis`的值也可以设为百分比。

##### flex-shrink: \<integer\>

默认值1,定义项目在剩余空间不足时的收缩能力。

这个属性和flex-grow很像，不过它是反过来的，是在空间**不够**的时候，项目应该按多少比例收缩。如下图所示，我们有五个项目，每个项目的宽度都为200px，此时容器的空间充足。

![UTOOLS1588086787760.png](E:\图片\2a2fd8bea7f106eeda6694eb9a3070ec.jpg)

如果我们缩小窗体（容器的宽度设为100%，也就是容器的宽度和视口的宽度挂钩），可以看到项目都被压缩了，而且是以**相同比例**压缩，这是因为每个项目的`flex-shrink`值为1。

![flex](https://caidc.oss-cn-beijing.aliyuncs.com/1.jpg)

那如果我们把2号的`flex-shrink`设为2呢？

![](https://caidc.oss-cn-beijing.aliyuncs.com/2.PNG)

可以看到2号相比其他缩的更小了，这是因为它的缩小比例是其他项目的两倍，换句话说，其他项目缩小10px的话，它要缩小20px。

##### flex

`flex`属性是`flex-grow`, `flex-shrink`， `flex-basis`的简写方式，也就是说`flex: 1 0 100px`相当于`flex-grow: 1; flex-shrink: 0; flex-basis: 100px`

