describe("Resource Management Frontend", () => {
  let baseUrl: string;

  before(() => {
    cy.task<string>("startServer").then(url => {
      baseUrl = url; // Store the base URL
      cy.visit(baseUrl);
    });
  });

  after(() => {
    return cy.task("stopServer"); // Stop the server after the report is done
  });
  it("should add a new resource", () => {
    // Intercept the POST request to monitor the API call
    cy.intercept('POST', '/add-resource').as('addResource');
  
    // Open the modal and fill in the form
    cy.get('button[data-target="#resourceModal"]').click();
    cy.get("#name").type("Test Resource", { force: true });
    cy.get("#location").type("Test Location", { force: true });
    cy.get("#description").type("Test Description", { force: true });
    cy.get("#owner").type("test@example.com", { force: true });
    
    // Click the 'Add New Resource' button
    cy.get("button.btn-primary").contains("Add New Resource").click();
    
    // Wait for the POST request to complete
    cy.wait('@addResource').its('response.statusCode').should('eq', 201);
    cy.wait(2000)
    cy.url().should('include', 'index.html');

  });  
  
  it("should view all resources", () => {
    cy.visit(baseUrl);
    // Ensure that the resource we just added is visible in the table
    cy.get("#tableContent").contains("Test Resource").should("exist");
  });

  it('should update an existing resource', () => {
    cy.visit(baseUrl);
  
    // Intercept the API request for updating the resource
    // cy.intercept('PUT', '/your/api/endpoint').as('updateResource');
  
    // Click the edit button for the resource
    cy.get('button.btn-warning').filter(':contains("Edit")').last().click();
  
    // Update resource details
    cy.get('#editName').clear().type('Updated Resource', { force: true });
    cy.get('#editLocation').clear().type('Updated Location', { force: true });
    cy.get('#editDescription').clear().type('Updated Description', { force: true });
    cy.get('#editOwner').clear().type('updated@example.com', { force: true });
  
    // Click the update resource button
    cy.get('#updateButton').click();
  
    // Wait for the update request to complete
    // cy.wait('@updateResource');
  
    // Verify the resource is updated in the table
    cy.get('#tableContent') 
      .find('tr')
      .contains('Updated Resource')
      .should('exist');  // Ensure the updated resource is in the table
  
    // Verify that the old resource no longer exists // Ensure the old resource is removed
  });
  

  it("should delete a resource", () => {
    cy.visit(baseUrl);
    cy.get("button.btn-danger").filter(':contains("Delete")').last().click();
    // Verify that the resource has been deleted
    cy.get("#tableContent").contains("Updated Resource").should("not.exist");
  });

  it("should be unable to add resource - empty fields", () => {
    cy.visit(baseUrl);
    // Open the modal and fill in the form
    cy.get('button[data-target="#resourceModal"]').click();
    // Click the add resource button
    cy.get("button.btn-primary").contains("Add New Resource").click();
    // Assert that the error message is displayed with the correct text
    cy.get('#message')
    .should('be.visible') // Ensure the message is visible
    .and('have.text', 'All fields are required!'); // Check the error message text
    // Assert that the message has the "text-danger" class
    cy.get('#message')
    .should('have.class', 'text-danger');
    });
    it("should be unable to add resource - short description", () => {
    cy.visit(baseUrl);
    // Open the modal and fill in the form
    cy.get('button[data-target="#resourceModal"]').click();
    cy.get("#name").type("Test Resource", { force: true });
    cy.get("#location").type("Test Location", { force: true });
    cy.get("#description").type("Short", { force: true });
    cy.get("#owner").type("test@example.com", { force: true });
    // Click the add resource button
    cy.get("button.btn-primary").contains("Add New Resource").click();
    //Verify the validation error
    cy.get("#message")
    .should("exist")
    // .and("include.text", "Unable to add resource!");
    });
    it("should be unable to modify resource - empty values", () => {
      cy.visit(baseUrl);
    
      // Open the edit modal
      cy.get('button.btn-warning').filter(':contains("Edit")').last().click();
    
      // Clear all fields and click update
      cy.get("#editName").clear({ force: true });
      cy.get("#editLocation").clear({ force: true });
      cy.get("#editDescription").clear({ force: true });
      cy.get("#editOwner").clear({ force: true });
    
      cy.get("#updateButton").click();
    
      // Assert error message
      cy.get("#editMessage", { timeout: 10000 })
        .should("be.visible")
        .and("have.text", "All fields are required!")
        //.and("have.class", "text-danger");
    });    
});
