import React, { useState, useEffect } from "react";
import {
  doc,
  collection,
  deleteDoc,
  addDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db  } from "./firebase";
import { useAuthValue } from "./AuthContext";
import "./Taskpage.css";
import './profile.css'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'




function Taskpage() {
  // const auth = useAuthValue();
  const {currentUser} = useAuthValue()
  const user = auth.currentUser;

  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [editingTaskId, setEditingTaskId] = useState("");
  const [updatedTask, setUpdatedTask] = useState({ title: "", description: "", dueDate: "" });
  const [comment, setComment] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [taskComments, setTaskComments] = useState({});

  useEffect(() => {
    if (user) {
      const userTasksRef = query(collection(db, "tasks"), where("assignedUser", "==", user.email));
      const sharedTasksRef = query(collection(db, "tasks"), where("sharedWith", "array-contains", user.email));

      const unsubscribeUserTasks = onSnapshot(userTasksRef, (snapshot) => {
        const updatedUserTasks = [];
        snapshot.forEach((doc) => {
          updatedUserTasks.push({ id: doc.id, ...doc.data() });
        });

        updatedUserTasks.sort((a, b) => {
          const dueDateA = new Date(a.dueDate);
          const dueDateB = new Date(b.dueDate);
          return dueDateA - dueDateB;
        });

        setTasks(updatedUserTasks);
      });

      const unsubscribeSharedTasks = onSnapshot(sharedTasksRef, (snapshot) => {
        const updatedSharedTasks = [];
        snapshot.forEach((doc) => {
          updatedSharedTasks.push({ id: doc.id, ...doc.data() });
        });

        updatedSharedTasks.sort((a, b) => {
          const dueDateA = new Date(a.dueDate);
          const dueDateB = new Date(b.dueDate);
          return dueDateA - dueDateB;
        });

        setTasks((prevTasks) => [...prevTasks, ...updatedSharedTasks]);
      });

      const commentsRef = collection(db, "comments");
      const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
        const updatedComments = {};
        snapshot.forEach((doc) => {
          const commentData = { id: doc.id, ...doc.data() };
          const taskId = commentData.taskId;
          if (!updatedComments[taskId]) {
            updatedComments[taskId] = [];
          }
          updatedComments[taskId].push(commentData);
        });
        setTaskComments(updatedComments);
      });

      return () => {
        unsubscribeUserTasks();
        unsubscribeSharedTasks();
        unsubscribeComments();
      };
    }
  }, [user]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();

    if (!user) {
      console.log("User not logged in.");
      return;
    }

    const taskData = {
      date: new Date().toLocaleString(),
      task,
      description: taskDesc,
      dueDate,
      assignedUser,
      userId: user.uid,
      sharedWith: [],
    };

    try {
      await addDoc(collection(db, "tasks"), taskData);
      console.log("Task added");
      setTask("");
      setTaskDesc("");
      setDueDate("");
      setAssignedUser("");
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };
  const handleShareTask = async (taskId) => {
    const emailToShareWith = prompt('Enter the email of the user to share the task with:');

    if (!emailToShareWith) {
      return;
    }

    const taskRef = doc(db, 'tasks', taskId);

    try {
      const taskDoc = await getDoc(taskRef);

      if (taskDoc.exists()) {
        const taskData = taskDoc.data();

        if (taskData.sharedWith && taskData.sharedWith.includes(emailToShareWith)) {
          console.log('Task is already shared with this user.');
          return;
        }

        const updatedSharedWith = taskData.sharedWith ? [...taskData.sharedWith, emailToShareWith] : [emailToShareWith];

        await updateDoc(taskRef, { sharedWith: updatedSharedWith });
        console.log('Task shared');

        // After sharing the task, send a notification to the recipient
        const notificationData = {
          title: 'Task Shared',
          body: 'You have a new shared task.',
        };

        // Retrieve the recipient's FCM token from the database based on their email
        const recipientUserDoc = await db.collection('users').where('email', '==', emailToShareWith).get();
        console.log('recipientUserDoc: ', recipientUserDoc);

        if (recipientUserDoc.docs.length > 0) {
          const recipientToken = recipientUserDoc.docs[0].data().fcmToken;
          console.log('recipientToken: ', recipientToken);
          if (recipientToken) {
            console.log('Sending notification to recipient.');
            console.log('notificationData: ', recipientToken);
            // Send the notification to the recipient by FCM token
            // sendNotification(recipientToken, notificationData);
          } else {
            console.error("Recipient's FCM token not found.");
          }
        } else {
          console.error('Recipient not found.');
        }
      } else {
        console.log('Task not found.');
      }
    } catch (error) {
      console.error('Error sharing task: ', error);
    }
  };


  const handleEditTask = (taskId) => {
    setEditingTaskId(taskId);
    const taskToEdit = tasks.find((t) => t.id === taskId);
    if (taskToEdit) {
      setUpdatedTask({
        title: taskToEdit.task,
        description: taskToEdit.description,
        dueDate: taskToEdit.dueDate,
      });
    }
  };

  const handleUpdateTask = async (taskId) => {
    if (!user) {
      console.log("User not logged in.");
      return;
    }

    const taskRef = doc(db, "tasks", taskId);
    try {
      await updateDoc(taskRef, {
        task: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
      });
      console.log("Task updated");
      setEditingTaskId("");
      setUpdatedTask({ title: "", description: "", dueDate: "" });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const handleRemoveTask = async (taskId) => {
    if (window.confirm("Are you sure you want to remove this task?")) {
      const taskRef = doc(db, "tasks", taskId);
      await deleteDoc(taskRef);
      console.log("Task removed");
    }
  };

  const handleAddComment = async (taskId, e) => {
    e.preventDefault();
    if (!user) {
      console.log("User not logged in.");
      return;
    }

    const commentData = {
      date: new Date().toLocaleString(),
      comment,
      taskId,
      userId: user.email,
    };

    try {
      await addDoc(collection(db, "comments"), commentData);
      console.log("Comment added");
      setComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleRemoveComment = async (commentId) => {
    if (window.confirm("Are you sure you want to remove this comment?")) {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
      console.log("Comment removed");
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Redirect to the login page after signing out
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="taskpage-container">
    <div className='center'>
    <div className='profile'>
      <h1>Profile</h1>
      <p><strong>Email: </strong>{currentUser?.email}</p>
      <p>
        <strong>Email verified: </strong>
        {`${currentUser?.emailVerified}`}
      </p>
      <span onClick={handleSignOut}>Sign Out</span>
    </div>
  </div>
      <div className="task-form">
        <form onSubmit={handleSubmitTask}>
          <input
            type="text"
            placeholder="Task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
          <input
            type="date"
            placeholder="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Assigned User"
            value={assignedUser}
            onChange={(e) => setAssignedUser(e.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="task-list">
        <ul>
          {tasks.map((t) => (
            <li key={t.id} className="task-item">
              <span>{t.task}</span>
              <span>Description: {t.description}</span>
              <span>Due Date: {t.dueDate}</span>
              <span>Assigned to: {t.assignedUser}</span>
              {editingTaskId === t.id ? (
                <div className="task-edit-form">
                  <input
                    type="text"
                    placeholder="Title"
                    value={updatedTask.title}
                    onChange={(e) =>
                      setUpdatedTask({ ...updatedTask, title: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={updatedTask.description}
                    onChange={(e) =>
                      setUpdatedTask({ ...updatedTask, description: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={updatedTask.dueDate}
                    onChange={(e) =>
                      setUpdatedTask({ ...updatedTask, dueDate: e.target.value })
                    }
                  />
                  <button onClick={() => handleUpdateTask(t.id)}>Update</button>
                </div>
              ) : (
                <div className="task-actions">
                  <button onClick={() => handleEditTask(t.id)}>Edit</button>
                  <button onClick={() => handleRemoveTask(t.id)}>Remove Task</button>
                  <button onClick={() => setSelectedTaskId(t.id)}>
                    {selectedTaskId === t.id ? "Hide Comments" : "View Comments"}
                  </button>
                  <button onClick={() => handleShareTask(t.id)}>Share Task</button>
                  {selectedTaskId === t.id && (
                    <div>
                      <form onSubmit={(e) => handleAddComment(t.id, e)}>
                        <input
                          type="text"
                          placeholder="Comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <button type="submit">Add Comment</button>
                      </form>
                      <ul>
                        {taskComments[t.id] &&
                          taskComments[t.id].map((c) => (
                            <li key={c.id}>
                              <span>{c.comment}</span>
                              <span>Commented by: {c.userId}</span>
                              <button onClick={() => handleRemoveComment(c.id)}>
                                Remove Comment
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Taskpage;
