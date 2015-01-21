'use strict';

/* Controllers */
angular.module('mindmap.controllers', []).
  controller('AppCtrl', ['$scope','$rootScope','$eb','$state','$timeout','$window','USER_ROLES','AUTH_EVENTS','AuthService','localStorageService','notificationService', function($scope,$rootScope,$eb,$state,$timeout,$window,USER_ROLES,AUTH_EVENTS,AuthService,localStorageService,notificationService){
      $scope.rebindLightboxes=false;
      $scope.showChatLink=false;
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
      $scope.makeAlert=function(text){$window.alert(text);};
      $scope.setCurrentUser = function (user){
        $scope.currentUser=user;
      };

      var storedUserID = localStorageService.get('mindmap_userID');
      if(storedUserID){
        $eb.addOpenCall(function(){
          //relogin from localstorage  
          AuthService.relogin(storedUserID).then(function(user){
              $scope.setCurrentUser(user);
              $rootScope.$broadcast("reloadMaps");
          },function(error){
            //timeout because all event handlers will be handled later
              $timeout(function(){
                $rootScope.$broadcast(AUTH_EVENTS.reloginFailed);
              },500);
          });
        });
      }else{
        //timeout because all event handlers will be handled later
        $timeout(function(){
          $rootScope.$broadcast(AUTH_EVENTS.reloginFailed);
        },500);
      }

      $scope.logout = function(){
        AuthService.logout($scope.currentUser.userID).then(function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },function(){
            $rootScope.$broadcast(AUTH_EVENTS.logoutFailed);
        }); 
      };
      $scope.toggleChat = function(newState){
        var $chatWindow=angular.element("#ChatWindow");
        if(newState){
          $chatWindow.show().animate({"right":"0px"},1000,function(){
            $scope.showed=newState;
            $scope.showChatLink=false;
            $scope.$apply();
          });
        }else{
          $chatWindow.animate({"right":'-300px'},1000,function(){
            $chatWindow.hide();
            $scope.showed=newState;
            $scope.showChatLink=true;
            $scope.$apply();
          });
        } 
      };
      /* lightboxes */
      $scope.fillLightbox= function(type){
         $scope.lightboxBody="views/lightboxes/"+type+".html";
      };
      $scope.closeLightbox=function(){
        angular.element("#LightboxCloser").click();
      };
      //saving each statechange for recompile lightbox launchers
      $scope.$on('$viewContentLoaded', 
        function(event){ 
        $scope.rebindLightboxes=true;
      });
      $scope.$on('$includeContentRequested', function(event,url) {
        if(url.indexOf('lightbox') != -1){
          angular.element("#LightboxBody").css("opacity",0);
        }
      });
      $scope.$on('$includeContentLoaded', function(event,url) {
        if(url.indexOf('lightbox') != -1){
          angular.element("#LightboxBody").css("opacity",1);
        }
    });
      $scope.oneNodeWithoutOthers = function(node){
        var returnNode = angular.copy(node);
        delete returnNode.children;
        delete returnNode.parent;
        return angular.copy(node,returnNode);
        
      };
      /* event handlers */
      var goToLogin=function(){$state.go("login");};
      $scope.$on(AUTH_EVENTS.notAuthorized,goToLogin);
      $scope.$on(AUTH_EVENTS.notAuthenticated,goToLogin);
      $scope.$on(AUTH_EVENTS.loginFailed,function(){
        notificationService.error("Login failed!");
      });
      $scope.$on(AUTH_EVENTS.logoutFailed,function(){
        notificationService.error("Logout failed!");
      });
      $scope.$on(AUTH_EVENTS.loginSuccess,function(){
        localStorageService.set('mindmap_userID',$scope.currentUser.userID);
        notificationService.info("Logged in success");
      });
      $scope.$on(AUTH_EVENTS.logoutSuccess,function(){
        localStorageService.remove('mindmap_userID');
        $scope.currentUser=null;
        $scope.rebindLightboxes=true;
        $state.go("mindmaps",{viewMode:"public"});
        notificationService.info("Logged out success");
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
              $state.go("mindmaps",{viewMode:"user"});
              $scope.closeLightbox();
            }, function () {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
       };
  }])
  .controller('MindMapCtrl', ['$scope','$rootScope','$eb','$state','$stateParams','$timeout','usSpinnerService','AUTH_EVENTS','notificationService',function($scope,$rootScope,$eb,$state,$stateParams,$timeout,usSpinnerService,AUTH_EVENTS,notificationService) {
    var viewModes=["public","user","search"];
    $scope.mindMap={};
    $scope.mindMaps=[];
    //wrong viewMode handle
    if($stateParams.viewMode){
      if($.inArray($stateParams.viewMode,viewModes) === -1){
        $state.go("mindmaps",{viewMode:"public"});
      }
    }
    //search withnout query handle
    if($stateParams.viewMode === 'search'){
       if($stateParams.searchQuery){
          $scope.searchQuery=$stateParams.searchQuery;
       }else{
          $state.go("mindmaps",{viewMode:'public'});
       }
    }
    $scope.initEditor = function(){
        if($eb.isReady()){
            $scope.showMaps();

        }else{
            $eb.addOpenCall($scope.showMaps);
        }
    }
    $scope.showMaps = function(){
        var matcher={};
        if(typeof $scope.searchQuery ==='string'){
          matcher.name={'$regex':'^'+$scope.searchQuery,'$options':'i'};
        }
        if(!$stateParams.viewMode || $stateParams.viewMode==='public' || $stateParams.viewMode==='search'){
          //public is default, in public mode and in search mode
          matcher.public=true;
        }
        if($stateParams.viewMode!== 'public' && $scope.currentUser!=null){
          matcher.users = $scope.currentUser.username;
        }
        if($stateParams.viewMode=== 'user' && $scope.currentUser==null){
          //no access to user maps if no user set
          return;
        }
        $eb.send('mindMaps.list', matcher, function(res) {
            $scope.$apply(function(){
              $scope.mindMaps=res.mindMaps;
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
            $rootScope.$broadcast("registerToChat",{mindMap:mindMap});
        });
    };
    $scope.createMap = function(mapName,openMap,publicMap){
      var params={name: mapName};
      if($scope.currentUser!=null){
        params.users=[$scope.currentUser.username];
      }
      params.public=$stateParams.viewMode==='public' || publicMap;
      $eb.send('mindMaps.save', params, function(result) {
            $scope.$emit("reloadMaps");
            if(openMap){
              $scope.$apply(function(){
                 $scope.openMap(result);
              });
            }
          
      });
    };
    $scope.renameMapHint= function(){
      alert('To rename a map just simply rename the first node of mind map.');
    };
    $scope.togglePublicMode = function(mindMap){

    };
    $scope.deleteMap = function(mindMap){
      if(confirm("Do you really want to delete a whole mind map called "+mindMap.name+"?")){
        $eb.send('mindMaps.delete', {id: mindMap._id}, function() {
           //clear editor and name if deleted map now opened
            if(mindMap.name === $scope.mindMap.name){
              angular.element(".editor").html("");
              angular.element("#MapName").html("");
            }
            $scope.$emit("reloadMaps");
        });
      } 
    };
    $scope.searchMaps = function(searchQuery){
      if(searchQuery!=""){
        $state.go("mindmaps",{viewMode:"search",searchQuery:searchQuery});
      }else{
        $state.go("mindmaps",{viewMode:"public"});
      }
    };
    $scope.saveMapAsPNG = function() {
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
    };
    $scope.getViewMode = function(){return $stateParams.viewMode;};
    $scope.getShowChatLink = function(){return $scope.showChatLink};
    /* event handlers */
    //redirect if no user tried user mode (after localstorage relogin failed)
    $scope.$on(AUTH_EVENTS.reloginFailed,function(){
      if($stateParams.viewMode==='user' && $scope.currentUser==null){
        $state.go("mindmaps",{viewMode:"public"});
      }
    });
    //form handlers
    $scope.$on("forms-createMapSended",function(event,data){
      $scope.createMap(data.mapName,data.openCreatedMap,data.publicMap);
    });
    $scope.$on("forms-searchFormSended",function(event,data){
      $scope.searchMaps(data.searchQuery);
    })

    $scope.$on("reloadMaps",function(event){
      $scope.showMaps();
    });
    $scope.$on("chatLink",function(event,data){
      $scope.showChatLink=data.showChatLink;
    });
    $scope.$on(AUTH_EVENTS.loginSuccess,function(){
      $scope.viewMode='user';
    });
    $scope.$on(AUTH_EVENTS.logoutSuccess,function(){
      $scope.viewMode="public";
    });
    
    $scope.$on("nodeAdded",function(event,data){
        notificationService.info('Node added.');
    });
    $scope.$on("nodeRenamed",function(event,data){
        notificationService.info('Rename success.');
        if(data.firstNode === "true"){
          //first node renamed -> map name renamed, we must reload map list
          $scope.showMaps();
        }
    });
    $scope.$on("nodeDeleted",function(event,data){
        notificationService.info('Node '+data.nodeName+ ' deleted.');
    });
  }])
.controller('ChatCtrl',['$scope','$eb',function($scope,$eb){
  $scope.inited=false;
  $scope.showed=true;
  $scope.message="";
  $scope.messages=[];
  $scope.mindMap=null;
  if($scope.currentUser!=null){
    $scope.username=$scope.currentUser.username;
  }else{
    $scope.username="anonymous";
  }
  $scope.$on("registerToChat",function(event,data){
    $scope.registerToChat(data.mindMap);
  });
  $scope.registerToChat= function(mindMap){
    $scope.mindMap=mindMap;
    $eb.registerHandler("mindMaps.chat."+mindMap._id, function (message) {
          $scope.messages.push(message);
          $scope.$apply();
    });
    $scope.inited=true;
    $scope.$emit("chatLinkEvent",{showChatLink:false});
  };
  $scope.sendMessage=function(message){
    if($scope.mindMap){
      $eb.publish('mindMaps.chat.'+$scope.mindMap._id,{text:message,username:$scope.username,datetime:moment().format("MMMM Do YYYY, h:mm:ss a")});
      $scope.message="";
      angular.element("#ChatMessageInput").val("");
    }else{
      throw new Error("No Mindmap set in ChatCtrl!");
    }
  };
  $scope.getAgo = function(datetime){
    return moment(datetime,"MMMM Do YYYY, h:mm:ss a").fromNow();
  }
}])
.controller('FormsCtrl', ['$scope','$rootScope','$stateParams', function($scope,$rootScope,$stateParams){
  //controller for forms, communicate with other ctrl with events
  //default scope data in function immedietly called
  var defaults = function(){
    $scope.createdMapName="";
    $scope.openCreatedMap=true;
    $scope.createdMapPublic=false;
  };defaults();
  $scope.createMapFormSended= function(mapName,openCreatedMap,publicMap){
    if(typeof publicMap === 'undefined'){
      publicMap=true;
    }
    $rootScope.$broadcast("forms-createMapSended",{mapName:mapName,openCreatedMap:openCreatedMap,publicMap:publicMap});
    $scope.closeLightbox();
    //set to defaults
    defaults();
  };
  $scope.searchForMindMap = function(searchQuery){
    $scope.searchQuery="";
    $rootScope.$broadcast("forms-searchFormSended",{searchQuery:searchQuery});
  };
  $scope.getViewMode = function(){
    return $stateParams.viewMode;
  }

}])