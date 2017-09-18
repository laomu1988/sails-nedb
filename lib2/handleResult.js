/**
 * @file 对nedb的查询结果进行处理
 * - average
 * - sum
 * - min
 * - max
 * - select
 */
const _ = require('lodash');
let utils = require('./utils');

const handleAttrs = ['average', 'sum', 'min', 'max'];
module.exports = function(docs, options) {
    if(!options || !docs || docs.length === 0) {
        return docs;
    }

    if(options.select && options.select.$in && options.select.$in.length > 0) {
        let select = options.select.$in;
        return utils.rewriteIds(docs.map(v => {
            let n = {};
            select.forEach(attr => n[attr] = v[attr]);
            return n;
        }));
    }


    let attr_arr = [];
    let attrs = {};
    let values = {};
    // 汇总要计算属性
    handleAttrs.forEach(sign => {
        if(options[sign] && options[sign].$in && options[sign].$in.length > 0) {
            attr_arr = attr_arr.concat(options[sign].$in);
            options[sign].$in.forEach(attr => {
                attrs[attr] = sign;
                switch(sign) {
                    case 'sum':
                        values[attr] = _.sumBy(docs, attr);
                        break;
                    case 'average':
                        values[attr] = _.sumBy(docs, attr) / docs.length;
                        break;
                    case 'min':
                        values[attr] = _.minBy(docs, attr)[attr];
                        break;
                    case 'max':
                        values[attr] = _.maxBy(docs, attr)[attr];
                        break;
                }
            })
        }
    });

    if (attr_arr.length === 0) {
        return utils.rewriteIds(docs);
    }
    console.log('docs:', docs);
    console.log('values:', values);

    return [values];
}