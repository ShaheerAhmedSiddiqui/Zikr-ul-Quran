# Zikr-ul-Quran — Playlist Management System (DSA Project)

---

## 📖 Brief Summary

A full-stack Quran playlist management system that leverages a custom Doubly Linked List as the core data structure for efficient playlist management and navigation.

---

## 🧭 Overview

Zikr-ul-Quran is a Semester-03 Data Structures & Algorithms (DSA) final project developed to demonstrate how fundamental data structures can be applied in a real-world, full-stack application.

Unlike traditional console-based DSA projects, this application integrates a custom in-memory Doubly Linked List with a Spring Boot backend, MySQL database, and React frontend to create a production-style Quran playlist management system.

The project showcases how theoretical DSA concepts can drive practical application logic while maintaining persistent data storage and an intuitive user experience.

---

## ❓ Problem Statement

Many academic DSA projects focus on isolated implementations that rarely demonstrate how data structures function within complete software systems.

This project addresses that gap by building a full-stack application where a custom Doubly Linked List is responsible for core playlist operations, including navigation, ordering, insertion, deletion, and synchronization with a relational database.

The system enables users to:

- Manage Quran playlists using a custom Doubly Linked List
- Navigate playlists in sequential order
- Perform playlist insertions, deletions, and reordering efficiently
- Synchronize in-memory playlist operations with persistent MySQL storage

---

## 🗂 Dataset

The application stores and manages:

- Quran Surah metadata in MySQL
- User information and playlist records
- Playlist ordering and associated metadata

### ⚠️ Audio Files Notice

Due to GitHub's file size limitations, Quran recitation audio files are not included in this repository.

To run the project locally, place the audio files inside:

```
backend/zikr-backend/src/main/resources/static/audio/
├── arabic/
├── urdu/
└── english/
```

---

## 🛠 Tools & Technologies

### Backend
- Java
- Spring Boot
- Spring Data JPA
- MySQL

### Frontend
- React
- TypeScript
- CSS

### Core Data Structure
- Custom Doubly Linked List (`PlaylistLinkedList`)

---

## 🏗 System Architecture

The application follows a layered architecture:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL Database
```

For playlist management, the workflow is:

1. Load playlist data from MySQL
2. Convert records into a custom Doubly Linked List
3. Perform insert, delete, reorder, and traversal operations in memory
4. Persist the updated playlist order back to the database

---

## 💡 Key Insights

This project demonstrates several important software engineering and DSA concepts:

- Integrating data structures into real-world applications
- Efficient management of ordered and dynamic collections using Linked Lists
- Combining in-memory processing with persistent database storage
- Building scalable applications using a clean layered architecture

---

## 🎥 Project Demonstration

A complete walkthrough of the project is available on LinkedIn.

The demonstration covers:

- User authentication
- Playlist creation and management
- Doubly Linked List-based playlist navigation
- Quran audio playback
- Frontend and backend interaction
- Database synchronization

---

## 🚀 How to Run the Project

### Prerequisites
- Java 17 or later
- Node.js
- MySQL

### Installation
1. Clone the repository
2. Import `database/qiraat_app.sql` into MySQL
3. Configure database credentials in `application.properties`
4. Add the Quran audio files locally (not included in this repository)
5. Start the Spring Boot backend
6. Run the React frontend

---

## 📊 Results & Conclusion

This project demonstrates how classical Data Structures & Algorithms concepts can be effectively applied in modern software development.

Rather than serving as a standalone academic implementation, the custom Doubly Linked List actively powers playlist creation, ordering, navigation, and synchronization, making it a core component of the application's functionality.

---

## 🔮 Future Improvements

- Deploy the backend and frontend to the cloud
- Integrate cloud storage for audio files
- Develop a mobile application
- Introduce additional DSA-based optimizations
- Support offline playlist synchronization

---

## 👤 Author

**Shaheer Ahmed Siddiqui**
BS Software Engineering
—Sukkur IBA University

📧 Email: mrshaheer75@gmail.com

🔗 LinkedIn: https://www.linkedin.com/in/shaheer-ahmed-siddiqui-b381a1248/

💻 GitHub: https://github.com/ShaheerAhmedSiddiqui/

---

## 🤝 Contributors

- [Muhammad Anas Qadri](https://github.com/anasqadri-dev)
- [Ghulam Mustafa](https://github.com/GhulamMustafa934)

---
