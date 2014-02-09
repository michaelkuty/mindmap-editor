var vertx = require('vertx')

var eb = vertx.eventBus;

var pa = 'vertx.mongopersistor';





var treeData = [
  {
  "_id": "1234-5678-9012-3456",
  "name": "Berries",
  "children": [
      {
      "key": "1",
      "name": "Grapes",
      "children": [
        {
        "key": "2",
        "name": "Red grapes"
        },
        {
        "key": "3",
        "name": "Green grapes"
        }
      ]
    },
    {
    "key": "4",
    "name": "Strawberries"
    },
    {
    "key": "5",
    "name": "Blueberries"
    }
    ]
  }
];

eb.send(pa, {action: 'delete', collection: 'mindmap', matcher: {}}, function(reply) {

    for (var i = 0; i < treeData.length; i++) {
      eb.send(pa, {
        action: 'save',
        collection: 'mindmap',
        document: treeData[i]
      });
    }

});

