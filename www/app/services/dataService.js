// This is a data service which gets and posts data in the API-service.

angular.module('kosmoramaApp').service('dataService', function($http) {

    var url = 'http://176.62.203.178/Comm/DataService';
    //var url = 'http://localhost:8080/Comm/DataService';

    //var hardcodedScreenNumber = 'AA02';

    // This function gets a user by the Screen number entered on login.
    this.getUser = function(userScreenNumber, callback) {
        // Preparing the content for the header required to get user in Api-service
        var content = {
            id: '0',
            method: 'GetUsers',
            params: userScreenNumber
        };
        var dataString = JSON.stringify(content); // Converting javascript to Json

        // Doing the http post request
        $http({
            method: 'POST',
            url: url,
            data: dataString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(userdata) {
            if (callback) {
                callback(userdata.result[0]);
            }
        }).error(function(data, status, headers, config) {
            console.log('testfail', data, status, headers, config);
            if (callback) {
                callback(null);
            }
        });

    };

    // This function gets the trainig for a user on the current day.
    this.getTraining = function(UserId, callback) {

        var content = {
            id: '1',
            method: 'GetScheduledTrainingAndQuestionnaires',
            params: UserId
        };

        var dataString = JSON.stringify(content); //Converting javascript to Json

        // Doing the http post request and returns an array of training objects.
        $http({
            method: 'POST',
            url: url,
            data: dataString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(trainingData) {
            var train = [];
            var date = new Date();
            var maxDate = new Date();
            maxDate.setDate(date.getDate() + 7);
            // Checking for current days training Items and adding them to array.
            for (var i = 0; i < trainingData.result.length; i++) {
                var trainingDate = new Date(trainingData.result[i].Date);
                if (trainingDate <= maxDate) {
                    for (var item in trainingData.result[i].TrainingItems) {
                        if (trainingData.result[i].TrainingItems[item].Type == 40) {
                            train.push(trainingData.result[i].TrainingItems[item]);
                        }
                    }
                }
            }
            if (callback) {
                callback(train);
            }
        }).error(function(trainingData, status, headers, config) {
            console.log('testfail', trainingData, status, headers, config);
            if (callback) {
                callback('error');
            }
        });
    };

    // This function post traning data.
    // Still needs work
    this.postData = function(trainingReport, callback) {
        var content = {
            id: '2',
            method: 'PostTrainingReport',
            params: trainingReport
        };

        var dataString = JSON.stringify(content); //Converting javascript to Json

        // Doing the http post request and returns an array of trainig objects.
        $http({
            method: 'POST',
            url: url,
            data: dataString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(trainingData) {
            if (callback) {
                callback(trainingData);
            }
        }).error(function(trainingData, status, headers, config) {
            console.log('testfail', trainingData, status, headers, config);
            if (callback) {
                callback('error');
            }
        });
    };

    // This function saves the note as read
    // returns true if success and false when an error has occured.
    this.postNoteData = function(noteId, callback) {
        var content = {
            id: '3',
            method: 'PostNoteAsRead',
            params: noteId
        };

        var dataString = JSON.stringify(content); // Converting javascript to Json

        // Doing the http post request and returns true if succes and false if not.
        $http({
            method: 'POST',
            url: url,
            data: dataString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(result) {
            if (callback) {
                callback(result);
            }
        }).error(function(result, status, headers, config) {
            console.log('testfail', result, status, headers, config);
            if (callback) {
                callback(result);
            }
        });
    };

    // This function saves feedbackReport to therpist, it handles both message and PainLevel
    // returns true if success and false when an error has occured.
    this.postFeedback = function(feedbackObject, callback) {
        console.log(feedbackObject);
        var feedbackReport = {
            "ScheduleId": feedbackObject.trainingId,
            "SessionOrderNumber": feedbackObject.sessionOrderNumber,
            "Message": feedbackObject.message,
            "PainLevel": feedbackObject.painLevel || 0,
        };

        var content = {
            id: '3',
            method: 'PostFeedback',
            params: feedbackReport
        };

        var dataString = JSON.stringify(content); // Converting javascript to Json

        // Doing the http post request and returns true if succes and false if not.
        $http({
            method: 'POST',
            url: url,
            data: dataString,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(trainingData) {
            console.log('callbackData', trainingData);
            if (callback) {
                callback(trainingData);
            }
        }).error(function(trainingData, status, headers, config) {
            console.log('testfail', trainingData, status, headers, config);
            if (callback) {
                callback('error');
            }
        });
    };
});
