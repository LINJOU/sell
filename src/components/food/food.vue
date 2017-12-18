<template>
    <div>
        <transition name="move">
            <div class="food" v-show="showFlag" ref="food">
                <div class="food-content">
                    <div class="image-header">
                        <img :src="food.image">
                        <div class="back" @click="hide">
                            <i class="icon-arrow_lift"></i>
                        </div>
                    </div>
                    <div class="content">
                        <h1 class="title">{{food.name}}</h1>
                        <div class="detail">
                            <span class="sell-count">月售{{food.sellCount}}份</span><span class="rating">好评率{{food.rating}}%</span>
                        </div>
                        <div class="price">
                            <span class="now">￥{{food.price}}</span>
                            <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                        </div>
                        <div class="cartcontrol-wrapper">
                            <cartcontrol :food="food"></cartcontrol>
                        </div>
                        <!-- 没有food.count 或 ===0时 -->
                        <!-- 解决获取不到el的问题 在变化过程中el还是存在的-->
                        <transition name="fade">
                            <div @click.stop.prevent="addFirst($event)" class="buy" v-show="!food.count || food.count === 0">加入购物车</div>
                        </transition>
                    </div>
                    <split v-show="food.info"></split>
                    <div class="info" v-show="food.info">
                        <h1 class="title">商品信息</h1>
                        <p class="text">{{food.info}}</p>
                    </div>
                    <split></split>
                    <div class="rating">
                        <h1 class="title">商品评价</h1>
                        <ratingselect :selectType="selectType" :onlyContent="onlyContent" :desc="desc" :ratings="food.ratings"></ratingselect>
                        <div class="rating-wrapper">
                            <!-- food.ratings不为空 -->
                            <ul v-show="food.ratings && food.ratings.length">
                                <li v-for="rating in food.ratings" class="rating-item border-1px" v-show="needShow(rating.rateType, rating.text)">
                                    <div class="user">
                                        <span class="name">{{rating.username}}</span>
                                        <img :src="rating.avatar" class="avatar" width="12" height="12">
                                    </div>
                                    <!-- 注意时间格式的处理 -->
                                    <div class="time">{{rating.rateTime | formatDate}}</div>
                                    <p class="text">
                                        <span :class="{'icon-thumb_up': rating.rateType === 0, 'icon-thumb_down': rating.rateType === 1}"></span>{{rating.text}}
                                    </p>
                                </li>
                            </ul>
                            <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import Vue from 'vue'
// 引入滚动库
import BScroll from 'better-scroll'
// 引入按钮组件
import cartcontrol from '@/components/cartcontrol/cartcontrol'
// 引入分隔组件
import split from '@/components/split/split'
// 引入评价组件
import ratingselect from '@/components/ratingselect/ratingselect'
// 引用事件中心模块
import bus from '@/common/js/bus'
// 引入时间格式模块
import {formatDate} from '@/common/js/date'

// 全部评价
const ALL = 2

export default {
    data () {
        return {
            showFlag: false,
            selectType: ALL,
            onlyContent: true,
            desc: {
                all: '全部',
                positive: '推荐',
                negative: '吐槽'
            }
        }
    },
    props: ['food'],
    methods: {
    // 加_是本组件私有方法，不加就可以给父组件调用
    // 可以被父组件调用
        show() {
            this.showFlag = true
            // 初始化
            this.selectType = ALL
            this.onlyContent = true
            // 当页面被展示时使用Bscorll
            this.$nextTick(() => {
                if (!this.scroll) {
                    this.scroll = new BScroll(this.$refs.food, {
                        click: true
                    })
                } else {
                    // 重新计算
                    this.scroll.refresh()
                }
            })
        },
        hide() {
            this.showFlag = false
        },
        // 加入购物车
        addFirst(event) {
            // 防止多次点击
            if (!event._constructed) {
                return
            }
            Vue.set(this.food, 'count', 1)
        },
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
    filters: {
        formatDate(time) {
            let date = new Date(time)
            return formatDate(date, 'yyyy-MM-dd hh:mm')
        }
    },
    components: {
        cartcontrol, split, ratingselect
    }
}
</script>
<style lang="stylus" rel="stylesheet/stylus">
    @import "../../common/stylus/mixin"
    .food
        position: fixed
        left: 0
        top: 0
        bottom: 48px
        // 被购物车列表，遮罩层覆盖
        z-index: 30px
        width: 100%
        background: #fff
        transform: translate3d(0, 0, 0)
        &.move-enter-active, &.move-leave-active
           transition: all .2s linear
        &.move-enter, &.move-leave-to
           transform: translate3d(100%, 0, 0)
        .image-header
            position: relative
            width: 100%
            // 处理图片未加载 图片位置出现空缺导致抖动
            height: 0
            //padding-top: 100% 相对于 width: 100%去计算的 形成一个宽高相等的容器
            padding-top: 100%
            img
               position: absolute
               top: 0
               left: 0
               width: 100%
               height: 100%
            .back
                position: absolute
                top: 10px
                left: 2px
                .icon-arrow_lift
                    display: block
                    padding: 10px
                    font-size: 20px
                    color: #fff
        .content
            position: relative
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 8px
                font-size: 14px
                font-weight: 700
                color: rgb(7, 17, 27)
            .detail
                margin-bottom: 18px
                line-height: 10px
                height: 10px 
                font-size: 0
                .sell-count, .rating
                    font-size: 10px
                    color: rgb(147, 153, 159)
                .sell-count
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
                right: 12px
                bottom: 12px
            .buy
                position: absolute
                right: 18px
                bottom: 18px
                z-index: 10
                height: 24px
                line-height: 24px
                padding: 0 12px
                box-sizing: border-box
                border-radius: 12px 
                font-size: 10px
                color: #fff
                background: rgb(0, 160, 220)
                opacity: 1 
                &.fade-enter-active, &.fade-leave-active
                    transition: all .3s
                &.fade-enter, &.fade-leave-to
                    opacity: 0
        .info
            padding: 18px
            .title
                line-height: 14px
                margin-bottom: 6px
                font-size: 14px               
                color: rgb(7, 17, 27)
            .text
                line-height: 24px
                padding: 0 8px
                font-size: 12px
                color: rgb(77, 85, 93)
        .rating
            padding-top: 18px 
            .title
                line-height: 14px
                margin-left: 18px
                font-size: 14px
                font-weight: 700 
                color: rgb(7, 17, 27)
            .rating-wrapper
                padding: 0 18px
                .rating-item
                    position: relative
                    padding: 16px 0
                    border-1px(rgba(7, 17, 27, .1))
                .user
                    position: absolute
                    right: 0
                    top: 16px
                    line-height: 12px 
                    font-size: 0
                    .name
                        display: inline-block
                        vertical-align: top
                        margin-right: 6px
                        font-size: 10px
                        color: rgb(147, 153, 159)
                    .avatar
                        border-radius: 50%
                .time
                    margin-bottom: 6px 
                    line-height: 12px
                    font-size: 10px
                    color: rgb(147, 153, 159)
                .text
                    line-height: 16px
                    font-size: 12px
                    color: rgb(7, 17, 27)
                    .icon-thumb_up, .icon-thumb_down
                        margin-right: 4px
                        line-height: 16px
                        font-size: 12px
                    .icon-thumb_up
                        color: rgb(0, 160, 220)   
                    .icon-thumb_down
                        color: rgb(147, 153, 159)
                .no-rating
                    padding: 16px
                    font-size: 12px
                    color: rgb(147, 153, 159)
</style>


