// Copyright (c) 2014 Jonathan Howard
// TODO: Work while closed
//       -- Timestamp based, tick only does display
//       -- Local storage for play/pause
//       -- Local storage for timestamp
//       -- "loading..." first thing, while it pulls up state
//          from local storage.
// TODO: Icon changes to "lit up" orange when on. grey when off
// TODO: Persist to Chrome's sync'ed storage occasionally
//       (avoiding rate limits).

var masteryTimer = function () {
  /**
   * The number to display (periodically persisted to local storage).
   * Starts at 0, goes up to 60*60*10000.
   *
   * @type {int}
   * @private
   */
   var secondsSpent = 0;

  /**
   * The number of seconds 'required' for mastery under the 10,000
   * hours rule.
   * 
   * @type {int}
   * @private
   */
   var secondsRequired = 10000 * 60 * 60;

  /**
   * True if paused, false otherwise.
   * 
   * @type {bool}
   * @private
   */
   var isPaused = true;

   var imgUrlPlay = "play-32.png";
   var imgUrlPause = "pause-32.png";
   var localStorageKey = "secSpent";
   var iconURIplaying = "icon.png";
   var iconURIpaused = "icoff.png";  // GET IT?? 

  /**
   * Persist current time to local storage
   *
   * @param {int} currentSecondsSpent
   * @private
   */
  setTimeSpent = function(currentSecondsSpent) {
    //chrome.storage.sync.set({localStorageKey: currentSecondsSpent},
    //  function() {
        //console.log('saved current seconds spent: ' + currentSecondsSpent);
    //    console.log('error? ' + chrome.runtime.lastError);
    //});
    localStorage[localStorageKey] = currentSecondsSpent;
  };

  /**
   * Animate the icon slightly so it looks clicked
   *
   * @private
   */
  animatedClick = function() {
    $('#icon').animate({
        'margin-top': '2px'
      },
      100,
      'swing',
      function() {
        $('#icon').animate({
          'margin-top': '0'
          },
          100);
      }); 
  };

  var publicObj = {
    /**
     * Get from local storage, set timer with it
     *
     * @type {int}
     * @public
     */
    getSecondsSpent: function() {
      //console.log('key: ' + localStorageKey);
      //chrome.storage.sync.get(localStorageKey,
      //  function(items) {
      //    secondsSpent = items[localStorageKey];
      //    if (secondsSpent === undefined || isNaN(secondsSpent)) {
      //      secondsSpent = 0;
      //    }
      //    //console.log('got ' + secondsSpent + ' sec spent from local storage');
      //});
      secondsSpent = Number(localStorage[localStorageKey]);
      if (secondsSpent === undefined || isNaN(secondsSpent)) {
        secondsSpent = 0;
      }
    },
    /**
     * Allow people to add time spent before installing the extention.
     *
     * @param {int} additionalSeconds
     * @public
     */
    addTimeSpent: function(additionalSeconds) {
      // Add to displayTime.
      secondsSpent += additionalSeconds;
    },
    /**
     * Initialize the timer.
     */
    init: function() {
      // Start ticking down as soon as the document's DOM is ready.
      $(document).ready(function () {
        setInterval(publicObj.tick, 1000);
      });

      // Setup play click event
      $('#control').click(publicObj.play);
    },
    /** 
     * Start counting time toward mastery.
     */
    play: function() {
      // Mark as unpaused;
      isPaused = false;

      // reset starting point from storage
      publicObj.getSecondsSpent();

      // Switch image, text, and to pause click event
      animatedClick();
      $('#control').unbind('click', publicObj.play);
      $('#control').click(publicObj.pause);
      $('#icon').attr('src', imgUrlPause);
      $('#shoutout').html('Focus!').removeClass('red green').addClass('green');
      // Change browser icon to 'on'.
      chrome.browserAction.setIcon({
        path: iconURIplaying
      });
    },
    /**
     * Stop counting time toward mastery
     */
    pause: function() {
      // Mark as paused;
      isPaused = true;

      // reset starting timestamp

      // Switch image, text, and to play click event
      animatedClick();
      $('#icon').attr('src', imgUrlPlay);
      $('#control').unbind('click', publicObj.pause);
      $('#control').click(publicObj.play);
      $('#shoutout').html('Ready?').removeClass('red green').addClass('red');
      // Change browser icon to 'off'.
      chrome.browserAction.setIcon({
        path: iconURIpaused
      });
    }, 
    tick: function() {
      // Triggered every second.
      if (!isPaused) {
        publicObj.addTimeSpent(1);
        setTimeSpent(secondsSpent);
        publicObj.updateView();
      }
    },
    updateView: function() {
      var totalSec = secondsRequired - secondsSpent;
      var days = parseInt(totalSec / (3600*24));
      var hours = parseInt(totalSec / 3600) % 24;
      var minutes = parseInt(totalSec / 60) % 60;
      var seconds = totalSec % 60;

      var result = days + " days, " + 
                   (hours < 10 ? "0" + hours : hours) + ":" + 
                   (minutes < 10 ? "0" + minutes : minutes) + ":" + 
                   (seconds  < 10 ? "0" + seconds : seconds +
                   " left");
      $('#countdown').html(result);
    }
  }

  return publicObj;
}();

masteryTimer.init();
