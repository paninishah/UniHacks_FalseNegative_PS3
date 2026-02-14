# FINAL MVP — Social Friendship Engagement Platform

## 1. Authentication & User Identity (Core)
**Features**
- Sign up / Login
- JWT-based authentication
- Profile:
    - `username` (unique)
    - `bio`
    - `avatar`
    - `account_visibility` (public/private)
    - Followers / Following system
    - Follow requests (if private account)
    - Suggested followers (mutuals + shared groups) (Analytics-lite ML)

**Required Models**
- User
- Follow
- FollowRequest

## 2. Public Feed — Structured Posting System (Core + Special)
**Features**
- Chronological feed (no algorithm)
- Post types:
    - Meme
    - Roast
    - Confession
    - Inside Joke
    - Casual
- Media support (image)
- Reactions:
    - GOAT
    - Clown
    - Red Flag
    - Iconic
- Comments
- Save to Memory Board
- **(Special) Headline Generator:** On story-type post, generate dramatic formatted headline. Template-based (no heavy AI required).

**Required Models**
- Post (`post_type` enum)
- PostMedia
- Reaction
- Comment
- SavedPost

## 3. Groups — Core Social Engine (Core)
**Features** (Messaging like WhatsApp/Insta)
- Create group
- Add/remove members
- Admin roles
- Group chat (text + image)
- Group settings:
    - `allow_relationship_graph` (boolean)
    - `allow_cupid` (boolean)

**Required Models**
- Group
- GroupMember
- Message

## 4. Daily Engagement Engine (Core)
Auto-generates per group: Poll, Roast challenge, “Most likely to”, or Quirky question.

**Features**
- Category rotation
- Cooldown per category
- Points for participation

**Required Models**
- PromptCategory
- GroupPromptHistory
- GroupPrompt
- PromptResponse

## 5. Game Session Framework (Core)
Generic reusable engine.
**Supports:**
- Timed games
- Voting games
- Anonymous games
- MVP includes 1 implemented game (e.g., Meme Battle or Guess Who).

**Includes:**
- Points
- Leaderboard
- Auto-close timer

**Required Models**
- GameType
- GameSession
- GameParticipant
- GameResponse
- GroupLeaderboardEntry

## 6. Digital Time Capsule Vault (Core + Special)
**Features**
- Create capsule: text, image
- Select `unlock_date`
- Visibility: private, group
- Immutable after locking
- Unlock notification
- **(Special) Capsule Suggestion:** If group message spike detected → suggest locking the day

**Required Models**
- TimeCapsule
- CapsuleMedia
- CapsuleAccess

## 7. Memory Board & Timeline (Core + Analytics)
**Memory Board**
- Save posts
- Add captions
- Sort by: date, popularity

**Timeline View**
- Filter by date
- “On this day” resurfacing
- Show unlocked capsules

**(Analytics) Memory Heatmap**
- Daily interaction aggregation
- Visual intensity by activity

**Required Models**
- MemoryCollection
- MemoryItem
- DailyInteractionSummary

## 8. Friendship Intelligence Dashboard (Analytics + Special)
Visible per group.

**A. Friendship Health Score (Analytics)**
- Based on: Messages per day, Average response time, Prompt participation, Game participation
- Output states: High Energy, Stable, Fading

**B. Friendship DNA (Analytics + Special)**
- Calculated using: Most used words, Roast frequency, Meme ratio, Most active member, Fastest responder
- Generates: Group alignment label, Top roaster, Primary tone, Most chaotic member

**Required Models**
- WordUsageStats
- GroupAnalyticsSnapshot

## 9. Smart Engagement System (Analytics)
**Triggers:**
- 48h inactivity → prompt
- Capsule unlock reminder

**(Analytics) Engagement Drop Detector**
- Moving average interaction tracking
- Auto-trigger special prompt day

**Required Models**
- ActivityLog
- Notification

## 10. Private Media Vault + Key Access (Core)
**Features**
- Upload private images
- Generate access key (token-based)
- Grant access to specific users
- Separate from follow system

**Required Models**
- PrivateVaultItem
- VaultAccessToken
- VaultPermission

## 11. Cupid — Group Matchmaking (Special)
Opt-in per group.
**Features**
- Member nominates 2 users
- Both receive private accept request
- If both accept → match revealed
- Match card visible in group
- No public rejection
- No compatibility AI in MVP.

**Required Models**
- CupidNomination
- CupidMatch
- CupidConsent

## 12. Relationship Graph Wall (Special)
Inside group only.
**Features**
- Each member defines: “I relate to ___ as ___”
- Graph auto-generated from: Source user, Target user, Relationship label
- Admin toggle available.

**Required Models**
- RelationshipEdge

## 13. Vanish Mode (Burn After Reading) (Special)
**Features**
- Message with `is_ephemeral` flag
- Auto-delete after 24h
- Timeline marker remains: “An event occurred”

**Required Models**
- EphemeralMessage
- EphemeralEventLog

## 14. Public Communities (PopVerse) (Core Extension)
Public discoverable groups based on interest.
**Features**
- Community creation
- Topic-based posting
- Join / Follow
- Public discussion
- No reputation system in MVP.

**Required Models**
- Community
- CommunityMember
- CommunityPost
- CommunityComment

## 15. Season Recap (Analytics + Special)
Year-end or custom date-range recap page.
**Shows:**
- Top 5 posts
- Most chaotic day
- Longest streak
- Top roaster
- Most active member
- Capsule moments
- Static summary view (no video generation).

**Required Models**
- Derived from analytics tables (no new core model required)
- Optional: RecapSnapshot

---

## Navigation Structure (Frontend Clarity)
**Tabs:**
- Feed
- Groups
- Communities
- Vault
- Analytics
- Notifications
- Profile

**Inside Group:**
- Chat
- Prompts
- Games
- Memory
- Cupid (if enabled)
- Graph
- Insights

## Final Product Identity
This MVP now includes:
- Structured social feed
- Gamified group engagement
- Intelligent analytics layer
- Time capsule emotional hook
- Controlled matchmaking
- Visual relationship graph
- Public interest communities
- Nostalgia recap

It is large but coherent. Nothing here is vague. Every feature maps to models.
