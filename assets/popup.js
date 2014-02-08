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
   */
   var secondsRequired = 10000 * 60 * 60;


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
    tick: function() {
      // Triggered every second.
      publicObj.addTimeSpent(1);
      setTimeSpent(secondsSpent);
      publicObj.updateView();
    },
    updateView: function() {
      var countdownEl = document.getElementById('countdown');
      if (countdownEl !== undefined) {
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
        countdownEl.innerHTML = result;
      }
    }
  }

  return publicObj;
}();

// Start ticking down as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  setInterval(masteryTimer.tick, 1000);
});
