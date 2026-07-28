# REWARDS API

Base URL

/api/rewards

Impact Points are an off-chain loyalty perk (Decision 022). They are never money and never leave the platform. Points are awarded automatically by the backend when a donation succeeds; there is no endpoint to grant or spend them.

---

# Rewards Overview

GET /

Authentication Required (any role)

Returns the signed-in user's Impact Points state.

Response

```
{
  "pointsLabel": "Impact Points",
  "balance": 210,
  "tier": { "name": "Bronze", "min": 0 },
  "nextTier": { "name": "Silver", "pointsNeeded": 290 },
  "tiers": [
    { "name": "Bronze", "min": 0 },
    { "name": "Silver", "min": 500 },
    { "name": "Gold", "min": 2000 },
    { "name": "Platinum", "min": 5000 }
  ],
  "rules": { "basePer1000": 1, "minPerDonation": 1, "firstDonation": 100, "newCampaign": 50 },
  "events": [
    { "id": 1, "type": "donation", "points": 5, "description": "Donation made", "donationId": 16, "createdAt": "..." }
  ]
}
```

---

# Earning Rules

Points are awarded once per successful donation, inside the payment flow, fire-and-forget (a rewards failure never affects the donation). Awarding is idempotent: a duplicate payment callback never double-awards.

| Event | Points | When |
| --- | --- | --- |
| donation | 1 per 1,000 TZS (minimum 1) | Every successful donation |
| first_donation | 100 | A donor's first ever donation |
| new_campaign | 50 | Each time a donor supports a campaign they had not backed before |

Balance and tier are always derived from the append-only ledger (`reward_events`); they are never stored, so the history and the balance can never drift apart.

---

# Tiers

A balance sits in the highest tier it clears.

| Tier | Minimum points |
| --- | --- |
| Bronze | 0 |
| Silver | 500 |
| Gold | 2,000 |
| Platinum | 5,000 |
