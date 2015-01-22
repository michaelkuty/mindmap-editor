'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mindmap.services', []).
  value('version', '0.1').
  service('$eb', function() {
    var eb = null,reconnects=0, ownFunctions = {},prefix="eventbus";
    if (!eb) {
        //var eb = new vertx.EventBus("http://localhost:8080/eventbus");
        eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/' + prefix);
    } else {
        return eb;
    }
    ownFunctions.reconnect = function(){
      if(reconnects<5){
        var calls=eb.getCalls();
        eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/' + prefix);
        eb.setCalls(calls);
        reconnects++;
      }else{
        if(confirm('Connection to server halted! \nPress OK for reload page.')){
          window.location.reload();
        }
      }
    };
    angular.extend(eb,ownFunctions);
    return eb;
  }).
  constant('AUTH_EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      logoutFailed: 'auth-logout-failed',
      reloginFailed: 'auth-relogin-failed',
      sessionTimeout: 'auth-session-timeout',
      notAuthenticated: 'auth-not-authenticated',
      notAuthorized: 'auth-not-authorized'
  }).
  constant('USER_ROLES', {
      user: 'user',
  }).
  factory('AuthService', function ($http, Session, $eb,$q,USER_ROLES) {
  var authService = {};
 
  authService.login = function (credentials) {
    var deffered = $q.defer();
    $eb.login(credentials.username,credentials.password,function(reply){
      if (reply.status === 'ok') {
        Session.create(1,reply.sessionID,USER_ROLES.user);
        deffered.resolve({username:credentials.username,userID:reply.sessionID,userRole:USER_ROLES.user});
      }else{
        deffered.reject(reply);
      }
    });
    return deffered.promise;
  };
  authService.relogin = function(sessionID){
    var deffered=$q.defer();
    $eb.authorise(sessionID,function(reply){
      if(reply.status === 'ok'){
        deffered.resolve({username:reply.username,userID:sessionID,userRole:USER_ROLES.user});
      }else{
        deffered.reject(reply);
      }
    });
    return deffered.promise;
  }
  authService.logout = function(sessionID){
    var deffered = $q.defer();
    $eb.logout(sessionID,function(reply){
      if(reply.status === 'ok'){
        Session.destroy();
        deffered.resolve();
      }else{
        deffered.reject(reply);
      }
    });
    return deffered.promise;
  };
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
}).
  service('Session', function () {
      this.create = function (sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
      };
      this.destroy = function () {
        this.id = null;
        this.userId = null;
        this.userRole = null;
      };
      return this;
}).
  service('RandomNameGenerator',function(){
    this.generate = function(){
      var names="slalomaway unsuitableinvidious chowderstain popularhorns cookieexcluded huddlepuck beepingchirp nonchalantjangling countlessgoody gulpranivorous hockeyemploy signoutrageous grittinglonely egadanthology jewishonlooker roastillegal tannedfaced pretzelsflats secondinning eyelashgrubby babbleawful judiciousmouldy cordialsquad unrealimpulsive sugarbizarre heapsqueamish untriedboing scutfestive zoomface denpricked pointedresolved shadyuttermost bunchshade argybargyhumbug overtdoughnut comparecurved subduedmischief chippingdraught wantingloaded wigglingbobble crashplover aspiringpurse unfitegg idealprime beertinted furslight trucksshriek movementimplore crunchysmoked forgivechew elaborateweed excitemedical needlessmarch tickmow waffletravel merchantassert peskywharf basketballchocolate basicexcited stutterthrilled batheollie bonemealprinter smellmacedonian firmgoon faxrotten lagopodoustalus marchedteeny raisinsreturn laughablepanamanian wristwiggly jordaniansurround clutchinggeorgian bungalowliver dartboardgrill risetired grouchold domodern germanimpetuous doubtdingaling beggingbolted tellflink pastieshops portlyhook costlawful shotputsuspect bazookajerk yorkshireroof calculateputtock sinebike freethrownambypamby fundoghearted snazzyfussy absenttibia tremendousdark trounceincrease worrygoose betrayedminty lewdcherries fishifiedtarget heelwren mischiefdule dearagitated fargrowing thismunch thunderybongo woofcooked klutzyluxuriant excuseubiquity servantsupportive cockalorumsnarling capitalpossessive brainquadriceps pingponggummy quallingharem mendriding hershiny studiouspaint rockersloutish pregnantsmiling bobcatribs diallitter samefallacious seriousluxurious rubeggs happinessmolar madcapknuckles seemlyshrubbery observantsnooker nobodyclot strengthenbone ragunderstood speculatewallabyies sticksseveral guineafowlhoop thornyshow clumsyfraid obtainrealistic flackback screechblink articulateringed moppingwrithing ableclatter switchporcupine spleenygossip wineviolent turdiformloser peltmarble buttonobnoxious meticulousfrosty rattlesnakegrotty unwelcomeeyeball flopbuyer peppercanned nuttoucan corngiant frogsfeed cavernouselope flatdote fustytongue dismalstarts jogwebbed teenypastoral extendjam janglingme grassplumber welltodouniform labourerhorse imperfectslang woodpeckerstep protestdrift blueimpossible whitingmerry underclumsy innocentunequal drinksecondhand hugemasculine beggarlyrhyming boozeoutfield lushpalatable chidefuzzy haypeafowl flapimmature announcerlend colorfulneanderthal mumblingrwandan jaguarhack poleappeal uglyminstrel muleholly lippedparade cliffvroom fillherd emphasizesmile hintsshoemaker curveddefinitive huskynutritious kittengrouse implyrumble brringlardass understoodframe"
      .split(" ");
      return names[Math.floor(Math.random()*names.length)];
    };
    return this;
  });
