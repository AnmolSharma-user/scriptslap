# ScriptSlap Deployment Instructions

## Complete Task Checklist

### ✅ Prerequisites (Already Done)

- [x] Database tables are created and configured
- [x] Supabase project is set up
- [x] Frontend application is built and running

### 📋 Tasks You Need to Complete

## Task 1: Set Up Edge Function Secrets

**Action Required:** In your Supabase Dashboard:

1. Go to **Settings > Edge Functions**
2. Click on **"Secrets"** tab
3. Add these 5 secrets one by one:

```
Secret Name: N8N_GENERATION_WEBHOOK_URL
Secret Value: https://scriptslapv1.app.n8n.cloud/webhook/scriptslap-trigger

Secret Name: N8N_REFINE_HOOK_URL
Secret Value: https://scriptslapv1.app.n8n.cloud/webhook/refine-hook-trigger

Secret Name: N8N_REFINE_CTA_URL
Secret Value: https://scriptslapv1.app.n8n.cloud/webhook/refine-cta-trigger

Secret Name: N8N_REFINE_PARAGRAPH_URL
Secret Value: https://scriptslapv1.app.n8n.cloud/webhook/refine-paragraph-trigger

Secret Name: N8N_ADD_PARAGRAPH_URL
Secret Value: https://scriptslapv1.app.n8n.cloud/webhook/add-paragraph-trigger
```

**✅ Verification:** After adding all secrets, you should see 5 secrets listed in the Edge Functions secrets section.

---

## Task 2: Install Supabase CLI

**Action Required:** Open your terminal and run these commands:

1. **Install Supabase CLI globally:**

```bash
npm install -g supabase
```

2. **Login to Supabase CLI:**

```bash
supabase login
```

(This will open a browser window for authentication)

**✅ Verification:** You should see "Logged in to Supabase" message.

---

## Task 3: Create Local Supabase Functions Directory

**Action Required:** In your terminal:

1. **Create a new directory for Supabase functions:**

```bash
mkdir -p supabase/functions
cd supabase/functions
```

2. **Create generate-script function:**

```bash
supabase functions new generate-script
```

3. **Create refine-content function:**

```bash
supabase functions new refine-content
```

**✅ Verification:** You should now have this folder structure:

```
supabase/
  functions/
    generate-script/
      index.ts
    refine-content/
      index.ts
```

---

## Task 4: Copy the Edge Function Code

**Action Required:** Replace the default code in the function files:

1. **Copy generate-script code:**

   - Open `supabase/functions/generate-script/index.ts`
   - Delete all existing content
   - Copy the entire content from `supabase-functions/generate-script/index.ts` (from this repository)
   - Save the file

2. **Copy refine-content code:**
   - Open `supabase/functions/refine-content/index.ts`
   - Delete all existing content
   - Copy the entire content from `supabase-functions/refine-content/index.ts` (from this repository)
   - Save the file

**✅ Verification:** Both files should be around 150-200 lines of TypeScript code each.

---

## Task 5: Deploy the Edge Functions

**Action Required:** In your terminal, deploy both functions:

```bash
# Deploy generate-script function
supabase functions deploy generate-script --project-ref suakemabtansfmvgbatp

# Deploy refine-content function
supabase functions deploy refine-content --project-ref suakemabtansfmvgbatp
```

**✅ Verification:** You should see success messages like:

```
Deployed Function generate-script on project suakemabtansfmvgbatp
Deployed Function refine-content on project suakemabtansfmvgbatp
```

---

## Task 6: Verify Functions in Supabase Dashboard

**Action Required:** Check your Supabase Dashboard:

1. Go to **Edge Functions** in your Supabase Dashboard
2. You should see both functions listed:
   - `generate-script`
   - `refine-content`
3. Each function should show "Deployed" status

**✅ Verification:** Both functions appear in the dashboard with "Deployed" status.

---

## Task 7: Test the Edge Functions

**Action Required:** Test that the functions are responding correctly:

1. **Test generate-script function:**

```bash
curl -L -X POST 'https://suakemabtansfmvgbatp.supabase.co/functions/v1/generate-script' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YWtlbWFidGFuc2ZtdmdiYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjY1NTksImV4cCI6MjA2ODE0MjU1OX0.70lqH6eThtj1X1jqrngZk90PooGIfwhyxgJsDtjYKfQ' \
  -H 'Content-Type: application/json' \
  --data '{"test": true}'
```

