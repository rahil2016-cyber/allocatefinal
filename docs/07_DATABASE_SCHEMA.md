# JobAllocate MySQL Database Schema & Relationships

> **Database Engine:** MySQL 8.0 (InnoDB)
> **Backend ORM:** Laravel Eloquent Models (`backend/app/Models/`)

---

## 1. Relational Schema Map

```text
┌────────────────┐          ┌───────────────────────────┐
│     users      │1       1 │   job_seeker_profiles     │
│  (id, phone,   ├──────────┤ (user_id, headline,       │
│  email, role)  │          │  expected_salary, resume) │
└───────┬────────┘          └───────────────────────────┘
        │1
        │
        │1
┌───────┴────────┐          ┌───────────────────────────┐
│   companies    │1        N│        job_posts          │
│ (user_id, gst, ├──────────┤ (company_id, title,       │
│ company_name)  │          │  salary_min, salary_max)  │
└────────────────┘          └─────────────┬─────────────┘
                                          │1
                                          │
                                          │N
                            ┌─────────────┴─────────────┐
                            │       applications        │
                            │ (job_post_id, user_id,    │
                            │  status, cover_letter)    │
                            └───────────────────────────┘
```

---

## 2. Table Schemas

### `users`
- `id` (BIGINT UNSIGNED, Primary Key, Auto Increment)
- `phone` (VARCHAR 20, Unique, Nullable)
- `email` (VARCHAR 191, Unique)
- `password` (VARCHAR 255)
- `role` (ENUM: `'job_seeker'`, `'company'`, `'super_admin'`)
- `is_verified` (BOOLEAN, Default: `false`)
- `created_at`, `updated_at` (TIMESTAMP)

### `job_seeker_profiles`
- `id` (BIGINT UNSIGNED, Primary Key)
- `user_id` (BIGINT UNSIGNED, Foreign Key -> `users.id`)
- `first_name`, `last_name` (VARCHAR 100)
- `date_of_birth` (DATE)
- `gender` (VARCHAR 20)
- `location` (VARCHAR 191)
- `headline` (VARCHAR 191)
- `experience_years` (INT)
- `expected_salary` (DECIMAL 12,2) — stored in **₹ / INR**
- `current_salary` (DECIMAL 12,2) — stored in **₹ / INR**
- `resume_path` (VARCHAR 255)

### `companies`
- `id` (BIGINT UNSIGNED, Primary Key)
- `user_id` (BIGINT UNSIGNED, Foreign Key -> `users.id`)
- `company_name` (VARCHAR 191)
- `gst_number` (VARCHAR 50)
- `is_kyc_verified` (BOOLEAN, Default: `false`)

### `job_posts`
- `id` (BIGINT UNSIGNED, Primary Key)
- `company_id` (BIGINT UNSIGNED, Foreign Key -> `companies.id`)
- `title` (VARCHAR 191)
- `employment_type` (VARCHAR 50)
- `salary_min`, `salary_max` (DECIMAL 12,2) — stored in **₹ / INR**
- `salary_period` (VARCHAR 20, Default: `'year'`)
- `status` (ENUM: `'draft'`, `'pending_review'`, `'published'`, `'closed'`)
- `is_urgent` (BOOLEAN, Default: `false`)

### `applications`
- `id` (BIGINT UNSIGNED, Primary Key)
- `job_post_id` (BIGINT UNSIGNED, Foreign Key -> `job_posts.id`)
- `user_id` (BIGINT UNSIGNED, Foreign Key -> `users.id`)
- `status` (ENUM: `'applied'`, `'shortlisted'`, `'interview'`, `'rejected'`, `'hired'`)
- `cover_letter` (TEXT)
- `employer_note` (TEXT)
