angular
	.module('kosmoramaApp')
	.controller('TimerController', function($interval, $window, $timeout, $state, $ionicHistory, languageService, storageService, mediaService, tabsService) {

		var self = this;

		var counter;
		var video = $('video').get(0);

		self.seconds = 0;
		self.capacity = 0;
		self.paused = false;
		self.radius = 0;
		self.intermission = false;

		self.training = {
			sets: 0,
			time: 0,
			pause: 0
		};

		(function init() {
			var currentTraining = storageService.proceduralUserData.currentTraining;
			self.training = {
				sets: currentTraining.Sets,
				time: (currentTraining.TimeSet * 60) + 1,
				pause: (currentTraining.Pause * 60) + 1
			};
			$window.onresize = refreshRadius;
			refreshRadius();
			start(self.training.time);
		})();

		/**
		 * Pause the timer if not in intermission. If paused, resume instead.
		 */
		self.pause = function() {
			if (self.paused) {
				// Get remaining seconds before starting incrementing again.
				var seconds = self.training.time - self.seconds;
				// Start incrementing.
				incrementTimer();
				counter = $interval(function() {
					incrementTimer();
				}, 1000, seconds);
				self.paused = false;
				video.play();
			}
			else {
				$interval.cancel(counter);
				counter = null;
				self.paused = true;
				// Let interval cancel before pausing video.
				$timeout(function() {
					video.pause();
				}, 100);
			}
		};

		/**
		 * Reset the timer.
		 */
		self.reset = function() {
			$interval.cancel(counter);
			counter = null;
			self.seconds = 0;
			self.paused = false;
		};

		/**
		 * Returns an object containing remaining minutes and seconds.
		 */
		self.formattedTime = function() {
			var remainingTime = self.intermission ? self.seconds : self.training.time - self.seconds;
			var minutes = Math.floor(remainingTime / 60);
			var seconds = remainingTime - (minutes * 60);
			return {
				min: minutes,
				sec: seconds
			};
		};

		self.getIcon = function() {
			return self.paused ? 'ion-play icon-position' : 'ion-pause';
		};

		/**
		 * Start the timer if not already started.
		 */
		function start(time) {
			self.capacity = time;
			self.seconds = self.intermission ? time : 0;
			incrementTimer();
			counter = $interval(function() {
				incrementTimer();
			}, 1000, time);
			video.play();
		}

		/**
		 * Increments the training timer or decrements the intermission timer. Also toggles between the two states.
		 * If training in progress, increment the timer it by a second until the specified time is reached.
		 * If pause in progress, decrement the timer by a second until 0 is reached.
		 * When the limit is reached, switch between active and pause. Decrement set count, if pause is over.
		 */
		function incrementTimer() {
			// If there is an intermission.
			if (self.intermission) {
				// If there's still time left.
				if (self.seconds > 0) {
					self.seconds--;
				}
				// If the intermission has just ended.
				else {
					self.intermission = false;
					start(self.training.time);
					video.play();
					// If there are any more sets left.
					if (self.training.sets > 0) {
						self.training.sets--;
					}
				}
			}
			// If training is in progress.
			else {
				// If there is time left.
				if (self.seconds < self.training.time) {
					self.seconds++;
				}
				// If the set just ended, and there are any sets left.
				else if (self.training.sets > 1) {
					self.intermission = true;
					start(self.training.pause);
					video.pause();
				}
				// If training is done.
				else {
					self.reset();
					mediaService.playIosAudio('stopTraining');
					tabsService.continue();
				}
			}
		}

		/**
		 * Update the radius of the progress bar.
		 * Used when the screen changes size while developing in a browser.
		 * Also take into account the ratio of the screen, to make sure the progress bar fits on wider devices.
		 */
		function refreshRadius() {
			if ($window.outerWidth / $window.innerHeight == 0.75) {
				self.radius = $window.outerHeight / 7;
			} else {
				self.radius = $window.outerHeight / 6;
			}
		}
	});
