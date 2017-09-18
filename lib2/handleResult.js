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

const handleAttrs = ['average', 'sum', 'min', 'max', 'groupBy'];
module.exports = function(docs, options) {
    if(!options || !docs || docs.length === 0) {
        return docs;
    }

    // select选择某些属性
    if(options.select && options.select.$in && options.select.$in.length > 0) {
        let select = options.select.$in;
        docs = docs.map(v => {
            let n = {};
            select.forEach(attr => n[attr] = v[attr]);
            return n;
        });
    }
    let attr_arr = [];
    let attrs = {};
    let values = [];

    // groupBy分组
    if(options.groupBy && options.groupBy.$in && options.groupBy.$in.length > 0) {
        let groups = options.groupBy.$in;
        let newDocs = _.groupBy(docs, function(v) {
            let value = '';
            groups.forEach(attr => value += v[attr] + '$$_nedb_$$');
            return value;
        });
        docs = [];
        for(var attr in newDocs) {
            if(newDocs[attr] && newDocs[attr].length > 0) {
                docs.push(newDocs[attr]);
            }
        }
    } else {
        docs = [docs];
    }

    // 汇总要计算属性
    handleAttrs.forEach(sign => {
        if(options[sign] && options[sign].$in && options[sign].$in.length > 0) {
            attr_arr = attr_arr.concat(options[sign].$in);
            options[sign].$in.forEach(attr => {
                attrs[attr] = sign;
            })
        }
    });

    if (attr_arr.length === 0) {
        return utils.rewriteIds(docs[0]);
    }
    // 计算属性
    docs.forEach((doc,index) => {
        let value = values[index];
        if(!value) {
            value = values[index] = {};
        }
        for(let attr in attrs) {
            switch(attrs[attr]) {
                case 'sum':
                    value[attr] = _.sumBy(doc, attr);
                    break;
                case 'average':
                    value[attr] = _.sumBy(doc, attr) / doc.length;
                    break;
                case 'min':
                    value[attr] = _.minBy(doc, attr)[attr];
                    break;
                case 'max':
                    value[attr] = _.maxBy(doc, attr)[attr];
                    break;
                case 'groupBy':
                    value[attr] = doc[0][attr];
                    break;
            }
        }
    });
    // console.log('docs:', docs);
    // console.log('values:', values);

    return values;
}