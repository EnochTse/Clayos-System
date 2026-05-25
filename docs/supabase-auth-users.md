# Supabase Auth Users

The app uses Supabase email + password login.

## Create the First Owner User

In Supabase:

1. Go to `Authentication` -> `Users`.
2. Click `Add user` -> `Create new user`.
3. Enter the owner email and password.
4. Enable email auto-confirm if the option is shown.
5. Save the user.

The first user who logs in after `0002_auth_profile_bootstrap.sql` has been run will be assigned the `owner` role. Later users default to `staff`.

Do not commit real passwords to the repository.
