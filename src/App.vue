<template>
  <div id="app">
    <!-- 头部 -->
    <v-header :seller="seller"></v-header>
    <!-- 导航栏 -->
    <v-tab></v-tab>
    <!-- 主体内容 -->
    <keep-alive>
      <router-view :seller="seller"></router-view>
    </keep-alive>
  </div>
</template>

<script>
import {urlParse} from '@/common/js/util'
import header from '@/components/header/header'
import tab from '@/components/tab/tab'
import axios from 'axios'

export default {
  data () {
    return {
      //  注意这里seller的类型 要用｛｝不能用其他的
      seller: {
        // 商店id
        // 立即执行
        id: (() => {
          let queryParam = urlParse()
          console.log(queryParam)
          return queryParam.id
        })()
      }
    }
  },
  created () {
    // 实例创建完成请求header数据
    axios.get('http://localhost:3013/seller?id=' + this.seller.id).then(response => {
      // this.seller = response.data
      // 合并对象 相当于 extend方法 扩展  es6语法   vue推荐的给对象扩展属性方法
      this.seller = Object.assign({}, this.seller, response.data)
    }).catch(error => {
     console.log(error)
    })
  },
  components: {
    'v-header': header,
    'v-tab': tab
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "common/stylus/index"
</style>
