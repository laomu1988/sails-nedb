// Type 2: Persistent datastore with manual loading
var Datastore = require('nedb')
, db = new Datastore({ filename: __dirname + '/test.db' });
db.loadDatabase(function (err) {    // Callback is optional
    // Now commands will be executed

    var doc = { hello: 'world'
    , n: 5
    , today: new Date()
    , nedbIsAwesome: true
    , notthere: null
    , notToBeSaved: undefined  // Will not be saved
    , fruits: [ 'apple', 'orange', 'pear' ]
    , infos: { name: 'nedb' }
    };
    db.ensureIndex({ fieldName: 'n', unique: true }, function (err) {
        // If there was an error, err is not null
    });
    db.insert(doc, function (err, newDoc) {   // Callback is optional

    console.log(err, newDoc);
    // newDoc is the newly inserted document, including its _id
    // newDoc has no key called notToBeSaved since its value was undefined
    });
});