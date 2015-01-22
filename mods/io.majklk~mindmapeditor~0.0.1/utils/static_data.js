var vertx = require('vertx')

var eb = vertx.eventBus;

var pa = 'vertx.mongopersistor';

var treeData = [
    {
        "key": "ac7480a6-1601-4369-b81b-156f9a58dbsc",
        "name": "test1",
        "public": true,
        "users": [],
        "children": [
            {
                "key": "09a1c0dd-cd4e-4232-a6e7-22adc1aasds0",
                "name": "Žluťoučký kůň",
                "children": [
                    {
                        "key": "09a1c0dd-cd4e-4232-a6e7-22adc1abasd30",
                        "name": "Žluťoučký kůň 2"
                    }
                ]
            }
         ]
    },
    {
        "key": "ac7480a6-1601-4369-b81b-156f9a58dabc",
        "name": "user_map",
        "public": false,
        "users": ['admin', 'duky'],
        "children": [
            {
                "key": "09a1c0dd-cd4e-4232-a6e7-22adc1aasds0",
                "name": "Žluťoučký kůň",
                "children": [
                    {
                        "key": "09a1c0dd-cd4e-4232-a6e7-22adc1abasd30",
                        "name": "Žluťoučký kůň 2"
                    }
                ]
            }
         ]
    }
];

eb.send(pa, {action: 'delete', collection: 'mindmaps', matcher: {}}, function(reply) {

    for (var i = 0; i < treeData.length; i++) {
      eb.send(pa, {
        action: 'save',
        collection: 'mindmaps',
        document: treeData[i]
      });
    }

});

users = [ {
        'firstname': 'Michael',
        'lastname': 'Kuty',
        'email': 'kuty.michael@uhk.cz',
        'username': 'admin',
        'password': 'admin'
    },{
        'firstname': 'Jakub',
        'lastname': 'Josef',
        'email': 'jakub.josef@uhk.cz',
        'username': 'kuba',
        'password': 'kuba'
    }
]

eb.send(pa, {action: 'delete', collection: 'users', matcher: {}}, function(reply) {

    for (var i = 0; i < users.length; i++) {
      eb.send(pa, {
        action: 'save',
        collection: 'users',
        document: users[i]
      });
    }

});