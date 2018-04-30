// See LICENSE.MD for license information.

var app = angular.module('MEANapp', ['ngRoute', 'ngStorage']);

/*********************************
 Controllers
 *********************************/

app.controller('HeaderController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Set local scope to persisted user data
    $scope.user = $localStorage;
    $scope.loc = $location;

    // Logout function
    $scope.logout = function(){
        $http({
            method: 'GET',
            url: '/account/logout'
        })
            .success(function(response){
                alert(response);
                $localStorage.$reset();
                $location.path('/');
            })
            .error(function(response){
                alert(response);
                $location.path('/account/login');
            }
        );
    };
});

app.controller('HomeController', function($scope, $localStorage, $location, $sessionStorage){

  // Set local scope to persisted user data
  $scope.user = $localStorage;
  $scope.loc = $location;

});


app.controller('PersonaController', function($scope, $localStorage, $sessionStorage, $location, anchorSmoothScroll){

  // Set local scope to persisted user data
  $scope.user = $localStorage;


  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.cancel = function() {
    $location.path('/');
  }

  $scope.submitForm = function() {
    $scope.user.persona = $("#personas a.active").attr("id")
    $location.path('/explore/industries');
  }

});

app.controller('IndustryController', function($scope, $localStorage, $sessionStorage, $location, anchorSmoothScroll){

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.backToPersonas = function() {
    $location.path('/explore/personas');
  }

  $scope.submitForm = function() {
    $scope.user.industry = $("#industries a.active").attr("id")
    console.log("Persona: " + $scope.user.persona);
    console.log("Industry: " + $scope.user.industry);
    $location.path('/explore/jobs');
  }

});

app.controller('JobsController', function($scope, $localStorage, $sessionStorage, $location, anchorSmoothScroll){

  // Set local scope to persisted user data
  $scope.user = $localStorage;
});

app.controller('ExploreTalentController', function($scope, $localStorage, $sessionStorage, $location, anchorSmoothScroll){

  // Set local scope to persisted user data
  $scope.user = $localStorage;
  $scope.loc = $location;

});

app.controller('LoginController', function($scope, $localStorage, $sessionStorage, $location, $http, anchorSmoothScroll){

    // Set local scope to persisted user data
    $scope.user = $localStorage;
    $scope.loc = $location;

    // Login submission
    $scope.submitLogin = function(){

        // Login request
        $http({
            method: 'POST',
            url: '/account/login',
            data: {
                    'username': $scope.loginForm.username,
                    'password': $scope.loginForm.password
                }
            })
            .success(function(response){
                // $localStorage persists data in browser's local storage (prevents data loss on page refresh)
                $localStorage.status = true;
                $localStorage.user = response;
                $location.path('/');
            })
            .error(function(){
                alert('Login failed. Check username/password and try again.');
            }
        );
    };

    // Redirect to account creation page
    $scope.createAccount = function(){
        $location.path('/account/create');
    }
});

app.controller('CreateAccountController', function($scope, $localStorage, $sessionStorage, $http, $location){

    // Create account
    $scope.submitForm = function(){
        $http({
            method: 'POST',
            url: '/account/create',
            data: {
                    'username': $scope.newUser.username,
                    'password': $scope.newUser.password,
                    'firstname' : $scope.newUser.firstname,
                    'lastname' : $scope.newUser.lastname,
                    'email' : $scope.newUser.email,
                    'role' : $scope.newUser.role
                }
            })
            .success(function(response){
                alert(response);
                $location.path('/account/login');
            })
            .error(function(response){
                // When a string is returned
                if(typeof response === 'string'){
                    alert(response);
                }
                // When array is returned
                else if (Array.isArray(response)){
                    // More than one message returned in the array
                    if(response.length > 1){
                        var messages = [],
                            allMessages;
                        for (var i = response.length - 1; i >= 0; i--) {
                            messages.push(response[i]['msg']);
                            if(response.length == 0){
                                allMessages = messages.join(", ");
                                alert(allMessages);
                                console.error(response);
                            }
                        }
                    }
                    // Single message returned in the array
                    else{
                        alert(response[0]['msg']);
                        console.error(response);
                    }
                }
                // When something else is returned
                else{
                    console.error(response);
                    alert("See console for error.");
                }
            }
        );

    };
});

