# Database Schema Documentation

This document provides an overview of all database tables in the dance platform, which enables dancers to manage their portfolios and clients to send collaboration requests.

## Table of Contents
- [User Management](#user-management)
- [Client Management](#client-management)
- [Artist Management](#artist-management)
- [Portfolio & Career](#portfolio--career)
- [Collaboration Requests](#collaboration-requests)

---

## User Management

### `user`
**Description:** General users/members (일반 사용자/회원)

**Primary Key:** `user_id`

**Columns:**
- `user_id` (varchar) - Unique user identifier
- `name` (varchar) - User's name
- `email` (text, unique) - User's email address
- `phone` (text, unique) - User's phone number

**RLS Enabled:** Yes

---

## Client Management

### `client_company`
**Description:** Client companies that hire dancers for projects (클라이언트 회사)

**Primary Key:** `company_id`

**Columns:**
- `company_id` (varchar) - Unique company identifier
- `company_name` (varchar) - Name of the company

**RLS Enabled:** Yes

**Related Tables:**
- Referenced by `client_user` for company association

---

### `client_user`
**Description:** Project managers/contacts from client companies (프로젝트 담당자 정보)

**Primary Key:** `client_id`

**Columns:**
- `client_id` (varchar) - Unique client identifier
- `name` (varchar) - Client contact's name
- `email` (text, unique) - Client contact's email
- `phone` (text, unique) - Client contact's phone number
- `company_id` (varchar) - Foreign key to `client_company`

**RLS Enabled:** Yes

**Relationships:**
- Belongs to `client_company` via `company_id`
- Creates `proposal` entries

---

## Artist Management

### `artist_user`
**Description:** Dancer/artist user accounts

**Primary Key:** `artist_id`

**Columns:**
- `artist_id` (varchar) - Unique artist identifier
- `name` (varchar) - Artist's name
- `email` (text, unique) - Artist's email address
- `phone` (text, unique) - Artist's phone number
- `birth` (date, nullable) - Artist's birth date

**RLS Enabled:** Yes

**Relationships:**
- Has one `artist_portfolio`
- Has many `workshop` entries
- Has many `dancer_award` entries
- Has many `dancer_performance` entries
- Has many `dancer_choreo` entries
- Has many `dancer_media` entries
- Has many `dancer_directing` entries
- Belongs to many `artist_team` entries
- Can be `leader_id` or `subleader_id` in `team_portfolio`
- Receives `proposal` entries

---

### `artist_team`
**Description:** Junction table linking artists to teams

**Primary Keys:** `artist_id`, `team_id`

**Columns:**
- `artist_id` (varchar) - Foreign key to `artist_user`
- `team_id` (varchar) - Foreign key to `team_portfolio`

**RLS Enabled:** Yes

**Relationships:**
- Links `artist_user` to `team_portfolio`

---

### `team_portfolio`
**Description:** Dance team/crew information and portfolios

**Primary Key:** `team_id`

**Columns:**
- `team_id` (varchar) - Unique team identifier
- `team_name` (varchar) - Name of the dance team
- `team_introduction` (text) - Team description/introduction
- `leader_id` (varchar) - Foreign key to `artist_user` (team leader)
- `subleader_id` (varchar) - Foreign key to `artist_user` (team sub-leader)

**RLS Enabled:** Yes

**Relationships:**
- Has many `artist_team` members
- Has one leader and one sub-leader from `artist_user`

---

## Portfolio & Career

### `artist_portfolio`
**Description:** Artist's main portfolio and profile information

**Primary Key:** `artist_id`

**Columns:**
- `artist_id` (varchar) - Foreign key to `artist_user`
- `artist_name` (varchar) - Artist's display name (Korean)
- `artist_name_eng` (varchar) - Artist's display name (English)
- `introduction` (text, nullable) - Artist's bio/introduction
- `photo` (text, nullable) - Profile photo URL
- `instagram` (text, nullable) - Instagram handle/URL
- `twitter` (text, nullable) - Twitter handle/URL
- `youtube` (text, nullable) - YouTube channel URL

**RLS Enabled:** Yes

**Relationships:**
- One-to-one with `artist_user`

---

### `workshop`
**Description:** Workshop/class teaching experience

**Primary Keys:** `artist_id`, `class_name`

**Columns:**
- `artist_id` (varchar) - Foreign key to `artist_user`
- `class_name` (varchar) - Name of the workshop/class
- `class_role` (array, nullable) - Roles in the class (e.g., instructor, assistant)
- `class_date` (date) - Date of the workshop
- `country` (varchar) - Country where workshop was held

**RLS Enabled:** Yes

**Relationships:**
- Belongs to `artist_user`

---

### `dancer_award`
**Description:** Awards and recognitions received by dancers

**Primary Keys:** `artist_id`, `issuing_org`

**Columns:**
- `artist_id` (varchar) - Foreign key to `artist_user`
- `issuing_org` (varchar) - Organization that issued the award
- `award_title` (varchar) - Title/name of the award (default: '참가')
- `received_date` (date) - Date award was received

**RLS Enabled:** Yes

**Relationships:**
- Belongs to `artist_user`

---

### `performance`
**Description:** Performance/show information

**Primary Key:** `performance_id`

**Columns:**
- `performance_id` (varchar) - Unique performance identifier
- `performance_title` (varchar) - Title of the performance
- `date` (date) - Performance date
- `category` (varchar, nullable) - Performance category (default: '참가')

**RLS Enabled:** Yes

**Relationships:**
- Has many `dancer_performance` entries

---

### `dancer_performance`
**Description:** Junction table linking dancers to performances

**Primary Keys:** `performance_id`, `artist_id`

**Columns:**
- `performance_id` (varchar) - Foreign key to `performance`
- `artist_id` (varchar) - Foreign key to `artist_user`

**RLS Enabled:** Yes

**Relationships:**
- Links `artist_user` to `performance`

---

### `song`
**Description:** Song/music information for choreography

**Primary Key:** `song_id`

**Columns:**
- `song_id` (varchar) - Unique song identifier
- `title` (varchar) - Song title
- `singer` (varchar) - Artist/singer name
- `date` (date) - Release/performance date
- `youtube_link` (text) - YouTube link to the song

**RLS Enabled:** Yes

**Relationships:**
- Has many `dancer_choreo` entries

---

### `dancer_choreo`
**Description:** Choreography work by dancers

**Primary Keys:** `song_id`, `artist_id`

**Columns:**
- `song_id` (varchar) - Foreign key to `song`
- `artist_id` (varchar) - Foreign key to `artist_user`
- `role` (array) - Roles in the choreography (e.g., choreographer, dancer)
- `display_order` (smallint, nullable) - Order for displaying in portfolio
- `is_highlight` (boolean) - Whether this is a highlighted work
- `highlight_display_order` (smallint) - Order for displaying in highlights

**RLS Enabled:** Yes

**Relationships:**
- Links `artist_user` to `song` for choreography credits

---

### `directing`
**Description:** Directing/creative direction projects

**Primary Key:** `directing_id`

**Columns:**
- `directing_id` (varchar) - Unique directing project identifier
- `title` (text) - Project title
- `date` (date) - Project date

**RLS Enabled:** Yes

**Relationships:**
- Has many `dancer_directing` entries

---

### `dancer_directing`
**Description:** Junction table linking dancers to directing projects

**Primary Keys:** `directing_id`, `artist_id`

**Columns:**
- `directing_id` (varchar) - Foreign key to `directing`
- `artist_id` (varchar) - Foreign key to `artist_user`

**RLS Enabled:** Yes

**Relationships:**
- Links `artist_user` to `directing` projects

---

### `dancer_media`
**Description:** Media content (videos, performances) for dancer portfolios

**Primary Keys:** `artist_id`, `youtube_link`

**Columns:**
- `artist_id` (varchar) - Foreign key to `artist_user`
- `youtube_link` (text) - YouTube video URL
- `category` (array) - Categories/tags for the media
- `display_order` (smallint) - Order for displaying in portfolio
- `is_highlight` (boolean) - Whether this is a highlighted media
- `highlight_display_order` (smallint, nullable) - Order for displaying in highlights

**RLS Enabled:** Yes

**Relationships:**
- Belongs to `artist_user`

---

## Collaboration Requests

### `proposal`
**Description:** Collaboration/project proposals sent by clients to dancers (제안하기)

**Primary Key:** `proposal_id`

**Columns:**
- `proposal_id` (bigint, identity) - Auto-incrementing proposal identifier
- `client_id` (varchar, nullable) - Foreign key to `client_user`
- `artist_id` (varchar) - Foreign key to `artist_user`
- `company_category` (varchar) - Category of the client company
- `company_name` (varchar) - Name of the client company
- `client_name` (varchar) - Name of the client contact
- `client_email` (text) - Client contact's email
- `client_phone` (text) - Client contact's phone
- `project_title` (varchar) - Title of the proposed project
- `project_category` (varchar) - Category of the project
- `project_description` (text) - Detailed project description
- `min_price` (double precision) - Minimum budget
- `max_price` (double precision) - Maximum budget
- `start_date` (date) - Project start date
- `end_date` (date) - Project end date
- `location` (text) - Project location
- `memo` (text, nullable) - Additional notes

**RLS Enabled:** Yes

**Relationships:**
- Belongs to `client_user` (sender)
- Belongs to `artist_user` (recipient)

---

## Notes

- All tables have Row Level Security (RLS) enabled for data protection
- Array columns (e.g., `role`, `category`) allow multiple values to be stored
- The platform supports both individual artists and dance teams
- Portfolios are organized with display orders and highlights for better presentation
- Proposals can be sent by clients to artists with detailed project information and budget ranges
