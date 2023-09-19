function SendEmail(windows, emailToShareWith, notificationData, currentUser) {
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${notificationData.title}</title>
        <style>
          body {
            font-family: sans-serif;
          }
  
          h1 {
            font-size: 24px;
          }
  
          p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
      <div>
        <h1>${notificationData.title}</h1>
      </div>  
        <br>
        <div>
        <p>Task Title: ${notificationData.task_title}</p>
        <p>Task Description: ${notificationData.task_description}</p>
        <p>Task Due Date:${notificationData.task_due_date}</p>
        </div>
        <br>
        <p>Task Shared by: ${currentUser?.email}</p>
      </body>
      </html>
    `;
  
    windows.Email.send({
      Host: "smtp.elasticemail.com",
      Username : "sudhakarjha8655@gmail.com",
      Password : "95822FE1AB223FF078F981F3ED1084592100",
      To: emailToShareWith,
      From: "sudhakarjha8655@gmail.com",
      Subject: "New Task Assigned",
      Body: emailContent
    })
      .then((message) => {
        if (message === "OK") {
          alert("Task successfully shared, and the email notification has been sent");
        }
      })
      .catch((error) => {
        alert("Error sending email: " + "error");
      });
  }
  
  export default SendEmail;
  