app.controller('AccountController', function($scope, $localStorage, $sessionStorage, $http, $location){

    // Create static copy of user data for form usage (otherwise any temporary changes will bind permanently to $localStorage)
    $scope.formData = $.extend(true,{},$localStorage.user);

    // Update user's account with new data
    $scope.updateAccount = function(){
        $http({
            method: 'POST',
            url: '/account/update',
            data: {
                'username': $scope.formData.username,
                'password': $scope.password,
                'firstname' : $scope.formData.firstname,
                'lastname' : $scope.formData.lastname,
                'email' : $scope.formData.email
            }
        })
            .success(function(response){
                $localStorage.user = $scope.formData;
                alert(response);
            })
            .error(function(response){
                // When a string is returned
                if(typeof response === 'string'){
                    alert(response);
                }
                // When an array is returned
                else if (Array.isArray(response)){
                    // More than one message returned in the array
                    if(response.length > 1){
                        var messages = [],
                            allMessages;
                        for (var i = response.length - 1; i >= 0; i--) {
                            messages.push(response[i]['msg']);
                            if(response.length == 0){
                                allMessages = messages.join(", ");
                                alert(allMessages);
                                console.error(response);
                            }
                        }
                    }
                    // Single message returned in the array
                    else{
                        alert(response[0]['msg']);
                        console.error(response);
                    }
                }
                // When something else is returned
                else{
                    console.error(response);
                    alert("See console for error.");
                }
            }
        );
    };

    // Delete user's account
    $scope.deleteAccount = function(){
        var response = confirm("Are you sure you want to delete your account? This cannot be undone!");
        if(response == true){
            $http({
                method: 'POST',
                url: '/account/delete',
                data: {
                    'username': $scope.formData.username
                }
            })
                .success(function(response){
                    $localStorage.$reset();
                    alert(response);
                    $location.path('/');
                })
                .error(function(response){
                    alert(response);
                }
            );
        }
    };

});

app.controller('ProtectedController', function($scope, $location, $http){

    $http({
        method: 'GET',
        url: '/protected'
    })
        .success(function(response){
            $scope.message = response;
        })
        .error(function(response){
            alert(response);
            $location.path('/account/login');
        }
    );

});


app.controller('QuizController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;
  console.log($scope.user);

  // Initialize Quiz Sections
  if($scope.user.quiz == undefined){
    $scope.user.quiz = {
      "quizSections": ["persona", "industry", "personality", "perks", "resume"],
      "quizIndex": 0,
      "activeSection": 0
    }

  }

  console.log($scope.user.quiz.activeSection);
  switch ($scope.user.quiz.activeSection){
    case 0:
      $location.path('/quiz/personas');
      break;
    case 1:
      $location.path('/quiz/industries');
      break;
    case 2:
      $location.path('/quiz/personality');
      break;
    case 3:
      $location.path('/quiz/perks');
      break;
    case 4:
      $location.path('/quiz/resume');
      break;
  }

  $scope.cancel = function() {
    $location.path('/');
  }

});


app.controller('QuizPersonaController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );


  // Set local scope to persisted user data
  $scope.user = $localStorage;

  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.cancel = function() {
    $location.path('/');
  }

  $scope.submitForm = function() {
    $scope.user.persona = $("#personas a.active").attr("id")
    $scope.user.quiz.activeSection = 1;
    console.log($scope.user.quiz.activeSection);
    $location.path('/quiz');
  }

});

app.controller('QuizIndustryController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.back = function() {
    $scope.user.quiz.activeSection = 0;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.industry = $("#industries a.active").attr("id")
    $scope.user.quiz.activeSection = 2;
    console.log($scope.user.quiz.activeSection);
    $location.path('/quiz');
  }

});

app.controller('QuizPersonalityController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  if ($scope.user.questions == undefined){
    $scope.user.questions = [
                 {id:'Q1', question:"What does your ideal work day look like?", answer:""},
                 {id:'Q2', question:"What is the greatest accomplishment of your life?", answer:""},
                 {id:'Q3', question:"For what in your life do you feel most grateful?", answer:""},
                 {id:'Q4', question:"If you were able to live to the age of 90 and retain either the mind or body of a 30-year old for the last 60 years of your life, which would you choose?", answer:""},
                 {id:'Q5', question:"What would constitute a perfect day for you? (not work related like number 1)", answer:""},
                 {id:'Q6', question:"Describe your average day (needs to be swapped out)", answer:""}
                ]
  }

  $scope.formQuestions = $.extend(true,{},$scope.user.questions);

  $scope.back = function() {
    $scope.user.quiz.activeSection = 1;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.questions = $scope.formQuestions;
    console.log($scope.user.questions);

    $scope.user.quiz.activeSection = 3;
    $location.path('/quiz');
  }

});

