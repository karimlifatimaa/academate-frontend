# Academate Frontend — Task Tracking

> Bu fayl müxtəlif agentlər tərəfindən izlənilə bilməsi üçün yaradılıb. Hər task tamamlandıqda statusu yenilənir.
>
> **Backend base URL:** `http://localhost:8080/api/v1`
> **Stack:** Next.js 16 (App Router) · React 19 · TanStack Query · Zustand · Tailwind v4 · shadcn/ui · Sonner
> **Dizayn sistemi:** Yaşıl `#4A6741` / `#6B8F6E`, krem fon `#F8F5F0`, `rounded-3xl` kartlar, `lucide-react` ikonları, dil: Azərbaycan dili

---

## 0. Mövcud səhifələr (✓ artıq hazırdır)

| # | Route | Rol | Endpoint(lər) | Status |
|---|-------|-----|---------------|--------|
| 0.1 | `/login` | hamı | `POST /auth/login` | ✓ |
| 0.2 | `/register` (selector) | hamı | — | ✓ |
| 0.3 | `/register/student` | hamı | `POST /auth/register/student` | ✓ |
| 0.4 | `/register/teacher` | hamı | `POST /auth/register/teacher` | ✓ |
| 0.5 | `/register/parent` | hamı | `POST /auth/register/parent` | ✓ |
| 0.6 | `/forgot-password` | hamı | `POST /auth/forgot-password` | ✓ |
| 0.7 | `/reset-password` | hamı | `POST /auth/reset-password` | ✓ |
| 0.8 | `/verify-email` | hamı | `GET /auth/verify-email` | ✓ |
| 0.9 | `/dashboard` | auth | aggregate | ✓ |
| 0.10 | `/(app)/profile` | auth | `GET/PATCH /users/me/*` | ✓ |
| 0.11 | `/(app)/lessons` | STUDENT/TEACHER | lesson CRUD | ✓ |
| 0.12 | `/(app)/family/children` | PARENT | `POST /family/link`, `GET /family/my-children` | ✓ |
| 0.13 | `/(discover)/teachers` | hamı | `GET /teachers` | ✓ |
| 0.14 | `/(discover)/teachers/[id]` | hamı | teacher + availability + reviews | ✓ (booking modal placeholder) |

---

## 1. Yeni qurulacaq səhifələr (Tasks)

Hər task aşağıdakı statusla işarələnir: ⬜ pending · 🟡 in-progress · ✅ done · ❌ blocked

### Task 1 — Student lesson booking page
- **Route:** `/(app)/teachers/[id]/book`
- **Rol:** STUDENT
- **Endpoint:** `POST /api/v1/students/lessons`
- **DTO:** `BookLessonRequest { teacherId, subject, scheduledAt, durationMinutes, notes? }`
- **UI:** subject seçim (müəllim subject-ləri), tarix/saat picker (availability slot-lara əsasən), müddət (60/90 dəq), qeydlər
- **Status:** ✅ done

### Task 2 — Student review submit
- **Route:** `/(app)/lessons` daxilində modal (COMPLETED dərslər üçün "Rəy yaz" düyməsi)
- **Rol:** STUDENT
- **Endpoint:** `POST /api/v1/students/teachers/{teacherId}/reviews`
- **DTO:** `CreateReviewRequest { rating: 1-5, comment? }`
- **Status:** ✅ done

### Task 3 — Teacher availability management
- **Route:** `/(app)/availability`
- **Rol:** TEACHER
- **Endpoint:** `PUT /api/v1/teachers/me/availability`
- **DTO:** `AvailabilitySlotRequest[] { dayOfWeek, startTime, endTime }`
- **UI:** həftə günləri üzrə slot əlavə/silmə, vaxt aralığı (HH:mm)
- **Status:** ✅ done

### Task 4 — Student invite-code page
- **Route:** `/(app)/family/invite-code`
- **Rol:** STUDENT
- **Endpoints:**
  - `POST /api/v1/family/invite-code` → `{ code, expiresAt }`
  - `GET /api/v1/family/my-parents` → `UserResponse[]`
- **UI:** kod yaratma, kopyala düyməsi, bağlı valideynlər siyahısı
- **Status:** ✅ done

### Task 5 — Parent register-child page
- **Route:** `/(app)/family/children/new`
- **Rol:** PARENT
- **Endpoint:** `POST /api/v1/auth/register/child`
- **DTO:** `RegisterChildRequest { fullName, grade, schoolName, birthDate }`
- **UI:** form (ad, sinif 1-11, məktəb, doğum tarixi)
- **Status:** ✅ done

### Task 6 — Security / account settings
- **Route:** `/(app)/profile/security`
- **Rol:** hamı
- **Endpoints:**
  - `POST /api/v1/auth/change-password`
  - `POST /api/v1/auth/logout-all`
  - `DELETE /api/v1/users/me`
- **Status:** ✅ done

