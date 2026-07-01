# SN58 Validator Dashboard — Technical Assessment

Start the project with `npm run dev`, open the login page, and send your **candidate key** to the interviewer so you can be added to the shortlist. The key is unique to your local copy of this project.

You are working on a local SN58-inspired validator management dashboard.

The existing application provides authentication, validator data, miner data, REST APIs, and a React dashboard.

Your task is to extend the application.

Complete the following:

### Task 1 — Miner Performance

Add a new endpoint:

`GET /api/miners/:id/performance`

Return historical performance information for the selected miner.

Display this information on the miner details page.

### Task 2 — Advanced Miner Filtering

Add filtering by:

- Minimum score
- Maximum score
- Minimum emissions
- Maximum emissions
- Status

Filters must be implemented server-side.

### Task 3 — Validator Weight Management

Add the ability for an authenticated user to update a miner's simulated validator weight.

Create:

`PATCH /api/miners/:id/weight`

Requirements:

- Weight must be between 0 and 1.
- Only authenticated users can modify it.
- Validate input on the backend.
- Store the value in MongoDB.
- Update the frontend without requiring a full page reload.

### Task 4 — Activity Logging

Whenever a miner is:

- Created
- Updated
- Deleted
- Weight changed

create an Activity record.

Display recent activity on the dashboard.

### Task 5 — Testing

Add tests covering your new functionality.

At minimum:

- 3 backend tests
- 2 frontend tests

### Task 6 — Documentation

Update README.md with:

- Your implementation approach
- API changes
- Database changes
- Testing approach
- Any tradeoffs you made
