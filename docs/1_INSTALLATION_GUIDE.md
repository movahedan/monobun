# 🚀 Installation Guide

> **Complete step-by-step installation guide for Monobun monorepo**

This guide walks you through the complete installation process, from initial setup to development environment configuration and cleanup.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Step 1: Initial Setup](#-step-1-initial-setup)
- [Step 2: Local Development Setup](#-step-2-local-development-setup)
- [Step 3: DevContainer Setup](#-step-3-devcontainer-setup)
- [Step 4: CI/CD Setup](#-step-4-cicd-setup)
- [Step 5: Verification](#-step-5-verification)
- [Step 6: Cleanup Process](#-step-6-cleanup-process)
- [Troubleshooting](#-troubleshooting)

## 🎯 Prerequisites

Before starting, ensure you have the following installed:

### **Required Software**
- **[Git](https://git-scm.com/)**: Version control
- **[Bun](https://bun.sh/)**: JavaScript runtime and package manager
- **[VS Code](https://code.visualstudio.com/)**: Code editor
- **[Docker Desktop](https://docs.docker.com/desktop/)**: Container platform
- **[Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)**: VS Code extension

### **Install Bun**

Bun is the primary package manager and runtime for this project. Install it first:

#### **macOS/Linux:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

#### **Windows:**
```bash
# Install via PowerShell
powershell -c "irm bun.sh/install.ps1 | iex"

# Or install via Windows Subsystem for Linux (WSL)
# Follow the macOS/Linux instructions above
```

#### **Alternative Installation Methods:**
```bash
# Using npm (if you have Node.js installed)
npm install -g bun

# Using Homebrew (macOS)
brew tap oven-sh/bun
brew install bun

# Using Cargo (if you have Rust installed)
cargo install bun
```

**Expected Output:**
```bash
bun --version
# Should show something like: 1.3.1
```

### **VS Code Extensions**
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for and install:
   - **Dev Containers** by Microsoft
   - **Docker** by Microsoft (optional but recommended)

### **System Requirements**
- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: At least 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## 🚀 Step 1: Initial Setup

### **1.1 Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/movahedan/monobun.git

# Navigate to the project directory
cd monobun

# Verify the clone was successful
ls -la
```

**Expected Output:**
```
total 40
drwxr-xr-x  8 user user 4096 Jan 15 10:00 .
drwxr-xr-x  3 user user 4096 Jan 15 10:00 ..
drwxr-xr-x  8 user user 4096 Jan 15 10:00 .devcontainer
drwxr-xr-x  8 user user 4096 Jan 15 10:00 apps
drwxr-xr-x  8 user user 4096 Jan 15 10:00 docs
drwxr-xr-x  8 user user 4096 Jan 15 10:00 packages
drwxr-xr-x  8 user user 4096 Jan 15 10:00 scripts
-rw-r--r--  1 user user 2048 Jan 15 10:00 package.json
-rw-r--r--  1 user user 2048 Jan 15 10:00 README.md
```

### **1.2 Open in VS Code**

```bash
# Open the project in VS Code
code .
```

**Alternative Method:**
- Open VS Code manually
- Go to `File` → `Open Folder`
- Select the `monobun` directory

### **1.3 Verify Bun Installation**

Before proceeding, verify that Bun is properly installed and working:

```bash
# Check Bun version
bun --version

# Check if Bun can run scripts
bun --help
```

**Expected Output:**
```bash
bun --version
# 1.3.1

bun --help
# Usage: bun [COMMAND] [OPTIONS] [ARGUMENTS]
# 
# Commands:
#   install, i, add, a    Install packages
#   run, r                Run a script or package
#   test, t               Run tests
#   build, b              Build the project
#   ...
```

## 🔧 Step 2: Local Development Setup

### **2.1 Run Local Setup**

This step installs dependencies, builds packages, and configures the local development environment.

```bash
# Run the complete local setup
bun run local:setup
```

**What this command does:**
1. **📦 Install Dependencies**: `bun install`
2. **🔍 Code Quality**: `bun run check:fix`
3. **🔍 Type Checking**: `bun run check:types`
4. **🧪 Run Tests**: `bun run test`
5. **🏗️ Build Packages**: `bun run build`
6. **🎯 Sync VS Code**: `bun run local:vscode`

**Expected Output:**
```
🚀 Local Development Setup

📦 Installing dependencies...
✅ Dependencies installed successfully

🔍 Running code quality checks...
✅ Code quality checks passed

🔍 Running type checks...
✅ Type checks passed

🧪 Running tests...
✅ Tests passed

🏗️ Building packages...
✅ Packages built successfully

🎯 Syncing VS Code configuration...
✅ VS Code configuration synced

✅ Local development setup completed successfully!

💡 Useful commands:
 - bun run check:quick # Quick verification
 - bun run dev:setup # Setup DevContainer environment
 - bun run local:cleanup # Clean everything
```

### **2.2 Verify Local Setup**

```bash
# Run a quick verification
bun run check:quick
```

**Expected Output:**
```
✅ Quick verification completed successfully!
```

## 🐳 Step 3: DevContainer Setup

### **3.1 Open DevContainer**

1. **Open Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. **Search for DevContainer**: Type "Dev Containers: Reopen in Container"
3. **Select the Command**: Click on "Dev Containers: Reopen in Container"
4. **Wait for Build**: The DevContainer will build and start (this may take 5-10 minutes on first run)

**What happens during build:**
- Docker image is built with all development tools
- VS Code extensions are installed
- Development environment is configured
- Docker permissions are set up
- `act` tool is installed for CI/CD testing

### **3.2 Verify DevContainer Setup**

Once the DevContainer is open, verify the setup:

```bash
# Check DevContainer health
bun run dev:check
```

**Expected Output:**
```
🐳 DevContainer Health Check

🔍 Checking Docker availability...
✅ Docker is available

🔨 Testing DevContainer builds...
✅ DevContainer builds successfully

🏥 Checking service health...
✅ All services are healthy

📊 Health Status Report:
- Service: admin (Port: 3001) - ✅ Healthy
- Service: storefront (Port: 3002) - ✅ Healthy
- Service: api (Port: 3003) - ✅ Healthy

✅ DevContainer health check completed successfully!
```

### **3.3 Setup DevContainer Environment**

```bash
# Setup DevContainer environment
bun run dev:setup
```

**What this command does:**
1. **🔨 Build Images**: Builds all Docker images
2. **🚀 Start Services**: Starts all development services
3. **🏥 Health Checks**: Verifies all services are running

**Expected Output:**
```
🐳 DevContainer Setup

🔨 Building Docker images...
✅ Images built successfully

🚀 Starting services...
✅ Services started successfully

🏥 Running health checks...
✅ All services are healthy

✅ DevContainer setup completed successfully!
```

## 🔄 Step 4: CI/CD Setup

### **4.1 Verify CI/CD Tools**

The DevContainer automatically installs and configures CI/CD tools during setup. Let's verify:

```bash
# Check if act is installed (for local GitHub Actions testing)
act --version
```

**Expected Output:**
```
act version 0.2.49
```

### **4.2 Test CI/CD Pipeline**

```bash
# Test the CI/CD pipeline locally
bun run ci:check --help
```

**Expected Output:**
```
CI Check

Uses catthehacker/ubuntu:act-latest image which has unzip available for Bun setup

Usage:
  bun run ci:check -e <event> -w <workflow> [-v | --verbose]

Arguments:
  -v, --verbose     Enable verbose output
  -e, --event (required)     GitHub event to simulate (e.g., pull_request, push)
  -w, --workflow (required)     Workflow file to test (e.g., .github/workflows/Check.yml)

Examples:
  bun run ci:check -v --verbose -e pull_request -w .github/workflows/Check.yml
  bun run ci:check --event push --workflow .github/workflows/Build.yml
```

### **4.3 Test Branch Name Validation**

```bash
# Test branch name validation
bun run ci:branchname --help
```

**Expected Output:**
```
CI Branch Name Checker

Validates branch names against predefined patterns for CI/CD

Usage:
  bun run ci:branchname [--verbose] [--force-check]

Arguments:
  -v, --verbose     Enable verbose output
  -f, --force-check     Force check even in CI environment

Examples:
  bun run ci:branchname
  bun run ci:branchname --verbose
  bun run ci:branchname --force-check
```

## ✅ Step 5: Verification

### **5.1 Run Complete Verification**

```bash
# Run comprehensive verification
bun run check:quick
```

**Expected Output:**
```
🔍 Quick Verification

🔍 Running code quality checks...
✅ Code quality checks passed

🔍 Running type checks...
✅ Type checks passed

🧪 Running tests...
✅ Tests passed

🏗️ Building packages...
✅ Packages built successfully

✅ Quick verification completed successfully!
```

### **5.2 Check Service Status**

```bash
# Check all development services
bun run dev:health
```

**Expected Output:**
```
🐳 Development Services Status

Name                  Command               State           Ports
monobun-admin-1     bun run dev          Up              0.0.0.0:3001->3001/tcp
monobun-storefront  bun run dev          Up              0.0.0.0:3002->3002/tcp
monobun-api-1       bun run dev          Up              0.0.0.0:3003->3003/tcp
```

### **5.3 Test Applications**

Open your browser and verify the applications are running:

- **Admin Dashboard**: http://localhost:3001
- **Storefront**: http://localhost:3002
- **API**: http://localhost:3003

## 🧹 Step 6: Cleanup Process

### **6.1 DevContainer Cleanup**

When you're done developing in the DevContainer:

```bash
# Clean up DevContainer services and artifacts
bun run dev:cleanup
```

**What this command does:**
1. **🛑 Stop Services**: Stops all development services
2. **🗑️ Remove Containers**: Removes all containers
3. **🧹 Clean Artifacts**: Removes build artifacts and temporary files

**Expected Output:**
```
🧹 DevContainer Cleanup

🛑 Stopping services...
✅ Services stopped successfully

🗑️ Removing containers...
✅ Containers removed successfully

🧹 Cleaning artifacts...
✅ Artifacts cleaned successfully

✅ DevContainer cleanup completed successfully!
```

### **6.2 Exit DevContainer**

1. **Close VS Code**: Close the VS Code window
2. **Or Exit DevContainer**: Press `Ctrl+Shift+P` → "Dev Containers: Reopen Locally"

### **6.3 Host Machine Cleanup**

Once you're back on the host machine:

```bash
# Clean up everything on the host
bun run local:cleanup
```

**What this command does:**
1. **🐳 Docker Cleanup**: Removes all Docker containers, images, and networks
2. **📦 Node Cleanup**: Removes node_modules and build artifacts
3. **🗂️ File Cleanup**: Removes temporary files and caches

**Expected Output:**
```
🧹 Local Development Cleanup

🐳 Cleaning Docker resources...
✅ Docker resources cleaned successfully

📦 Cleaning Node.js artifacts...
✅ Node.js artifacts cleaned successfully

🗂️ Cleaning temporary files...
✅ Temporary files cleaned successfully

✅ Local cleanup completed successfully!

💡 To start fresh, run:
  - bun run local:setup # For local development
  - bun run dev:setup # For DevContainer development
```

### **6.4 Remove DevContainer (Optional)**

If you want to completely remove the DevContainer:

```bash
# Remove the VS Code DevContainer (run from host machine)
bun run dev:rm
```

**⚠️ Warning**: This will stop and remove the VS Code DevContainer itself.

**Expected Output:**
```
🐳 Stopping VS Code DevContainer...

🛑 Stopping VS Code DevContainer...
✅ DevContainer stopped successfully

🐳 Stopping all related containers...
✅ All containers stopped successfully

🗑️ Removing containers...
✅ All containers removed successfully

✅ DevContainer removal completed successfully!

💡 To start fresh, run:
  - bun run local:setup # For local development
  - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
  - Type 'Dev Containers: Reopen in Container' and select the command
  - bun run dev:setup # For DevContainer development
```

## 🔧 Troubleshooting

### **Common Issues**

#### **Bun Not Found**
```bash
# If bun command is not found, add to PATH
export PATH="$HOME/.bun/bin:$PATH"

# Or restart your terminal after installation
# On macOS/Linux, the installer should add this automatically
```

#### **Bun Installation Fails**
```bash
# Try alternative installation methods
npm install -g bun

# Or use Homebrew (macOS)
brew tap oven-sh/bun
brew install bun

# Check system requirements
# Bun requires macOS 10.15+, Linux, or Windows 10+
```

#### **Docker Not Running**
```bash
# Start Docker Desktop
# On macOS/Linux: sudo systemctl start docker
# On Windows: Start Docker Desktop application
```

#### **DevContainer Build Fails**
```bash
# Clean up and retry
bun run local:cleanup
bun run dev:rm
# Then reopen in DevContainer
```

#### **Port Conflicts**
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3003

# Kill conflicting processes or change ports in docker-compose.dev.yml
```

#### **Permission Issues**
```bash
# Fix Docker permissions (Linux/macOS)
sudo chmod 666 /var/run/docker.sock
sudo usermod -aG docker $USER
```

#### **VS Code Extensions Not Syncing**
```bash
# Manually sync VS Code configuration
bun run local:vscode
```

### **Getting Help**

- **Documentation**: Check the [docs](./) directory for detailed guides
- **Issues**: Create an issue on GitHub with detailed error messages
- **Community**: Join our community discussions

## 🎯 Next Steps

After successful installation:

1. **Explore the Codebase**: Check out the [apps](./apps) and [packages](./packages) directories
2. **Read Documentation**: Review the [docs](./docs) for detailed guides
3. **Start Developing**: Begin with the application in the [apps](./apps) directory
4. **Run Tests**: Use `bun run test` to run the test suite
5. **Check Quality**: Use `bun run check:quick` for code quality verification

---

**🎉 Congratulations! You've successfully installed and configured the Monobun monorepo development environment.** 