var vertx = require('vertx')

var eb = vertx.eventBus;

var pa = 'vertx.mongopersistor';

var treeData = [
  {
  "_id": "1234-5678-9012-3456",
  "name": "Vysoká škola",
  "tags": ["škola", "myšlení"]
  "children": [
      {
      "key": "1",
      "name": "BC",
      "description": "example",
      "children": [
        {
        "key": "AI",
        "name": "Alikovaná informatika",
        "description": "Student získá během studia dobré základní znalosti matematiky, algoritmizace a objektového 
                        modelování, na které navazují předměty s přímou aplikací (zejména programování, návrhy 
                        a správa informačních systémů a počítačových sítí, webovské technologie). Současně získává 
                        základní znalosti ekonomie a managementu a povinně studuje odborný anglický jazyk. 
                        U tohoto bakalářského studijního programu je kladen důraz na praktické dovednosti v oblasti 
                        informačních technologií. Zejména jeho kombinovaná forma uspokojí stoupající poptávku 
                        odborníků z jiných oblastí, kteří potřebují doplnit svoji odbornost o praktickou znalost 
                        informačních technologií. 
                        Uplatnění absolventa je především na pozicích programátora, návrháře a správce informačních 
                        systémů a sítí, webdesignera, apod. Profil znalostí vyhovuje výkonu funkce manažera nižší až 
                        střední úrovně, založení a vedení malé firmy a při dobrých jazykových předpokladech nachází 
                        absolventi uplatnění také ve firmách s nadnárodní působností. 
                        "
        },
        {
        "key": "IM",
        "name": "Informační management"
        }
      ]},
      {
      "key": "4",
      "name": "ING",
      "children": [
        {
        "key": "AI",
        "name": "Alikovaná informatika"
        },
        {
        "key": "IM",
        "name": "Informační management"
        }
      ]},
      {
      "key": "PHD",
      "name": "já nevím test utf-8"
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

