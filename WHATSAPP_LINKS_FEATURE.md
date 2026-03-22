# WhatsApp Group Links Management - Implementation Guide

## Overview

This feature allows administrators to manage WhatsApp group links for recruitment form roles. When users apply for positions during recruitment, they automatically receive WhatsApp group links for all selected positions.

## Files Created

### Components

1. **RecruitmentFormsList** (`components/admin/recruitment/RecruitmentFormsList.tsx`)
   - Displays all recruitment forms in a card grid layout
   - Shows form status (active/inactive)
   - Shows count of roles with WhatsApp links
   - Clicking a form selects it for link management

2. **WhatsAppLinksManager** (`components/admin/recruitment/WhatsAppLinksManager.tsx`)
   - Displays all roles from selected form
   - Shows current WhatsApp link status for each role
   - "Add/Edit" buttons to manage links
   - Shows link preview with external link button

3. **WhatsAppLinkModal** (`components/admin/recruitment/WhatsAppLinkModal.tsx`)
   - Modal form to add/edit WhatsApp links
   - Built with react-hook-form + zod validation
   - Validates link format (must contain "whatsapp" or "chat.whatsapp")
   - Shows success/error toasts on submit

### Pages

1. **WhatsApp Links Management Page** (`app/admin/recruitment/whatsapp-links/page.tsx`)
   - Main page integrating all components
   - Two-column layout: forms list (left) and link manager (right)
   - Auto-loads first form on page load
   - Handles form selection and refresh

### API Integration

Updated `services/api.ts` with new recruitment API methods:

```typescript
// Update WhatsApp link by role name (recommended)
recruitmentApi.updateRoleWhatsappLink(formId, roleName, whatsappLink)

// Get role WhatsApp link
recruitmentApi.getRoleWhatsappLink(formId, roleId)
```

### Types

Added new types to `types/index.ts`:

```typescript
export type IFormField = { ... }
export type IRoleDefinition = {
  _id?: string;
  roleName: string;
  description?: string;
  fields: IFormField[];
  whatsappLink?: string;  // NEW
};
export type RecruitmentForm = { ... }
export type RecruitmentFormsResponse = { ... }
export type RecruitmentFormResponse = { ... }
```

## How to Use

### For Admins

1. **Navigate to WhatsApp Links Management**
   - Go to Admin Panel → Recruitment → Click "WhatsApp Links" button
   - Or navigate directly to `/admin/recruitment/whatsapp-links`

2. **Select a Recruitment Form**
   - Forms list appears on the left
   - Shows count of roles with/without links
   - Click to select a form

3. **Add/Edit WhatsApp Links**
   - Selected form's roles appear on the right
   - Each role shows status (linked/not linked)
   - Click "Add" or "Edit" button to open modal
   - Paste WhatsApp group link
   - System validates the link
   - Click "Save Link" to update

4. **Link Validation**
   - Link must contain "whatsapp" or "chat.whatsapp"
   - Example valid links:
     - https://chat.whatsapp.com/abc123
     - https://whatsapp.com/invitation/xxx
   - Invalid links are rejected with error message

### For Users (Application Process)

When users submit a recruitment application:
1. Users select multiple positions/roles
2. System fetches recruitment form
3. For each selected position, system finds WhatsApp link
4. Links are stored in the application document under `whatsappGroupLinks`
5. Frontend can display these links to user after successful submission

## Feature Highlights

✅ **No Breaking Changes** - Completely optional feature
✅ **Link Validation** - Prevents invalid links from being saved
✅ **Real-time Updates** - Changes reflected immediately
✅ **User-Friendly** - Clean, intuitive admin interface
✅ **Responsive Design** - Works on mobile and desktop
✅ **Error Handling** - Proper error messages and toasts
✅ **Admin-Only** - All endpoints require admin authentication

## Data Structure

