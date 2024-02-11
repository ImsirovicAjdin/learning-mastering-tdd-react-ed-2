Pre-commit hooks can significantly enhance the development workflow, especially in a React/TypeScript codebase, by enforcing code quality, style consistency, and meaningful commit messages. Here are five examples of useful pre-commit hooks for such projects:

### 1. **ESLint Check**

This hook runs ESLint on staged `.ts` and `.tsx` files to ensure they adhere to defined coding standards before committing. It prevents commits if the linting fails.

```bash
#!/bin/sh

# Run ESLint on staged .ts and .tsx files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.tsx\?$')
[ -z "$staged_files" ] && exit 0

echo "Running ESLint..."
npm run eslint -- $staged_files

if [ $? -ne 0 ]; then
  echo "ESLint found issues. Commit aborted."
  exit 1
fi
```

### 2. **Prettier Format Check**

This hook ensures that all staged `.ts` and `.tsx` files are formatted according to Prettier's rules. If any files are not formatted correctly, the commit is aborted.

```bash
#!/bin/sh

# Check if staged .ts and .tsx files are formatted
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.tsx\?$')
[ -z "$staged_files" ] && exit 0

echo "Checking Prettier formatting..."
npm run prettier -- --list-different $staged_files

if [ $? -ne 0 ]; then
  echo "Prettier formatting issues found. Please format your files before committing."
  exit 1
fi
```

### 3. **TypeScript Compilation Check**

Before allowing a commit, this hook verifies that the TypeScript compiler (`tsc`) doesn't find any errors. This ensures that commits don't introduce any type errors.

```bash
#!/bin/sh

echo "Checking TypeScript compilation..."
npm run tsc -- --noEmit

if [ $? -ne 0 ]; then
  echo "TypeScript compilation failed. Commit aborted."
  exit 1
fi
```

### 4. **Unit Test Hook**

This hook runs unit tests on the staged `.ts` and `.tsx` files. It helps ensure that new changes do not break existing functionality. This example uses Jest, a popular testing framework.

```bash
#!/bin/sh

# Run Jest on staged .ts and .tsx files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.test\.tsx\?$')
[ -z "$staged_files" ] && exit 0

echo "Running Jest tests..."
npm run jest -- $staged_files

if [ $? -ne 0 ]; then
  echo "Jest tests failed. Commit aborted."
  exit 1
fi
```

### 5. **Commit Message Validation**

This hook checks that commit messages are descriptive and not just single or few words from a defined list of non-descriptive terms. It helps ensure that commit messages provide meaningful context about the changes.

```bash
#!/bin/sh

# Read the commit message from the file specified by the first argument
commit_message=$(cat "$1")
non_descriptive_terms=("fixes" "small refactoring" "changes" "updates")

for term in "${non_descriptive_terms[@]}"; do
  if [[ "$commit_message" == "$term" ]]; then
    echo "Commit message '$commit_message' is not descriptive."
    exit 1
  fi
done
```

For the commit message validation hook, ensure it's configured to run with the `commit-msg` hook point rather than `pre-commit`. You would place this script in `.git/hooks/commit-msg` and make it executable.

Each of these hooks can be adjusted according to your project's specific needs and preferences. Leveraging these hooks in a React/TypeScript codebase helps maintain high code quality, consistency, and ensures that team members contribute meaningful commit messages, facilitating a smoother development process.

* * *

Saving and sharing Git hooks within a project, especially across a team, can be a bit challenging since Git does not track the `.git/hooks` directory as part of the repository. However, there are effective strategies to manage and distribute custom Git hooks within your team:

### Using a Shared Scripts Directory

1. **Create a Directory for Hooks in Your Project**: Create a directory within your project to hold your Git hooks, e.g., `git_hooks/`.

2. **Add Your Hook Scripts**: Place your custom hook scripts in this directory. Make sure they are executable and properly named according to the hooks you intend to use (e.g., `pre-commit`, `commit-msg`).

3. **Make Scripts Executable**: Ensure your hook scripts are executable by running a command like `chmod +x git_hooks/*`.

4. **Instruct Team Members to Set Up Locally**: Include instructions in your `README.md` or a setup script in your repository that directs team members to set up the hooks locally. This setup can involve copying the hooks from `git_hooks/` to `.git/hooks/` or creating symlinks. A simple setup script (`setup-hooks.sh`) could look like this:

   ```bash
   #!/bin/sh
   # Script to set up Git hooks for the project

   HOOK_NAMES="pre-commit commit-msg"
   echo "Setting up Git hooks..."

   for hook in $HOOK_NAMES; do
     ln -s -f ../../git_hooks/$hook .git/hooks/$hook
   done

   echo "Git hooks set up successfully."
   ```

5. **Commit the Directory and Setup Script**: Add the `git_hooks/` directory and the setup script to your Git repository and commit them. This way, they are shared with any clone of the repository.

### Using a Git Hooks Management Tool

