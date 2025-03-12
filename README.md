# Goalist

Goalist is a goal management application that allows users to create, track, and manage their goals effectively. With a user-friendly interface and powerful features, Goalist helps you stay organized and motivated.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication with email and Google sign-in.
- Create, update, and delete goals.
- Organize goals into lists.
- Track progress with visual progress meters.
- Drag and drop functionality for goal lists.
- Responsive design for mobile and desktop use.

## Technologies Used

- React
- TypeScript
- Supabase (for backend and authentication)
- Tailwind CSS (for styling)
- DaisyUI (for UI components)
- React Router (for navigation)
- @hello-pangea/dnd (for drag-and-drop functionality)

## Installation

To get started with Goalist, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/goalist.git
   ```

2. Navigate to the project directory:

   ```bash
   cd goalist
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up your Supabase project and configure the environment variables. Create a `.env` file in the root directory and add your Supabase URL and public API key:

   ```plaintext
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

- **Sign Up / Sign In**: Create a new account or sign in using your email or Google account.
- **Create Goals**: Add new goals and organize them into lists.
- **Track Progress**: Monitor your progress with visual indicators.
- **Drag and Drop**: Rearrange your goal lists using drag-and-drop functionality.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes.
4. Push to your branch.
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for using Goalist! We hope it helps you achieve your goals effectively.
