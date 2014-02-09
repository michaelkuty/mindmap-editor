'use strict';

/* Services */


// Demonstrate how to register services
// for example resorts services from snowguide
angular.module('mindmap-editor.services', []).
  value('version', '0.0.7').
  factory('Resorts',['$resource',function($resource){
  	return $resource('api/resorts/:resortID',
		{ resortID: '@resortID',mountains: '@mountains'},{
                    favorite:{
                        method:'GET',
                        params:{favorite:true},
                        isArray:true
                    },
                    byMountains:{
                        method:'GET',
                        params:{mountains:'@mountains'},
                        isArray:true
                    }
          });
  }]).
  factory('Mountains',['$resource',function($resource){
        return $resource('api/mountains');
  }]);
