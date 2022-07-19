# techPath serverless API

## How to setup the project

- Clone the repository from:
  `git@github.com:movi-repo/techpath-backend.git`

- Set the project node version:
  `nvm use`

- Install needed node version if it is not available on your local:
  `nvm install`

- Install all dependencies:
  `yarn install`

## API documentation

API documentation resides on doc folder in the root. Double click on the index.html to see

- How to generate: All the documents will be generated based the routes.js file which resides inside src 
folder. Please follow the Swagger guidelines to write a new one. WHen there is a new API written we have to write
doc comments on above the each router. Then run the following command to update the API documentation,

`yarn run build-docs`

## How to run the project
- Run offline:
  `yarn offline`

## Branching Strategy

#### Main Branches

- `develop` (Main development branch)
- `uat`
- `master`
#### Feature Branches

##### Naming Conventions

- Feature: `f/<branch_name>`
- Bug: `b/<branch_name>`
- PR: `[jira_task_number]-<feature/bug_name>`

##### Create/Update SES email templates
- Create email template using MJML service
https://mjml.io/try-it-live/pfRlfjudv

- To create a new template
aws ses create-template --cli-input-json file://src/templates/email/welcome.json

- Update existing SES template
aws ses update-template --cli-input-json file://src/templates/email/welcome.json