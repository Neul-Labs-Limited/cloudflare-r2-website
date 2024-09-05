# Cloudflare R2 Website

## Description

This project provides a comprehensive solution for setting up and deploying a website using Cloudflare R2 when your site exceeds the 20,000 page limit of Cloudflare Pages. It automates the process of creating the necessary Cloudflare infrastructure and sets up GitHub Actions for continuous deployment.

Version: 1.0.0
Author: Dipankar Sarkar
License: ISC

## Features

- Automated setup of Cloudflare R2 bucket
- Creation and configuration of Cloudflare Worker for serving content
- DNS record setup for custom domain
- GitHub Actions workflow for continuous deployment
- Optimized Hugo build and deployment process
- Automatic secret management for GitHub repository

## Prerequisites

- Node.js and npm installed
- Cloudflare account with R2 and Workers enabled
- GitHub repository for your Hugo site
- Hugo installed locally for development

## Obtaining Required Keys and Tokens

Before you begin the setup process, you'll need to obtain several keys and tokens. Here's how to get each one:

1. **Cloudflare API Token (CF_API_TOKEN)**:
   - Log in to your Cloudflare dashboard
   - Go to "My Profile" > "API Tokens"
   - Click "Create Token"
   - Use the "Edit zone DNS" template and add the "R2 Storage Bucket Item Admin" permission
   - Select your specific zone (domain) and account resources
   - Generate the token and copy it

2. **Cloudflare Account ID (CF_ACCOUNT_ID)**:
   - Log in to your Cloudflare dashboard
   - The Account ID is visible in the URL when you're on the Account Home page
   - It's a 32-character string

3. **Cloudflare Zone ID (CF_ZONE_ID)**:
   - In your Cloudflare dashboard, select the website you're working with
   - The Zone ID is visible on the right side of the "Overview" page

4. **GitHub Personal Access Token (GITHUB_TOKEN)**:
   - Go to your GitHub account settings
   - Select "Developer settings" > "Personal access tokens" > "Tokens (classic)"
   - Click "Generate new token"
   - Give it a name, and select the "repo" scope
   - Generate the token and copy it

5. **R2 Access Key ID and Secret Access Key (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)**:
   - In your Cloudflare dashboard, go to "R2"
   - Click on "Manage R2 API Tokens"
   - Create a new API token with read and write permissions
   - You'll receive an Access Key ID and Secret Access Key

6. **R2 Bucket Name (R2_BUCKET_NAME)**:
   - Choose a unique name for your R2 bucket
   - This will be created by the setup script

7. **Domain and Subdomain (DOMAIN, SUBDOMAIN)**:
   - Use your own domain that's managed by Cloudflare
   - Choose a subdomain for your website (e.g., 'www')

## Setup Instructions

1. Clone this repository:
   ```
   git clone https://github.com/dipankar/cloudflare-r2-website.git
   cd cloudflare-r2-website
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   CF_API_TOKEN=your_cloudflare_api_token
   CF_ACCOUNT_ID=your_cloudflare_account_id
   CF_ZONE_ID=your_cloudflare_zone_id
   GITHUB_TOKEN=your_github_personal_access_token
   R2_ACCESS_KEY_ID=your_r2_access_key_id
   R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
   R2_BUCKET_NAME=your_desired_bucket_name
   DOMAIN=your_domain.com
   SUBDOMAIN=www
   ```

4. Run the Cloudflare setup script:
   ```
   node setup_cloudflare.js
   ```
   This script will create the R2 bucket, set up the Worker, and configure DNS.

5. Set up GitHub repository secrets:
   ```
   node setup_github_secrets.js
   ```
   This script will automatically set the necessary secrets in your GitHub repository.

6. Copy the GitHub workflow file to your Hugo project:
   ```
   cp .github/workflows/hugo-deploy.yml /path/to/your/hugo/project/.github/workflows/
   ```

7. Commit and push the workflow file to your Hugo project repository.

## Usage

Once set up, the system works as follows:

1. Develop your Hugo site locally.
2. Commit and push changes to the `main` branch of your GitHub repository.
3. The GitHub Actions workflow will automatically build your Hugo site and deploy it to the Cloudflare R2 bucket.
4. The Cloudflare Worker will serve your site from the R2 bucket.

## File Structure

- `setup_cloudflare.js`: Script to set up Cloudflare infrastructure
- `setup_github_secrets.js`: Script to set up GitHub repository secrets
- `.github/workflows/hugo-deploy.yml`: GitHub Actions workflow for Hugo deployment
- `README.md`: This file

## Troubleshooting

- If you encounter issues with the Cloudflare setup, check your API token permissions and account/zone IDs.
- For GitHub Actions issues, verify that all secrets are correctly set in your repository.
- If your site isn't updating after push, check the GitHub Actions logs for any error messages.
- Ensure your Cloudflare account has R2 and Workers enabled. You may need to add a payment method even if you're within the free tier.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
