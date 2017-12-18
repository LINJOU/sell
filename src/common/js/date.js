export function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
        // 匹配年份
        // 替换RegExp.$1==(/(y+)/)-->数字转为字符串-->从第几位开始截取
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            // 将获取的数字转换成字符串
            let str = o[k] + ''
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
        }
    }
    return fmt
}
// 补零
function padLeftZero(str) {
    // 小技巧：从str.length位置开始截取 eg: 9 --> 009 str.length=1 --> 09
    return ('00' + str).substr(str.length)
}