app.controller('QuizPerksController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  if ($scope.user.perks == undefined){
    $scope.user.perks = [
                 {id:'Perk1', perk:"Food Provided", checked: false},
                 {id:'Perk2', perk:"Transportation Provided", checked: false},
                 {id:'Perk3', perk:"Gym Provided", checked: false},
                 {id:'Perk4', perk:"Unlimited PTO", checked: false},
                ]
  }

  $scope.formPerks = $.extend(true,{},$scope.user.perks);

  $scope.back = function() {
    $scope.user.quiz.activeSection = 2;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.perks = $scope.formPerks;
    $scope.user.quiz.activeSection = 4;
    $location.path('/quiz');
  }

});

app.controller('QuizResumeController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  // Disable hitting enter to submit
  $(document).on("keypress", "form", function(event) {
      return event.keyCode != 13;
  });

  // Experience related methods
  if ($scope.user.experiences == undefined){
    $scope.user.experiences = [
                 {id:'1', company:"", role:"", description:"", startdate:"", enddate:""}
                ]
  }

  $scope.formExperiences= $.extend(true,[],$scope.user.experiences);


  $scope.removeExperience = function(experience_id){
    $scope.formExperiences = $scope.formExperiences.filter(e => e.id !== experience_id)
  }

  $scope.addExperience = function(){
    $scope.formExperiences.push({id: $scope.formExperiences.length,  company:"", role:"", description:"", startdate:"", enddate:""});

  }

  // Education related methods
  if ($scope.user.educations == undefined){
    $scope.user.educations = [
                 {id:'1', degree:"", institute:"", description:"", startdate:"", enddate:""}
                ]
  }

  $scope.formEducations = $.extend(true,[],$scope.user.educations);

  $scope.removeEducation = function(education_id){
    $scope.formEducations = $scope.formEducations.filter(e => e.id !== education_id)
  }

  $scope.addEducation = function(){
    $scope.formEducations.push({id: $scope.formEducations.length, degree:"", institute:"", description:"", startdate:"", enddate:""});
  }

  // Skill PillBox methods
  if ($scope.user.skills == undefined){
    $scope.user.skills = []
  }

  $scope.formSkills= $.extend(true,[],$scope.user.skills);


  $('#skillPillbox').pillbox();

  $('#skillPillbox').pillbox('addItems', $scope.formSkills);

  // Form submission related methods

  $scope.back = function() {
    $scope.user.quiz.activeSection = 3;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.experiences = $scope.formExperiences;
    $scope.user.educations = $scope.formEducations;

    // Remove Duplicates from PillBox
    skillpills = $('#skillPillbox').pillbox('items');
    var unique_skills = {};

    for ( var i=0, len=skillpills.length; i < len; i++ )
        unique_skills[skillpills[i]['value']] = skillpills[i];

    finalskillpills = new Array();
    for ( var key in unique_skills )
        finalskillpills.push(unique_skills[key]);

    $scope.user.skills = finalskillpills;
    $scope.user.quiz.activeSection = 4;
    $location.path('/');
  }

});

app.controller('JobseekerJobsController', function($scope, $localStorage, $sessionStorage, $location, $http){

  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/protected'
  })
      .success(function(response){
          $scope.message = response;
      })
      .error(function(response){
          alert(response);
          $location.path('/account/login');
      }
  );

  // Set local scope to persisted user data
  $scope.user = $localStorage;


});

/*********************************
 Routing
 *********************************/
