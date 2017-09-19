const Waterline = require('waterline')
const waterline = new Waterline()
const sails_nedb= require('../')

var Doc = { name: 'test', number: 5};
var Selector = {name: 'test'};

const config = {
    adapters: {
        nedb: sails_nedb
    },
    connections: {
        waterline: {
            adapter: 'nedb'
        }
    }
}

const model = {
    identity: 'test',
    connection: 'waterline',
    attributes: {
        name: {
            type: 'string'
        },
        number: {
            type: 'integer', // 库存数目
            required: true
        }
    }
}

waterline.loadCollection(Waterline.Collection.extend(model));

waterline.initialize(config, function (err, ontology) {
    if (err) {
        logger.error(err)
        reject(err)
    }
    else {
        // console.log('ontology.collections:', ontology.collections);
        let db = ontology.collections.test
        db.find(Selector).then(docs => console.log(docs));
        db.find(Selector).then(function(docs) {
            if(docs && docs.length > 0) {
                console.log('has data , update:', docs[0].id);
                db.update(Selector, Doc).then(() => {
                    update(db);
                }, catchError('update2'))
            } else {
                console.log('do not has data , insert');
                db.create(Doc).then(() => {
                    update(db);
                }, catchError('create'));
            }
        }, catchError('findOrCreate'));
    }
})

function update(db) {
    db.update(Selector, {$inc: {number: 4}}).then(docs=> {
        console.assert(docs.length > 0, '更新doc数目：' + docs.length)
        if(docs.length > 0) {
            let doc = docs[0];
            console.log(doc);
            console.assert(doc.number === 9, '$inc是否生效:doc.number' + doc.number + '!=9')
        }
    }, catchError('$inc'));
}

function catchError(msg) {
    return function(err) {
        console.error(msg, err);
        throw err;
    }
}