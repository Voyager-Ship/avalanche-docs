<!-- schema-erd:start -->
## Schema Changes

_Auto-generated 2026-05-14 — `feat/standardize-evaluate-hackathon` vs `ece1b723390c`_

> Legend: **black** = existing · <span style="color:#16a34a">**green**</span> = added · <span style="color:#ea580c">**orange**</span> = changed

```mermaid
flowchart LR
    classDef existing fill:#fff,stroke:#000,stroke-width:1.5px,color:#000
    classDef added    fill:#ecfdf5,stroke:#22c55e,stroke-width:2.5px,color:#000
    classDef changed  fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#000

    HackathonJudge["<b><font color='#16a34a'>HackathonJudge (NEW)</font></b><br/><font color='#16a34a'>id : String PK</font><br/><font color='#16a34a'>hackathon_id : String FK</font><br/><font color='#16a34a'>user_id : String FK</font><br/><font color='#16a34a'>assigned_by : String</font><br/><font color='#16a34a'>assigned_at : DateTime</font>"]:::added
    Evaluation["<b>Evaluation</b><br/>id : String PK<br/><font color='#ea580c'>form_data_id : String? FK  (was NOT NULL)</font><br/><font color='#16a34a'>project_id : String? FK  (NEW)</font><br/><font color='#16a34a'>hackathon_id : String?  (NEW)</font><br/>evaluator_id : String FK<br/><font color='#ea580c'>verdict : String?  (was NOT NULL)</font><br/>comment : String?<br/>score_overall : Float?<br/>scores : Json?<br/>created_at : DateTime<br/>updated_at : DateTime<br/>stage : Int"]:::changed
    Hackathon["<b>Hackathon</b><br/>id : String PK<br/>title : String<br/>description : String<br/>location : String<br/>total_prizes : Int<br/>tags : String[]<br/>content : Json<br/>end_date : DateTime<br/>start_date : DateTime<br/>timezone : String<br/>banner : String<br/>icon : String<br/>small_banner : String<br/>participants : Int<br/>organizers : String?<br/>top_most : Boolean?<br/>custom_link : String?<br/>created_by : String? FK<br/>is_public : Boolean?<br/>updated_by : String? FK<br/>event : String?<br/>cohosts : String[]<br/>new_layout : Boolean?<br/>google_calendar_id : String?"]:::existing
    User["<b>User</b><br/>id : String PK<br/>name : String?<br/>email : String<br/>image : String?<br/>authentication_mode : String?<br/>integration : String?<br/>last_login : DateTime?<br/>user_name : String?<br/>bio : String?<br/>notification_email : String?<br/>telegram_account : String?<br/>github_account : String?<br/>x_account : String?<br/>linkedin_account : String?<br/>additional_social_accounts : String[]<br/>notifications : Boolean?<br/>profile_privacy : String?<br/>custom_attributes : String[]<br/>team_id : String?<br/>created_at : DateTime<br/>country : String?<br/>noun_avatar_enabled : Boolean<br/>noun_avatar_seed : Json?<br/>skills : String[]<br/>user_type : Json?<br/>wallet : String[]<br/>notification_means : Json?<br/>github_access_token : String?"]:::existing
    FormData["<b>FormData</b><br/>id : String PK<br/>form_data : Json<br/>timestamp : DateTime<br/>origin : String<br/>project_id : String FK<br/>final_verdict : String?<br/>current_stage : Int"]:::existing
    Project["<b>Project</b><br/>id : String PK<br/>hackaton_id : String? FK<br/>project_name : String<br/>short_description : String<br/>full_description : String?<br/>tech_stack : String?<br/>github_repository : String?<br/>demo_link : String?<br/>logo_url : String?<br/>cover_url : String?<br/>demo_video_link : String?<br/>screenshots : String[]<br/>tracks : String[]<br/>created_at : DateTime<br/>updated_at : DateTime<br/>explanation : String?<br/>is_preexisting_idea : Boolean<br/>small_cover_url : String?<br/>tags : String[]<br/>is_winner : Boolean?<br/>categories : String[]<br/>origin : String<br/>other_category : String?<br/>deployed_addresses : Json[]<br/>website : Json?<br/>socials : Json?"]:::existing

    Hackathon ==>|"NEW hackathon_id"| HackathonJudge
    User ==>|"NEW user_id"| HackathonJudge
    FormData -->|"form_data_id"| Evaluation
    Project ==>|"NEW project_id"| Evaluation
    User -->|"evaluator_id"| Evaluation
    User -->|"created_by"| Hackathon
    User -->|"updated_by"| Hackathon
    Project -->|"project_id"| FormData
    Hackathon -->|"hackaton_id"| Project
    linkStyle 0 stroke:#22c55e,stroke-width:2.5px
    linkStyle 1 stroke:#22c55e,stroke-width:2.5px
    linkStyle 3 stroke:#22c55e,stroke-width:2.5px
```

### Summary

- ✚ **Added tables**: `HackathonJudge`
- ⚠️ **Changed tables**: `Evaluation`

#### `Evaluation` — field deltas

| Field | Before | After | Change |
|---|---|---|---|
| `project_id` | — | `project_id    String?` | ✚ added |
| `hackathon_id` | — | `hackathon_id  String?` | ✚ added |
| `form_data_id` | `form_data_id  String` | `form_data_id  String?` | ⚠️ (was NOT NULL) |
| `verdict` | `verdict       String` | `verdict       String?` | ⚠️ (was NOT NULL) |

#### `HackathonJudge` — new table

| Field | Definition |
|---|---|
| `id` | `id            String    @id @default(uuid())` |
| `hackathon_id` | `hackathon_id  String` |
| `user_id` | `user_id       String` |
| `assigned_by` | `assigned_by   String` |
| `assigned_at` | `assigned_at   DateTime  @default(now()) @db.Timestamptz(3)` |

<!-- schema-erd:end -->