app.config(function($routeProvider) {
    'use strict';

    $routeProvider.

        //Root
        when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        }).

        //Explore Jobs Personas
        when('/explore/personas', {
            templateUrl: 'views/personas.html',
            controller: 'PersonaController'
        }).

        //Explore Jobs Industries
        when('/explore/industries', {
            templateUrl: 'views/industries.html',
            controller: 'IndustryController'
        }).

        //Explore Jobs Jobs
        when('/explore/jobs', {
            templateUrl: 'views/explore_jobs.html',
            controller: 'JobsController'
        }).

        //Explore Talent
        when('/explore/talent', {
            templateUrl: 'views/explore_talent.html',
            controller: 'ExploreTalentController'
        }).

        //Login page
        when('/account/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).

        //Account page
        when('/account', {
            templateUrl: 'views/account.html',
            controller: 'AccountController'
        }).

        //Quiz Main Page
        when('/quiz', {
            templateUrl: 'views/quiz_main.html',
            controller: 'QuizController'
        }).

        //Quiz Personas Page
        when('/quiz/personas', {
            templateUrl: 'views/quiz_personas.html',
            controller: 'QuizPersonaController'
        }).

        //Quiz Industries Page
        when('/quiz/industries', {
            templateUrl: 'views/quiz_industries.html',
            controller: 'QuizIndustryController'
        }).

        //Quiz Personality Page
        when('/quiz/personality', {
            templateUrl: 'views/quiz_personality.html',
            controller: 'QuizPersonalityController'
        }).

        //Quiz Personality Page
        when('/quiz/perks', {
            templateUrl: 'views/quiz_perks.html',
            controller: 'QuizPerksController'
        }).

        //Quiz Resume Page
        when('/quiz/resume', {
            templateUrl: 'views/quiz_resume.html',
            controller: 'QuizResumeController'
        }).

        //Quiz Resume Page
        when('/jobseeker/jobs', {
            templateUrl: 'views/jobseeker_jobs.html',
            controller: 'JobseekerJobsController'
        }).

        //Create Account page
        when('/account/create', {
            templateUrl: 'views/create_account.html',
            controller: 'CreateAccountController'
        }).

        //Protected page
        when('/protected', {
            templateUrl: 'views/protected.html',
            controller: 'ProtectedController'
        });

});

/*********************************
 Helper Functions
 *********************************/

app.service('anchorSmoothScroll', function(){

     this.scrollTo = function(eID) {

         // This scrolling function
         // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

         var startY = currentYPosition();
         var stopY = elmYPosition(eID);
         var distance = stopY > startY ? stopY - startY : startY - stopY;
         if (distance < 100) {
             scrollTo(0, stopY); return;
         }
         var speed = Math.round(distance / 100);
         if (speed >= 20) speed = 20;
         var step = Math.round(distance / 25);
         var leapY = stopY > startY ? startY + step : startY - step;
         var timer = 0;
         if (stopY > startY) {
             for ( var i=startY; i<stopY; i+=step ) {
                 setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                 leapY += step; if (leapY > stopY) leapY = stopY; timer++;
             } return;
         }
         for ( var i=startY; i>stopY; i-=step ) {
             setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
             leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
         }

         function currentYPosition() {
             // Firefox, Chrome, Opera, Safari
             if (self.pageYOffset) return self.pageYOffset;
             // Internet Explorer 6 - standards mode
             if (document.documentElement && document.documentElement.scrollTop)
                 return document.documentElement.scrollTop;
             // Internet Explorer 6, 7 and 8
             if (document.body.scrollTop) return document.body.scrollTop;
             return 0;
         }

         function elmYPosition(eID) {
             var elm = document.getElementById(eID);
             var y = elm.offsetTop;
             var node = elm;
             while (node.offsetParent && node.offsetParent != document.body) {
                 node = node.offsetParent;
                 y += node.offsetTop;
             } return y;
         }

     };

});

app.directive('wordcountValidate', function() {
    return {
        // restrict to an attribute type.
        restrict: 'A',

        // element must have ng-model attribute.
        require: 'ngModel',

        // scope = the parent scope
        // elem = the element the directive is on
        // attr = a dictionary of attributes on the element
        // ctrl = the controller for ngModel.
        link: function(scope, elem, attr, ctrl) {

            // add a parser that will process each time the value is
            // parsed into the model when the user updates it.
            ctrl.$parsers.unshift(function(value) {
                // test and set the validity after update.
                if(value == undefined){
                  value = "";
                }
                var valid = value.trim().split(/\s+/).length >= parseInt(attr.wordcountValidate);
                ctrl.$setValidity('wordcountValidate', valid);

                // if it's valid, return the value to the model,
                // otherwise return undefined.
                return valid ? value : undefined;
            });

            // add a formatter that will process each time the value
            // is updated on the DOM element.
            ctrl.$formatters.unshift(function(value) {
                // validate.
                if(value == undefined){
                  value = "";
                }
                ctrl.$setValidity('wordcountValidate', value.trim().split(/\s+/).length >= parseInt(attr.wordcountValidate));

                // return the value or nothing will be written to the DOM.
                return value;
            });
        }
    };
});


app.filter('wordCounter', function () {
    return function (value) {
        if (value && typeof value === 'string') {
            return value.trim().split(/\s+/).length;
        } else {
            return 0;
        }
    };
})
