# Terraform and EC2 deployment

This setup provisions one Ubuntu 24.04 x86_64 `t3.small` in `ap-south-1`, with an Elastic IP, Nginx, Certbot, Systems Manager access, CloudWatch logs/alarms, and an S3 release bucket. GitHub Actions builds the Next.js standalone output and deploys each successful push to `main` through GitHub OIDC and SSM. The app database and DNS zone are intentionally not provisioned here.

The EC2 security group allows inbound HTTP/HTTPS only; there is no public SSH ingress. The app runs as a non-root `systemd` service behind Nginx. HTTP-01 certificate issuance retries until the external DNS A records point at the Elastic IP. Certbot's systemd timer renews certificates, and a deploy hook reloads Nginx after renewal.

## Requirements

- Terraform 1.10 or later, AWS CLI v2, and an AWS CLI credential profile allowed to create the resources in the Terraform configuration.
- A GitHub repository at `DrJanvi/youniq-lyf`, with permission to configure its production Environment.
- A registered domain and a valid email address for Let's Encrypt.
- A separately provisioned MySQL database reachable from the EC2 host.

## Initial provisioning

1. Authenticate the AWS CLI to the intended account. Confirm the account ID before applying; Terraform's `allowed_account_ids` setting will reject a different account.
2. Create the encrypted/versioned Terraform state bucket. The bootstrap root uses local state because the bucket does not exist until this first apply:

   ```sh
   terraform -chdir=infra/terraform/bootstrap init
   terraform -chdir=infra/terraform/bootstrap plan \
     -var='aws_account_id=123456789012' \
     -var='aws_region=ap-south-1'
   terraform -chdir=infra/terraform/bootstrap apply \
     -var='aws_account_id=123456789012' \
     -var='aws_region=ap-south-1'
   ```

   Keep the bootstrap state's `terraform.tfstate` private and backed up. It contains only the bootstrap resources, not application secrets. The main infrastructure root uses the S3 backend from its first initialization.
3. Copy the example Terraform inputs and edit them with the real account ID, domain, and contact email:

   ```sh
   cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
   cp infra/terraform/backend.hcl.example infra/terraform/backend.hcl
   ```

   Set the backend bucket in `backend.hcl` to the state bucket output from the bootstrap step. Do not commit either copied file.
4. Review and apply the production infrastructure:

   ```sh
   terraform -chdir=infra/terraform init -backend-config=backend.hcl
   terraform -chdir=infra/terraform validate
   terraform -chdir=infra/terraform plan
   terraform -chdir=infra/terraform apply
   ```

   Review the plan before applying. If the account already has the GitHub Actions OIDC provider, import the existing provider into Terraform state rather than attempting to create a duplicate.
5. Update [deployment-target.json](./deployment-target.json) with the account ID, region, and primary domain used by Terraform, then commit that change through a reviewed pull request. The workflow derives the target role ARN and release bucket from this tracked file and checks the assumed AWS account. This is intentionally a required, reviewed edit to change accounts.
6. In GitHub repository settings, create a `production` Environment and restrict deployments to the `main` branch. Do not add a required reviewer if pushes to `main` must deploy without a per-deployment approval. Protect `main` and require the `Validate and build` check before merging.

The GitHub OIDC trust policy uses the immutable owner and repository IDs as well as their names. Repositories created after July 15, 2026 use these IDs in the default OIDC `sub` claim. If you transfer or replace the GitHub repository, update `github_repository`, `github_repository_owner_id`, and `github_repository_id`, then apply Terraform again before deploying.

## Required manual setup

### DNS and HTTPS

- Add an A record for the primary domain and every `additional_domains` hostname to Terraform's `elastic_ip` output. Keep DNS at your current provider.
- Do not publish an AAAA record unless IPv6 is separately configured. The host currently has IPv4 networking only.
- Allow DNS to propagate. The host's certificate bootstrap retries automatically; it may serve HTTP until Let's Encrypt can validate the domain. Check with `sudo systemctl status youniqlyf-certificate-bootstrap` through an SSM session and `sudo certbot certificates`.
- Verify renewal with `sudo certbot renew --dry-run`. The installed Certbot timer runs renewals automatically and reloads Nginx after a successful renewal.

### Database and runtime configuration

- Provision MySQL separately. For a database in AWS, allow access from the EC2 security group; for an external database, allow its outbound Elastic IP if the provider uses an IP allowlist.
- In Systems Manager Parameter Store, create SecureString parameters under `/youniqlyf/production/`. At minimum, add `DATABASE_URL` and `JWT_SECRET`. Add the applicable Cloudinary, Brevo, Razorpay, and mail-driver values from the root `.env.example`. The EC2 role can read only this parameter path.
- Use the AWS-managed `aws/ssm` KMS key for SecureString values unless you also grant the EC2 role decrypt access to a customer-managed KMS key.
- Do not put secret values in Terraform variables/state, GitHub workflow files, user data, or Git. `NEXT_PUBLIC_SITE_URL` is built from the reviewed `domain_name` in `deployment-target.json`; it is public configuration, not a secret.
- After the first deployment has applied committed migrations, create the initial admin account/seed once from a trusted environment. Do not run the seed script on each deploy. The pipeline uses `prisma migrate deploy`; it does not use `db:push` or `migrate dev` in production.

## What happens on a push

1. Pull requests and pushes to `main` install from `yarn.lock`, generate Prisma Client, apply committed migrations to a disposable GitHub Actions MySQL service, lint, test, and run `next build` on Node.js 24. CI never receives production secrets or connects to the production database.
2. For `main`, the workflow packages `.next/standalone`, `.next/static`, `public`, Prisma migrations, and the migration CLI into a commit-addressed artifact.
3. A separate deploy job assumes the account-pinned IAM role using GitHub OIDC, verifies the account ID, uploads the artifact to private S3, and invokes the EC2 instance using SSM.
4. EC2 downloads and verifies the artifact, loads SecureString runtime values, runs `prisma migrate deploy`, atomically switches releases, restarts the app, and checks `/api/health`. On application health-check failure it restores the prior release. Use backward-compatible expand/contract migrations because a database migration itself is not automatically reversed.

The app's CloudWatch log groups retain application and Nginx logs for 14 days. CPU and memory alarms are created but have no notification action; configure an SNS topic/action if you want email or pager alerts. Nginx limits request bodies to 100 MiB to support media uploads without accepting unbounded request bodies.

## Account-switch guardrails and limitations

- The account ID is checked by Terraform's AWS provider and checked again by the deployment workflow. The GitHub OIDC role trusts only this repository's `production` Environment.
- GitHub Actions OIDC trust includes immutable GitHub owner and repository IDs, preventing a different repository with the same name from assuming the deployment role.
- Account/region/domain/role target details live in a tracked file. An account switch requires a reviewed code change plus provisioning in the new account and updates to Terraform state/backend and GitHub's production Environment setup. The workflow does not discover or assume roles in another account.
- One `t3.small` is a cost-conscious starting point for fewer than 5,000 visits per day; builds run in GitHub Actions, not on EC2. This is a single point of failure and a deployment restart can briefly interrupt traffic. Resize if memory or CPU-credit metrics indicate pressure.
- Terraform changes are applied explicitly after reviewing `terraform plan`; pushes to `main` deploy application code only. No database or DNS changes are automatically applied.
