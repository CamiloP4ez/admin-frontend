
## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd admin-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Configure API Base URL:**
    Create a `.env` file in the root of the project and add your API's base URL:
    ```env
    VITE_API_BASE_URL=http://localhost:8080/api
    ```
    Replace `http://localhost:8080/api` with the actual URL of your backend API.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    The application will typically be available at `http://localhost:5173` (Vite's default port).

## Default SuperAdmin Credentials

For initial setup and testing, a default SuperAdmin user is expected by the backend (or you should create one with these credentials if your backend supports seeding/initial setup):

*   **Username:** `superadmin`
*   **Password:** `superadminpassword`

Log in with these credentials to access all administrative features, including the "Administrators" management section.

## Basic Operation

1.  **Login:** Navigate to the login page. Enter the credentials (e.g., `superadmin` / `superadminpassword`).
2.  **Dashboard:** Upon successful login, you'll be redirected to the main dashboard (defaulting to the Users page).
3.  **Navigation:**
    *   **Users:** Manage general user accounts. Admins can enable/disable users and view their posts. SuperAdmins can also delete users.
    *   **Posts:** Manage all posts on the platform. Admins can edit or delete posts.
    *   **Administrators (SuperAdmin only):** Manage user roles, effectively promoting or demoting other users to/from Admin status. SuperAdmins can also enable/disable and delete any user from this section.
4.  **Modals:**
    *   Editing users or posts will open a modal window for changes.
    *   Viewing user posts will open a modal displaying their publications.
    *   Managing roles for a user (as SuperAdmin) will open a dedicated modal.
5.  **Logout:** Click the "Cerrar Sesión" (Logout) button in the navbar to end your session.

## Further Development

*   Implement user registration if admins need to create accounts directly.
*   Add more detailed error handling and user feedback.
*   Expand on post management features (e.g., comment moderation if applicable).
*   Introduce unit and integration tests.
