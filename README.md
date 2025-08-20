# EMS-App

This repository contains an Employee Management System (EMS) application with two main components:
- **Angular Frontend** (in the `Angular/` folder)
- **FastAPI Backend** (in the `Fast-API/` folder)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Employee management (CRUD)
- Authentication & Authorization
- Leave management
- Department & Role management
- Profile image upload
- Responsive UI

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Python 3.9+](https://www.python.org/downloads/)
- [pip](https://pip.pypa.io/en/stable/)

### 1. Clone the Repository
```sh
git clone https://github.com/NikhileshGarol/EMS-App.git
cd EMS-App
```

### 2. Setup FastAPI Backend
```sh
cd Fast-API
# (Optional) Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows
source venv/bin/activate  # On Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload
```

### 3. Setup Angular Frontend
```sh
cd ../Angular
npm install --legacy-peer-deps

# Start the Angular development server
npm start
# or
ng serve
```

---

## Usage
1. **Start the FastAPI backend** (see above).
2. **Start the Angular frontend** (see above).
3. Access the app at [http://localhost:4200](http://localhost:4200).
4. The frontend communicates with the backend via REST APIs (see `proxy.conf.json` for proxy settings).

---

## Project Structure
```
EMS-App/
├── Angular/         # Angular frontend
│   ├── src/
│   ├── ...
│   └── package.json
├── Fast-API/        # FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── ...
└── uploads/         # Uploaded profile images
```

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a Pull Request

---

## License
This project is licensed under the MIT License.

---

## Support
For issues, please open a [GitHub Issue](https://github.com/NikhileshGarol/EMS-App/issues).

---
