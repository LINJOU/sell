<template>
    <div class="cartcontrol">
        <transition name="move">
            <!-- .stop.prevent防止点击穿透 -->
            <div class="cart-decrease" v-show="food.count > 0" @click.stop.prevent="decreaseCart">
                <span class="inner icon-remove_circle_outline"></span>
            </div>
        </transition>
        <div class="cart-count" v-show="food.count > 0">{{food.count}}</div>
        <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
    </div>
</template>
<script>
import Vue from 'vue'
// 引用事件中心模块
import bus from '@/common/js/bus'

export default {
    props: ['food'],
    methods: {
        addCart(event) {
            // 防止多次点击
            if (!event._constructed) {
                return
            }
            if (!this.food.count) {
                // 添加food不存在的字段时 需要调用vue.set方法添加，这样才可以通过vue观测到这个字段的变化
                Vue.set(this.food, 'count', 1)
            } else {
                this.food.count++
            }
            // 派发事件 dom将cart.add作为事件参数传入event.target 将小球的dom传出去给goods
            bus.$emit('card-add', event.target)
        },
        decreaseCart(event) {
            if (!event._constructed) {
                return
            }
            if (this.food.count) {
                this.food.count--
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .cartcontrol
        font-size: 0    
        .cart-decrease
            display: inline-block
            // 增加用户点击区域
            padding: 6px
            .inner
                display: inline-block
                line-height: 24px
                font-size: 24px
                color: rgb(0, 160, 220)
            &.move-enter-active, &.move-leave-active
                transition: all .5s
                transform: translate3d(0, 0, 0)
                .inner
                    transition: all .5s
                    transform: rotate(0)  
            &.move-enter, &.move-leave-to
                opacity: 0
                transform: translate3d(24px, 0, 0)
                .inner
                    transform: rotate(180deg)    
        .cart-count
            display: inline-block
            vertical-align: top
            width: 12px
            padding-top: 6px
            line-height: 24px
            text-align: center
            font-size: 10px
            color: rgb(147, 153, 159)
        .cart-add
            display: inline-block
            line-height: 24px
            padding: 6px 
            font-size: 24px
            color: rgb(0, 160, 220)         
</style>