### Recruitment Form (with WhatsApp links)
```json
{
  "_id": "ObjectId",
  "title": "Winter Recruitment 2025",
  "isActive": true,
  "roles": [
    {
      "_id": "ObjectId",
      "roleName": "Web Developer",
      "description": "Full-stack development",
      "whatsappLink": "https://chat.whatsapp.com/abc123",
      "fields": [...]
    }
  ]
}
```

### Application (with WhatsApp links)
```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "formId": "ObjectId",
  "generalInfo": {
    "positions": ["Web Developer", "Android Developer"]
  },
  "whatsappGroupLinks": {
    "Web Developer": "https://chat.whatsapp.com/abc123",
    "Android Developer": "https://chat.whatsapp.com/def456"
  },
  "status": "pending"
}
```

## API Endpoints (Backend)

### GET /api/recruitment/forms
Fetch all recruitment forms
- Auth: Admin only
- Response: `{ success: true, forms: [...] }`

### GET /api/recruitment/forms/:formId
Fetch specific form with all roles
- Auth: Admin only
- Response: `{ success: true, form: {...} }`

### PATCH /api/recruitment/forms/:formId/role-whatsapp
Update WhatsApp link for a role (by name)
- Auth: Admin only
- Body: `{ "roleName": "Web Developer", "whatsappLink": "https://..." }`
- Response: `{ success: true, message: "...", form: {...} }`

## Frontend Testing Checklist

- [ ] Load recruitment forms list
- [ ] Select different forms
- [ ] Form details load correctly
- [ ] Add new WhatsApp link to a role
- [ ] Link validation works (invalid links rejected)
- [ ] Edit existing link
- [ ] Success toast shows after save
- [ ] List refreshes with new link status
- [ ] Error handling works (API errors show toast)
- [ ] Responsive design works on mobile
- [ ] Back button/navigation works
- [ ] Link preview button opens WhatsApp

## Troubleshooting

### "Failed to load recruitment forms"
- Check API endpoint is correct: `/api/recruitment/forms`
- Verify admin is authenticated (check auth token in cookies)
- Check backend server is running

### "Please provide a valid WhatsApp group link"
- Link must contain "whatsapp" or "chat.whatsapp"
- Copy full invitation link from WhatsApp
- Example: `https://chat.whatsapp.com/xxxxxxxxxxxxx`

### Modal doesn't open
- Check browser console for errors
- Verify role object has `roleName` property
- Check modal component is mounted

### Changes not saving
- Check network tab in dev tools for API response
- Verify `formId` is being passed correctly
- Check error message in toast

## Future Enhancements

- Add link expiration dates
- Track which users joined which groups
- Send automatic WhatsApp messages to users
- Generate QR codes for WhatsApp links
- Activity logging for link updates
- Link statistics (how many users joined)
- Bulk link update
- Link scheduler

## Component Dependencies

```
RecruitmentFormsList
├── uses: RecruitmentForm type
├── icons: lucide-react
└── styling: tailwindcss

WhatsAppLinksManager
├── uses: RecruitmentForm, IRoleDefinition types
├── icons: lucide-react
├── styling: tailwindcss
└── child: WhatsAppLinkModal

WhatsAppLinkModal
├── uses: react-hook-form
├── validator: zod + @hookform/resolvers
├── icons: lucide-react
├── notifications: react-hot-toast
├── styling: tailwindcss
└── API: recruitmentApi.updateRoleWhatsappLink

WhatsAppLinksPage
├── uses: All above components
├── API: recruitmentApi.getAllForms, getFormById
├── styling: tailwindcss
└── icons: lucide-react
```

## Environment Setup

No additional environment variables or setup required. The feature uses:
- Existing API client (axios with auth interceptor)
- Existing UI patterns and styling
- Existing form libraries (react-hook-form, zod)

## Performance Notes

- Forms list renders in card grid (responsive)
- Lazy loads form details on selection
- Modal uses controlled form state
- No unnecessary re-renders
- API calls cached in component state

## Accessibility

- All buttons have aria-labels
- Form inputs have proper labels
- Modal has focus management
- Color contrasts meet WCAG standards
- Keyboard navigation supported
