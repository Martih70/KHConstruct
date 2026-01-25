#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const printHeader = (title) => {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
};

const addResult = (testName, passed, message = '') => {
  if (passed) {
    results.passed.push(testName);
    log(`✓ ${testName}`, 'green');
    if (message) log(`  ${message}`, 'dim');
  } else {
    results.failed.push(testName);
    log(`✗ ${testName}`, 'red');
    if (message) log(`  ${message}`, 'dim');
  }
};

const addWarning = (testName, message) => {
  results.warnings.push({ test: testName, message });
  log(`⚠ ${testName}`, 'yellow');
  if (message) log(`  ${message}`, 'dim');
};

// Test functions
const testNodeVersion = () => {
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    addResult('Node.js Version', majorVersion >= 18, `Installed: ${nodeVersion}`);
  } catch (error) {
    addResult('Node.js Version', false, 'Node.js not found');
  }
};

const testPackageDependencies = () => {
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredDeps = ['express', 'better-sqlite3', 'zod', 'jsonwebtoken', 'bcrypt'];
    
    let allPresent = true;
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep]) {
        allPresent = false;
        break;
      }
    }
    
    addResult('Package Dependencies', allPresent, `Found ${Object.keys(packageJson.dependencies).length} dependencies`);
  } catch (error) {
    addResult('Package Dependencies', false, error.message);
  }
};

const testTypeScript = () => {
  try {
    execSync('npx tsc --version', { stdio: 'pipe' });
    addResult('TypeScript Compiler', true, 'tsc available');
  } catch (error) {
    addResult('TypeScript Compiler', false, 'TypeScript not properly installed');
  }
};

const testTypeScriptCompilation = () => {
  try {
    execSync('npm run type-check', { stdio: 'pipe', cwd: __dirname });
    addResult('TypeScript Type Checking', true, 'No type errors found');
  } catch (error) {
    addResult('TypeScript Type Checking', false, 'Type errors detected');
  }
};

const testConfigFile = () => {
  try {
    const configPath = path.join(__dirname, 'src', 'config', 'index.ts');
    const exists = fs.existsSync(configPath);
    addResult('Config File', exists, exists ? 'Configuration loaded' : 'config/index.ts missing');
  } catch (error) {
    addResult('Config File', false, error.message);
  }
};

const testEnvironmentVariables = () => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    const envExists = fs.existsSync(envPath);
    addResult('Environment File (.env)', envExists, envExists ? '.env file found' : 'Create .env from .env.example');
    
    if (fs.existsSync(envExamplePath)) {
      const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
      const requiredVars = ['DATABASE_PATH', 'PORT', 'NODE_ENV', 'JWT_SECRET'];
      const missingVars = [];
      
      for (const variable of requiredVars) {
        if (!exampleContent.includes(variable)) {
          missingVars.push(variable);
        }
      }
      
      if (missingVars.length > 0) {
        addWarning('.env.example', `Missing variables: ${missingVars.join(', ')}`);
      }
    }
  } catch (error) {
    addResult('Environment File (.env)', false, error.message);
  }
};

const testDatabaseStructure = () => {
  try {
    const databasePath = path.join(__dirname, 'src', 'database');
    const files = fs.readdirSync(databasePath);
    
    const requiredFiles = ['connection.ts', 'migrations.ts', 'seeds.ts'];
    const hasAllFiles = requiredFiles.every(file => files.includes(file));
    
    addResult('Database Structure (src)', hasAllFiles, `Found ${files.length} database configuration files`);
  } catch (error) {
    addResult('Database Structure (src)', false, error.message);
  }
};

const testRoutesExist = () => {
  try {
    const routesPath = path.join(__dirname, 'src', 'routes', 'v1');
    const routeFiles = fs.readdirSync(routesPath).filter(f => f.endsWith('.ts'));
    
    const expectedRoutes = [
      'auth.ts', 'clients.ts', 'contractors.ts', 'costCategories.ts',
      'costSubElements.ts', 'costItems.ts', 'units.ts', 'projects.ts',
      'projectEstimates.ts', 'bcis.ts'
    ];
    
    const missingRoutes = expectedRoutes.filter(route => !routeFiles.includes(route));
    
    addResult('API Routes', missingRoutes.length === 0, 
      `Found ${routeFiles.length}/${expectedRoutes.length} route files`);
    
    if (missingRoutes.length > 0) {
      addWarning('Missing Routes', `Missing: ${missingRoutes.join(', ')}`);
    }
  } catch (error) {
    addResult('API Routes', false, error.message);
  }
};

const testMiddleware = () => {
  try {
    const middlewarePath = path.join(__dirname, 'src', 'middleware');
    const files = fs.readdirSync(middlewarePath);
    
    const hasRateLimiter = files.includes('rateLimiter.ts');
    const hasAuth = files.some(f => f.includes('auth'));
    
    addResult('Middleware Files', files.length > 0, `Found ${files.length} middleware files`);
    
    if (!hasRateLimiter) {
      addWarning('Rate Limiter', 'rateLimiter.ts not found');
    }
    if (!hasAuth) {
      addWarning('Auth Middleware', 'Authentication middleware not found');
    }
  } catch (error) {
    addResult('Middleware Files', false, error.message);
  }
};

