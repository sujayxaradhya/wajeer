# Database Tables and Fields

## 1. `user_business`

Represents the relationship between a user and a business.

| Field       | Type     |
| ----------- | -------- |
| business_id | business |
| invited_at  | datetime |
| joined_at   | datetime |
| location_id | location |
| reliability | float    |
| role        | string   |
| trust_score | float    |
| user_id     | user     |

---

# 2. `location`

Represents business locations.

| Field       | Type     |
| ----------- | -------- |
| address     | string   |
| business_id | business |
| created_at  | datetime |
| location_id | location |
| name        | string   |

---

# 3. `business`

Stores business entities.

| Field      | Type     |
| ---------- | -------- |
| created_at | datetime |
| name       | string   |
| owner_id   | user     |

---

# 4. `user`

Main user table.

| Field          | Type     |
| -------------- | -------- |
| created_at     | datetime |
| email          | string   |
| email_verified | boolean  |
| image          | string   |
| name           | string   |
| password_hash  | string   |
| roles          | string[] |
| trust_score    | float    |
| updated_at     | datetime |

---

# 5. `notification`

Stores notifications for users.

| Field      | Type     |
| ---------- | -------- |
| body       | string   |
| created_at | datetime |
| data       | json     |
| read       | boolean  |
| title      | string   |
| type       | string   |
| user_id    | user     |

---

# 6. `shift`

Represents job shifts posted by businesses.

| Field       | Type     |
| ----------- | -------- |
| created_at  | datetime |
| date        | datetime |
| end_time    | string   |
| hourly_rate | float    |
| location_id | location |
| notes       | string   |
| posted_by   | user     |
| role        | string   |
| start_time  | string   |
| status      | string   |
| title       | string   |
| updated_at  | datetime |

---

# 7. `claim`

Tracks workers claiming shifts.

| Field        | Type     |
| ------------ | -------- |
| claimed_at   | datetime |
| responded_at | datetime |
| shift_id     | shift    |
| status       | string   |
| worker_id    | user     |

---

# 8. `verification`

Used for verification tokens (email, etc).

| Field      | Type     |
| ---------- | -------- |
| created_at | datetime |
| expires_at | datetime |
| identifier | string   |
| updated_at | datetime |
| value      | string   |

---

# 9. `session`

Tracks user sessions.

| Field      | Type     |
| ---------- | -------- |
| created_at | datetime |
| expires_at | datetime |
| ip_address | string   |
| token      | string   |
| updated_at | datetime |
| user_agent | string   |
| user_id    | string   |

---

# 10. `account`

OAuth / authentication provider accounts.

| Field         | Type     |
| ------------- | -------- | ---- |
| account_token | string   | null |
| account_id    | string   |
| created_at    | datetime |
| id_token      | string   | null |
| password      | string   | null |
| provider      | string   |
| refresh_token | string   | null |
| scope         | string   | null |
| updated_at    | datetime |
| user_id       | string   |

---

✅ **Total Tables:** 10

```
user_business
location
business
user
notification
shift
claim
verification
session
account
```
