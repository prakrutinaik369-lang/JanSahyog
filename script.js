
const resourceForm = document.getElementById("resourceForm");
const supportForm = document.getElementById("supportForm");
const issueForm = document.getElementById("issueForm");

// Display resources
async function loadResources() {
  const list = document.getElementById("resourceList");

  try {
    const response = await fetch("/api/resources");
    if (!response.ok) throw new Error("Could not load resources");

    const resources = await response.json();
    list.replaceChildren();

    resources.forEach(item => {
      const column = document.createElement("div");
      column.className = "col-md-6 col-lg-4";

      const card = document.createElement("div");
      card.className = "resource-card";

      const title = document.createElement("h5");
      title.textContent = item.title;

      const category = document.createElement("p");
      category.textContent = "Category: " + item.category;

      const type = document.createElement("p");
      type.textContent = "Action: " + item.type;

      const student = document.createElement("p");
      student.textContent = "Shared by: " + item.student_name;

      card.append(title, category, type, student);
      column.appendChild(card);
      list.appendChild(column);
    });
  } catch (error) {
    list.textContent = error.message;
  }
}

// Submit resource
resourceForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(resourceForm));

  try {
    const response = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");

    alert("Resource shared successfully!");
    resourceForm.reset();
    loadResources();
  } catch (error) {
    alert(error.message);
  }
});

// Submit student support request
supportForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(supportForm));

  try {
    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");

    document.getElementById("supportMessage").textContent =
      "Your support request has been submitted successfully.";

    supportForm.reset();
  } catch (error) {
    document.getElementById("supportMessage").textContent = error.message;
  }
});

// Submit campus issue
issueForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(issueForm));

  try {
    const response = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");

    document.getElementById("issueMessage").textContent =
      "Your campus issue has been reported successfully.";

    issueForm.reset();
  } catch (error) {
    document.getElementById("issueMessage").textContent = error.message;
  }
});

loadResources();
