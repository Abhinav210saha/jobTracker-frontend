const company = document.getElementById("company");
const role = document.getElementById("role");
const salary = document.getElementById("salary");
const form = document.getElementById("form");
const jobType = document.getElementById("jobType");
const jobStatus = document.getElementById("jobStatus");
const jobList = document.getElementById("jobList");
const btnCancel = document.getElementById("btn-cancel");
const btnSubmit = document.querySelector(".btn-submit");

let jobs = [];
let editJobIndex = null;

// Initial fetch from DB on page load
loadAndDisplayJobs();

async function getData() {
  const url = "http://localhost:3000/jobs";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    return result.jobs || [];
  } catch (error) {
    console.error("Error fetching data from DB:", error);
    return [];
  }
}

async function loadAndDisplayJobs() {
  jobs = await getData();
  displayJobs();
}

async function saveDataToDB(job) {
  const payload = {
    companyName: job.company,
    jobRole: job.role,
    jobType: job.jobType,
    jobStatus: job.jobStatus,
    salary: job.salary,
  };

  const url = "http://localhost:3000/job";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving to DB:", error);
  }
}



form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const job = {
    company: company.value.trim(),
    role: role.value.trim(),
    salary: salary.value.trim(),
    jobType: jobType.value,
    jobStatus: jobStatus.value,
  };

  if (editJobIndex === null) {
    await saveDataToDB(job);
  } else {
    // If you implement a PUT/PATCH endpoint later:
    try {
      const response = await updateDataInDB(
        jobs[editJobIndex]._id,
        job,
      );
      console.log(response);
    } catch (error) {
       console.error("Error Updating to DB:", error);

    }
  }

  clearForm();
  // Fetch fresh data from the database
  await loadAndDisplayJobs();
});



async function updateDataInDB(id, job) {
  // console.log(id,job)
  try {
    const payload = {
      companyName: job.company,
      jobRole: job.role,
      jobType: job.jobType,
      jobStatus: job.jobStatus,
      salary: job.salary,
    };

     const url = `http://localhost:3000/job/update/${id}`;
    const response = await fetch(url,{
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error Update in updateDataInDB method to DB:", error);
  }
}

function displayJobs() {
  if (!jobList) return;

  jobList.innerHTML = jobs
    .map(
      (job, index) => `
      <div class="job-card">
        <div class="job-card-header">
          <div>
            <h3 class="job-card-title">${job.jobRole || job.role || ""}</h3>
            <p class="job-card-company">${job.companyName || job.company || ""}</p>
          </div>
          <span class="badge status-${(job.jobStatus || "").toLowerCase()}">${job.jobStatus || ""}</span>
        </div>

        <div class="job-card-meta">
          <span class="badge badge-meta">${job.jobType || ""}</span>
          <span class="badge badge-meta">${job.salary || ""}</span>
        </div>

        <div class="job-card-footer">
          <button type="button" class="btn-delete" onClick="deleteJob('${job._id || index}')">Delete</button>
          <button type="button" class="btn-edit" onClick="editJob(${index})">Edit</button>
        </div>
      </div>`,
    )
    .join("");
}

async function deleteJob(idOrIndex) {
  // If your backend has a delete endpoint (e.g., DELETE /user/:id):
  await fetch(`http://localhost:3000/job/delete/${idOrIndex}`, { method: 'DELETE' });
  await loadAndDisplayJobs();

  // Temporary client-side remove until you add a DELETE route:
  if (typeof idOrIndex === "number") {
    jobs.splice(idOrIndex, 1);
    displayJobs();
  }
}

function editJob(index) {
  const job = jobs[index];
  editJobIndex = index;

  // console.log(job._id)

  company.value = job.companyName || job.company || "";
  role.value = job.jobRole || job.role || "";
  salary.value = job.salary || "";
  jobType.value = job.jobType || "";
  jobStatus.value = job.jobStatus || "";

  btnSubmit.textContent = "Update Job";
  if (btnCancel) btnCancel.style.display = "block";
}

function clearForm() {
  editJobIndex = null;
  if (btnCancel) btnCancel.style.display = "none";
  btnSubmit.textContent = "Add Job";
  form.reset();
}

if (btnCancel) {
  btnCancel.addEventListener("click", clearForm);
}