const testModels = () => {
  try {
    const modelsPath = path.join(__dirname, 'src', 'models');
    const files = fs.readdirSync(modelsPath).filter(f => f.endsWith('.ts'));
    
    addResult('Database Models', files.length > 0, `Found ${files.length} model files`);
  } catch (error) {
    addResult('Database Models', false, error.message);
  }
};

const testRepositories = () => {
  try {
    const reposPath = path.join(__dirname, 'src', 'repositories');
    const files = fs.readdirSync(reposPath).filter(f => f.endsWith('.ts'));
    
    addResult('Repositories', files.length > 0, `Found ${files.length} repository files`);
  } catch (error) {
    addResult('Repositories', false, error.message);
  }
};

const testServices = () => {
  try {
    const servicesPath = path.join(__dirname, 'src', 'services');
    const files = fs.readdirSync(servicesPath).filter(f => f.endsWith('.ts'));
    
    addResult('Service Layer', files.length > 0, `Found ${files.length} service files`);
  } catch (error) {
    addResult('Service Layer', false, error.message);
  }
};

const testUtilities = () => {
  try {
    const utilsPath = path.join(__dirname, 'src', 'utils');
    const files = fs.readdirSync(utilsPath).filter(f => f.endsWith('.ts'));
    
    addResult('Utility Functions', files.length > 0, `Found ${files.length} utility files`);
  } catch (error) {
    addResult('Utility Functions', false, error.message);
  }
};

const testBuildConfiguration = () => {
  try {
    const tsconfigPath = path.join(__dirname, 'tsconfig.json');
    const tsconfigExists = fs.existsSync(tsconfigPath);
    addResult('Build Configuration', tsconfigExists, 'tsconfig.json found');
  } catch (error) {
    addResult('Build Configuration', false, error.message);
  }
};

const testClientBuild = () => {
  try {
    const clientPath = path.join(__dirname, '..', 'client');
    const clientPackage = path.join(clientPath, 'package.json');
    
    if (fs.existsSync(clientPackage)) {
      const pkg = JSON.parse(fs.readFileSync(clientPackage, 'utf8'));
      const hasReact = !!pkg.dependencies.react;
      const hasBuildScript = !!pkg.scripts.build;
      
      addResult('Client (React)', hasReact && hasBuildScript, 'React client configured');
    }
  } catch (error) {
    addResult('Client (React)', false, error.message);
  }
};

const testCostEstimationFeature = () => {
  try {
    const costItemsRoute = path.join(__dirname, 'src', 'routes', 'v1', 'costItems.ts');
    const projectEstimatesRoute = path.join(__dirname, 'src', 'routes', 'v1', 'projectEstimates.ts');
    
    const hasCostItems = fs.existsSync(costItemsRoute);
    const hasProjectEstimates = fs.existsSync(projectEstimatesRoute);
    
    addResult('Cost Estimation Feature', hasCostItems && hasProjectEstimates, 
      'Cost items and estimates endpoints found');
  } catch (error) {
    addResult('Cost Estimation Feature', false, error.message);
  }
};

const printSummary = () => {
  printHeader('DIAGNOSTIC SUMMARY');
  
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;
  
  log(`\nTotal Tests: ${total}`, 'bright');
  log(`Passed: ${results.passed.length}`, 'green');
  log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');
  log(`Pass Rate: ${passRate}%\n`, passRate >= 85 ? 'green' : 'yellow');
  
  if (results.failed.length > 0) {
    log('FAILED TESTS:', 'red');
    results.failed.forEach(test => log(`  • ${test}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log('\nWARNINGS:', 'yellow');
    results.warnings.forEach(warning => {
      log(`  • ${warning.test}: ${warning.message}`, 'yellow');
    });
  }
  
  log(`\n${'='.repeat(60)}`, 'cyan');
  
  if (results.failed.length === 0 && passRate >= 85) {
    log('✓ KHConstruct is healthy and ready for development!', 'green');
  } else if (results.failed.length > 0) {
    log('✗ Fix the failed tests before proceeding', 'red');
  } else {
    log('⚠ Review warnings and address them', 'yellow');
  }
  
  log(`${'='.repeat(60)}\n`, 'cyan');
};

// Main execution
const main = () => {
  log('\n', 'cyan');
  printHeader('KHConstruct Diagnostic Tool v1.0');
  log('Running comprehensive health checks...', 'bright');
  
  // Environment
  printHeader('ENVIRONMENT CHECKS');
  testNodeVersion();
  testPackageDependencies();
  testEnvironmentVariables();
  
  // TypeScript
  printHeader('TYPESCRIPT & BUILD');
  testTypeScript();
  testTypeScriptCompilation();
  testBuildConfiguration();
  
  // Configuration
  printHeader('CONFIGURATION');
  testConfigFile();
  testDatabaseStructure();
  
  // Code Structure
  printHeader('CODE STRUCTURE');
  testRoutesExist();
  testMiddleware();
  testModels();
  testRepositories();
  testServices();
  testUtilities();
  
  // Features
  printHeader('FEATURE CHECKS');
  testCostEstimationFeature();
  testClientBuild();
  
  // Summary
  printSummary();
};

main();
