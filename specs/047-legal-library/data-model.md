# Data Model: 047-legal-library

All entities are frontend-only TypeScript types. No database persistence.

## Inheritance Calculator Entities

### EstateInput

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `totalValue` | `number` | Total estate value in EGP | > 0 |
| `debts` | `number` | Outstanding debts to deduct | >= 0, default 0 |
| `bequests` | `number` | Wasiyyah (will) amount — max 1/3 of net estate | >= 0, default 0 |

### HeirInput

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `type` | `HeirType` | Category of heir (enum) | Required |
| `count` | `number` | Number of individuals of this type | >= 1, integer |
| `gender` | `'male' \| 'female'` | Gender of heir | Required |

### HeirType (enum)

| Value | Arabic Label | Notes |
|-------|-------------|-------|
| `HUSBAND` | زوج | Max count: 1 |
| `WIFE` | زوجة | Max count: 4 |
| `SON` | ابن | No max |
| `DAUGHTER` | بنت | No max |
| `SON_OF_SON` | ابن ابن | No max |
| `DAUGHTER_OF_SON` | بنت ابن | No max |
| `FATHER` | أب | Max count: 1 |
| `MOTHER` | أم | Max count: 1 |
| `GRANDFATHER_PATERNAL` | جد لأب | Max count: 1, only if no father |
| `GRANDMOTHER_PATERNAL` | جدة لأب | Max count: 1 |
| `GRANDMOTHER_MATERNAL` | جدة لأم | Max count: 1 |
| `FULL_BROTHER` | أخ شقيق | No max |
| `FULL_SISTER` | أخت شقيقة | No max |
| `PATERNAL_HALF_BROTHER` | أخ لأب | No max |
| `PATERNAL_HALF_SISTER` | أخت لأب | No max |
| `MATERNAL_HALF_BROTHER` | أخ لأم | No max |
| `MATERNAL_HALF_SISTER` | أخت لأم | No max |
| `UNCLE_PATERNAL` | عم | No max |
| `NEPHEW_PATERNAL` | ابن أخ | No max |

### InheritanceResult

| Field | Type | Description |
|-------|------|-------------|
| `shares` | `HeirShare[]` | Array of individual share results |
| `totalDistributed` | `number` | Total amount distributed (should equal net estate) |
| `remainingEstate` | `number` | Any unclaimed remainder (should be 0 if radd applied) |
| `isOversubscribed` | `boolean` | Whether fixed shares exceed 1 (awl applies) |
| `awlRate` | `number \| null` | Reduction rate if oversubscribed |
| `warnings` | `string[]` | Warnings about unusual cases |

### HeirShare

| Field | Type | Description |
|-------|------|-------------|
| `heirType` | `HeirType` | Heir category |
| `count` | `number` | Number of individuals |
| `shareType` | `'fard' \| 'ta'sib' \| 'radd'` | How share is determined |
| `fraction` | `string` | Quranic fraction (e.g., "1/2", "1/6") — null for ta'sib |
| `totalAmount` | `number` | Total amount for this heir group in EGP |
| `perPersonAmount` | `number` | Amount per individual in EGP |
| `percentage` | `number` | Percentage of net estate |
| `legalBasis` | `string` | Arabic legal basis citation |

## Court Fees Calculator Entities

### CourtFeesInput

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `caseType` | `CaseType` | Category of lawsuit | Required |
| `claimValue` | `number` | Value of the claimed right in EGP | > 0 (for monetary cases) |
| `isAppeal` | `boolean` | Whether this is an appeal | Default: false |
| `isCassation` | `boolean` | Whether this is cassation (نقض) | Default: false |

### CaseType (enum)

| Value | Arabic Label | Fee Category |
|-------|-------------|--------------|
| `MONETARY_CLAIM` | مطالبة مالية | Progressive brackets |
| `REAL_ESTATE_DISPUTE` | منازعة عقارية | Progressive brackets |
| `PERSONAL_STATUS` | أحوال شخصية | Fixed or exempt |
| `LABOR` | دعوى عمالية | Exempt |
| `COMMERCIAL` | دعوى تجارية | Progressive brackets |
| `ADMINISTRATIVE` | دعوى إدارية | Fixed |
| `CRIMINAL_PRIVATE` | دعوى جنائية (حق خاص) | Fixed |
| `EXECUTION` | تنفيذ حكم | Percentage of executed amount |
| `INJUNCTION` | دعوى مستعجلة | Fixed |

### CourtFeesResult

| Field | Type | Description |
|-------|------|-------------|
| `fees` | `FeeDetail[]` | Itemized fee breakdown |
| `totalFees` | `number` | Grand total in EGP |
| `isExempt` | `boolean` | Whether case type is exempt |
| `exemptionReason` | `string \| null` | Legal basis for exemption if applicable |
| `warnings` | `string[]` | Caveats about the estimate |

### FeeDetail

| Field | Type | Description |
|-------|------|-------------|
| `feeType` | `string` | Fee category name in Arabic |
| `amount` | `number` | Amount in EGP |
| `legalBasis` | `string` | Legal citation |

## Legal Library Landing Page Entities

### LibraryTool

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique tool identifier |
| `title` | `string` | Arabic title |
| `description` | `string` | Short Arabic description |
| `icon` | `React.ReactNode` | Icon component |
| `route` | `string` | Route path |
| `isAvailable` | `boolean` | Whether tool is live |

### Static Library Tools

| id | title | route |
|----|-------|-------|
| `inheritance` | حاسبة المواريث | `/legal-library/inheritance` |
| `court-fees` | حاسبة الرسوم القضائية | `/legal-library/court-fees` |
