

My Organization

Home
Projects
Monitoring
Schedules
Traefik File System
Docker
Swarm
Requests
Settings
Web Server
Profile
Remote Servers
Users
SSH Keys
AI
Git
Registry
S3 Destinations
Certificates
Cluster
Notifications
Extra
Documentation
Support
Sponsor

CN
Account
rofizuhairr@gmail.com
Version v0.22.7

Projects
naty
portofolio

portofolio
naty-portofolio-z2kzq9
Dokploy Server
General
Environment
Domains
Preview Deployments
Schedules
Deployments
Logs
Monitoring
Advanced
Deployments
See all the 10 last deployments for this application

If you want to re-deploy this application use this URL in the config of your git provider or docker
Webhook URL:
https://admin.garasiproduksi.com/api/deploy/KZmC-jEZxhaCwfkiESaQX

1. error
Manual deployment

4 minutes ago
1m 52s
Application: portofolio - naty | Dokploy
Deployment
See all the details of this deployment | 

Initializing deployment
Clonning Repo github.com/wahyu688/naty-next.git to /etc/dokploy/applications/naty-portofolio-z2kzq9/code: ✅
Cloning into '/etc/dokploy/applications/naty-portofolio-z2kzq9/code'...
remote: Enumerating objects: 78, done.
Cloned github.com/wahyu688/naty-next.git: ✅
Build dockerfile: ✅
Source Type: github: ✅
#0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.57kB 0.0s done
#1 DONE 0.1s
#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 2.5s
#3 [internal] load .dockerignore
#3 transferring context:
#3 transferring context: 172B done
#3 DONE 8.2s
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 resolve docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 0.0s done
#4 sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 7.67kB / 7.67kB done
#4 sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb 1.72kB / 1.72kB done
#4 sha256:11cedc39e663e7c5d5cb9cc77a461a0d2adc25537b94e6831a6108f09cb2001b 6.52kB / 6.52kB done
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0B / 3.86MB 2.6s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 0B / 43.23MB 2.6s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0B / 1.26MB 2.6s
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 3.86MB / 3.86MB 3.0s
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 3.86MB / 3.86MB 3.0s done
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 0B / 445B 3.1s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 3.22MB / 43.23MB 3.2s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 7.34MB / 43.23MB 3.3s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 13.63MB / 43.23MB 3.5s
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0.4s done
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 445B / 445B 3.4s done
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 16.78MB / 43.23MB 3.6s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 19.92MB / 43.23MB 3.7s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 1.26MB / 1.26MB 3.7s done
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 27.26MB / 43.23MB 3.9s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 31.86MB / 43.23MB 4.1s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 34.60MB / 43.23MB 4.3s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 37.95MB / 43.23MB 4.4s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 43.23MB / 43.23MB 4.5s done
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287
#4 ...
#5 [internal] load build context
#5 ...
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 4.2s done
#4 ...
#5 [internal] load build context
#5 transferring context: 748.59kB 0.1s done
#5 DONE 14.4s
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 extracting sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0.1s done
#4 extracting sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 done
#4 DONE 14.7s
#6 [builder 1/4] WORKDIR /app
#6 DONE 0.3s
#7 [deps 1/4] RUN apk add --no-cache libc6-compat
#7 ...
#8 [runner 2/6] RUN addgroup --system --gid 1001 nodejs
#8 DONE 0.7s
#9 [runner 3/6] RUN adduser --system --uid 1001 nextjs
#9 DONE 0.4s
#7 [deps 1/4] RUN apk add --no-cache libc6-compat
#7 1.686 (1/3) Installing musl-obstack (1.2.3-r2)
#7 1.708 (2/3) Installing libucontext (1.3.3-r0)
#7 1.724 (3/3) Installing gcompat (1.1.0-r4)
#7 1.749 OK: 11.0 MiB in 21 packages
#7 DONE 1.8s
#10 [deps 2/4] WORKDIR /app
#10 DONE 0.1s
#11 [deps 3/4] COPY package.json package-lock.json* ./
#11 DONE 0.1s
#12 [deps 4/4] RUN npm ci
#12 4.718 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
#12 6.114 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#12 7.935 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
#12 7.947 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
#12 8.023 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
#12 9.422 npm warn deprecated glob@10.3.10: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
#12 12.53 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
#12 33.13 npm warn deprecated next@14.2.29: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
#12 33.43
#12 33.43 added 425 packages, and audited 426 packages in 33s
#12 33.43
#12 33.43 160 packages are looking for funding
#12 33.43   run `npm fund` for details
#12 33.61
#12 33.61 5 vulnerabilities (1 moderate, 4 high)
#12 33.61
#12 33.61 To address all issues (including breaking changes), run:
#12 33.61   npm audit fix --force
#12 33.61
#12 33.61 Run `npm audit` for details.
#12 33.61 npm notice
#12 33.61 npm notice New major version of npm available! 10.8.2 -> 11.17.0
#12 33.61 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
#12 33.61 npm notice To update run: npm install -g npm@11.17.0
#12 33.61 npm notice
#12 DONE 34.1s
#13 [builder 2/4] COPY --from=deps /app/node_modules ./node_modules
#13 DONE 5.2s
#14 [builder 3/4] COPY . .
#14 DONE 0.1s
#15 [builder 4/4] RUN npm run build
#15 0.785
#15 0.785 > naty-portfolio@0.1.0 build
#15 0.785 > next build
#15 0.785
#15 1.667   ▲ Next.js 14.2.29
#15 1.668
#15 1.688    Creating an optimized production build ...
#15 30.41  ✓ Compiled successfully
#15 30.41    Linting and checking validity of types ...
#15 39.15    Collecting page data ...
#15 39.75 Error: supabaseUrl is required.
#15 39.75     at /app/.next/server/chunks/370.js:37:56504
#15 39.75     at new rz (/app/.next/server/chunks/370.js:37:56755)
#15 39.75     at rY (/app/.next/server/chunks/370.js:37:61026)
#15 39.75     at 1926 (/app/.next/server/app/api/contact/route.js:1:2733)
#15 39.75     at t (/app/.next/server/webpack-runtime.js:1:127)
#15 39.75     at 5937 (/app/.next/server/app/api/contact/route.js:1:518)
#15 39.75     at t (/app/.next/server/webpack-runtime.js:1:127)
#15 39.75     at t (/app/.next/server/app/api/contact/route.js:1:2902)
#15 39.75     at /app/.next/server/app/api/contact/route.js:1:2937
#15 39.75     at t.X (/app/.next/server/webpack-runtime.js:1:1191)
#15 39.76
#15 39.76 > Build error occurred
#15 39.76 Error: Failed to collect page data for /api/contact
#15 39.76     at /app/node_modules/next/dist/build/utils.js:1269:15
#15 39.76     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
#15 39.76   type: 'Error'
#15 39.76 }
#15 39.79 npm notice
#15 39.79 npm notice New major version of npm available! 10.8.2 -> 11.17.0
#15 39.79 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
#15 39.79 npm notice To update run: npm install -g npm@11.17.0
#15 39.79 npm notice
#15 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
> [builder 4/4] RUN npm run build:
39.76 Error: Failed to collect page data for /api/contact
39.76     at /app/node_modules/next/dist/build/utils.js:1269:15
39.76     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
39.76   type: 'Error'
39.76 }
39.79 npm notice
39.79 npm notice New major version of npm available! 10.8.2 -> 11.17.0
39.79 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
39.79 npm notice To update run: npm install -g npm@11.17.0
39.79 npm notice
------
Dockerfile:25
--------------------
|
|     ENV NEXT_TELEMETRY_DISABLED=1
| >>> RUN npm run build
|
|     # ── 3. Production runner ──────────────────────────────────────
--------------------
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
Error ❌
#0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.57kB 0.0s done
#1 DONE 0.1s
#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 2.5s
#3 [internal] load .dockerignore
#3 transferring context:
#3 transferring context: 172B done
#3 DONE 8.2s
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 resolve docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 0.0s done
#4 sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 7.67kB / 7.67kB done
#4 sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb 1.72kB / 1.72kB done
#4 sha256:11cedc39e663e7c5d5cb9cc77a461a0d2adc25537b94e6831a6108f09cb2001b 6.52kB / 6.52kB done
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0B / 3.86MB 2.6s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 0B / 43.23MB 2.6s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0B / 1.26MB 2.6s
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 3.86MB / 3.86MB 3.0s
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 3.86MB / 3.86MB 3.0s done
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 0B / 445B 3.1s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 3.22MB / 43.23MB 3.2s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 7.34MB / 43.23MB 3.3s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 13.63MB / 43.23MB 3.5s
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0.4s done
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 445B / 445B 3.4s done
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 16.78MB / 43.23MB 3.6s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 19.92MB / 43.23MB 3.7s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 1.26MB / 1.26MB 3.7s done
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 27.26MB / 43.23MB 3.9s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 31.86MB / 43.23MB 4.1s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 34.60MB / 43.23MB 4.3s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 37.95MB / 43.23MB 4.4s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 43.23MB / 43.23MB 4.5s done
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287
#4 ...
#5 [internal] load build context
#5 ...
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 4.2s done
#4 ...
#5 [internal] load build context
#5 transferring context: 748.59kB 0.1s done
#5 DONE 14.4s
#4 [base 1/1] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 extracting sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0.1s done
#4 extracting sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 done
#4 DONE 14.7s
#6 [builder 1/4] WORKDIR /app
#6 DONE 0.3s
#7 [deps 1/4] RUN apk add --no-cache libc6-compat
#7 ...
#8 [runner 2/6] RUN addgroup --system --gid 1001 nodejs
#8 DONE 0.7s
#9 [runner 3/6] RUN adduser --system --uid 1001 nextjs
#9 DONE 0.4s
#7 [deps 1/4] RUN apk add --no-cache libc6-compat
#7 1.686 (1/3) Installing musl-obstack (1.2.3-r2)
#7 1.708 (2/3) Installing libucontext (1.3.3-r0)
#7 1.724 (3/3) Installing gcompat (1.1.0-r4)
#7 1.749 OK: 11.0 MiB in 21 packages
#7 DONE 1.8s
#10 [deps 2/4] WORKDIR /app
#10 DONE 0.1s
#11 [deps 3/4] COPY package.json package-lock.json* ./
#11 DONE 0.1s
#12 [deps 4/4] RUN npm ci
#12 4.718 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
#12 6.114 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#12 7.935 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
#12 7.947 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
#12 8.023 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
#12 9.422 npm warn deprecated glob@10.3.10: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
#12 12.53 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
#12 33.13 npm warn deprecated next@14.2.29: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
#12 33.43
#12 33.43 added 425 packages, and audited 426 packages in 33s
#12 33.43
#12 33.43 160 packages are looking for funding
#12 33.43   run `npm fund` for details
#12 33.61
#12 33.61 5 vulnerabilities (1 moderate, 4 high)
#12 33.61
#12 33.61 To address all issues (including breaking changes), run:
#12 33.61   npm audit fix --force
#12 33.61
#12 33.61 Run `npm audit` for details.
#12 33.61 npm notice
#12 33.61 npm notice New major version of npm available! 10.8.2 -> 11.17.0
#12 33.61 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
#12 33.61 npm notice To update run: npm install -g npm@11.17.0
#12 33.61 npm notice
#12 DONE 34.1s
#13 [builder 2/4] COPY --from=deps /app/node_modules ./node_modules
#13 DONE 5.2s
#14 [builder 3/4] COPY . .
#14 DONE 0.1s
#15 [builder 4/4] RUN npm run build
#15 0.785
#15 0.785 > naty-portfolio@0.1.0 build
#15 0.785 > next build
#15 0.785
#15 1.667   ▲ Next.js 14.2.29
#15 1.668
#15 1.688    Creating an optimized production build ...
#15 30.41  ✓ Compiled successfully
#15 30.41    Linting and checking validity of types ...
#15 39.15    Collecting page data ...
#15 39.75 Error: supabaseUrl is required.
#15 39.75     at /app/.next/server/chunks/370.js:37:56504
#15 39.75     at new rz (/app/.next/server/chunks/370.js:37:56755)
#15 39.75     at rY (/app/.next/server/chunks/370.js:37:61026)
#15 39.75     at 1926 (/app/.next/server/app/api/contact/route.js:1:2733)
#15 39.75     at t (/app/.next/server/webpack-runtime.js:1:127)
#15 39.75     at 5937 (/app/.next/server/app/api/contact/route.js:1:518)
#15 39.75     at t (/app/.next/server/webpack-runtime.js:1:127)
#15 39.75     at t (/app/.next/server/app/api/contact/route.js:1:2902)
#15 39.75     at /app/.next/server/app/api/contact/route.js:1:2937
#15 39.75     at t.X (/app/.next/server/webpack-runtime.js:1:1191)
#15 39.76
#15 39.76 > Build error occurred
#15 39.76 Error: Failed to collect page data for /api/contact
#15 39.76     at /app/node_modules/next/dist/build/utils.js:1269:15
#15 39.76     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
#15 39.76   type: 'Error'
#15 39.76 }
#15 39.79 npm notice
#15 39.79 npm notice New major version of npm available! 10.8.2 -> 11.17.0
#15 39.79 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
#15 39.79 npm notice To update run: npm install -g npm@11.17.0
#15 39.79 npm notice
#15 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
> [builder 4/4] RUN npm run build:
39.76 Error: Failed to collect page data for /api/contact
39.76     at /app/node_modules/next/dist/build/utils.js:1269:15
39.76     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
39.76   type: 'Error'
39.76 }
39.79 npm notice
39.79 npm notice New major version of npm available! 10.8.2 -> 11.17.0
39.79 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.17.0
39.79 npm notice To update run: npm install -g npm@11.17.0
39.79 npm notice
------
Dockerfile:25
--------------------
|
|     ENV NEXT_TELEMETRY_DISABLED=1
| >>> RUN npm run build
|
|     # ── 3. Production runner ──────────────────────────────────────
--------------------
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
Close