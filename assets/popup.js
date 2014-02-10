// Copyright (c) 2014 Jonathan Howard


var masteryTimer = function () {
  /**
   * The number to display (periodically persisted to local storage).
   * Starts at 0, goes up to 60*60*10000.
   *
   * @type {int}
   * @private
   */
  var secondsSpent = 0;

  var startTimestamp = 0;
  var lastSyncTimestamp = 0;

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

  // LocalStorage keys.
  var lsKeyTotalElapsedSeconds = "secSpent";
  var lsKeyStartTimestamp = "startTimestamp";
  var lsKeyLastSyncTimestamp = "lastSyncTimestamp";
  var lsKeyIsPaused = "isPaused";

  // Resource URIs.
  var imgUrlPlay = "play-32.png";
  var imgUrlPause = "pause-32.png";
  var iconURIplaying = "icon.png";
  var iconURIpaused = "icoff.png";  // GET IT?? 


  /**
   * Get current time since the epoch, in seconds.
   *
   * @private
   */
  getCurrentTimestamp = function() {
    return Math.round(new Date().getTime() / 1000)
  };

  /**
   * Persist current time to local storage.
   * TODO: Periodically persist to Google's synced storage.
   *
   * @param {int} currentSecondsSpent
   * @private
   */
  setTimeSpent = function(currentSecondsSpent) {
    //chrome.storage.sync.set({lsKeyTotalElapsedSeconds: currentSecondsSpent},
    //  function() {
        //console.log('saved current seconds spent: ' + currentSecondsSpent);
    //    console.log('error? ' + chrome.runtime.lastError);
    //});
    localStorage[lsKeyTotalElapsedSeconds] = currentSecondsSpent;
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
      //console.log('key: ' + lsKeyTotalElapsedSeconds);
      //chrome.storage.sync.get(lsKeyTotalElapsedSeconds,
      //  function(items) {
      //    secondsSpent = items[lsKeyTotalElapsedSeconds];
      //    if (secondsSpent === undefined || isNaN(secondsSpent)) {
      //      secondsSpent = 0;
      //    }
      //    //console.log('got ' + secondsSpent + ' sec spent from local storage');
      //});
      secsSpent = Number(localStorage[lsKeyTotalElapsedSeconds]);
      if (secsSpent === undefined || isNaN(secsSpent)) {
        secsSpent = 0;
      }
      return secsSpent;
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
     * Initialize the timer from localStorage state.
     */
    init: function() {
      // Initial state from localStorage
      startTimestamp = Number(localStorage[lsKeyStartTimestamp]);
      if ((startTimestamp === undefined) || isNaN(startTimestamp)) {
        startTimestamp = 0;
      }
      isPaused = localStorage[lsKeyIsPaused] != "false";
      totalElapsedSeconds = Number(localStorage[lsKeyTotalElapsedSeconds]);
      if ((totalElapsedSeconds === undefined) || isNaN(totalElapsedSeconds)) {
        totalElapsedSeconds = 0;
      }
      lastSyncTimestamp = Number(localStorage[lsKeyLastSyncTimestamp]);
      if ((lastSyncTimestamp === undefined) || isNaN(lastSyncTimestamp)) {
        lastSyncTimestamp = 0;
      }

      // Set display now that it's loaded.
      if (!isPaused) {
        publicObj.play(); // already playing.
      }

      // Start ticking as soon as the document's DOM is ready.
      $(document).ready(function () {
        setInterval(publicObj.tick, 1000);
      });

      // Setup play click event
      $('#control').click(publicObj.play);
    },
    /** 
     * Start counting time toward mastery.
     * Only call this after init().
     */
    play: function() {
      if (startTimestamp == 0) {
        // Only do these on initial play, not loading up into
        // existing 'playing' state.
        startTimestamp = getCurrentTimestamp();
        localStorage[lsKeyStartTimestamp] = startTimestamp;

        // Reset starting point from storage.
        secondsSpent = publicObj.getSecondsSpent();

        // Switch image, text, and to pause click event.
        animatedClick();
      }

      // Change browser icon to 'on'.
      chrome.browserAction.setIcon({
        path: iconURIplaying
      });

      // Mark as unpaused.
      isPaused = false;
      localStorage[lsKeyIsPaused] = false;

      $('#control').unbind('click', publicObj.play);
      $('#control').click(publicObj.pause);
      $('#icon').attr('src', imgUrlPause);
      $('#shoutout').html('Focus!').removeClass('red green').addClass('green');

      // Immediate update, don't wait for the next tick.
      publicObj.updateView();
    },
    /**
     * Stop counting time toward mastery and add session time to total.
     */
    pause: function() {
      // Mark as paused;
      isPaused = true;
      localStorage[lsKeyIsPaused] = "true";

      // Add on time from that session.
      var thisSession = getCurrentTimestamp() - startTimestamp;
      var totalSec = secondsSpent + thisSession;
      setTimeSpent(totalSec);
      
      // reset starting timestamp
      startTimestamp = 0;
      localStorage[lsKeyStartTimestamp] = 0;

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
        publicObj.updateView();
      }
      // TODO: If it's been long enough, sync to Google Chrome account.
    },
    updateView: function() {
      var previousTotal = secondsSpent;
      var thisSession = getCurrentTimestamp() - startTimestamp;
      var totalSec = secondsRequired - (previousTotal + thisSession);
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
