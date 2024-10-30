const addResource = () => {
  let response = "";
  const jsonData = {
    name: document.getElementById("name").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value,
    owner: document.getElementById("owner").value
  };

  // Validation
  if (!jsonData.name || !jsonData.location || !jsonData.description) {
    document.getElementById("message").innerHTML = "All fields are required!";
    document.getElementById("message").setAttribute("class", "text-danger");
    return;
  }

  const request = new XMLHttpRequest();
  request.open("POST", "/add-resource", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.onload = () => {
    response = JSON.parse(request.responseText);
    console.log(response);
    const messageElement = document.getElementById("message");

    if (request.status === 200) {
      messageElement.innerHTML = "Added Resource: " + jsonData.name + "!";
      messageElement.setAttribute("class", "text-success");
      resetForm();
      window.location.href = "index.html";
    } else {
      messageElement.innerHTML = "Unable to add resource!";
      messageElement.setAttribute("class", "text-danger");
    }
  };

  request.onerror = () => {
    document.getElementById("message").innerHTML = "Network error occurred!";
    document.getElementById("message").setAttribute("class", "text-danger");
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
  request.onload = function() {
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
}