For a more streamlined approach, consider using a Git hooks management tool like `pre-commit` or `Husky`. These tools allow you to define hooks in a configuration file that's part of your repository, making it easy to share and synchronize hooks across your team.

#### Using `pre-commit`:

1. **Install `pre-commit`**: Direct team members to install the `pre-commit` tool. It can usually be installed globally via package managers like `pip` for Python or `brew` for macOS.

2. **Add a `.pre-commit-config.yaml`**: Create a configuration file in your repository root. Define hooks and their sources according to the `pre-commit` documentation.

3. **Install Hooks**: Direct team members to run `pre-commit install` to set up the hooks locally after cloning the repository.

#### Using `Husky` for Node.js Projects:

1. **Install `Husky`**: Add `Husky` as a development dependency in your project with `npm` or `yarn`.

2. **Configure Hooks in `package.json`**: Define your hooks and their commands directly in your `package.json` or in a separate `.huskyrc` file.

3. **Share with Team Members**: Once Husky and its configuration are committed to your repository, hooks will automatically be set up when team members `npm install` or `yarn install`.

### Platform Support

These approaches are platform-agnostic regarding where your repository is hosted. Whether your project is on GitHub, GitLab, Bitbucket, or any other Git repository hosting service, the strategy for sharing and synchronizing Git hooks among your team members remains the same. The key is ensuring that the hooks and their setup mechanism are part of the repository content, which gets shared naturally through Git operations.

 * * *

Creating effective pre-commit hooks can greatly improve the quality and maintainability of your React/JS front-end codebase. Below are seven examples of useful pre-commit hooks, including one that ensures commit messages are descriptive and not just a single word or a vague phrase. These hooks are intended to be placed in the `.git/hooks/pre-commit` script file and made executable.

### 1. **Linting with ESLint**

This hook runs ESLint on staged `.js` files to catch and fix linting errors before committing.

```bash
#!/bin/sh
files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
if [ -n "$files" ]; then
  npx eslint $files
fi
```

### 2. **Code Formatting with Prettier**

This hook checks if your staged files are formatted according to Prettier's rules. If not, the commit is aborted.

```bash
#!/bin/sh
files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
if [ -n "$files" ]; then
  npx prettier --check $files
  if [ $? -ne 0 ]; then
    echo "Prettier found unformatted files. Please format them before committing."
    exit 1
  fi
fi
```

### 3. **Unit Testing with Jest**

Ensure that all unit tests pass before allowing a commit. This hook runs Jest in CI mode.

```bash
#!/bin/sh
npx jest --bail --ci
if [ $? -ne 0 ]; then
  echo "Jest tests failed. Please fix the errors before committing."
  exit 1
fi
```

### 4. **Check for TODO Comments**

Prevent commits that have `TODO` comments, encouraging developers to complete tasks before committing.

```bash
#!/bin/sh
files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
if [ -n "$files" ]; then
  if grep -n 'TODO' $files; then
    echo "Your commit contains TODO comments. Please address them before committing."
    exit 1
  fi
fi
```

### 5. **Ensure Feature Branch Naming Convention**

Enforce a specific naming convention for your feature branches to keep your repository organized.

```bash
#!/bin/sh
branch_name=$(git symbolic-ref --short HEAD)
feature_branch_regex="^feature/"
if ! [[ $branch_name =~ $feature_branch_regex ]]; then
  echo "Branch name does not follow the 'feature/' naming convention."
  exit 1
fi
```

### 6. **Detect Large Files**

Prevent large files (e.g., over 1MB) from being committed, which can bloat the repository size.

```bash
#!/bin/sh
maxsize=1048576
files=$(git diff --cached --name-only --diff-filter=ACM)
for file in $files; do
  filesize=$(wc -c <"$file" | tr -d ' ')
  if [ $filesize -gt $maxsize ]; then
    echo "File $file is larger than $maxsize bytes. Consider reducing its size before committing."
    exit 1
  fi
done
```

### 7. **Commit Message Validator**

This hook checks for non-descriptive commit messages from a predefined list and rejects commits with such messages.

```bash
#!/bin/sh
commit_msg=$(cat $1)
non_descriptive_terms=("fixes" "small refactoring" "changes" "updates" "minor tweaks")
for term in "${non_descriptive_terms[@]}"; do
  if [[ "$commit_msg" == *"$term"* ]]; then
    echo "Commit message contains non-descriptive term: '$term'. Please provide a more descriptive message."
    exit 1
  fi
done
```

To use these hooks, you would typically place the script content into the `.git/hooks/pre-commit` file within your Git repository and make the file executable with `chmod +x .git/hooks/pre-commit`. Remember, for the commit message validator hook, you would use it as a `commit-msg` hook, not a `pre-commit` hook, and place it in `.git/hooks/commit-msg`.

These examples are tailored for a React/JS codebase and demonstrate how pre-commit hooks can automate and enforce various best practices, from code quality checks to commit message guidelines.