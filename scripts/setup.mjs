import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';

// Helper for colors
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

const ENV_PATH = path.join(process.cwd(), '.env');
const ENV_EXAMPLE_PATH = path.join(process.cwd(), '.env.example');

async function handleExistingEnvFile() {
  try {
    await fs.access(ENV_PATH);
    console.log(yellow("⚠️  Looks like you already have a `.env` file."));

    const content = await fs.readFile(ENV_PATH, 'utf-8');
    console.log(blue("\n--- Your current .env file: ---"));
    console.log(content);
    console.log("--------------------------------\n");

    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Do you want to create a new .env file? Your current one will be safely backed up to .env.bak.',
      default: false
    }]);

    if (!proceed) {
      console.log(green("\n👍 Alright, I've left your existing .env file untouched. Happy crawling!"));
      return false; // Signal to exit
    }

    await fs.rename(ENV_PATH, path.join(process.cwd(), '.env.bak'));
    console.log(green("✅ Your old .env file has been backed up to .env.bak.\n"));
    return true; // Signal to continue
  } catch (error) {
    // File doesn't exist, which is the normal case.
    return true; // Signal to continue
  }
}

async function main() {
  console.log(`\n${bold(blue("🔥 Welcome to the Firecrawl Self-Hosting Setup! 🔥"))}`);
  console.log("I'll guide you through creating your configuration file.\n");

  const shouldContinue = await handleExistingEnvFile();
  if (!shouldContinue) {
    return;
  }

  console.log(blue("Let's start with the essentials. Press Enter to accept the default values.\n"));

  const questions = [
    // --- Required ---
    {
      type: 'input',
      name: 'PORT',
      message: 'On which port should the Firecrawl API run?',
      default: '3002',
      validate: input => /^\d+$/.test(input) ? true : 'Please enter a valid port number.'
    },
    {
      type: 'input',
      name: 'BULL_AUTH_KEY',
      message: 'Enter a password to protect the job queue admin panel:',
      default: 'CHANGEME'
    },
    // --- Optional Sections ---
    {
      type: 'confirm',
      name: 'configureAi',
      message: '🚀 Next up: AI Features! Do you want to set up an AI provider (like OpenAI) now?',
      default: false
    },
    {
      type: 'input',
      name: 'OPENAI_API_KEY',
      message: 'Enter your OpenAI API Key:',
      when: answers => answers.configureAi,
      validate: input => input.length > 0 ? true : 'API Key cannot be empty.'
    },
    {
      type: 'confirm',
      name: 'configureProxy',
      message: '🌐 Need to use a proxy? Configure it now?',
      default: false
    },
    {
      type: 'input',
      name: 'PROXY_SERVER',
      message: 'Enter your proxy server URL (e.g., http://proxy.example.com:8080):',
      when: answers => answers.configureProxy,
      validate: input => input.startsWith('http') ? true : 'Please enter a full URL (e.g., http://...)'
    },
    {
      type: 'input',
      name: 'PROXY_USERNAME',
      message: 'Enter proxy username (optional, press Enter to skip):',
      when: answers => answers.configureProxy
    },
    {
      type: 'password',
      name: 'PROXY_PASSWORD',
      message: 'Enter proxy password (optional, press Enter to skip):',
      mask: '*',
      when: answers => answers.configureProxy
    },
  ];

  const answers = await inquirer.prompt(questions);

  // Generate the .env file from the template
  let envTemplate = await fs.readFile(ENV_EXAMPLE_PATH, 'utf-8');

  // Replace values in the template
  for (const [key, value] of Object.entries(answers)) {
    // Only process answers that are strings and have a value.
    // This avoids trying to write the boolean 'when' flags to the file.
    if (typeof value === 'string' && value) {
      const regex = new RegExp(`^#?\\s*${key}=.*`, 'm');
      envTemplate = envTemplate.replace(regex, `${key}=${value}`);
    }
  }

  await fs.writeFile(ENV_PATH, envTemplate);

  console.log(green("\n🎉 All done! Your `.env` file has been created successfully."));
  console.log("You can always edit it manually later to change advanced settings.");
  console.log(blue("\n🚀 Now you can start Firecrawl by running:"));
  console.log(bold("docker compose up\n"));
}

main().catch(error => {
  // Inquirer throws an error when the prompt is exited, e.g., by Ctrl+C
  if (error.isTtyError) {
    console.log(red("\n👋 Setup cancelled. No changes have been made."));
  } else {
    console.error(red("\nAn unexpected error occurred during setup:"));
    console.error(error);
  }
  process.exit(1);
});
