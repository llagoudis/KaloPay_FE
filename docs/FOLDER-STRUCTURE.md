# KaLoPay Frontend – Folder Structure & Where to Write Code

## Rule of thumb

| Kahan likhen? | Kya likhen? |
|---------------|-------------|
| **`app/`** | Pages / routes (URL ke hisaab se screen). Sirf layout + components ko import karke use karna. |
| **`components/`** | Reusable UI: tables, forms, popups, cards. Ye components **pages** use karte hain. |

---

## 1. `app/` folder (Pages / Routes)

- **Ye wahi jagah hai jahan URL decide hota hai** (e.g. `/admin/employees` → `app/admin/(protected)/employees/page.tsx`).
- Har **page** kam se kam ek `page.tsx` export karta hai.
- Page mein **zyada logic nahi** honi chahiye: page sirf layout decide kare aur **components** ko import karke unhe render kare.

**Examples:**
- `app/admin/(protected)/employees/page.tsx` → Employees **page** (screen ka layout: title card, search card, etc.)
- `app/admin/(protected)/employees/add/page.tsx` → Add Employee **page**
- `app/admin/(protected)/companies/page.tsx` → Companies **page**

**Page mein aisa karein:**
- Title, cards, spacing (layout).
- Components ko import karke use karein, e.g. `<EmployeeTable />`, `<AddEmployeeForm />`.

---

## 2. `components/` folder

### `components/ui/`
- **Generic** UI: Button, Input, Table, Badge, Modal, etc.
- Kisi specific feature (admin/employee/user) ke liye nahi, sab jagah use ho sakte hain.

### `components/shared/`
- **Sab roles** use karte hain: Sidebar, Header, SearchBar, Pagination, etc.

### `components/admin/`
Admin panel ke **feature-wise** components. Yahan woh cheezein banti hain jo **sirf admin pages** use karti hain.

| Folder | Kya banaen? | Kahan use hoga? |
|--------|-------------|------------------|
| `components/admin/employees/` | `EmployeeTable.tsx`, `AddEmployeeForm.tsx`, `EditEmployeePopup.tsx` | `app/admin/.../employees/page.tsx`, `employees/add/page.tsx`, etc. |
| `components/admin/companies/` | `CompanyTable.tsx`, `AddCompanyForm.tsx`, `EditCompanyPopup.tsx` | `app/admin/.../companies/page.tsx`, companies add/edit pages |
| `components/admin/accounts/` | `AccountTable.tsx`, account-related forms/popups | `app/admin/.../accounts/page.tsx` |
| `components/admin/administrators/` | `AdminTable.tsx`, admin add/edit forms | `app/admin/.../administrators/page.tsx` |
| `components/admin/wallet/` | `WalletSummaryTabs.tsx`, wallet UI | `app/admin/.../wallet/page.tsx` |

**Important:**  
- **Table, form, popup** jaisi cheezein **yahan** (`components/admin/...`) banani hain.
- **Page** (`app/admin/.../page.tsx`) mein sirf in components ko import karke layout ke andar use karna hai.

---

## 3. Flow (Example: Employees)

```
User opens /admin/employees
        ↓
app/admin/(protected)/employees/page.tsx  (PAGE – layout + cards)
        ↓
Uses:
  - components/admin/employees/EmployeeTable.tsx   (table with columns, data, actions)
  - (optional) components/shared/SearchBar.tsx
  - components/ui/Button.tsx
```

- **Page** = "Employees heading card + Search card + table card" jaisa layout.
- **EmployeeTable** = actual table (columns, rows, badges, links, actions). Isi ko page import karega.

---

## 4. Summary

| Jagah | Kaam |
|-------|------|
| **app/admin/(protected)/employees/page.tsx** | Employees **screen** ka layout (title card, search card, table card). Yahan se `EmployeeTable` etc. import karein. |
| **components/admin/employees/EmployeeTable.tsx** | Employees **table** (columns, data, filters, actions). Yahan table ka poora code ho. |
| **components/admin/employees/AddEmployeeForm.tsx** | Add employee **form**. Add page ya popup ise use karega. |
| **components/admin/employees/EditEmployeePopup.tsx** | Edit employee **popup/modal**. Detail page ya table actions ise use karega. |

**Galat jagah nahi banega** agar ye rule follow karein:  
- **Screen / URL** → `app/` ke andar `page.tsx`.  
- **Table / Form / Popup / Feature UI** → `components/admin/` (ya `user/`, `employee/`) ke andar.
