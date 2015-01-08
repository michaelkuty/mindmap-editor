'use strict';

/* Controllers */

angular.module('mindmap.controllers', []).
  controller('AppCtrl', ['$scope','$rootScope','$eb','$state','USER_ROLES','AUTH_EVENTS','AuthService','localStorageService', function($scope,$rootScope,$eb,$state,USER_ROLES,AUTH_EVENTS,AuthService,localStorageService){
      $eb.addOpenCall(function(){
        $rootScope.$apply(function(){
            $rootScope.busloaded=true;
        });
      });

      $scope.currentUser = null;
      $scope.userRoles=USER_ROLES;
      $scope.isAuthorized = AuthService.isAuthorized;

      $scope.setCurrentUser = function (user){
        $scope.currentUser=user;
      };
      //relogin from localstorage
      var storedUserID = localStorageService.get('mindmap_userID');
      if(storedUserID){
        AuthService.relogin(storedUserID).then(function(user){
            $scope.setCurrentUser(user);
        });
      }

      $scope.logout = function(sessionID){
        //is promise needed for logout?
        AuthService.logout().then(function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutFailed);
        }); 
        goToLogin();
      };
      $scope.fillLightbox= function(type){
         $scope.lightboxBody="views/lightboxes/"+type+".html";
      };
      var goToLogin=function(){$state.go("login");};
      $scope.$on(AUTH_EVENTS.notAuthorized,goToLogin);
      $scope.$on(AUTH_EVENTS.notAuthenticated,goToLogin);

      $scope.$on(AUTH_EVENTS.loginFailed,function(){
        alert("Login failed!");
      });
      $scope.$on(AUTH_EVENTS.loginFailed,function(){
        alert("Logout failed!");
      });

      $scope.$on(AUTH_EVENTS.loginSuccess,function(){
        localStorageService.set('mindmap_userID',$scope.currentUser.userID);
        alert('logged in!');
      });
      $scope.$on(AUTH_EVENTS.logoutSuccess,function(){
        localStorageService.remove('mindmap_userID');
        alert('logged out!');
      });
  }]).

  controller('LoginCtrl', ['$scope','$rootScope','$eb','$state','AUTH_EVENTS','AuthService',function($scope,$rootScope,$eb,$state,AUTH_EVENTS,AuthService) {
       (function(){
         if($scope.currentUser!=null){
            //$state.go("mindmap");
         }
       })();
       $scope.credentials = {
         username: '',
         password: ''
       };
       $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
              $scope.setCurrentUser(user);
              $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
              $state.go("mindmap");
            }, function () {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
       };
  }])
  .controller('MindMapCtrl', ['$scope','$eb','$state',function($scope,$eb,$state) {
    var renderListItem = function(mindMap) {
        var $li = angular.element('<li class="span4">'),
        openMindMap = function() {
            new MindMapEditor(mindMap, $eb);
            //$('.save-as-png').show();
            angular.element('#MapName').html("<h2>" + mindMap.name + "</h2>");
            return false;
        },
        deleteMindMap = function() {
            $eb.send('mindMaps.delete', {id: mindMap._id}, function() {
                $li.remove();
            });
            return false;
        },
        saveAsPNG = function() {
            var svg = $('.editor').html();
            var stylesheet = document.styleSheets[0];
            var css = '';
            for (var i = 0 ; i < stylesheet.cssRules.length ; i++) {
                css += stylesheet.cssRules[i].cssText;
                css += "\n";
            }
            console.log(css);
            console.log(svg);
            $eb.send('mindMaps.exporter.svg2png', {svg: svg, css: css}, function(result) {
                if (result.data) {
                window.location.href = 'data:image/png;base64,'+result.data;
                }
            });
            return false;
        };
        angular.element('<a>').text(mindMap.name).attr('href', '#').on('click',openMindMap).appendTo($li);
        angular.element('<button>').text('Smazat').addClass("btn btn-danger pull-right").on('click',deleteMindMap).appendTo($li);
        angular.element('<button>').addClass("save-as-png btn btn-primary pull-right").text('Uložit').on('click',saveAsPNG).appendTo($li);
        $li.appendTo('.mind-maps');
    };
    $('.create-form').submit(function() {
        var nameInput = $('[name=name]', this);
        $eb.send('mindMaps.save', {name: nameInput.val()}, function(result) {
            renderListItem(result);
            nameInput.val('');
        });
        return false;
    });
    var showMaps = function(){
        $eb.send('mindMaps.list', {}, function(res) {
            $.each(res.mindMaps, function() {
                renderListItem(this);
            });
        });
    };
    if($eb.isReady()){
        showMaps();
    }else{
        $eb.addOpenCall(showMaps);
    }

  }]);