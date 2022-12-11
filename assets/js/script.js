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

  // Handle displaying the current day.
  function renderToday () {
    const today = dayjs().format('dddd, MMMM Do');
    currentDayEl.text(today);
  }

  // The getEventsFromStorage function and return array of event objects.
  function getEventsFromStorage () {
    let storedEventsArr = []
    const eventsFromStorage = localStorage.getItem("events");
    if (eventsFromStorage) {
      storedEventsArr = JSON.parse(eventsFromStorage);
    }
    return storedEventsArr;
  }

  // The storeEventsToStorage function saves an array of events in local storage.
  function storeEventsToStorage (storedEventsArr) {
    localStorage.setItem("events", JSON.stringify(storedEventsArr));
  }

  // Get event data from local storage and display it on the page.
  function renderEventData () {
    // Clear all textareas on the page.
    textareaEl.empty();

    // Get an array of events from local storage.
    const eventsArr = getEventsFromStorage();

    // If any event object is stored in the array, add events to the corresponding timeblock.
    if (eventsArr.length !== 0) {
      // Loop through the array of events.
      $(eventsArr).each(function (i) {
        const event = eventsArr[i];
        const eventHour = Object.keys(event)[0].substring(5);
        const eventDescription = Object.values(event)[0];
        // Loop through the timeblocks and add event description to the corresponding timeblock.
        $(timeblockEl).each(function (j) {
          const timeblock = $(this);
          const timeblockHour = timeblock.attr("id").substring(5);
          if (timeblockHour === eventHour) {
            timeblock.children("textarea").text(eventDescription);
          }
        })
      })
    }
  }

  // The handleSaveEvent function stores event data in local storage.
  function handleSaveEvent (e) {
    e.preventDefault();

    const hour = $(this).parent(".time-block").attr("id");
    const description = $(this).siblings(".description").val();

    // Create an object for new event.
    const newEvent = {
      [hour]: description
    }

    // Get the array of events from local storage.
    let eventsArr = getEventsFromStorage();

    // Add the new event object to the array.
    if (eventsArr.length !== 0) {
      $(eventsArr).each(function (i) {
        const oneEvent = eventsArr[i];
        if (oneEvent[hour]) {
          oneEvent[hour] = description;
        }
        else {
          eventsArr.push(newEvent);
        }
      })
    }
    else {
      eventsArr.push(newEvent);
    }

    // Save the array in local storage.
    storeEventsToStorage(eventsArr);

    window.alert("Events have been successfully updated and added to local storage.");
  }

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
  }

  // The handleSaveEvent function is called when the save button is clicked.
  timeblockEl.on("click", ".saveBtn", handleSaveEvent);

  // Run the functions on page load.
  renderToday();
  setTimeblockColor();
  renderEventData();
});