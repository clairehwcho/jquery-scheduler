/*
Wrap all code that interacts with the DOM in a call to jQuery to ensure that
the code isn't run until the browser has finished rendering all the elements in the html.
*/
$(function () {
  // Load dayjs advanced format plugin to use other formats for date.
  dayjs.extend(window.dayjs_plugin_advancedFormat);

  // Save reference to important DOM elements
  const currentDayEl = $("#currentDay");
  const timeblockEl = $(".time-block");
  const textareaEl = $(".description");
  const saveMessageEl = $("<p>").attr("id", "save-message").html("Appointment added to <span>local storage</span>✅");

  // Handle displaying the current day.
  function renderToday () {
    const today = dayjs().format('dddd, MMMM Do');
    currentDayEl.text(today);
  };

  // The getEventsFromStorage function and return array of event objects.
  function getEventsFromStorage () {
    const eventsFromStorage = localStorage.getItem("events");
    if (eventsFromStorage) {
      storedEventsArr = JSON.parse(eventsFromStorage);
      console.log("Data found from local storage");
      return storedEventsArr;
    }
    else {
      console.log("No data found from local storage");
      return null;
    }
  };

  // The storeEventsToStorage function saves an array of events in local storage.
  function storeEventsToStorage (storedEventsArr) {
    localStorage.setItem("events", JSON.stringify(storedEventsArr));
    console.log("Data stored in local storage");
  };

  // Get event data from local storage and display it on the page.
  function renderEventData () {
    // Get an array of events from local storage.
    const eventsArr = getEventsFromStorage();

    // If there is no data stored in local storage, exit the function.
    if (!eventsArr) {
      console.log("No data to be rendered");
      return;
    }

    // Clear all textareas on the page.
    textareaEl.empty();

    // If any event object is stored in the array, add events to the corresponding timeblock.
    // Loop through the array of events.
    $(eventsArr).each(function (i) {
      const event = eventsArr[i];
      const eventHour = Object.keys(event)[0].substring(5);
      const eventDescription = Object.values(event)[0];
      // Loop through the timeblocks and add event description to the corresponding timeblock.
      $(timeblockEl).each(function () {
        const timeblock = $(this);
        const timeblockHour = timeblock.attr("id").substring(5);
        if (timeblockHour === eventHour) {
          timeblock.children("textarea").text(eventDescription);
        }
      })
    })
    console.log("Data rendered");
  };

  // The handleSaveEvent function stores event data in local storage.
  function handleSaveEvent (e) {
    e.preventDefault();

    // Create an object for new event.
    const hour = $(this).parent(".time-block").attr("id");
    const description = $(this).siblings(".description").val().trim();
    const newEvent = {
      [hour]: description
    }

    // Get the array of events from local storage.
    let eventsArr = getEventsFromStorage();

    // If no data is stored in local storage
    if (eventsArr === null) {
      // If the textarea is empty, exit the function.
      if (description === "") {
        console.log("Nothing to update");
        return;
      }
      // If the textarea is not empty, make a new array and add the new event object to the array.
      else {
        eventsArr = [];
        eventsArr.push(newEvent);
        console.log("A new event added");
      }
    }
    // If any data is stored in local storage
    else {
      let isPresent = false;
      while (!isPresent) {
        // Loop through each event object in the array.
        $(eventsArr).each(function (i) {
          const storedEventObj = eventsArr[i];
          // If the object already has the selected hour as a key, reset its value or remove the object.
          if (storedEventObj.hasOwnProperty(hour)) {
            if (storedEventObj[hour] === description) {
              console.log("Nothing to update");
              isPresent = true;
              return false;
            }
            else if (description !== "") {
              storedEventObj[hour] = description;
              console.log(`${hour} data updated`);
              isPresent = true;
              return false;
            }
            else {
              let idxToRemove;
              $.each(eventsArr, function (i, obj) {
                if (obj.hasOwnProperty(hour)) {
                  idxToRemove = i;
                }
              });
              eventsArr.splice(idxToRemove, 1);
              console.log(`${hour} data removed`);
              isPresent = true;
              return false;
            }
          }
        })
        break;
      }

      // If the array does not have the selected hour data, add nothing or the new object to the array.
      if (!isPresent) {
        if (description === "") {
          console.log("Nothing to update");
          return;
        }
        else {
          eventsArr.push(newEvent);
          console.log("A new event added");
        }
      }
    };

    // If the object in local storage is empty, remove the object.
    if (jQuery.isEmptyObject(eventsArr)) {
      localStorage.clear();
      saveMessageEl.insertAfter($("header"));
    }
    // Or save the new array in local storage.
    else {
      storeEventsToStorage(eventsArr);
      saveMessageEl.insertAfter($("header"));
    }
  };

  // The setTimeblockColor sets the background color of each time block on page load.
  function setTimeblockColor () {
    // Get the current hour.
    const currentHour = parseInt(dayjs().format("k"));

    // Loop through each timeblock and set corresponding class attribute.
    $(timeblockEl).each(function () {
      const timeblock = $(this);
      const timeblockHour = parseInt(timeblock.attr("id").substring(5));

      // If the current hour has passed the timeblock hour, add "past" to its class attribute.
      if (timeblockHour < currentHour) {
        timeblock.addClass("past")
      }
      // If the current hour is the same as the timeblock hour, add "present" to its class attribute.
      else if (timeblockHour === currentHour) {
        timeblock.addClass("present")
      }
      // If the current hour is not yet the timeblock hour, add "future" to its class attribute.
      else {
        timeblock.addClass("future")
      };
    })
  };

  // Remove the save confirmation message displayed on the top of timeblocks when any textarea is clicked.
  function removeSaveMessage () {
    saveMessageEl.remove();
  };

  // The handleSaveEvent function is called when the save button is clicked.
  timeblockEl.on("click", ".saveBtn", handleSaveEvent);

  // The removeSaveMessage is called when any textarea is clicked.
  $("textarea").on("click", removeSaveMessage);

  // Run the functions on page load.
  renderToday();
  setTimeblockColor();
  renderEventData();
});
