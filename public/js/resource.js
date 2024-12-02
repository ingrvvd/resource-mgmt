const addResource = () => {
  let response = "";
  const messageElement = document.getElementById("message");

  // Clear any previous messages
  messageElement.innerHTML = "";
  
  // Collecting form data
  const jsonData = {
    name: document.getElementById("name").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
    owner: document.getElementById("owner").value
  };

  // Validation
  if (!jsonData.name || !jsonData.location || !jsonData.description) {
    messageElement.innerHTML = "All fields are required!";
    messageElement.setAttribute("class", "text-danger");
    return;
  }

  // AJAX Request
  const request = new XMLHttpRequest();
  request.open("POST", "/add-resource", true);
  request.setRequestHeader("Content-Type", "application/json");
  
  request.onload = () => {
    response = JSON.parse(request.responseText);
    console.log(response);

    if (request.status === 201) {
      messageElement.innerHTML = `Added Resource: ${jsonData.name}!`;
      messageElement.setAttribute("class", "text-success");
      resetForm();

      // Delay redirect for 2 seconds to allow user to read the message
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      messageElement.innerHTML = "Unable to add resource! Check server response for details.";
      messageElement.setAttribute("class", "text-danger");
      console.error("Error:", response); // Log detailed error for debugging
    }
  };

  // Network Error Handling
  request.onerror = () => {
    messageElement.innerHTML = "Network error occurred!";
    messageElement.setAttribute("class", "text-danger");
  };

  request.send(JSON.stringify(jsonData));
};

const resetForm = () => {
  document.getElementById("name").value = "";
  document.getElementById("location").value = "";
  document.getElementById("description").value = "";
  document.getElementById("owner").value = "";
};

const viewResources = () => {
  var response = "";
  var request = new XMLHttpRequest();
  request.open("GET", "/view-resources", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = () => {
    response = JSON.parse(request.responseText);
    var html = "";
    for (var i = 0; i < response.length; i++) {
      html +=
        "<tr>" +
        "<td>" +
        (i + 1) +
        "</td>" +
        "<td>" +
        response[i].name +
        "</td>" +
        "<td>" +
        response[i].location +
        "</td>" +
        "<td>" +
        response[i].description +
        "</td>" +
        "<td>" +
        response[i].owner +
        "</td>" +
        "<td>" +
        '<button type="button" class="btn btn-warning" onclick="editResource(\'' +
        JSON.stringify(response[i]).replaceAll('"', "&quot;") +
        "')\">Edit </button> " +
        '<button type="button" class="btn btn-danger" onclick="deleteResource(' +
        response[i].id +
        ')"> Delete</button>' +
        "</td>" +
        "</tr>";
    }
    document.getElementById("tableContent").innerHTML = html;
  };
  request.send();
};

const editResource = data => {
  var selectedResource = JSON.parse(data);
  document.getElementById("editName").value = selectedResource.name;
  document.getElementById("editLocation").value = selectedResource.location;
  document.getElementById("editDescription").value =
    selectedResource.description;
  document.getElementById("editOwner").value = selectedResource.owner;
  document
    .getElementById("updateButton")
    .setAttribute("onclick", 'updateResource("' + selectedResource.id + '")');
  $("#editResourceModal").modal("show");
};

const updateResource = id => {
  console.log(id);
  var response = "";
  var jsonData = new Object();
  jsonData.name = document.getElementById("editName").value;
  jsonData.location = document.getElementById("editLocation").value;
  jsonData.description = document.getElementById("editDescription").value;
  jsonData.owner = document.getElementById("editOwner").value;
  if (
    jsonData.name == "" ||
    jsonData.location == "" ||
    jsonData.description == "" ||
    jsonData.owner == ""
  ) {
    document.getElementById("editMessage").innerHTML =
      "All fields are required!";
    document.getElementById("editMessage").setAttribute("class", "text-danger");
    return;
  }
  var request = new XMLHttpRequest();
  request.open("PUT", "/edit-resource/" + id, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = () => {
    response = JSON.parse(request.responseText);
    if (response.message == "Resource modified successfully!") {
      document.getElementById("editMessage").innerHTML =
        "Edited Resource: " + jsonData.name + "!";
      document
        .getElementById("editMessage")
        .setAttribute("class", "text-success");
      window.location.href = "index.html";
    } else {
      document.getElementById("editMessage").innerHTML =
        "Unable to edit resource!";
      document
        .getElementById("editMessage")
        .setAttribute("class", "text-danger");
    }
  };
  request.send(JSON.stringify(jsonData));
};

const deleteResource = (selectedId) => {
  var response = "";
  var request = new XMLHttpRequest();
  request.open("DELETE", "/delete-resource/" + selectedId, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = () => {
    response = JSON.parse(request.responseText);
    if (response.message == "Resource deleted successfully!") {
      window.location.href = "index.html";
    } else {
      alert("Unable to delete resource!");
    }
  };
  request.send();
}
