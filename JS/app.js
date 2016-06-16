var baseURL = "https://test-api-project-3b52c.firebaseio.com/";
var taskReferenceApp = new Firebase(baseURL);

var $dailyTaskboard = $('.daily .task-list');
var $weeklyTaskboard = $('.weekly .task-list')
var $infiniteTaskboard = $('.infinite .task-list');

$(document).ready(function () {
    /* When clicking on nav buttons, load the pages */
    $('.dailyTab').on('click', function(){
      loadBoard('Daily');
    });

    $('.weeklyTab').on('click', function(){
      loadBoard('Weekly');
    });

    $('.infiniteTab').on('click', function(){
      loadBoard('Infinite');
    });

    $('.homeTab').on('click', function(){

      loadBoard('Summary');
    });

    //Load the summary page when document loads
    loadBoard('Summary');

    clearTasksByInterval();
});


function loadTasks (taskboardType,taskType) {

  var $taskboard = $(taskboardType);
  var tasks = [];

  console.log('Task type loading: ' + taskType);

  taskReferenceApp.child(taskType).on('value', function(results){
  var allTasks = results.val();

  //console.log(allTasks);
    if (allTasks == null || $taskboard.html() == null){
    } else {
      for (var tsk in allTasks){
          var task = allTasks[tsk].task

          var $taskElement = $('<div class="task"></div>');

          var $editBtn = $('<i class="fa fa-pencil edit"></i>')

          $editBtn.on('click', function(e) {
            var id = $(e.target.parentNode).data('id')
            console.log(e.target.parentNode)
            updateTask(id,task,taskType);
          })

          var $deleteBtn = $('<i class="fa fa-trash delete"></i>')
          $deleteBtn.on('click', function(e) {
              var id = $(e.target.parentNode).data('id')
              deleteTask(id,taskType);
          });


          $taskElement.attr('data-id', tsk)
          $taskElement.attr('data-type',taskType)

          $taskElement.html(task);

          $taskElement.append($editBtn);
          $taskElement.append($deleteBtn);

          tasks.push($taskElement)
          $taskboard.empty();

          for (var i in tasks){
            $taskboard.append(tasks[i]);
        }
      }
    }
  })
}

function loadBoard (boardType) {
  var $sidebar = $('.sidebar');
  var $daily = $('.daily');
  var $weekly = $('.weekly');
  var $infinite = $('.infinite');

    $('#addTask').on('click', function(){
      createTask();
    });


  if(boardType == 'Daily'){
    $sidebar.removeClass('hidden');
    $daily.removeClass('col-lg-4').removeClass('hidden').addClass('col-lg-10');
    $weekly.addClass('hidden');
    $infinite.addClass('hidden');

    loadTasks('.daily .task-list','Daily Tasks');

    $('.dailyTab').siblings().removeClass('active');
    $('.dailyTab').addClass('active');

  } else if (boardType == 'Weekly') {
    $sidebar.removeClass('hidden');
    $daily.addClass('hidden');
    $weekly.removeClass('col-lg-4').removeClass('hidden').addClass('col-lg-10');
    $infinite.addClass('hidden');

    loadTasks('.weekly .task-list','Weekly Tasks');

    $('.weeklyTab').siblings().removeClass('active');
    $('.weeklyTab').addClass('active');

  } else if (boardType == 'Infinite') {
    $sidebar.removeClass('hidden');
    $daily.addClass('hidden');
    $weekly.addClass('hidden');
    $infinite.removeClass('col-lg-4').removeClass('hidden').addClass('col-lg-10');;

    loadTasks('.infinite .task-list','Infinite Tasks');

    $('.infiniteTab').siblings().removeClass('active');
    $('.infiniteTab').addClass('active');

  } else if (boardType == 'Summary') {
    loadTasks('.daily .task-list','Daily Tasks');
    loadTasks('.weekly .task-list','Weekly Tasks');
    loadTasks('.infinite .task-list','Infinite Tasks');

    $('.homeTab').siblings().removeClass('active');
    $('.homeTab').addClass('active');

    $sidebar.addClass('hidden');
    $daily.removeClass('col-lg-10').removeClass('hidden').addClass('col-lg-4');
    $weekly.removeClass('col-lg-10').removeClass('hidden').addClass('col-lg-4');
    $infinite.removeClass('col-lg-10').removeClass('hidden').addClass('col-lg-4');


  }

}

