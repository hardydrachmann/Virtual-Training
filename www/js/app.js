// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular
	.module('virtualTrainingApp', ['ionic', 'ngCordova', 'angular-svg-round-progressbar'])
	.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if (window.cordova) {
				screen.lockOrientation('portrait');
				window.plugins.insomnia.keepAwake();
			}
			if (window.cordova && window.cordova.plugins.Keyboard) {
				// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
				// for form inputs)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

				// Don't remove this line unless you know what you are doing. It stops the viewports
				// from snapping when text inputs are focused. Ionic handles this internally for
				// a much nicer keyboard experience.
				cordova.plugins.Keyboard.disableScroll(false);
			}
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
		$ionicPlatform.registerBackButtonAction(function(e) {
			e.preventDefault();
			return false;
		}, 101);
	})
	.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $sceDelegateProvider) {

		$stateProvider.state('home', {
			url: '/home',
			templateUrl: 'views/home.html',
			controller: 'HomeController',
			controllerAs: 'home',
			cache: false
		})

		.state('login', {
			url: '/login',
			templateUrl: 'views/login.html',
			cache: false
		})

		.state('trainingPlan', {
			url: '/trainingPlan',
			templateUrl: 'views/trainingPlan.html',
			controller: 'TrainingController',
			controllerAs: 'training',
			cache: false
		})

		.state('trainingDemo', {
			url: '/trainingDemo',
			templateUrl: 'views/trainingDemo.html',
			controller: 'TrainingController',
			controllerAs: 'training',
			cache: false
		})

		.state('training', {
			url: '/training',
			templateUrl: 'views/training.html',
			controller: 'TrainingController',
			controllerAs: 'training',
			cache: false
		})

		.state('feedback', {
			url: '/feedback',
			templateUrl: 'views/feedback.html',
			controller: 'FeedbackController',
			controllerAs: 'feedback',
			cache: false
		})

		.state('painLevel', {
			url: '/painLevel',
			templateUrl: 'views/painLevel.html',
			controller: 'NotesController',
			controllerAs: 'notes',
			cache: false
		})

		.state('notes', {
			url: '/notes',
			templateUrl: 'views/notes.html',
			controller: 'NotesController',
			controllerAs: 'notes',
			cache: false
		});

		$urlRouterProvider.otherwise('/login');

		// Whitelist 'self' (keyword) and azure blob url.
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'https://welfaredenmark.blob.core.windows.net/**'
		]);

		// Disable 'swipe' back function.
		$ionicConfigProvider.views.swipeBackEnabled(false);
	});
