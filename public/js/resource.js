const addResource = () => {
    let response = "";
    const jsonData = {
      name: document.getElementById("name").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      owner: document.getElementById("owner").value,
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
  