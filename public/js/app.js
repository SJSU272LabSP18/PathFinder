// See LICENSE.MD for license information.

var app = angular.module('MEANapp', ['ngRoute', 'ngStorage','ngSanitize']);

/*********************************
 Controllers
 *********************************/

app.controller('HeaderController', function($scope, $localStorage, $sessionStorage, $location, $http){

    // Set local scope to persisted user data
    $scope.user = $localStorage;
    $scope.loc = $location;
    console.log($scope.user);

    // Logout function
    $scope.logout = function(){
        $http({
            method: 'GET',
            url: '/account/logout'
        })
            .success(function(response){
                alert(response);
                $localStorage.$reset();
                $scope.user = $localStorage;
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


// Controller for when non logged in user wants to view job offerings
app.controller('JobsController', function($scope, $filter, $localStorage, $sessionStorage, $location, $http, anchorSmoothScroll){

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  $scope.sort = {
              sortingOrder : 'company',
              reverse : false
          };

  // Create Table Based on Jobs Data
  $http({
      method: 'GET',
      url: '/explore/jobs',
      params: {'persona': $scope.user.persona, 'industry':$scope.user.industry}
      })
      .success(function(response){
          // init
          $scope.items = response;
          console.log($scope.items);
          if ($scope.items.length == 0){
            alert("No jobs found for specified persona and industry");
            $location.path('/explore/personas');
          }

          $scope.gap = 5;
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 10;
          $scope.pagedItems = [];
          $scope.currentPage = 0;

          // Calculate gap that should be caused
          num_pages = Math.ceil($scope.items.length/$scope.itemsPerPage);
          if(num_pages < $scope.gap){
            $scope.gap = num_pages;
          }


            var searchMatch = function (haystack, needle) {
                if (!needle) {
                    return true;
                }
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            };

            // init the filtered items
            $scope.search = function () {
                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for(var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                if ($scope.sort.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
                }
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };


            // calculate page in place
            $scope.groupToPages = function () {
                $scope.pagedItems = [];

                for (var i = 0; i < $scope.filteredItems.length; i++) {
                    if (i % $scope.itemsPerPage === 0) {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                    } else {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                    }
                }
            };

            $scope.range = function (size,start, end) {
                var ret = [];
                console.log(size,start, end);
                if (size < end) {
                    end = size;
                    start = size-$scope.gap;
                }
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }
                 console.log(ret);
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pagedItems.length - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

          // functions have been describe process the data for display
          $scope.search();

      });



  // Redirect user to jobs page
  $scope.goToJob = function(id) {
    $location.path('/explore/jobs/view/' + id);
  }


});

// Controller for when non logged in user wants to view a specific job offering
app.controller('JobViewController', function($scope, $localStorage, $location, $sessionStorage, $routeParams,  $http){

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  // Pull job listing from db
  $http({
      method: 'GET',
      url: '/explore/job/view',
      params: {'job_id': $routeParams.id}
      })
      .success(function(response){
          $scope.job= response;
          console.log($scope.job);

          if($scope.job == ""){
            alert("No Job Found in DB");
            $location.path('/explore/jobs');
          }

          $scope.user.skillgaps = [
            {
              "text":"Python",
              "value":"Python",
              "trainings": [
                {
                  title: "Complete Python Bootcamp: Go from zero to hero in Python 3",
                  link: "https://www.udemy.com/complete-python-bootcamp/"
                },
                {
                  title: "Introduction To Python Programming",
                  link: "https://www.udemy.com/pythonforbeginnersintro/"
                }
              ]
            },
            {
              "text":"React",
              "value":"React",
              "trainings": [
                {
                  title: "Master ReactJS: Learn React JS from Scratch",
                  link: "https://www.udemy.com/master-reactjs/"
                }
              ]
            },
          ]


      })

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

  // Get User Persona from DB
  $http({
      method: 'GET',
      url: '/quiz/persona',
      params: {'username': $scope.user.user.username}

      })
      .success(function(response){
          $scope.user.persona = response;
      });


  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.cancel = function() {
    $location.path('/');
  }

  $scope.submitForm = function() {
    $scope.user.persona = $("#personas a.active").attr("id")
    $http({
        method: 'POST',
        url: '/quiz/persona',
        data: {
                'username': $scope.user.user.username,
                'email': $scope.user.user.email,
                'firstname': $scope.user.user.firstname,
                'lastname': $scope.user.user.lastname,
                'persona': $scope.user.persona
            }
        })
        .success(function(response){
            $scope.user.quiz.activeSection = 1;
            $location.path('/quiz');
        })
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

  // Get User Industry from DB
  $http({
      method: 'GET',
      url: '/quiz/industry',
      params: {'username': $scope.user.user.username}

      })
      .success(function(response){
          $scope.user.industry = response;
      })


  $('#tab_selector').on('change', function (e) {
	    $('.nav-tabs li a').eq($(this).val()).tab('show');
	});

  $scope.back = function() {
    $scope.user.quiz.activeSection = 0;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.industry = $("#industries a.active").attr("id")
    $http({
        method: 'POST',
        url: '/quiz/industry',
        data: {
                'username': $scope.user.user.username,
                'industry': $scope.user.industry
            }
        })
        .success(function(response){
            $scope.user.quiz.activeSection = 2;
            $location.path('/quiz');
        })
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

  // Get User Personality Qs from DB
  $http({
      method: 'GET',
      url: '/quiz/personality',
      params: {'username': $scope.user.user.username}

      })
      .success(function(response){
        console.log(response);
        $scope.user.questions = [
                     {id:'Q1', question:"What does your ideal work day look like?", answer:response.q1},
                     {id:'Q2', question:"What is the greatest accomplishment of your life?", answer:response.q2},
                     {id:'Q3', question:"For what in your life do you feel most grateful?", answer:response.q3},
                     {id:'Q4', question:"How would you describe yourself?", answer:response.q4},
                     {id:'Q5', question:"What is your most treasured memory?", answer:response.q5},
                     {id:'Q6', question:"What are some of your hobbies?", answer:response.q6}
                    ]



        if ($scope.user.questions == undefined){
          $scope.user.questions = [
                       {id:'Q1', question:"What does your ideal work day look like?", answer:""},
                       {id:'Q2', question:"What is the greatest accomplishment of your life?", answer:""},
                       {id:'Q3', question:"For what in your life do you feel most grateful?", answer:""},
                       {id:'Q4', question:"How would you describe yourself?", answer:""},
                       {id:'Q5', question:"What is your most treasured memory?", answer:""},
                       {id:'Q6', question:"What are some of your hobbies?", answer:""}
                      ]
        }

        $scope.formQuestions = $.extend(true,{},$scope.user.questions);


      });



  $scope.back = function() {
    $scope.user.quiz.activeSection = 1;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {
    $scope.user.questions = $scope.formQuestions;
    $http({
        method: 'POST',
        url: '/quiz/personality',
        data: {
                'username': $scope.user.user.username,
                'q1': $scope.user.questions[0].answer,
                'q2': $scope.user.questions[1].answer,
                'q3': $scope.user.questions[2].answer,
                'q4': $scope.user.questions[3].answer,
                'q5': $scope.user.questions[4].answer,
                'q6': $scope.user.questions[5].answer
            }
        })
        .success(function(response){
          $scope.user.quiz.activeSection = 3;
          $location.path('/quiz');
        })
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

  // GET A LIST OF ALL THE PERKS FROM DB HERE


  // Check if user is authorized to view page
  $http({
      method: 'GET',
      url: '/quiz/perks',
      params: {
        'username': $scope.user.user.username,
        'persona': $scope.user.persona,
        'industry': $scope.user.industry,
        }
      })
      .success(function(response){
          $scope.user.perks = response;
          $scope.formPerks = $.extend(true,{},$scope.user.perks);

      })




  $scope.back = function() {
    $scope.user.quiz.activeSection = 2;
    $location.path('/quiz');
  }

  $scope.submitForm = function() {

    // Get list of perks
    $scope.user.perks = $scope.formPerks;

    var list_of_perks = []
    for (var key in $scope.user.perks) {
      list_of_perks.push($scope.user.perks[key]);
    }

    $http({
        method: 'POST',
        url: '/quiz/perks',
        data: {
                'username': $scope.user.user.username,
                'perks': list_of_perks
            }
        })
        .success(function(response){
          $scope.user.quiz.activeSection = 4;
          $location.path('/quiz');
        })

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

  // Get User Personality Qs from DB
  $http({
      method: 'GET',
      url: '/quiz/resume',
      params: {'username': $scope.user.user.username}

      })
      .success(function(response){
        console.log(response);
        $scope.user.experiences = response.experience;
        $scope.user.educations = response.education;
        $scope.user.skills = response.skills;

        // Experience related methods
        if ($scope.user.experiences == ""){
          $scope.user.experiences = [
                       {id:0, company:"", role:"", description:"", startdate:"", enddate:""}
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
        if ($scope.user.educations == ""){
          $scope.user.educations = [
                       {id: 0, degree:"", institute:"", description:"", startdate:"", enddate:""}
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
        if ($scope.user.skills == ""){
          $scope.user.skills = []
        }

        $scope.formSkills= $.extend(true,[],$scope.user.skills);


        $('#skillPillbox').pillbox();

        $('#skillPillbox').pillbox('addItems', $scope.formSkills);

      });

  // Disable hitting enter to submit
  $(document).on("keypress", ":input:not(textarea)", function(event) {
      return event.keyCode != 13;
  });


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

    finalskillpills = [];
    for ( var key in unique_skills )
        finalskillpills.push(unique_skills[key]);

    $scope.user.skills = finalskillpills;

    $http({
        method: 'POST',
        url: '/quiz/resume',
        data: {
                'username': $scope.user.user.username,
                'experience': $scope.user.experiences,
                'education': $scope.user.educations,
                'skills': $scope.user.skills
            }
        })
        .success(function(response){
          $scope.user.quiz.activeSection = 0;
          $location.path('/');
        })
  }

});

app.controller('JobseekerJobsController', function($scope, $filter, $localStorage, $sessionStorage, $location, $http){

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

  $scope.sort = {
              sortingOrder : 'company',
              reverse : false
          };

  // Create Table Based on Jobs Data
  $http({
      method: 'GET',
      url: '/jobseeker/jobs',
      params: {'username': $scope.user.user.username}
      })
      .success(function(response){
          // init
          $scope.items = response;
          console.log($scope.items);


          $scope.gap = 5;
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 10;
          $scope.pagedItems = [];
          $scope.currentPage = 0;

          // Calculate gap that should be caused
          num_pages = Math.ceil($scope.items.length/$scope.itemsPerPage);
          if(num_pages < $scope.gap){
            $scope.gap = num_pages;
          }


            var searchMatch = function (haystack, needle) {
                if (!needle) {
                    return true;
                }
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            };

            // init the filtered items
            $scope.search = function () {
                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for(var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                if ($scope.sort.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
                }
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };


            // calculate page in place
            $scope.groupToPages = function () {
                $scope.pagedItems = [];

                for (var i = 0; i < $scope.filteredItems.length; i++) {
                    if (i % $scope.itemsPerPage === 0) {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                    } else {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                    }
                }
            };

            $scope.range = function (size,start, end) {
                var ret = [];
                console.log(size,start, end);
                if (size < end) {
                    end = size;
                    start = size-$scope.gap;
                }
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }
                 console.log(ret);
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pagedItems.length - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

          // functions have been describe process the data for display
          $scope.search();

      });



  // Redirect user to jobs page
  $scope.goToJob = function(id) {
    $location.path('/jobseeker/jobs/view/' + id);
  }


});


app.controller('JobseekerJobViewController', function($scope, $localStorage, $location, $sessionStorage, $routeParams,  $http){

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

  // Pull job listing from db
  $http({
      method: 'GET',
      url: '/jobseeker/job/view',
      params: {'username': $scope.user.user.username, 'job_id': $routeParams.id}
      })
      .success(function(response){
          $scope.job= response;
          console.log($scope.job);

          if($scope.job == ""){
            alert("No Job Found in DB");
            $location.path('/jobseeker/jobs');
          }

      })

});


//
//
// Job Poster Specific controls
//
//

app.controller('JobposterPostJobController', function($scope, $localStorage, $sessionStorage, $location, $http){

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
  $(document).on("keypress", ":input:not(textarea)", function(event) {
      return event.keyCode != 13;
  });

  $('#tab_selector_personas').on('change', function (e) {
	    $('#personas li a').eq($(this).val()).tab('show');
	});

  $('#tab_selector_industry').on('change', function (e) {
      $('#industries li a').eq($(this).val()).tab('show');
  });


  // Create job dict
  $scope.user.jobpost = {}
  $scope.user.jobpost.skills = []

  // Init Sliders
  var slider1 = document.getElementById('emotionalSlider');
  noUiSlider.create(slider1,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });


  var slider2 = document.getElementById('extrovertSlider');
  noUiSlider.create(slider2,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider3 = document.getElementById('unplannedSlider');
  noUiSlider.create(slider3,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider4 = document.getElementById('orgSlider');
  noUiSlider.create(slider4,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider5 = document.getElementById('growthSlider');
  noUiSlider.create(slider5,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider6 = document.getElementById('challengeSlider');
  noUiSlider.create(slider6,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider7 = document.getElementById('noveltySlider');
  noUiSlider.create(slider7,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  var slider8 = document.getElementById('helpSlider');
  noUiSlider.create(slider8,{
  	start: 50,
  	connect: "lower",
  	range: {
  	    min: 0,
  	    max: 100
  	}
  });

  // Skill Pillbox Init
  $('#skillPillbox').pillbox();

  $('#perkPillbox').pillbox();

  // Form submission related methods
  $scope.cancel = function() {
    $location.path('/');
  }

  $scope.submitForm = function() {
    $scope.user.jobpost.title = $scope.jobpost.title;
    $scope.user.jobpost.company = $scope.jobpost.company;
    $scope.user.jobpost.logourl = $scope.jobpost.logourl;
    $scope.user.jobpost.summary = $scope.jobpost.summary;
    $scope.user.jobpost.description = $scope.jobpost.description;
    $scope.user.jobpost.city = $scope.jobpost.city;
    $scope.user.jobpost.state = $scope.jobpost.state;
    $scope.user.jobpost.persona =  $("#personas a.active").attr("id");
    $scope.user.jobpost.industry = $("#industries a.active").attr("id");

    // Remove Duplicates from Skill PillBox
    skillpills = $('#skillPillbox').pillbox('items');
    var unique_skills = {};

    for ( var i=0, len=skillpills.length; i < len; i++ )
        unique_skills[skillpills[i]['value']] = skillpills[i];

    finalskillpills = new Array();
    for ( var key in unique_skills )
        finalskillpills.push(unique_skills[key]);

    // Remove Duplicates from Perk PillBox
    perkpills = $('#perkPillbox').pillbox('items');
    var unique_perks = {};

    for ( var i=0, len=perkpills.length; i < len; i++ )
        unique_perks[perkpills[i]['value']] = perkpills[i];

    finalperkpills = [];
    for ( var key in unique_perks )
        finalperkpills.push(unique_perks[key]);

    $scope.user.jobpost.skills = finalskillpills;
    $scope.user.jobpost.perks = finalperkpills;
    $scope.user.jobpost.emotionalSlider = $('#emotionalSlider')[0].noUiSlider.get();
    $scope.user.jobpost.extrovertSlider = $('#extrovertSlider')[0].noUiSlider.get();
    $scope.user.jobpost.unplannedSlider = $('#unplannedSlider')[0].noUiSlider.get();
    $scope.user.jobpost.orgSlider = $('#orgSlider')[0].noUiSlider.get();
    $scope.user.jobpost.growthSlider = $('#growthSlider')[0].noUiSlider.get();
    $scope.user.jobpost.challengeSlider = $('#challengeSlider')[0].noUiSlider.get();
    $scope.user.jobpost.noveltySlider = $('#noveltySlider')[0].noUiSlider.get();
    $scope.user.jobpost.helpSlider = $('#helpSlider')[0].noUiSlider.get();


    console.log($scope.user.jobpost);

    $http({
        method: 'POST',
        url: '/post/job',
        data: {
                'username': $scope.user.user.username,
                'email': $scope.user.user.email,
                'title': $scope.user.jobpost.title,
                'company': $scope.user.jobpost.company,
                'logourl': $scope.user.jobpost.logourl,
                'summary': $scope.user.jobpost.summary,
                'description': $scope.user.jobpost.description,
                'city': $scope.user.jobpost.city,
                'state': $scope.user.jobpost.state,
                'persona': $scope.user.jobpost.persona,
                'industry': $scope.user.jobpost.industry,
                'skills': $scope.user.jobpost.skills,
                'perks': $scope.user.jobpost.perks,
                'emotionalSlider': $scope.user.jobpost.emotionalSlider,
                'extrovertSlider': $scope.user.jobpost.extrovertSlider,
                'unplannedSlider': $scope.user.jobpost.unplannedSlider,
                'orgSlider': $scope.user.jobpost.orgSlider,
                'growthSlider': $scope.user.jobpost.growthSlider,
                'challengeSlider': $scope.user.jobpost.challengeSlider,
                'noveltySlider': $scope.user.jobpost.noveltySlider,
                'helpSlider':$scope.user.jobpost.helpSlider

            }
        })
        .success(function(response){
            alert(response);
            $location.path('/');
        })
        .error(function(response){
            alert(response);
            $location.path('/');
        });
  }

});


app.controller('JobposterJobsController', function($scope, $filter, $localStorage, $sessionStorage, $location, $http){

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

  $scope.sort = {
              sortingOrder : 'company',
              reverse : false
          };

  // Create Table Based on Jobs Data
  $http({
      method: 'GET',
      url: '/jobposter/jobs',
      params: {'username': $scope.user.user.username}
      })
      .success(function(response){
          // init
          $scope.items = response;
          console.log($scope.items);


          $scope.gap = 5;
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 10;
          $scope.pagedItems = [];
          $scope.currentPage = 0;

          // Calculate gap that should be caused
          num_pages = Math.ceil($scope.items.length/$scope.itemsPerPage);
          if(num_pages < $scope.gap){
            $scope.gap = num_pages;
          }


            var searchMatch = function (haystack, needle) {
                if (!needle) {
                    return true;
                }
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            };

            // init the filtered items
            $scope.search = function () {
                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for(var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                if ($scope.sort.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
                }
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };


            // calculate page in place
            $scope.groupToPages = function () {
                $scope.pagedItems = [];

                for (var i = 0; i < $scope.filteredItems.length; i++) {
                    if (i % $scope.itemsPerPage === 0) {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                    } else {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                    }
                }
            };

            $scope.range = function (size,start, end) {
                var ret = [];
                console.log(size,start, end);
                if (size < end) {
                    end = size;
                    start = size-$scope.gap;
                }
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }
                 console.log(ret);
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pagedItems.length - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

          // functions have been describe process the data for display
          $scope.search();

      });



  // Redirect user to jobs page
  $scope.goToJob = function(id) {
    $location.path('/jobposter/jobs/view/' + id);
  }


});

app.controller('JobposterJobViewController', function($scope, $localStorage, $location, $sessionStorage, $routeParams,  $http){

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

  // Pull job listing from db
  $http({
      method: 'GET',
      url: '/jobseeker/job/view',
      params: {'username': $scope.user.user.username, 'job_id': $routeParams.id}
      })
      .success(function(response){
          $scope.job= response;
          console.log($scope.job);

          if($scope.job == ""){
            alert("No Job Found in DB");
            $location.path('/jobseeker/jobs');
          }
      })


  $scope.goToEditJob = function(job_id) {
    $location.path('/jobposter/jobs/edit/' + job_id);
  };

  $scope.goToCandidates = function(job_id){
    $location.path('/jobposter/jobs/view/candidates/' + job_id);
  }


});


app.controller('JobposterJobEditViewController', function($scope, $localStorage, $sessionStorage, $location, $http,  $routeParams){

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

  // Pull job listing from db
  $http({
      method: 'GET',
      url: '/jobseeker/job/view',
      params: {'username': $scope.user.user.username, 'job_id': $routeParams.id}
      })
      .success(function(response){
          $scope.jobpost = response;

          if($scope.jobpost == ""){
            alert("No Job Found in DB");
            $location.path('/jobseeker/jobs');
          }

          // Init Sliders
          var slider1 = document.getElementById('emotionalSlider');
          noUiSlider.create(slider1,{
          	start: $scope.jobpost.emotionalSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });


          var slider2 = document.getElementById('extrovertSlider');
          noUiSlider.create(slider2,{
          	start: $scope.jobpost.extrovertSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider3 = document.getElementById('unplannedSlider');
          noUiSlider.create(slider3,{
          	start: $scope.jobpost.unplannedSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider4 = document.getElementById('orgSlider');
          noUiSlider.create(slider4,{
          	start: $scope.jobpost.orgSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider5 = document.getElementById('growthSlider');
          noUiSlider.create(slider5,{
          	start: $scope.jobpost.growthSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider6 = document.getElementById('challengeSlider');
          noUiSlider.create(slider6,{
          	start: $scope.jobpost.challengeSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider7 = document.getElementById('noveltySlider');
          noUiSlider.create(slider7,{
          	start: $scope.jobpost.noveltySlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          var slider8 = document.getElementById('helpSlider');
          noUiSlider.create(slider8,{
          	start: $scope.jobpost.helpSlider,
          	connect: "lower",
          	range: {
          	    min: 0,
          	    max: 100
          	}
          });

          // Skill Pillbox Init
          $('#skillPillbox').pillbox();
          $('#skillPillbox').pillbox('addItems', $scope.jobpost.skills);

          // Perk Pillbox Init
          $('#perkPillbox').pillbox();
          $('#perkPillbox').pillbox('addItems', $scope.jobpost.perks);


      })


  // Disable hitting enter to submit
  $(document).on("keypress", ":input:not(textarea)", function(event) {
      return event.keyCode != 13;
  });

  $('#tab_selector_personas').on('change', function (e) {
	    $('#personas li a').eq($(this).val()).tab('show');
	});

  $('#tab_selector_industry').on('change', function (e) {
      $('#industries li a').eq($(this).val()).tab('show');
  });

  // Form submission related methods
  $scope.cancel = function() {
    $location.path('/jobposter/jobs/view/' + $scope.jobpost._id);
  }

  $scope.submitForm = function() {
    $scope.user.jobpost = {}
    $scope.user.jobpost.id = $scope.jobpost._id;
    $scope.user.jobpost.title = $scope.jobpost.title;
    $scope.user.jobpost.company = $scope.jobpost.company;
    $scope.user.jobpost.logourl = $scope.jobpost.logourl;
    $scope.user.jobpost.summary = $scope.jobpost.summary;
    $scope.user.jobpost.description = $scope.jobpost.description;
    $scope.user.jobpost.city = $scope.jobpost.city;
    $scope.user.jobpost.state = $scope.jobpost.state;
    $scope.user.jobpost.persona =  $("#personas a.active").attr("id");
    $scope.user.jobpost.industry = $("#industries a.active").attr("id");

    // Remove Duplicates from Skill PillBox
    skillpills = $('#skillPillbox').pillbox('items');
    var unique_skills = {};

    for ( var i=0, len=skillpills.length; i < len; i++ )
        unique_skills[skillpills[i]['value']] = skillpills[i];

    finalskillpills = new Array();
    for ( var key in unique_skills )
        finalskillpills.push(unique_skills[key]);

    // Remove Duplicates from Perk PillBox
    perkpills = $('#perkPillbox').pillbox('items');
    var unique_perks = {};

    for ( var i=0, len=perkpills.length; i < len; i++ )
        unique_perks[perkpills[i]['value']] = perkpills[i];

    finalperkpills = [];
    for ( var key in unique_perks )
        finalperkpills.push(unique_perks[key]);

    $scope.user.jobpost.skills = finalskillpills;
    $scope.user.jobpost.perks = finalperkpills;
    $scope.user.jobpost.emotionalSlider = $('#emotionalSlider')[0].noUiSlider.get();
    $scope.user.jobpost.extrovertSlider = $('#extrovertSlider')[0].noUiSlider.get();
    $scope.user.jobpost.unplannedSlider = $('#unplannedSlider')[0].noUiSlider.get();
    $scope.user.jobpost.orgSlider = $('#orgSlider')[0].noUiSlider.get();
    $scope.user.jobpost.growthSlider = $('#growthSlider')[0].noUiSlider.get();
    $scope.user.jobpost.challengeSlider = $('#challengeSlider')[0].noUiSlider.get();
    $scope.user.jobpost.noveltySlider = $('#noveltySlider')[0].noUiSlider.get();
    $scope.user.jobpost.helpSlider = $('#helpSlider')[0].noUiSlider.get();


    console.log($scope.user.jobpost);

    $http({
        method: 'POST',
        url: '/update/job',
        data: {
                'id': $scope.user.jobpost.id,
                'username': $scope.user.user.username,
                'email': $scope.user.user.email,
                'title': $scope.user.jobpost.title,
                'company': $scope.user.jobpost.company,
                'logourl': $scope.user.jobpost.logourl,
                'summary': $scope.user.jobpost.summary,
                'description': $scope.user.jobpost.description,
                'city': $scope.user.jobpost.city,
                'state': $scope.user.jobpost.state,
                'persona': $scope.user.jobpost.persona,
                'industry': $scope.user.jobpost.industry,
                'skills': $scope.user.jobpost.skills,
                'perks': $scope.user.jobpost.perks,
                'emotionalSlider': $scope.user.jobpost.emotionalSlider,
                'extrovertSlider': $scope.user.jobpost.extrovertSlider,
                'unplannedSlider': $scope.user.jobpost.unplannedSlider,
                'orgSlider': $scope.user.jobpost.orgSlider,
                'growthSlider': $scope.user.jobpost.growthSlider,
                'challengeSlider': $scope.user.jobpost.challengeSlider,
                'noveltySlider': $scope.user.jobpost.noveltySlider,
                'helpSlider':$scope.user.jobpost.helpSlider

            }
        })
        .success(function(response){
          alert(response);
          $location.path('/jobposter/jobs/view/' + $scope.jobpost._id);
        })
        .error(function(response){
            alert(response);
            $location.path('/');
        });
  }

});


app.controller('JobposterJobViewCandidatesController', function($scope, $filter, $localStorage, $sessionStorage, $location, $http, $routeParams){

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

  $scope.sort = {
              sortingOrder : 'firstname',
              reverse : false
          };

  // Create Table Based on Jobs Data
  $http({
      method: 'GET',
      url: '/jobposter/jobs/candidates',
      params: {'job_id': $routeParams.id}
      })
      .success(function(response){
          // init
          $scope.items = response;
          console.log($scope.items);


          $scope.gap = 5;
          $scope.filteredItems = [];
          $scope.groupedItems = [];
          $scope.itemsPerPage = 10;
          $scope.pagedItems = [];
          $scope.currentPage = 0;

          // Calculate gap that should be caused
          num_pages = Math.ceil($scope.items.length/$scope.itemsPerPage);
          if(num_pages < $scope.gap){
            $scope.gap = num_pages;
          }


            var searchMatch = function (haystack, needle) {
                if (!needle) {
                    return true;
                }
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            };

            // init the filtered items
            $scope.search = function () {
                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for(var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                if ($scope.sort.sortingOrder !== '') {
                    $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
                }
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };


            // calculate page in place
            $scope.groupToPages = function () {
                $scope.pagedItems = [];

                for (var i = 0; i < $scope.filteredItems.length; i++) {
                    if (i % $scope.itemsPerPage === 0) {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
                    } else {
                        $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                    }
                }
            };

            $scope.range = function (size,start, end) {
                var ret = [];
                console.log(size,start, end);
                if (size < end) {
                    end = size;
                    start = size-$scope.gap;
                }
                for (var i = start; i < end; i++) {
                    ret.push(i);
                }
                 console.log(ret);
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pagedItems.length - 1) {
                    $scope.currentPage++;
                }
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

          // functions have been describe process the data for display
          $scope.search();

      });


  // Redirect user to canidate page
  $scope.goToCandidate = function(id) {
    $location.path('/jobposter/jobs/view/candidate/' + id);
  }

});

app.controller('JobposterJobViewCandidateController', function($scope, $localStorage, $location, $sessionStorage, $routeParams,  $http){

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

  // Pull candidate data from db
  $http({
      method: 'GET',
      url: '/jobposter/jobs/candidate',
      params: {'candidate_id': $routeParams.id}
      })
      .success(function(response){
          $scope.candidate = response;
          console.log($scope.candidate);

          if($scope.candidate == ""){
            alert("No User Found in DB");
            $location.path('/');
          }

      })

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

        //Explore Jobs Job View for non-registered users
        when('/explore/jobs/view/:id', {
            templateUrl: 'views/explore_job_view.html',
            controller: 'JobViewController'
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

        //JOB SEEKER SPECIFIC STUFS
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

        //Job Seeker Jobs List Page
        when('/jobseeker/jobs', {
            templateUrl: 'views/jobseeker_jobs.html',
            controller: 'JobseekerJobsController'
        }).

        //Job Seeker Specific Job Page
        when('/jobseeker/jobs/view/:id', {
            templateUrl: 'views/jobseeker_job_view.html',
            controller: 'JobseekerJobViewController'
        }).

        //JOB POSTER SPECIFIC STUFS
        //Job Poster Post Job Page
        when('/post/job', {
            templateUrl: 'views/jobposter_post_job.html',
            controller: 'JobposterPostJobController'
        }).

        //Job Poster View Jobs Page
        when('/jobposter/jobs', {
            templateUrl: 'views/jobposter_jobs.html',
            controller: 'JobposterJobsController'
        }).

        //Job Poster Specific Job Page
        when('/jobposter/jobs/view/:id', {
            templateUrl: 'views/jobposter_job_view.html',
            controller: 'JobposterJobViewController'
        }).

        //Job Poster Edit Specific Job Page
        when('/jobposter/jobs/edit/:id', {
            templateUrl: 'views/jobposter_edit_job_view.html',
            controller: 'JobposterJobEditViewController'
        }).

        //Job Poster Specific Job Candidates Page
        when('/jobposter/jobs/view/candidates/:id', {
            templateUrl: 'views/jobposter_job_view_candidates.html',
            controller: 'JobposterJobViewCandidatesController'
        }).

        //Job Poster Specific Job Candidate Page
        when('/jobposter/jobs/view/candidate/:id', {
            templateUrl: 'views/jobposter_job_view_candidate.html',
            controller: 'JobposterJobViewCandidateController'
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


app.directive("customSort", function() {
  return {
      restrict: 'A',
      transclude: true,
      scope: {
        order: '=',
        sort: '='
      },
      template :
        ' <a ng-click="sort_by(order)" style="color: #555555;">'+
        '    <span ng-transclude></span>'+
        '    <i ng-class="selectedCls(order)"></i>'+
        '</a>',
      link: function(scope) {

      // change sorting order
      scope.sort_by = function(newSortingOrder) {
          var sort = scope.sort;

          if (sort.sortingOrder == newSortingOrder){
              sort.reverse = !sort.reverse;
          }

          sort.sortingOrder = newSortingOrder;
      };

      scope.selectedCls = function(column) {
          if(column == scope.sort.sortingOrder){
              return ('fa fa-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
          }
          else{
              return'fa fa-sort'
          }
      };
    }// end link
  }
});
