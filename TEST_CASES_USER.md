# User (Individual) Role Test Cases

This document outlines the test cases to verify the functionality of the "User" (Individual) role in the Medixra platform.

**Role Definition:**
- **Role Name in DB:** `user`
- **Display Name:** Individual
- **Permissions:** Browse products, contact vendors/technicians, save items, report listings, manage own profile.

**Automated Test Status:**
- ✅ = Passed
- ⚠️ = Passed with caveats (e.g. rate limits)
- ⏭️ = Not Automated (Requires manual verification or complex auth setup)

---

## 1. Authentication & Onboarding

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | **Sign Up as Individual** | 1. Go to `/signup`.<br>2. Select "Individual".<br>3. Fill Name, Email, Phone, Password.<br>4. Submit. | Account created. User redirected to "Check Email" page. DB entry created in `profiles` with role `user`. | ✅ (UI Logic Verified, API Rate Limit Hit) |
| **AUTH-02** | **Email Verification** | 1. Click verification link in email (or simulate in Supabase).<br>2. Attempt login. | Email marked verified. Login successful. | ⏭️ |
| **AUTH-03** | **Login (Invalid)** | 1. Go to `/login`.<br>2. Enter invalid credentials.<br>3. Submit. | Error message displayed. | ✅ |
| **AUTH-04** | **Logout** | 1. Click User Avatar in navbar.<br>2. Click "Log out". | Session cleared. Redirected to Homepage or Login. | ⏭️ |
| **AUTH-05** | **Protected Route Redirect** | 1. Ensure logged out.<br>2. Try to access `/dashboard/user`. | Redirected to `/login`. | ✅ |

## 2. Dashboard & Navigation

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **DASH-01** | **Dashboard Load** | 1. Login as User.<br>2. Land on `/dashboard/user`. | Dashboard loads with "Welcome [Name]". Quick actions visible (Browse, Saved Items). | ⏭️ |
| **DASH-02** | **Navigation Bar** | 1. Check Navbar links. | "Browse Equipment", "Find Technicians" visible. "For Vendors" link available (since user is not a vendor). | ⏭️ |
| **DASH-03** | **Mobile Menu** | 1. Resize to mobile view.<br>2. Open hamburger menu. | All links accessible. Profile menu accessible. | ⏭️ |

## 3. Product Discovery

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **PROD-01** | **Browse All** | 1. Click "Browse Equipment" or go to `/products`. | List of active products displayed. | ✅ |
| **PROD-02** | **Search** | 1. Enter keyword (e.g., "X-Ray") in search bar.<br>2. Press Enter. | Results filtered by keyword. | ✅ |
| **PROD-03** | **Filter by Category** | 1. Select a category (e.g., "Imaging"). | Only items in that category displayed. | ✅ |
| **PROD-04** | **Filter by City** | 1. Select a city (e.g., "Lahore"). | Only items in that city displayed. | ⏭️ |
| **PROD-05** | **Filter by Price** | 1. Set Min and Max price. | Only items within range displayed. | ⏭️ |

## 4. Product Interaction

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **ITEM-01** | **View Details** | 1. Click on a product card. | Redirect to `/product/[id]`. Details (Price, Condition, Description) match. | ⏭️ |
| **ITEM-02** | **Contact Vendor** | 1. On product detail, click "Chat on WhatsApp". | Opens WhatsApp API with pre-filled message including product name. | ⏭️ |
| **ITEM-03** | **Save Item** | 1. Click Heart icon on product card or detail page. | Heart turns filled/red. Toast notification "Item saved". | ⏭️ |
| **ITEM-04** | **View Saved Items** | 1. Go to `/dashboard/saved-items`. | The saved product appears in the list. | ⏭️ |
| **ITEM-05** | **Remove Saved Item** | 1. On Saved Items page, click "Remove" or Heart icon. | Item removed from list. | ⏭️ |
| **ITEM-06** | **Report Item** | 1. On product detail, click "Report Listing".<br>2. Select reason, add description.<br>3. Submit. | Report submitted to DB. Admin can view it. Toast success. | ⏭️ |

## 5. Technician Discovery

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TECH-01** | **List Technicians** | 1. Go to `/technicians`. | List of approved technicians displayed. | ✅ |
| **TECH-02** | **Filter Technicians** | 1. Filter by City or Speciality. | List updates to show matching technicians. | ⏭️ |
| **TECH-03** | **Contact Technician** | 1. Click "Contact" / WhatsApp button. | Opens WhatsApp with technician's number. | ⏭️ |

## 6. Profile Management

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **PROF-01** | **View Settings** | 1. Go to `/dashboard/settings`. | Profile form loads with current Name, Email, Phone. | ⏭️ |
| **PROF-02** | **Update Profile** | 1. Click "Edit Profile".<br>2. Change Name or City.<br>3. Click Save. | Success message. Page reflects new data. (Fixed: Edit form added) | ⏭️ |
| **PROF-03** | **Delete Account** | 1. Click "Delete Account".<br>2. Type "DELETE" to confirm. | Account deleted. Session cleared. Redirected to Home. Data removed from DB. | ⏭️ |

## 7. Access Control (Security)

| ID | Test Case | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **Vendor Dashboard Access** | 1. As User, try to access `/dashboard/vendor`. | Redirected to `/unauthorized` or `/login`. | ✅ |
| **SEC-02** | **Admin Access** | 1. As User, try to access `/admin`. | Redirected to `/unauthorized` or `/login`. | ✅ |
| **SEC-03** | **Post Ad Access** | 1. As User, click "Sell Now" or go to `/post-ad`. | Redirected to `/signup?role=vendor`. (Fixed: Redirect behavior updated) | ⏭️ |

---

## Notes for Tester
- **Environment:** Local Dev (Playwright)
- **Date:** 2026-02-13
- **Updates:**
    - **PROF-02:** Profile editing enabled in Settings page.
    - **SEC-03:** Non-vendors redirected to Vendor Signup when accessing Post Ad.
- **Issues:**
    - Sign Up flow hits Supabase rate limits on repetitive testing.
    - Full E2E flows (Dashboard, Profile) require a verified user session which is hard to mock without service keys.