/*********************************************
***********   General Actions   **************
*********************************************/
function createTask(){

  //Show the popup where they can create the task
  var $popup = $('#popup')
  $popup.removeClass('hidden');


  //Close the popup if they don't want it
  $('.closePopUp').on('click', function(){
    $popup.addClass('hidden');
  })

  //Create the task when they click on the button
  $('#createTask').one('click', function(event){
    event.preventDefault();

    //Get the type of task they want to create from the select box
    var $type = $('#getCreateType option:selected').text();
    console.log($type);
    var textareaVal = tinymce.get('texteditor').getContent();

    if(textareaVal == ''){
      //Figure out what to do: window alert, no. Other??
    } else {
      $popup.addClass('hidden');
      console.log(textareaVal);
      
      // create a section for taks data in the particular database child
      var taskReference = taskReferenceApp.child($type + ' Tasks');

        //Push the data to the task
        taskReference.push({
          task: textareaVal
        })

      // Clear message input (for UX purposes)
      tinymce.get('texteditor').setContent('');

      //Now reload the board to show what is going on
      loadBoard($type);
    }
  })
}


function updateTask(id,task,type){
  var taskRef = new Firebase(baseURL + type + "/" + id)

  //Show popup
  var $popup = $('#popupUpdate').removeClass('hidden');

  //Get content from tinyMCE
  tinymce.get('updateeditor').setContent(task);


  var splitType = type.split(' ');
  var boardType = splitType[0];

  $('.closePopUp').on('click', function(){
    $popup.addClass('hidden');
  })

  $('#updateTask').on('click', function (event){
    event.preventDefault();

    var textareaVal = tinymce.get('updateeditor').getContent();

    if(textareaVal == ''){
      console.log(textareaVal);
      window.alert('Please type in a task first!')
    } else {
      taskRef.update({
        task: textareaVal
      })

      $('#popupUpdate').addClass('hidden');
    }

    loadBoard(boardType);
  })
}

function deleteTask(id, type) {
  var taskRef = new Firebase(baseURL + type + "/" +  id)

  console.log(baseURL + type + "/" +  id);
  taskRef.remove();

  //Parse the type and remove the unnecesary "Tasks" at the end
  var splitType = type.split(' ');
  var boardType = splitType[0];

  loadBoard(boardType);
}

function clearTasksByInterval () {
  var day = new Date().getDay();
  var hours = new Date().getHours();

  if (day === 0 && hours > 0 && hours <= 1) {
    var weeklyref = new Firebase(baseURL + "Weekly Tasks/");
    weeklyref.remove();
  } else if (hours > 0 && hours <= 1) {
    var dailyref = new Firebase(baseURL + "Daily Tasks/");
    dailyref.remove();
  }

  //Check every hour if it is eligible to clear
  setInterval(clearTasksByInterval, 3600000);
}



/*----------- Under Construction ---------------*/

// function exportTasks() {
//   //using the Google Sheets endpoint iterate through all the tasks and then post them to the sheets update.
//   //https://developers.google.com/sheets/reference/rest/#service-sheetsgoogleapiscom
//   var clientID = YOURS

//   var randomString = function() {
//       var text = "";
//       var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//       for(var i = 0; i < 32; i++) {
//           text += possible.charAt(Math.floor(Math.random() * possible.length));
//       }
//       return text;
//   }

//   var nonce = randomString();
//   console.log('https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=' + clientID + '&nonce=' + nonce);

//   var xhr = new XMLHttpRequest();
//   var oauthToken = gapi.auth.getToken();
//   xhr.open('GET',
//   'https://www.googleapis.com/plus/v1/people/me/activities/public' +
//   '?access_token=' + encodeURIComponent(oauthToken.access_token));
//   xhr.send();


//   $.ajax({
//     url: 'https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=' + clientID + '&nonce=' + nonce
//   })

  //Create the spreadsheet, and then get it's ID

  //Using the spreadsheet's Iterate through the tasks in that view to exportTasks
  // https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}


  //Have a loading signal while it goes around
  // Show a message, after it is done
//}

