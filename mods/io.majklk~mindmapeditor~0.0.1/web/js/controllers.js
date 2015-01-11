'use strict';

/* Controllers */

angular.module('mindmap.controllers', []).
  controller('AppCtrl', ['$scope','$rootScope','$eb','$state','USER_ROLES','AUTH_EVENTS','AuthService','localStorageService', function($scope,$rootScope,$eb,$state,USER_ROLES,AUTH_EVENTS,AuthService,localStorageService){
      $eb.addOpenCall(function(){
        $rootScope.$apply(function(){
            $rootScope.busloaded=true;
        });
      });
      $eb.addCloseCall(function(){
        $eb.reconnect();
      })
      $scope.currentUser = null;
      $scope.userRoles=USER_ROLES;
      $scope.isAuthorized = AuthService.isAuthorized;

      $scope.setCurrentUser = function (user){
        $scope.currentUser=user;
      };
      var storedUserID = localStorageService.get('mindmap_userID');
      if(storedUserID){
        $eb.addOpenCall(function(){
          //relogin from localstorage  
          AuthService.relogin(storedUserID).then(function(user){
              $scope.setCurrentUser(user);
          });
        });
      }

      $scope.logout = function(){
        AuthService.logout($scope.currentUser.userID).then(function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutFailed);
        }); 
      };
      $scope.fillLightbox= function(type){
         $scope.lightboxBody="views/lightboxes/"+type+".html";
      };
      $scope.closeLightbox=function(){
        angular.element("#LightboxCloser").click();
      };
      $scope.oneNodeWithoutOthers = function(node){
        var returnNode;
        delete node.children;
        delete node.parent;
        return angular.copy(node,returnNode);
      }


      /* event handlers */
      var goToLogin=function(){$state.go("login");};
      $scope.$on(AUTH_EVENTS.notAuthorized,goToLogin);
      $scope.$on(AUTH_EVENTS.notAuthenticated,goToLogin);

      $scope.$on(AUTH_EVENTS.loginFailed,function(){
        alert("Login failed!");
      });
      $scope.$on(AUTH_EVENTS.logoutFailed,function(){
        alert("Logout failed!");
      });

      $scope.$on(AUTH_EVENTS.loginSuccess,function(){
        localStorageService.set('mindmap_userID',$scope.currentUser.userID);
        alert('logged in!');
      });
      $scope.$on(AUTH_EVENTS.logoutSuccess,function(){
        localStorageService.remove('mindmap_userID');
        $scope.currentUser=null;
        alert('logged out!');
      });
  }]).

  controller('LoginCtrl', ['$scope','$rootScope','$eb','$state','AUTH_EVENTS','AuthService',function($scope,$rootScope,$eb,$state,AUTH_EVENTS,AuthService) {
       $scope.credentials = {
         username: '',
         password: ''
       };
       $scope.login = function (credentials) {
            AuthService.login(credentials).then(function (user) {
              $scope.setCurrentUser(user);
              $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
              $state.go("mindmaps");
              $scope.closeLightbox();
            }, function () {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
       };
  }])
  .controller('MindMapCtrl', ['$scope','$eb','$state','$stateParams','$timeout','usSpinnerService','AUTH_EVENTS',function($scope,$eb,$state,$stateParams,$timeout,usSpinnerService,AUTH_EVENTS) {
    $scope.mindMap={};
    $scope.openCreatedMap=true;
    //after all completed check viewmode
    $timeout(function(){
        if(!$scope.currentUser || ($stateParams.hasOwnProperty('viewMode') && $stateParams.viewMode==='public')){
          $scope.viewMode="public";
        }else{
          $scope.viewMode="user";
        }
    },100);
    
    $scope.initEditor = function(){
        if($eb.isReady()){
            $scope.showMaps();
        }else{
            $eb.addOpenCall($scope.showMaps);
        }
    }
    $scope.showMaps = function(){
        $eb.send('mindMaps.list', {}, function(res) {
            $.each(res.mindMaps, function() {
                renderListItem(this);
            });
        });
    };
    $scope.openMap = function(mindMap){
        usSpinnerService.spin("spinner-editor");
        $scope.mindMap = mindMap;
        new MindMapEditor(mindMap, $eb,$scope,function(){
            angular.element('#MapName').html("<h4>Map: " + mindMap.name + "</h4>");
            //stop after all dom operations done
            $timeout(function(){
                usSpinnerService.stop("spinner-editor");
            },100);
        });
    };
    $scope.createMap = function(mapName,openMap){
      $eb.send('mindMaps.save', {name: mapName}, function(result) {
            renderListItem(result);
            if(openMap){
              $scope.$apply(function(){
                $scope.openMap(result);
              });
            }
      });
      $scope.closeLightbox();
      //set to defaults
      $scope.createdMapName="";
      $scope.openCreatedMap=true;
    };
    $scope.setViewMode = function(viewMode){$scope.viewMode=viewMode;};
    $scope.getViewMode = function(){return $scope.viewMode;};
    /* event handlers */
    $scope.$on(AUTH_EVENTS.loginSuccess,function(){
      $scope.viewMode='user';
    })
    $scope.$on("nodeAdded",function(event,data){
        alert('node added to ' + data.nodeName);
    });
    $scope.$on("nodeRenamed",function(event,data){
        alert('node '+data.nodeKey+' renamed to '+ data.newName);
    });
    $scope.$on("nodeDeleted",function(event,data){
        alert('node '+data.nodeName+ ' deleted');
    });
    /* menu generator */
    var renderListItem = function(mindMap) {
        var $li = angular.element('<li class="span4">'),
        openMindMap = function() {
            $scope.openMap(mindMap);
            return false;
        },
        deleteMindMap = function() {
            $eb.send('mindMaps.delete', {id: mindMap._id}, function() {
                $li.remove();
            });
            //clear editor and name if deleted map now opened
            if(mindMap.name === $scope.mindMap.name){
                angular.element(".editor").html("");
                angular.element("#MapName").html("");
            }
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
        // fix undefined name
        if (typeof mindMap.name !== "undefined") {
          angular.element('<a>').text(mindMap.name).attr('href', '#').on('click',openMindMap).appendTo($li);
          angular.element('<button>').text('Smazat').addClass("btn btn-danger pull-right").on('click',deleteMindMap).appendTo($li);
          angular.element('<button>').addClass("save-as-png btn btn-primary pull-right").text('Uložit').on('click',saveAsPNG).appendTo($li);
          $li.appendTo('.mind-maps');
        }
    };
  }]);