### Task 7 — Avatar upload UI
- **Yer:** Profil səhifəsində mövcud avatar bölməsinə inteqrasiya
- **Endpoint:** `POST /api/v1/users/me/avatar?fileName=&contentType=` → `{ uploadUrl, avatarUrl }`
- **Axın:** 1) backend-dən `uploadUrl` al, 2) `PUT {uploadUrl}` ilə S3-ə fayl yüklə, 3) profil yenilə
- **Status:** ✅ done

### Task 8 — Admin pages
- **Routes:**
  - `/(admin)/users` — bütün istifadəçilər (deactivate)
  - `/(admin)/teachers` — müəllimlər (verify)
- **Rol:** ADMIN
- **Endpoints:**
  - `GET /api/v1/admin/users?role=&page=&size=`
  - `GET /api/v1/admin/teachers?page=&size=`
  - `PATCH /api/v1/admin/teachers/{id}/verify`
  - `PATCH /api/v1/admin/users/{id}/deactivate`
- **UI:** ayrı admin layout (sidebar), cədvəl, paginasiya
- **Status:** ✅ done

### Task 9 — Wire teacher-detail BookModal
- **Yer:** `src/app/(discover)/teachers/[id]/page.tsx`
- **Dəyişiklik:** `BookModal` placeholder-ini götürüb birbaşa `/(app)/teachers/[id]/book` route-na yönləndirmək
- **Status:** ✅ done

---

### Task 10 — Free-slot picker with calendar (booking redesign)
- **Yer:** `src/app/(app)/teachers/[id]/book/page.tsx` + yeni komponent
- **Rol:** STUDENT
- **Backend analizi:**
  - `TeacherAvailability` həftəlik şablondur: `dayOfWeek + startTime + endTime`
  - **Yoxdur:** `GET /teachers/{id}/booked-times` — müəllimin bron olunmuş vaxtlarını alan public endpoint yoxdur
  - **Yoxdur:** `POST /students/lessons` heç bir konflikt yoxlaması etmir — istənilən gələcək tarixi qəbul edir
  - **Var:** `GET /api/v1/students/lessons` — şagird öz dərslərini görə bilər (öz konfliktlərini hesablamaq üçün)
- **Frontend həlli:**
  1. `GET /teachers/{id}/availability` ilə həftəlik şablon al
  2. `GET /students/lessons` ilə şagirdin öz dərslərini al
  3. Seçilmiş gün üçün availability pəncərələrini 60 dəqiqəlik slotlara böl
  4. Keçmiş slotları və şagirdin özünün artıq bron etdiyi slotları passiv et
  5. Şagird slot seçir → subject + müddət seçir → bron edir
- **Məhdudiyyət:** Başqa şagirdlərin bron etdiyi vaxtlar görünmür (backend public-də vermir). Müəllim daxili olaraq dublikat bronları aşkar edib ləğv edir.
- **Status:** ✅ done

### Backend dəyişiklikləri (2026-05-01) — ✅ tətbiq olundu

**Yeni endpoint:**
- `GET /api/v1/teachers/{id}/booked-times?from=YYYY-MM-DD&to=YYYY-MM-DD` (public)
- `from`/`to` məcburi deyil — defolt: bu gün → +14 gün
- Cavab: `BookedTimeResponse[]` — `{ startTime, endTime }` (şagird PII yoxdur, yalnız vaxt aralıqları)
- Yalnız `PENDING` və `CONFIRMED` statuslu dərslər qaytarılır

**Booking validation əlavə olundu** (`LessonService.book()`):
1. **Müddət yoxlaması:** 1 ≤ `durationMinutes` ≤ 240 (yoxsa `400 BadRequest`)
2. **Availability yoxlaması:** `scheduledAt` müəllimin həmin gün cədvəlinə uyğun olmalıdır:
   - Müəllimin həmin gün mövcudluğu yoxdursa → `400 BadRequest`
   - Dərs gecə yarısını keçirsə → `400 BadRequest`
   - Slot heç bir availability pəncərəsinə tam sığmasa → `400 BadRequest`
3. **Konflikt yoxlaması:** Eyni müəllimə eyni vaxtda PENDING/CONFIRMED dərs varsa → `409 Conflict` ("Bu vaxt artıq başqa şagird tərəfindən rezerv edilib")

**Yeni repository metodları** (`LessonRepository`):
- `findActiveBookingsInRange(teacherId, from, to)` — public booked-times üçün
- `findOverlapCandidates(teacherId, earliestStart, end)` — JPQL ilə namizəd çək, Java-da dəqiq overlap

**Yeni DTO:** `BookedTimeResponse` — `{ LocalDateTime startTime, LocalDateTime endTime }`

**Frontend inteqrasiyası:**
- `useTeacherBookedTimes(teacherId, from, to)` hook-u əlavə olundu
- `BookedTimeRange` tipi `types/profile.ts`-də
- `generateSlotsForDate()` `bookedTimes` parametri qəbul edir
- Booking səhifəsində qırmızı slot stili "Rezerv olunub" üçün, legend əlavə olundu

---

## 2. Texniki qeydlər

