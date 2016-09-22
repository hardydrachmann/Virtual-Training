angular
	.module('kosmoramaApp')
	.controller('HomeController',
		function($rootScope, $state, $timeout, $ionicHistory, $cordovaNetwork, languageService, storageService, popupService, dataService, loadingService, mediaService, downloadService, debugService, tabsService) {

			var self = this;
			self.audio = '';
			self.online = false;

			(function init() {
				if (!debugService.device || $cordovaNetwork.getNetwork() === 'wifi') {
					assessNetwork();
				}
				$rootScope.device = debugService.device;

				$rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
					if (!self.online) {
						if (networkState === 'wifi') {
							self.online = true;
							assessNetwork(networkState);
						}
					}
				});

				$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
					if (self.online) {
						if (networkState !== 'wifi') {
							self.online = false;
						}
					}
				});
			})();

			self.getPassCount = function() {
				var trainings = storageService.persistentUserData.training;
				var passCount = 0;
				for (var i = 0; i < trainings.length; i++) {
					if (trainings[i].passTitle) {
						passCount++;
					}
				}
				return passCount;
			};

			/**
			 * Pretend to access to network when working from a browser.
			 */
			self.spoofNetwork = true;
			$rootScope.browserSubmit = function() {
				if (!debugService.device) {
					if (self.spoofNetwork) {
						assessNetwork('wifi');
					}
				}
			};

			/**
			 * Checks the internet status to determine whether it's possible to sync.
			 */
			function assessNetwork(networkState) {
				console.log('Assessing network state...');
				if (debugService.device) {
					// Actually get the network state of the device.
					networkState = $cordovaNetwork.getNetwork();
				}
				if (storageService.getCompleted().length) {
					syncData();
				}
				else {
					getData();
				}
			}

			/**
			 * Syncs data to the database and updates current training plan.
			 * !BUG!: Need callback to avoid getting new training before currently finished training has been submitted.
			 */
			function syncData() {
				var data = storageService.getCompleted();
				console.log('Syncing stored data.', data);
				if (data.length) {
					loadingService.loaderShow();
					for (var i = 0; i < data.length; i++) {
						if (data[i]) {
							for (var j = 0; j < data[i].reports.length; j++) {
								console.log('Training report', data[i].reports[j][0]);
								dataService.postData(data[i].reports[j]);
							}
							console.log('Training feedback', data[i].passData);
							dataService.postFeedback(data[i].passData);
						}
					}
				}
				getData();
			}

			/**
			 * Get the user's training plan.
			 */
			function getData() {
				console.log('Getting data.');
				loadingService.loaderShow();
				storageService.clearTrainingData();
				storageService.printUserData();
				dataService.getUser(storageService.getUserScreenNumber(), function(result) {
					getTraining(result.Id);
				});
			}

			/**
			 * Get training items from service and download media.
			 */
			function getTraining(userId) {
				dataService.getTraining(userId, function(data) {
					if (data) {
						$timeout(function() {
							if (debugService.device) {
								downloadTraining(data);
							}
							sortTraining(data);
							loadingService.loaderHide();
							console.log('Getting data done!');
							storageService.printStorage();
							storageService.printUserData();
						}, 2000);
					}
					else {
						loadingService.loaderHide();
						popupService.alertPopup(languageService.getText('noTrainingText'));
					}
				});
			}

			/**
			 * Remove all media files on device, then download all new media files.
			 */
			function downloadTraining(trainings) {
				self.audio = '';
				mediaService.removeMedia();
				downloadService.createMediaFolders(trainings, function() {
					var success = false;
					for (var i = 0; i < trainings.length; i++) {
						success = downloadService.downloadMedia(trainings[i].ExerciseId);
						if (!success) {
							break;
						}
						console.log('success at: ', trainings[i]);
					}
					loadingService.loaderHide();
					$timeout(function() {
						self.audio = mediaService.getAudio('prompt');
					}, 100);
					if (success) {
						popupService.checkPopup(true);
					}
					else {
						popupService.checkPopup(false);
						tabsService.setTabs();
					}
					self.audio = '';
				});
			}

			/**
			 * Sorting and adding a pass item for each set of training.
			 */
			function sortTraining(data) {
				if (data.length > 0) {
					var setCount = data[0].SessionOrderNumber,
						pass = 1,
						firstTrainingId = data[0].TrainingId;
					for (var i = 0; i < data.length; i++) {
						if (data[i].SessionOrderNumber === setCount || data[i].TrainingId > firstTrainingId) {
							storageService.persistentUserData.training.push({
								passTitle: languageService.getText('passText') + pass++
							});
							setCount++;
							firstTrainingId = data[i].TrainingId;
						}
						storageService.persistentUserData.training.push(data[i]);
					}
				}
			}
		});
