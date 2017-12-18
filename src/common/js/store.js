/**
 * 存储数据到localStorage中
 * @param id   用户店面id
 * @param key  健
 * @param value  值
 */

export function saveToLocal(id, key, val) {
    // 注意要用window. 运行在浏览器才有window.
    let seller = window.localStorage._seller_
    if (!seller) {
        seller = {}
        seller[id] = {}
    } else {
        seller = JSON.parse(seller)
        if (!seller[id]) {
            seller[id] = {}     
        }
    }
    seller[id][key] = val
    window.localStorage._seller_ = JSON.stringify(seller)
}

/**
 * 从localStorage中取值
 * @param id   用户店面id
 * @param key  健
 * @param def  默认值
 */

 export function loadFromLocal(id, key, def) {
    let seller = window.localStorage._seller_
    if (!seller) {
        // 如果没有就返回默认值
        return def
    }
    seller = JSON.parse(seller)[id]
    // 判断是否有此商家
    if (!seller) {
        return def
    }
    // 判断是否有这个 key
    let ret = seller[key]
    return ret || def
 }