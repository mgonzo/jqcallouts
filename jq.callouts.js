'use strict';
;(function ($) {

// create the plugin
$.extend($.fn, {
  callout: function (options, callback) {
    if (this.length) {
      return this.each( function () {
        new CallOut(options, this, callback);
      });
    }
  }
});


// the function used in the plugin 
var CallOut = function (options, element, callback) {

  // Save a copy of the element
  var el = element
    , $el = $(el)

    // Set the defaults
    , defaults = {
          hover: false
        , tailOffset: null
      }

    // Mixin the user options
    , opt = $.extend({}, defaults, options)

    // to store globally accessible variables
    , my = {}

    /**
     * Build the necessary html for the tooltip
     * @name buildTarget
     * @return The target jquery object
     */
    , buildTarget = function (href) {
        var $target = $(href)
          , $wrap = document.createElement('div')
          , $tail = document.createElement('div')
          , $arrow = document.createElement('div')
          , $container = document.createElement('div')
          , $interior = document.createElement('div');

        // Save a copy of the original element for uninit()
        $el.data('origin', $target.clone());

        $wrap = $($wrap).addClass('jqcallout');
        $tail = $($tail).addClass('arrow');
        $arrow = $($arrow);
        $container = $($container).addClass('container');
        $interior = $($interior).addClass('interior-container');

        $('body').append($wrap);
        $wrap.append($tail).append($container);
        $tail.append($arrow);
        $container.append($interior);
        $interior.append($target.detach()[0]);

        // copy target id for the new outer div,
        // add content class and remove the id
        $wrap.attr('id', $target.attr('id'));
        $target.addClass('content')
               .removeAttr('id');
        
        // hide and return our new target
        $wrap.addClass('hide');
        return $wrap;
      }

    /**
     * Set the callout's position classes based on the window position of the trigger
     * @name setPosition 
     */
    , setPosition = function () {
        var $target = my.$target   // target element
          , trigger = {
                top: my.$trigger.offset().top
              , bottom: my.$trigger.offset().top + my.$trigger.height()
              , left: my.$trigger.offset().left
              , right: my.$trigger.offset().left + my.$trigger.width()
            }
          , winWidth = $(window).width()
          , winHeight = $(window).height();

        // reset the trigger coordinates

        // set the horizontal class
        if (trigger.right < winWidth/3) {
          $target.addClass('right');
        }
        else if (trigger.right > winWidth/3 && trigger.right < (winWidth/3)*2) {
          $target.addClass('center');
        }
        else if (trigger.right > (winWidth/3)*2) {
          $target.addClass('left');
        }

        // set the vertical class,
        if ($target.hasClass('center')) {
          if (trigger.top < winHeight/2) {
            $target.addClass('bottom');
          }
          else {
            $target.addClass('top');
          }
        }
        else {
          if (trigger.top < winHeight/3) {
            $target.addClass('bottom');
          }
          else if (trigger.top > winHeight/3 && trigger.top < (winHeight/3)*2) {
            $target.addClass('middle');
          }
          else {
            $target.addClass('top');
          }
        }
      }

    /**
     * @name getPosition
     */
    , getPosition = function (args) {
        var $target = my.$target;

        if ($target.hasClass('center')) {

          if ($target.hasClass('bottom') && typeof args['center bottom'] === 'function') {
            args['center bottom']();
          }
          if ($target.hasClass('top') && typeof args['center top'] === 'function') {
            args['center top']();
          }
        }
        else {
          if ($target.hasClass('right')) {

            if ($target.hasClass('bottom') && typeof args['right bottom'] === 'function') {
              args['right bottom']();
            }
            else if ($target.hasClass('middle') && typeof args['right middle'] === 'function') {
              args['right middle']();
            }
            else if ($target.hasClass('top') && typeof args['right top'] === 'function') {
              args['right top']();
            }
          }
          else if ( $target.hasClass('left')) {

            if ($target.hasClass('bottom') && typeof args['left bottom'] === 'function') {
              args['left bottom']();
            }
            else if ($target.hasClass('middle') && typeof args['left middle'] === 'function') {
              args['left middle']();
            }
            else if ($target.hasClass('top') && typeof args['left top'] === 'function') {
              args['left top']();
            }
          }
        }
      }//end getPosition

    /**
     * Place the tail in the correct location
     * @name setTail
     */
    , setTail = function () {
        var tail = {'top': 0, 'left': 0} // set tail coordinates
          , $tail = my.$tail           // tail element
          , $target = my.$target       // target element
          , tailOffset = opt.tailOffset || my.$tail.height()/2;

        getPosition({
          'center bottom': function () {
              var border = $tail.children()
                                  .css('border-bottom-width')
                                  .replace('px',' ')
                                  .trim();

              $tail.width(border * 2);
              tail.left = $target.width()/2 - $tail.width()/2;
          }
          ,'center top': function () {
              my.$target.append($tail.detach());
              tail.left = $target.width()/2 - $tail.width()/2;
          }
          ,'right bottom': function () {
              tail.top = tailOffset;
          }
          ,'left bottom': function () {
              tail.top = tailOffset;
          }
          ,'right middle': function () {
              tail.top = $target.height()/2 - $tail.height()/2;
          }
          ,'left middle': function () {
              tail.top = $target.height()/2 - $tail.height()/2;
          }
          ,'right top': function () {
              tail.top = $target.height() - (tailOffset + $tail.height());
          }
          ,'left top': function () {
              tail.top = $target.height() - (tailOffset + $tail.height());
          }
        });

        $tail.css({'top': tail.top, 'left': tail.left});
      }


    /**
     * Place the callout in the correct location
     * @name setCoords
     */
    , setCoords = function () {
        var trigger = {
                top: my.$trigger.offset().top
              , bottom: my.$trigger.offset().top + my.$trigger.height()
              , left: my.$trigger.offset().left
              , right: my.$trigger.offset().left + my.$trigger.width()
            }
          , $trigger = my.$trigger       // trigger element
          , target = {'top': 0, 'left': 0} // set target coordinates
          , $target = my.$target         // target element
          , $tail = my.$tail             // tail element
          , tailOffset = opt.tailOffset || my.$tail.height()/2
          , winWidth = $(window).width()
          , winHeight = $(window).height();

        // functions to get position
        getPosition({
          'center bottom': function () {
              target.left = trigger.left - $target.width()/2 + $trigger.width()/2;
              target.top = trigger.bottom + tailOffset;
          }
          ,'center top': function () {
              target.left = trigger.left - $target.width()/2 + $trigger.width()/2;
              target.top = trigger.top - $target.height() - tailOffset;
          }
          ,'right bottom': function () {
              target.left = trigger.right + tailOffset;
              target.top = (trigger.top + $trigger.height()/2) -
                           (tailOffset + $tail.height()/2);
          }
          ,'right middle': function () {
              target.left = trigger.right + tailOffset;
              target.top = trigger.top - $target.height()/2 + $trigger.height()/2;
          }
          ,'right top': function () {
              target.left = trigger.right + tailOffset;
              target.top = (trigger.bottom - $target.height() - $trigger.height()/2) +
                           (tailOffset + $tail.height()/2);
          }
          ,'left bottom': function () {
              target.left = trigger.left - $target.outerWidth() - tailOffset;
              target.top = (trigger.top + $trigger.height()/2) -
                           (tailOffset + $tail.height()/2);
          }
          ,'left middle': function () {
              target.left = trigger.left - $target.outerWidth() - tailOffset;
              target.top = trigger.top - $target.height()/2 + $trigger.height()/2;
          }
          ,'left top': function () {
              target.left = trigger.left - $target.outerWidth() - tailOffset;
              target.top = (trigger.bottom - $target.height() - $trigger.height()/2) +
                           (tailOffset + $tail.height()/2);
          }
        });

        // set the position
        $target.css({'top': target.top, 'left': target.left});
      }

    /**
     * @name showTarget
     */
    , showTarget = function () {
        setPosition();
        setTail();
        setCoords();
        my.$target.removeClass('hide');
      }

    /**
     * @name hideTarget
     */
    , hideTarget = function (duration) {
        my.$target.addClass('hide');
        my.$target.removeClass()
                  .attr('class', 'jqcallout hide');
      }

    /**
     * @name hideAll
     */
    , hideAll = function () {
        $('.jqcallout').addClass('hide');
      }

    /**
     * Handle options, store elements and assign event listeners
     * @name init
     */
    , init = function () {
        var href;

        /*
         * Setup the Elements
         */
        my.$trigger = $el;
        href = my.$trigger.attr('href');
        my.$target = buildTarget(href);
        my.$tail = my.$target.children('.arrow');

        /*
         * Setup the Events
         */
          $el.on('click', function (e) {
            e.preventDefault();
            if (my.$target.hasClass('hide')) {
              showTarget();
            }
            else {
              hideTarget();
            }
          });

      };

  init();
};

})(jQuery);

