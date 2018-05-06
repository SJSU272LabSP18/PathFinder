// See LICENSE.MD for license information.

var app = angular.module('MEANapp', ['ngRoute', 'ngStorage','ngSanitize']);

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
                     {id:'Q4', question:"If you were able to live to the age of 90 and retain either the mind or body of a 30-year old for the last 60 years of your life, which would you choose?", answer:response.q4},
                     {id:'Q5', question:"What would constitute a perfect day for you? (not work related like number 1)", answer:response.q5},
                     {id:'Q6', question:"Describe your average day (needs to be swapped out)", answer:response.q6}
                    ]



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


  // Create Table Based on Jobs Data

  // init
  $scope.sort = {
              sortingOrder : 'Company',
              reverse : false
          };

  $scope.gap = 5;
  $scope.filteredItems = [];
  $scope.groupedItems = [];
  $scope.itemsPerPage = 10;
  $scope.pagedItems = [];
  $scope.currentPage = 0;

  $scope.items = [
    {"id":1,"Company":"Spotify","Job_Title":"Front-End Engineer","City":"New York City","State":"NY","Ranking":99},
    {"id":2,"Company":"Soundcloud","Job_Title":"Back-End Engineer","City":"New York City","State":"NY","Ranking":60},
    {"id":3,"Company":"Pandora","Job_Title":"Full-Stack Engineer","City":"Oakland","State":"CA","Ranking":75},
    {"id":4,"Company":"Apple Music","Job_Title":"Front-End Engineer","City":"Cupertino","State":"CA","Ranking":90},
    {"id":5,"Company":"Tidal","Job_Title":"UX Engineer","City":"Chicago","State":"IL","Ranking":80},
  ];

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


  // Redirect user to jobs page
  $scope.goToJob = function(id) {
    $location.path('/jobseeker/jobs/view/' + id);
  }


});


app.controller('JobseekerJobViewController', function($scope, $localStorage, $location, $sessionStorage, $routeParams){

  // Set local scope to persisted user data
  $scope.user = $localStorage;

  // Pull this from db in future
  $scope.items = [
    {

      "id":1,
      "Company":"Spotify",
      "CompanyLogo": "https://media.licdn.com/mpr/mpr/shrink_200_200/gcrc/dms/image/C560BAQFkDzx_7dqq3A/company-logo_400_400/0?e=2124345600&v=beta&t=7zBkFJuVSz8lK8i46oS-J7_QUNF-NjPoyRShTdu-9vY",
      "Job_Title":"Front-End Engineer",
      "City":"New York City",
      "State":"NY",
      "Ranking":99,
      "Job_Summary":"Spotify is looking for a Software Engineer to join our Engineering org.\nYou will build data solutions and distributed services to bring music and digital media experiences to our 100 million active users and millions of artists, either by working directly on product features, publishing and insight tools for artists, or by improving the quality of our software tools and large scale infrastructure.\n You will take on complex data and distributed systems problems using some of the most diverse datasets available — user behaviors, acoustical analysis, revenue streams, cultural and contextual data, and other signals across our broad range of mobile and connected platforms.\n Above all, your work will impact the way the world experiences music.",
      "Job_Type": "Entry Level",
      "Key_Skills": [
        {"text":"JavaScript", "value":"JavaScript"},
        {"text":"Python", "value":"Python"},
        {"text":"HTML", "value":"HTML"},
        {"text":"React", "value":"React"}
      ],
      "Description": "What you’ll do:\nBuild large-scale batch and real-time data pipelines with data processing frameworks like Scalding, Scio, Storm, Spark and the Google Cloud Platform.\n\nArchitect, design, develop, deploy and operate services that support millions of users.\n\nLeverage best practices in continuous integration and delivery.\n\nHelp drive optimization, testing and tooling to improve data and systems quality.\n\nCollaborate with other engineers, ML experts and stakeholders, taking learning and leadership opportunities that will arise every single day.\n\nWork in cross functional agile teams to continuously experiment, iterate and deliver on new product objectives."
    },
  ];

  $scope.job = $scope.items.find(function(element) {
    return element.id ==  $routeParams.id;
  });

  if($scope.job == undefined){
    alert("No Job Found in DB");
    $location.path('/jobseeker/jobs');
  }

  $('#skillPillbox').pillbox();
  $('#skillPillbox').pillbox('addItems', $scope.job.Key_Skills);

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

  // Create job dict
  $scope.user.jobpost = {}
  $scope.user.jobpost.skills = []


  // Skill Pillbox Init
  $('#skillPillbox').pillbox();


  // Form submission related methods
  $scope.cancel = function() {
    $location.path('/');
  }

  $scope.submitForm = function() {
    $scope.user.jobpost.title = $scope.jobpost.title;
    $scope.user.jobpost.company = $scope.jobpost.company;
    $scope.user.jobpost.summary = $scope.jobpost.summary;

    // Remove Duplicates from PillBox
    skillpills = $('#skillPillbox').pillbox('items');
    var unique_skills = {};

    for ( var i=0, len=skillpills.length; i < len; i++ )
        unique_skills[skillpills[i]['value']] = skillpills[i];

    finalskillpills = new Array();
    for ( var key in unique_skills )
        finalskillpills.push(unique_skills[key]);

    $scope.user.jobpost.skills = finalskillpills;
    $location.path('/');
  }

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

        //Job Poster Post Job Page
        when('/post/job', {
            templateUrl: 'views/jobposter_post_job.html',
            controller: 'JobposterPostJobController'
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
