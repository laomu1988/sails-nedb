var Datastore = require('nedb')
, db = new Datastore({ filename: __dirname + '/../.tmp/test.nedb' });
var Doc = { hello: 'world', n: 5};
var selector = {hello: 'world'};
db.loadDatabase(function(err) {
    if(err) {
        console.log(err);
        return;
    }
    
    db.find(selector, function(err, doc) {
        if(err) {
            console.log(err);
        }
        else {
            if(!doc || doc.length === 0) {
                console.log('insert');
                db.insert(Doc, update);
            } else {
                console.log('update');
                db.update(selector, Doc, update);
            }
        }
    });
});

function update(err) {
    if(err) {
        console.log(err);
        return;
    }
    db.update(selector, {$inc: {n: 10}}, {
        multi: true,
        returnUpdatedDocs: true
    }, function(err, numAffected, doc) {
        console.log('updated')
        console.assert(!err, 'noError:' +  err);
        console.log(doc);
    });
}