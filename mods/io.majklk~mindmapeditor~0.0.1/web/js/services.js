'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('mindmap.services', []).
  value('version', '0.1').
  service('$eb', function() {
    var eb = null;
    if (!eb) {
        //var eb = new vertx.EventBus("http://localhost:8080/eventbus");
        eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
    } else {
        return eb;
    }
    return eb;
  }).
  constant('AUTH_EVENTS', {
      loginSuccess: 'auth-login-success',
      loginFailed: 'auth-login-failed',
      logoutSuccess: 'auth-logout-success',
      logoutFailed: 'auth-logout-failed',
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
      alert(reply);
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
        deffered.resolve({username:reply.username.username,userID:reply.sessionID,userRole:USER_ROLES.user});
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
});
