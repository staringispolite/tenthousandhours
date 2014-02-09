// Copyright (c) 2014 Jonathan Howard
// TODO: Add persistence to local storage.
// TODO: Add play/pause to countdown.

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

  /**
   * Persist current time to local storage
   *
   * @param {int} currentTime
   * @private
   */
  setTimeSpent = function(currentTime) {
    // Stubbed out for now.
  };

  var publicObj = {
    /**
     * Get from local storage
     *
     * @type {int}
     * @public
     */
    getTimeSpent: function() {
       // Stubbed out for now.
       return 0;
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

      // reset starting timestamp

      // Switch image, text, and to pause click event
      $('#control').click(publicObj.pause);
      $('#icon').attr('src', imgUrlPause);
      $('#shoutout').html('Focus!').removeClass('red green').addClass('green');
    }, 
    /**
     * Stop counting time toward mastery
     */
    pause: function() {
      // Mark as paused;
      isPaused = true;

      // reset starting timestamp

      // Switch image, text, and to play click event
      $('#icon').attr('src', imgUrlPlay);
      $('#control').click(publicObj.play);
      $('#shoutout').html('Ready?').removeClass('red green').addClass('red');
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
