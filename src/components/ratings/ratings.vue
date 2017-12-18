<template>
  <div class="ratings" ref="ratings">
    <div class="ratings-content">
      <div class="overview">
        <div class="overview-left">
          <h1 class="score">
            {{seller.score}}
          </h1>
          <div class="title">综合评分</div>
          <div class="rank">高于周边商家{{seller.rankRate}}%</div>
        </div>
        <div class="overview-right">
          <div class="score-wrapper">
            <span class="title">服务态度</span>
            <star :size="36" :score="seller.serviceScore"></star>
            <span class="score">{{seller.serviceScore}}</span>
          </div>
          <div class="score-wrapper">
            <span class="title">商品评分</span>
            <star :size="36" :score="seller.foodScore"></star>
            <span class="score">{{seller.foodScore}}</span>
          </div>
          <div class="delivery-wrapper">
            <span class="title">送达时间</span>
            <span class="delivery">{{seller.deliveryTime}}分钟</span>
          </div>
        </div>
      </div>
      <split></split>
      <ratingselect :selectType="selectType" :onlyContent="onlyContent" :ratings="ratings"></ratingselect>
      <div class="rating-wrapper">
        <ul>
          <li class="rating-item border-1px" v-for="rating in ratings" v-show="needShow(rating.rateType, rating.text)">
            <div class="avatar">
              <img :src="rating.avatar" width="28" height="28">
            </div>
            <div class="content">
              <h1 class="name">{{rating.username}}</h1>
              <div class="star-wrapper">
                <star :size="24" :score="rating.score"></star>
                <span class="delivery" v-show="rating.deliveryTime">{{rating.deliveryTime}}分钟送达</span>
              </div>
              <p class="text">{{rating.text}}</p>
              <!-- 推荐 -->
              <div class="recommend" v-show="rating.recommend && rating.recommend.length">
                <span class="icon-thumb_up"></span>
                <span v-for="item in rating.recommend" class="item">{{item}}</span>
              </div>
              <div class="time">
                {{rating.rateTime | formatDate}}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
// 引入滚动库
import BScroll from 'better-scroll'
// 引入评价组件
import star from '@/components/star/star'
// 引入分隔组件
import split from '@/components/split/split'
// 引入评价组件
import ratingselect from '@/components/ratingselect/ratingselect'
// 引入时间格式模块
import {formatDate} from '@/common/js/date'
// 引用事件中心模块
import bus from '@/common/js/bus'

import axios from 'axios'
// 全部评价
const ALL = 2

export default {
  data () {
    return {
      ratings: [],
      selectType: ALL,
      onlyContent: true
    }
  },
  methods: {
    needShow(type, text) {
      if (this.onlyContent && !text) {
          return false
      }
      if (this.selectType === ALL) {
          return true
      } else {
          return type === this.selectType
      }
    }
  },
  created () {
    axios.get('http://localhost:3013/ratings').then(response => {
      this.ratings = response.data
      // 在这个函数中调用以防内容还未加载完就执行，获取不到元素的高度导致无法滑动
      // DOM 更新了 操作dom时一定要在$nextTick里
      this.$nextTick(() => {
        // console.log(this.$refs.ratings)
        this.scroll = new BScroll(this.$refs.ratings, {
          click: true
        })
      })
    }).catch(error => {
     console.log(error)
    })
    // 获取子组件的selectType的更新
    bus.$on('ratingtype-select', type => {
        this.selectType = type
        // 异步更新dom
        this.$nextTick(() => {
            this.scroll.refresh()
        })
    })
    bus.$on('content-toggle', onlyContent => {
        this.onlyContent = onlyContent
        this.$nextTick(() => {
            this.scroll.refresh()
        })
    })
  },
  props: ['seller'],
      filters: {
        formatDate(time) {
            let date = new Date(time)
            return formatDate(date, 'yyyy-MM-dd hh:mm')
        }
    },
  components: {
    star, split, ratingselect
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin"
  .ratings
    position: absolute
    top: 174px
    bottom: 0
    width: 100%
    overflow: hidden
    .overview
      display: flex
      padding: 18px 0
      .overview-left
        flex: 0 0 137px
        padding: 6px 0
        // 兼容
        width: 137px
        border-right: 1px solid rgba(7, 17, 27, .1)
        text-align: center
        // 兼容iphone5的换行
        @media only screen and (max-width: 320px)
          flex: 0 0 120px
          width: 120px
        .score
          margin-bottom: 6px
          line-height: 28px
          font-size: 24px
          color: rgb(255, 153, 0)
        .title
          margin-bottom: 8px
          line-height: 12px
          font-size: 12px
          color: rgb(7, 17, 27)
        .rank
          line-height: 10px
          font-size: 10px
          color: rgb(147, 153, 159)
      .overview-right
        flex: 1
        padding: 6px 0 6px 24px
        @media only screen and (max-width: 320px)
          padding-left: 6px
        .score-wrapper
          margin-bottom: 8px
          font-size: 0
          .title
            display: inline-block
            vertical-align: top
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
          .star
            display: inline-block
            margin: 0 12px
            vertical-align: top
          .score
            display: inline-block
            vertical-align: top
            line-height: 18px
            font-size: 12px
            color: rgb(255, 153, 0)
        .delivery-wrapper
          font-size: 0
          .title
            display: inline-block
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
          .delivery
            margin-left: 12px
            font-size: 12px
            color: rgb(147, 153, 159)
    .rating-wrapper
      padding: 0 18px
      .rating-item
        display: flex
        padding: 18px 0
        border-1px(rbga(7, 17, 27, .1))
        .avatar
          flex: 0 0 28px
          width: 28px
          margin-right: 12px
          img
            border-radius: 50%
        .content
          position: relative
          flex: 1
          .name
            margin-bottom: 4px
            line-height: 12px
            font-size: 10px
            color: rgb(7, 17, 27)
          .star-wrapper
            margin-bottom: 6px
            font-size: 0
            .star
              display: inline-block
              margin-right: 6px
              vertical-align: top
            .delivery
              display: inline-block
              vertical-align: top
              line-height: 12px
              font-size: 10px
              color: rgb(147, 153, 159)
          .text
            margin-bottom: 8px
            line-height: 18px
            color: rbga(7, 17, 27)
            font-size: 12px
          .recommend
            line-height: 16px
            font-size: 0
            .icon-thumb_up, .item
              display: inline-block
              margin: 0 8px 4px 0
              font-size: 9px
            .icon-thumb_up
              color: rgb(0, 100, 220)
            .item
              padding: 0 6px
              border: 1px solid rgba(7, 17, 27, 0.1)
              border-radius: 1px
              color: rgb(147, 153, 159)
              background: #fff
          .time
            position: absolute
            top: 0
            right: 0
            line-height: 12px
            font-size: 10px
            color: rgb(147, 153, 159) 
</style>

