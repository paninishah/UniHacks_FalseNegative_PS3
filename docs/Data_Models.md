# Backend-Frontend Handshake: Data Models

## 🧱 CORE AUTH & USER SYSTEM

### 🟦 users (Django Auth Extended)
**Attributes:**
- `user_id` (PK)
- `username` (unique, required)
- `email` (unique, required)
- `password_hash`
- `dob`
- `created_at`
- `last_login`

**Login must accept:**
- identifier (username OR email)
- password

### 🟦 profiles
**Attributes:**
- `profile_id` (PK)
- `user_id` (FK → users, unique)
- `name` (required)
- `bio`
- `pfp_url`
- `is_private` (boolean)
- `onboarding_completed` (boolean)
- `created_at`

**Relationship:**
- users 1 —— 1 profiles

### 🟦 followers
**Attributes:**
- `id` (PK)
- `follower_id` (FK → users)
- `following_id` (FK → users)
- `created_at`

**Unique constraint:**
- (follower_id, following_id)
- Self-referencing M:M relationship.

---

## 📰 NEWSROOM SYSTEM

### 🟦 posts
**Attributes:**
- `post_id` (PK)
- `user_id` (FK → users)
- `group_id` (FK → groups, nullable)
- `type` (enum: text, image)
- `category` (enum: meme, confession, roast, joke, news_bite)
- `text_content` (nullable)
- `image_url` (nullable)
- `caption` (nullable)
- `headline_generated` (text, nullable)
- `vanish_mode` (boolean, default false)
- `visibility` (enum: public, private, group)
- `created_at`
- `updated_at`

**Rules:**
- If `vanish_mode` = true → scheduled deletion after 24h
- visibility enforced by backend

**Relationships:**
- users 1 —— M posts
- groups 1 —— M posts

### 🟦 post_reactions
- `reaction_id` (PK)
- `post_id` (FK → posts)
- `user_id` (FK → users)
- `reaction_type` (GOAT, clown, red_flag, iconic)
- `created_at`

**Unique constraint:**
- (post_id, user_id)

### 🟦 comments
- `comment_id` (PK)
- `post_id` (FK → posts)
- `user_id` (FK → users)
- `text`
- `created_at`

---

## 👥 GROUP SYSTEM

### 🟦 groups
- `group_id` (PK)
- `name`
- `admin_id` (FK → users)
- `is_public` (boolean)
- `allow_cupid` (boolean)
- `allow_relationship_graph` (boolean)
- `created_at`

### 🟦 group_members
- `id` (PK)
- `group_id` (FK → groups)
- `user_id` (FK → users)
- `role` (admin/member)
- `joined_at`

**Unique constraint:**
- (group_id, user_id)

**Supports:**
- Add member
- Remove member
- Role update

---

## 🧠 GROUP ANALYTICS

### 🟦 group_activity_log
- `activity_id` (PK)
- `group_id` (FK → groups)
- `user_id` (FK → users)
- `activity_type` (post/comment/game/message)
- `created_at`

**Used for:**
- 48h inactivity detection
- Moving average interaction tracking

### 🟦 friendship_dna
- `dna_id` (PK)
- `group_id` (FK → groups)
- `user_id` (FK → users)
- `top_label`
- `roast_frequency`
- `most_used_word`
- `interaction_score`
- `updated_at`

Computed periodically.

### 🟦 memory_heatmap
- `heatmap_id` (PK)
- `group_id` (FK → groups)
- `date`
- `interaction_count`
- `sentiment_score`
- `created_at`

One row per group per day.

---

## 🎮 GAME SYSTEM

### 🟦 game_sessions
- `game_id` (PK)
- `group_id` (FK → groups)
- `game_type` (most_likely_to, skribbl, cupid)
- `status` (active/completed)
- `started_at`
- `ended_at`

### 🟦 game_participants
- `id` (PK)
- `game_id` (FK → game_sessions)
- `user_id` (FK → users)
- `score`

### 🟦 game_responses
- `response_id` (PK)
- `game_id` (FK → game_sessions)
- `user_id` (FK → users)
- `response_text`
- `created_at`

---

## 💘 CUPID SYSTEM

### 🟦 cupid_nominations
- `nomination_id` (PK)
- `group_id` (FK → groups)
- `user_a` (FK → users)
- `user_b` (FK → users)
- `nominated_by` (FK → users)
- `created_at`

### 🟦 cupid_consents
- `consent_id` (PK)
- `nomination_id` (FK → cupid_nominations)
- `user_id` (FK → users)
- `accepted` (boolean)
- `responded_at`

### 🟦 cupid_matches
- `match_id` (PK)
- `group_id` (FK → groups)
- `user_a` (FK → users)
- `user_b` (FK → users)
- `matched_at`

---

## 🧩 RELATIONSHIP GRAPH WALL

### 🟦 relationship_edges
- `edge_id` (PK)
- `group_id` (FK → groups)
- `source_user_id` (FK → users)
- `target_user_id` (FK → users)
- `relationship_label` (text)
- `created_at`

**Unique constraint:**
- (group_id, source_user_id, target_user_id)

### 🟦 wall_roles
- `role_id` (PK)
- `group_id` (FK → groups)
- `user_id` (FK → users)
- `role_name`
- `assigned_at`

---

## 🔐 VAULT SYSTEM

### 🟦 vaults
- `vault_id` (PK)
- `owner_id` (FK → users)
- `group_id` (FK → groups, nullable)
- `visibility` (private/public)
- `created_at`

### 🟦 vault_items
- `item_id` (PK)
- `vault_id` (FK → vaults)
- `post_id` (FK → posts, nullable)
- `image_url`
- `text_content`
- `unlock_date`
- `is_unlocked` (boolean)
- `created_at`

### 🟦 vault_keys
- `key_id` (PK)
- `vault_id` (FK → vaults)
- `user_id` (FK → users)
- `granted_at`

**Unique constraint:**
- (vault_id, user_id)

**Access logic:**
- Private vault → owner + key holders
- Public vault → everyone

---

## 🎯 PROMPT SYSTEM

### 🟦 prompts
- `prompt_id` (PK)
- `type` (random_question, initiate_conversation, roast_prompt)
- `text`
- `created_at`

### 🟦 group_prompt_history
- `id` (PK)
- `group_id` (FK → groups)
- `prompt_id` (FK → prompts)
- `delivered_at`

**Used for:**
- Avoid repetition
- Category cooldown

---

## 🤖 AI CHATBOT

### 🟦 chatbot_logs
- `chat_id` (PK)
- `user_id` (FK → users)
- `group_id` (FK → groups, nullable)
- `message`
- `response`
- `created_at`

Independent from engagement system.

---

## 📊 SEASON RECAP

### 🟦 season_recap
- `recap_id` (PK)
- `group_id` (FK → groups)
- `start_date`
- `end_date`
- `most_active_user` (FK → users)
- `most_roasted_user` (FK → users)
- `total_posts`
- `total_games`
- `generated_at`

---

## 🔁 RELATIONSHIP SUMMARY (FINAL)

**users**
- ↳ 1-1 profiles
- ↳ M-M users (followers)
- ↳ 1-M posts
- ↳ M-M groups
- ↳ M-M vaults

**groups**
- ↳ 1-M posts
- ↳ 1-M game_sessions
- ↳ 1-M group_activity_log
- ↳ 1-M friendship_dna
- ↳ 1-M memory_heatmap
- ↳ 1-M relationship_edges

**posts**
- ↳ 1-M reactions
- ↳ 1-M comments

**vaults**
- ↳ 1-M vault_items
- ↳ M-M users via vault_keys
