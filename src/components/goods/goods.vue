<template>
  <div class="goods">
    <!-- 温馨提示：ref="  某name  " 中，某name 不可使用短横线拼接命名的方式 -->
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li v-for="(item, index) in goods" class="menu-item" :class="{'current': currentIndex === index}" @click="selectMenu(index, $event)">
          <span class="text border-1px">
            <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
        </li>
      </ul>
    </div>  
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="item in goods" class="food-list food-list-hook">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li v-for="food in item.foods" class="food-item border-1px" @click="selectFood(food, $event)">
              <div class="icon">
                <img width="57" height="57" :src="food.icon">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                  </div>
                </div>
              </div>
              <div class="cartcontrol-wrapper">
                <cartcontrol :food="food"></cartcontrol>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart ref="shopcart" :deliveryPrice="seller.deliveryPrice" :minPrice="seller.minPrice" :selectFoods="selectFoods"></shopcart>
    <food :food="selectedFood" ref="food"></food>
  </div>  
</template>
<script>
// import Vue from 'vue'

import axios from 'axios'
// 引入滚动库
import BScroll from 'better-scroll'
// 引入购物车组件
import shopcart from '@/components/shopcart/shopcart'
// 引入按钮组件
import cartcontrol from '@/components/cartcontrol/cartcontrol'
// 引入商品详情组件
import food from '@/components/food/food'
// 引用事件中心模块
import bus from '@/common/js/bus'

export default {
  data () {
    return {
      goods: [],
      // 高度为累积量，用数组存储
      listHeight: [],
      scrollY: 0,
      selectedFood: {}
    }
  },
  props: ['seller'],
  computed: {
    // 做映射
    currentIndex() {
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          return i
        }
      }
      return 0
    },
    selectFoods() {
      let foods = []
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food)
          }
        })
      })
      return foods
    }
  },
  created () {
    axios.get('http://localhost:3013/goods').then(response => {
      this.goods = response.data
      // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
      // DOM 更新了 操作dom时一定要在$nextTick里
      this.$nextTick(() => {
        this._initScroll()
        this._calculateHeight()
      })
    }).catch(error => {
     console.log(error)
    })
    this.classMap = ['decrease', 'discount', 'invoice', 'special', 'guarantee']
    // 子组件事件触发
    bus.$on('card-add', el => {
      // 体验优化，异步执行下落动画
      this.$nextTick(() => {
        // 父组件传递给子组件
        // 获取shopcart的dorp(el)
        this.$refs.shopcart.drop(el)
      })
    })
  },
  methods: {
    _initScroll() {
      // 左侧边栏滚动(一定要用驼峰) $refs获取元素DOM对象
      // 注意此处是 this.$refs.xxx
      this.meunScroll = new BScroll(this.$refs.menuWrapper, {
        click: true
      })
      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        click: true,
        probeType: 3 // 监测实时滚动的位置
      })

      this.foodsScroll.on('scroll', (pos) => {
        // 绝对值 拿到实时的y坐标
        this.scrollY = Math.abs(Math.round(pos.y))
      })
    },
    // 获取区域宽度
    _calculateHeight() {
      // 获取食物的li Dom节点列表
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    selectMenu(index, event) {
      // better-scroll 可以监听到此事件，浏览器原生不能监听到  防止pc端出现两次点击
      if (!event._constructed) {
        return
      }
      // 获取食物的li Dom节点列表
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let el = foodList[index]
      // 调用better-scroll 方法滚动到响应位置
      this.foodsScroll.scrollToElement(el, 300)
      // console.log(index)
    },
    // 商品详情
    selectFood(food, event) {
      if (!event._constructed) {
        return
      }
      this.selectedFood = food
      // 调用food组件的show方法
      this.$refs.food.show()
    }
  },
  components: {
    shopcart, cartcontrol, food
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin"
  .goods
    display: flex 
    position: absolute
    // 定义视口
    top: 174px
    bottom: 46px
    width: 100%
    overflow: hidden   
    .menu-wrapper
      flex: 0 0 80px
      // 要写宽度不然安卓下有问题
      width: 80px 
      background: #f3f5f7
      .menu-item
        // 小技巧table垂直居中最好的布局
        display: table
        height: 54px
        width: 56px
        padding: 0 12px
        line-height: 14px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          font-weight: 700
          .text
            border-no()       
        .icon
          display: inline-block
          vertical-align: top  
          width: 12px
          height: 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat     
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        .text
          display: table-cell
          // 让标签元素以表格单元格的形式呈现，类似于td标签
          width: 56px
          vertical-align: middle   
          font-size: 12px
          border-1px(rgba(7, 17, 27, 0.1))      
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        // 上下margin重合
        margin: 18px
        padding-bottom: 18px 
        border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px   
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)             
          .desc
            margin-bottom: 8px
            line-height: 12px 
          .extra
            .count
              margin-right: 12px 
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 8px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)
        .cartcontrol-wrapper
          position: absolute
          right: 0
          bottom: 12px
</style>