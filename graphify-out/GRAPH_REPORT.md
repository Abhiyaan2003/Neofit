# Graph Report - .  (2026-05-15)

## Corpus Check
- Corpus is ~47,196 words - fits in a single context window. You may not need a graph.

## Summary
- 441 nodes · 940 edges · 20 communities (12 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.9)
- Token cost: 50,000 input · 10,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Mobile App Infrastructure|Mobile App Infrastructure]]
- [[_COMMUNITY_Onboarding & Configuration|Onboarding & Configuration]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_Web Application Core|Web Application Core]]
- [[_COMMUNITY_Workout Logic Engines|Workout Logic Engines]]
- [[_COMMUNITY_Workout State & Progression|Workout State & Progression]]
- [[_COMMUNITY_Training Programs|Training Programs]]
- [[_COMMUNITY_Performance Auditing|Performance Auditing]]
- [[_COMMUNITY_Landing Page|Landing Page]]
- [[_COMMUNITY_Server-side Supabase|Server-side Supabase]]
- [[_COMMUNITY_Web Dashboard Layout|Web Dashboard Layout]]
- [[_COMMUNITY_Middleware|Middleware]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Auth Semantic Layer|Auth Semantic Layer]]
- [[_COMMUNITY_Workout Semantic Layer|Workout Semantic Layer]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 56 edges
2. `Colors` - 21 edges
3. `useOnboardingStore` - 21 edges
4. `FontSize` - 17 edges
5. `Exercise` - 17 edges
6. `Spacing` - 15 edges
7. `FontWeight` - 15 edges
8. `generateWorkoutPlan()` - 15 edges
9. `Button()` - 14 edges
10. `createClient()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Authentication Lifecycle` --rationale_for--> `Onboarding Orchestration`  [INFERRED]
  mobile/app/auth/callback.tsx → neofit/src/store/onboarding.ts
- `GeneratingStep()` --calls--> `useOnboardingStore`  [EXTRACTED]
  neofit/src/features/onboarding/GeneratingStep.tsx → neofit/src/store/onboarding.ts
- `Button()` --calls--> `cn()`  [EXTRACTED]
  neofit/src/components/ui/button.tsx → neofit/src/lib/utils.ts
- `Card()` --calls--> `cn()`  [EXTRACTED]
  neofit/src/components/ui/card.tsx → neofit/src/lib/utils.ts
- `Input()` --calls--> `cn()`  [EXTRACTED]
  neofit/src/components/ui/input.tsx → neofit/src/lib/utils.ts

## Hyperedges (group relationships)
- **Core Workout Engines** — neofit_src_lib_engines_physique_engine_ts, neofit_src_lib_engines_split_engine_ts, neofit_src_lib_engines_equipment_filter_ts [INFERRED 0.95]

## Communities (20 total, 8 thin omitted)

### Community 0 - "Mobile App Infrastructure"
Cohesion: 0.06
Nodes (45): styles, styles, AuthCallback(), styles, FormData, schema, styles, FormData (+37 more)

### Community 1 - "Onboarding & Configuration"
Cohesion: 0.05
Nodes (61): EQUIPMENT_ITEMS, EXPERIENCE_LABELS, GOAL_LABELS, GYM_PRESETS, MUSCLE_COLORS, SPLIT_LABELS, PHYSIQUE_PROGRAMS, EQUIPMENT_CATEGORIES (+53 more)

### Community 2 - "UI Component Library"
Cohesion: 0.06
Nodes (43): cn(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge() (+35 more)

### Community 3 - "Web Application Core"
Cohesion: 0.06
Nodes (32): metadata, RootLayout(), viewport, AuthProvider(), DAYS, fadeUp, STATUS_COLORS, TODAY (+24 more)

### Community 4 - "Workout Logic Engines"
Cohesion: 0.07
Nodes (35): filterByDifficulty(), filterByEquipment(), filterExercisePool(), calculateSetsPerExercise(), getPhysiqueProgram(), getRepsForGoal(), getRestForGoal(), getSectionCounts() (+27 more)

### Community 5 - "Workout State & Progression"
Cohesion: 0.1
Nodes (24): evaluateStreak(), getMaxRestGap(), incrementStreak(), getRankedSubstitutes(), getSubstitutes(), ARM_EXERCISES, BACK_EXERCISES, CARDIO_EXERCISES (+16 more)

### Community 6 - "Training Programs"
Cohesion: 0.13
Nodes (14): AESTHETIC_PHYSIQUE_PROGRAM, BALANCED_FITNESS_PROGRAM, FAT_BURN_ACCELERATOR_PROGRAM, LEAN_ATHLETIC_PROGRAM, MASS_MONSTER_PROGRAM, Program, ProgramDay, ProgramExercise (+6 more)

### Community 7 - "Performance Auditing"
Cohesion: 0.15
Nodes (17): PerformanceAudit(), PerformanceAuditProps, auditExercisePerformance(), AuditResult, VolumeAdjustment, checkForPR(), estimateOneRM(), ExercisePerformance (+9 more)

### Community 8 - "Landing Page"
Cohesion: 0.33
Nodes (4): EQUIPMENT_CATEGORIES, fadeUp, FEATURES, stagger

## Knowledge Gaps
- **121 isolated node(s):** `styles`, `styles`, `schema`, `FormData`, `styles` (+116 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Component Library` to `Mobile App Infrastructure`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **Why does `Workout` connect `Web Application Core` to `Mobile App Infrastructure`, `Onboarding & Configuration`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `Button()` connect `Mobile App Infrastructure` to `UI Component Library`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **What connects `styles`, `styles`, `schema` to the rest of the system?**
  _121 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mobile App Infrastructure` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Onboarding & Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._