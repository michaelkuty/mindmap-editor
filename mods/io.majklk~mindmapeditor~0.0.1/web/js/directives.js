'use strict';

/* Directives */

angular.module('mindmap.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
directive('ngLightbox', ['$compile','$timeout', function($compile,$timeout) {
    return function(scope, element, attr) {
        var lightbox, options, overlay;

        var defaults = {
            'class_name': false,
            'trigger': 'manual',
            'element': element[0],
            'kind': 'normal'
        }
        var options = angular.extend(defaults, angular.fromJson(attr.ngLightbox));

        // check if element is passed by the user
        options.element = typeof options.element === 'string' ? document.getElementById(options.element) : options.element;

        var add_overlay = function(){
            if(document.getElementById('overlay')) return;
            // compiling when we add it to have the close directive kick in
            overlay = $compile('<div id="overlay" ng-lightbox-close/>')(scope);

            // add a custom class if specified
            options.class_name && overlay.addClass(options.class_name);

            // append to dom
            angular.element(document.body).append(overlay);

            // load iframe options if defined
            options.kind === 'iframe' && load_iframe();

            // we need to flush the styles before applying a class for animations
            window.getComputedStyle(overlay[0]).opacity;
            overlay.addClass('overlay-active');
            angular.element(options.element).addClass('lightbox-active').css("margin-top",angular.element(document).scrollTop()+150);
            },
        load_iframe = function(){
            options.element = options.element || 'lightbox-iframe';
            var iframe = "<div id='" + options.element + "' class='lightbox'><iframe frameBorder=0 width='100%' height='100%' src='" + attr.href + "'></iframe></div>";
            angular.element(document.body).append(iframe);
        },
        showfn=function(event) {
            add_overlay();
            event.preventDefault();
            return false;
        },
        bindfn=function(fromWatch){
            if(options.trigger === 'auto'){
                add_overlay();
            }else if(options.hasOwnProperty("launcherID")){
                if(!fromWatch){
                    $timeout(function(){
                        angular.element("a#"+options.launcherID).bind('click', showfn);
                    },200);
                }else{
                    angular.element("a#"+options.launcherID).bind('click', showfn);
                }
            }else if(options.hasOwnProperty("launcherClass")){
                if(!fromWatch){
                    $timeout(function(){
                        angular.element("a."+options.launcherClass).bind('click', showfn);
                    },200);
                }else{
                    angular.element("a."+options.launcherClass).bind('click', showfn);
                }
            }
        };
        scope.$watch('rebindLightboxes',function(newVal,oldVal){
            if(newVal === true){
                bindfn(true);
                scope.rebindLightboxes=false;
            }
        });
        //do first bind
        bindfn();
    };
}]).

directive('ngLightboxClose', function() {
    return function(scope, element, attr) {
        var remove_overlay = function(){
            var overlay = document.getElementById('overlay');
            angular.element(document.getElementsByClassName('lightbox-active')[0]).removeClass('lightbox-active');

            // fallback for ie8 and lower to handle the overlay close without animations
            if(angular.element(document.documentElement).hasClass('lt-ie9')){
                angular.element(overlay).remove();
            }else{
                angular.element(overlay).removeClass('overlay-active');
            }
        },
        transition_events = ['webkitTransitionEnd', 'mozTransitionEnd', 'msTransitionEnd', 'oTransitionEnd', 'transitionend'],
        closer=document.getElementById('LightboxCloser');

        angular.forEach(transition_events, function(ev){
            element.bind(ev, function(){
                // on transitions, when the overlay doesnt have a class active, remove it
                !angular.element(document.getElementById('overlay')).hasClass('overlay-active') && angular.element(document.getElementById('overlay')).remove();
            });
        });

        // binding esc key to close
        angular.element(document.body).bind('keydown', function(event){
            event.keyCode === 27 && remove_overlay();
        });

        // binding click on overlay to close
        element.bind('click', function(event) {
            remove_overlay();
        });
        if(closer){
        // binding click to close button
        angular.element(closer).bind('click',function(event){
            remove_overlay();
            event.preventDefault();
        });
        }

    };
});