- **Auth:** `access-token` cookie-də (15 dəq), `refresh-token` localStorage-da. `axios.ts` 401 üçün avtomatik refresh edir.
- **Roles:** `useProfile()` hook-undan `role` götürülür; rol uyğun deyilsə səhifə `redirect` edir.
- **API hooks:** Yeni endpoint-lər üçün `src/hooks/use*.ts` fayllarına əlavə edilməlidir.
- **Types:** `src/types/profile.ts`-də DTO tipləri saxlanır.
- **Toast:** `sonner` istifadə olunur (`toast.success`, `toast.error`).
- **Form:** `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Layout naviqasiyası:** Yeni səhifələr əlavə edildikdə `src/app/(app)/layout.tsx` `NAV` obyektinə əlavə olunmalıdır.

---

## 3. Test plan

- [ ] Student: login → teachers → detail → book → /lessons → review yaz
- [ ] Teacher: login → /availability slot əlavə/sil → /lessons confirm/complete
- [ ] Parent: login → /family/children/new → /family/children siyahıda görünür
- [ ] Student: login → /family/invite-code → kod kopyala → valideyn `/family/children`-də link et
- [ ] Admin: login → /users deactivate, /teachers verify
- [ ] Hamı: /profile/security parol dəyiş, avatar yüklə

---

## 4. Dəyişiklik tarixçəsi

| Tarix | Agent | Dəyişiklik |
|-------|-------|------------|
| 2026-04-30 | claude-opus-4-7 | Task siyahısı yaradıldı, planlama tamamlandı |
| 2026-04-30 | claude-opus-4-7 | Task 1-9 tamamlandı: booking, review modal, availability, invite-code, register-child, security, avatar (presigned URL), admin (users + teachers), teacher detail booking link |
| 2026-04-30 | claude-opus-4-7 | Task 10 tamamlandı: backend dərindən analiz edildi, slot picker UI ilə booking redesign — 14 günlük strip + müəllimin həftəlik availability template-indən 60-dəq slotlar generasiya, keçmiş və şagird konfliktləri passiv. `next build` 23 route uğurla yaratdı. |
| 2026-05-01 | claude-opus-4-7 | Backend update-ləri tətbiq olundu: yeni `GET /teachers/{id}/booked-times` public endpoint, `LessonService.book()`-da availability + konflikt validation, yeni repository query-ləri. Frontend slot picker real bron məlumatları ilə inteqrasiya olundu (qırmızı "Rezerv olunub" stili + legend). `compileJava` və `next build` təmizdir. |

---

## 5. Yaradılan/dəyişdirilən fayllar (2026-04-30)

**Yeni səhifələr:**
- `src/app/(app)/teachers/[id]/book/page.tsx` — STUDENT lesson booking
- `src/app/(app)/availability/page.tsx` — TEACHER cədvəl idarəsi
- `src/app/(app)/family/invite-code/page.tsx` — STUDENT dəvət kodu
- `src/app/(app)/family/children/new/page.tsx` — PARENT uşaq qeydiyyatı
- `src/app/(app)/profile/security/page.tsx` — parol/logout-all/hesab sil
- `src/app/(admin)/layout.tsx` — admin layout (ADMIN guard)
- `src/app/(admin)/admin/users/page.tsx` — istifadəçi siyahısı + deactivate
- `src/app/(admin)/admin/teachers/page.tsx` — müəllim siyahısı + verify

**Yeni komponentlər:**
- `src/components/lessons/ReviewModal.tsx` — rating + şərh modal-ı

**Yeni hooklar:**
- `src/hooks/useBooking.ts` — `useBookLesson`, `useCreateReview`
- `src/hooks/useAvailability.ts` — `useMyAvailability`, `useUpdateAvailability`
- `src/hooks/useFamily.ts` — `useGenerateInviteCode`, `useMyParents`, `useRegisterChild`
- `src/hooks/useAdmin.ts` — `useAdminUsers`, `useAdminTeachers`, `useVerifyTeacher`, `useDeactivateUser`

**Yeni utility:**
- `src/lib/constants.ts` — SUBJECTS, DAY_AZ, ROLE_LABEL, RELATION_LABEL
- `src/lib/slots.ts` — `buildDayStrip()`, `generateSlotsForDate()` — availability + lesson list-dən boş slotlar hesablayır

**Dəyişdirilmiş fayllar:**
- `src/types/auth.ts` — `UserRole`-a `"ADMIN"` əlavə edildi
- `src/app/(app)/layout.tsx` — STUDENT-ə "Valideyn" linki, ADMIN-ə real naviqasiya
- `src/app/(app)/profile/page.tsx` — avatar upload presigned URL flow-na keçirildi, "Təhlükəsizlik" linki
- `src/app/(app)/lessons/page.tsx` — COMPLETED dərslər üçün ReviewModal qoşuldu
- `src/app/(app)/family/children/page.tsx` — "Yeni uşaq" linki əlavə edildi
- `src/app/(discover)/teachers/[id]/page.tsx` — placeholder modal silindi, real `/teachers/[id]/book` route-na yönləndirir

**TypeScript yoxlaması:** ✅ `tsc --noEmit` xətasız keçir