2. **Test refine-content function:**

```bash
curl -L -X POST 'https://suakemabtansfmvgbatp.supabase.co/functions/v1/refine-content' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YWtlbWFidGFuc2ZtdmdiYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjY1NTksImV4cCI6MjA2ODE0MjU1OX0.70lqH6eThtj1X1jqrngZk90PooGIfwhyxgJsDtjYKfQ' \
  -H 'Content-Type: application/json' \
  --data '{"test": true}'
```

**✅ Verification:** Both commands should return responses (not 404 errors). The responses may contain errors about missing fields, which is expected with test data.

---

## Task 8: Test ScriptSlap Application

**Action Required:** Test the full application:

1. **Sign up for a new account:**

   - Go to your ScriptSlap app
   - Click "Sign Up"
   - Create a new account with email/password

2. **Access the Status page:**

   - After signing in, go to `/status`
   - Click "Run System Tests"

3. **Verify all systems:**
   - Database Tables: Should show "Ready" (green)
   - Edge Functions: Should show "Ready" (green)

**✅ Verification:** All tests should pass and show green "Ready" status.

---

## Task 9: Test Script Generation

**Action Required:** Test the core functionality:

1. **Go to Dashboard:**

   - Navigate to `/dashboard`
   - You should see your email and credits (15)

2. **Try generating a script:**
   - Fill in the "Topic" field (required)
   - Optionally add a project name
   - Optionally add a YouTube URL
   - Select language and video length
   - Click "Generate Script"

**✅ Verification:** You should see a success message and be redirected to the script editor (even if the n8n workflows aren't set up yet).

---

## Task 10: Monitor and Debug

**Action Required:** Set up monitoring:

1. **Check Edge Function Logs:**

   - Go to Supabase Dashboard > Edge Functions
   - Click on each function to view logs
   - Monitor for any errors during testing

2. **Check Database Activity:**
   - Go to Supabase Dashboard > Database > Tables
   - Verify that records are being created in:
     - `profiles` (user profiles)
     - `projects` (when creating scripts)
     - `generated_scripts` (script records)

**✅ Verification:** Logs show successful function executions and database records are created.

---

## 🎯 Final Verification Checklist

Mark each item as complete:

- [ ] **Task 1:** Edge Function secrets added (5 secrets)
- [ ] **Task 2:** Supabase CLI installed and authenticated
- [ ] **Task 3:** Local functions directory created
- [ ] **Task 4:** Edge Function code copied correctly
- [ ] **Task 5:** Both functions deployed successfully
- [ ] **Task 6:** Functions visible in Supabase Dashboard
- [ ] **Task 7:** Functions respond to test requests
- [ ] **Task 8:** ScriptSlap Status page shows all green
- [ ] **Task 9:** Script generation works end-to-end
- [ ] **Task 10:** Monitoring and logs are working

---

## 🚀 Post-Deployment Notes

### What's Working:

- ✅ User authentication and sign-up
- ✅ Credit management system
- ✅ Project and script creation
- ✅ Edge Function deployment
- ✅ Database integration

### What Still Needs Setup:

- 🔄 n8n automation workflows (separate setup)
- 🔄 Actual AI script generation (requires n8n)
- 🔄 Real refinement processing (requires n8n)

### Directory Structure After Completion:

```
your-project/
├── supabase/
│   └── functions/
│       ├── generate-script/
│       │   └── index.ts
│       └── refine-content/
│           └── index.ts
├── client/ (ScriptSlap frontend)
└── DEPLOYMENT_INSTRUCTIONS.md (this file)
```

### Credit Costs:

- Script generation without URL: **10 credits**
- Script generation with URL: **15 credits**
- Hook refinement: **1 credit**
- CTA refinement: **1 credit**
- Paragraph refinement: **1 credit**
- Add new paragraph: **2 credits**

### Support:

If you encounter issues:

1. Check the Edge Function logs in Supabase Dashboard
2. Use the `/status` page to diagnose problems
3. Verify all secrets are set correctly
4. Ensure your Supabase project has the correct permissions

**🎉 Congratulations!** Once all tasks are complete, your ScriptSlap application will be fully deployed and ready for n8n integration!
