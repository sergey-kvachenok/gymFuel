# Deployment & CI/CD Guide

## Table of Contents

1. Overview
2. Workflow Structure
3. Required Secrets & Variables
4. Automatic Staging Deployment
5. Manual Staging Deployment
6. Manual Production Deployment (with Staging Safety Check)
7. Reusable Workflow (`deploy-reusable.yml`)
8. Troubleshooting & FAQ

---

## 1. Overview

This project uses **GitHub Actions** for CI/CD automation and **Vercel** for deployment. The deployment pipeline ensures that only code passing CI is deployed to staging automatically, and only staging code that was deployed automatically (not manually) can be promoted to production.

---

## 2. Workflow Structure

### Triggers

- **workflow_run**: Automatically triggers after a successful run of the `CI Pipeline` workflow on the `main` branch.
- **workflow_dispatch**: Allows manual deployment via the GitHub Actions UI, with an environment choice (`staging` or `production`).

### Jobs

#### 2.1. `check-staging-safety`

- Runs only for manual production deployments.
- Checks that the last staging deployment was automatic (after CI), not manual.
- If staging is "safe", allows production deployment.

#### 2.2. `deploy-staging`

- Automatically deploys to staging after a successful CI run on `main`.
- Uses the reusable workflow.

#### 2.3. `deploy-production`

- Manual production deployment.
- Only runs if staging is "safe" (last deployment was automatic).
- Uses the reusable workflow.

#### 2.4. `deploy-staging-manual`

- Manual deployment to staging (no CI check required).
- Uses the reusable workflow.

---

## 3. Required Secrets & Variables

Add these secrets in **GitHub Repository → Settings → Secrets and variables → Actions**:

| Secret Name                    | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `VERCEL_TOKEN`                 | Vercel CLI token                             |
| `VERCEL_PROJECT_ID_STAGING`    | Vercel Project ID for staging environment    |
| `VERCEL_PROJECT_ID_PRODUCTION` | Vercel Project ID for production environment |
| `DATABASE_URL_STAGING`         | Database connection string for staging       |
| `DATABASE_URL_PRODUCTION`      | Database connection string for production    |

**Note:** Secret names must match exactly with those used in the workflow files.

---

## 4. Automatic Staging Deployment

- Triggered automatically after a successful `CI Pipeline` run on `main`.
- The `deploy-staging` job runs only if CI passes:
  ```yaml
  if: github.event.workflow_run.conclusion == 'success'
  ```
- Uses the reusable workflow for deployment steps.

---

## 5. Manual Staging Deployment

- Can be triggered manually from the GitHub Actions UI by selecting the `staging` environment.
- Does **not** require a successful CI run.
- Uses the `deploy-staging-manual` job and the reusable workflow.

---

## 6. Manual Production Deployment (with Staging Safety Check)

- Can be triggered manually from the GitHub Actions UI by selecting the `production` environment.
- Before deploying, the `check-staging-safety` job verifies that the last staging deployment was automatic (after CI), not manual.
- If the check passes, the `deploy-production` job runs, using the same commit as the last safe staging deployment.
- If the last staging deployment was manual, production deployment is blocked until a new automatic staging deployment occurs.

---

## 7. Reusable Workflow (`deploy-reusable.yml`)

- Contains the shared deployment steps: code checkout, dependency installation, Vercel deployment, Prisma migrations, etc.
- Receives parameters via `with` and `secrets` from the calling workflow.
- Ensures DRY (Don't Repeat Yourself) and consistent deployment logic for both staging and production.

---

## 8. Troubleshooting & FAQ

### Q: **Vercel CLI error: "Detected linked project does not have 'id'"**

**A:** This means the `VERCEL_PROJECT_ID` secret is missing or empty. Ensure the secret exists and matches the name used in the workflow.

### Q: **Production deployment is blocked**

**A:** The last staging deployment was manual. Push new changes to `main` to trigger an automatic staging deployment, then retry production deployment.

### Q: **Secrets not found or empty**

**A:** Double-check that all required secrets are set in GitHub and that their names match those referenced in the workflow files.

---

## Example: How to Deploy to Production

1. Push your changes to the `main` branch.
2. Wait for the CI pipeline and automatic staging deployment to complete successfully.
3. Go to GitHub Actions → select the `Deploy to Environments` workflow → click "Run workflow" → choose `production`.
4. If the last staging deployment was automatic, production deployment will proceed using the same commit.

---

If you have questions or need to update the deployment process, please update this file accordingly.
