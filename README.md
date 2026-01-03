# Executable Verification Skill for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude-Code-blue.svg)](https://claude.com/claude-code)

An evolution of RPI (Research, Plan, Implement) where **each phase outputs runnable code that proves assumptions** instead of prose summaries.

## 🎯 What is Executable Verification?

Traditional RPI workflows have AI agents write markdown summaries at each phase:
- Research: "The project uses Next.js" ← *Hope it's accurate*
- Planning: "We'll add auth to the service layer" ← *Seems reasonable*
- Implementation: Code (finally something verifiable!)

**Executable Verification** improves this by making every phase produce executable code:
- **Research**: Scripts that **prove** architectural patterns via AST analysis
- **Planning**: Scripts that **validate** integration points are ready
- **Implementation**: Standard tests that **verify** features work

### The Cumulative Principle

Each phase verifies what it needs - avoiding duplication, not depth:

| Phase | Focus | Verification |
|-------|-------|--------------|
| Research | Codebase assumptions | AST, web scraping, user prompts, system state |
| Planning | Preconditions for steps | New integration points (can be deep if needed) |
| Implementation | Behavior | Standard tests |

## ✨ Features

- 🔍 **Deep Research Verification** - AST parsing, web scraping, user prompts, system state
- ✅ **Planning Precondition Checks** - Verify integration points, avoid duplicating research
- 🧪 **Standard Implementation Tests** - Unit/integration testing patterns
- 📚 **Comprehensive Documentation** - Detailed guides for each phase
- 🎨 **Ready-to-Use Templates** - TypeScript, JavaScript, and planning templates
- 🚀 **One-Command Setup** - Bootstrap script for instant start
- 📦 **Project or Global** - Install per-project or globally for all your work

## 🚀 Quick Start

### Option 1: Project-Level Installation (Recommended)

Install the skill in your current project:

\`\`\`bash
# Clone into your project
mkdir -p .claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git .claude/skills/executable-verification

# Or download and extract
curl -L https://github.com/andrueanderson/claude-skill-executable-verification/archive/main.tar.gz | tar xz
mv claude-skill-executable-verification-main .claude/skills/executable-verification
\`\`\`

### Option 2: Global Installation

Install once, use in all projects:

\`\`\`bash
# Clone to global skills directory
mkdir -p ~/.claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git ~/.claude/skills/executable-verification
\`\`\`

### Verify Installation

Ask Claude Code:
\`\`\`
"What skills are available?"
\`\`\`

You should see \`executable-verification\` in the list.

## 📖 Usage

### Automatic Activation

The skill automatically activates when you:
- Implement complex features
- Refactor large codebases
- Work with unfamiliar code
- Make architectural changes

**Example prompts:**
\`\`\`
"Implement OAuth authentication"
"Refactor the auth system to support multiple providers"
"Add real-time notifications using WebSockets"
\`\`\`

### Manual Activation

Explicitly request the skill:
\`\`\`
"Use executable verification to implement user roles and permissions"
\`\`\`

### Quick Bootstrap

Initialize verification in your project:

\`\`\`bash
.claude/skills/executable-verification/scripts/init-verification.sh
\`\`\`

This creates:
- \`research/assumptions.ts\` - Research verification template
- \`planning/preconditions.ts\` - Planning verification template
- Installs dependencies (ts-morph, tsx)
- Adds verification scripts to package.json

## 🎬 Live Demo

See executable verification in action:
- **Blog Post**: [Beyond RPI: Make Your AI Verify Its Assumptions](https://andrueslab.com/topics/artificial-intelligence/executable-verification)
- **Live Demo**: [Bookmark Tool Implementation](https://andrueslab.com/conversations/executable-verification-demo)
- **Source Code**: [Verification Scripts](https://github.com/andrueanderson/andrueslab/tree/main/research)

## 📚 Documentation

The skill includes comprehensive documentation:

- **[SKILL.md](SKILL.md)** - Core workflow and principles (loaded by Claude)
- **[research-phase.md](research-phase.md)** - Deep AST analysis techniques
- **[planning-phase.md](planning-phase.md)** - Precondition check patterns
- **[implementation-phase.md](implementation-phase.md)** - Testing best practices
- **[USAGE.md](USAGE.md)** - Complete usage guide with examples

## 📁 Templates

Ready-to-use templates in \`templates/\`:

- \`research-typescript.ts\` - TypeScript research with ts-morph
- \`research-javascript.js\` - JavaScript research with file operations
- \`planning-template.ts\` - Planning preconditions template
- \`package.json\` - Verification script commands

## 🔧 Example Workflow

### 1. Research Phase

\`\`\`bash
npx tsx research/bookmark-feature.ts
\`\`\`

**Output:**
\`\`\`
✅ Project uses Next.js 15 with App Router
✅ Sidebar navigation is centralized
✅ Components use shadcn/ui
✅ All 12 assumptions verified!
\`\`\`

### 2. Planning Phase

\`\`\`bash
npx tsx planning/bookmark-feature.ts
\`\`\`

**Output:**
\`\`\`
✅ READY Create feature component
✅ READY Add to sidebar navigation
✅ READY Add local storage persistence
✅ 9/10 steps ready!
\`\`\`

### 3. Implementation

Build your feature, then run tests:

\`\`\`bash
npm test
\`\`\`

Scripts are named after the feature (e.g., \`bookmark-feature.ts\`) so they accumulate over time and can be re-run in future sessions.

## 🎯 Benefits

1. **Failures Are Localized** - Know exactly which assumption broke
2. **Self-Correcting** - Actionable error messages guide fixes
3. **Fewer Human Touchpoints** - Machine validates research/planning
4. **Reproducible Context** - Re-run verification in new conversations
5. **Auditable Trail** - Every decision has proof

## 🛠️ Requirements

- **Claude Code** - This is a Claude Code skill
- **TypeScript/JavaScript project** - For full AST analysis features
- **ts-morph** (optional) - For deep TypeScript verification
- **tsx** (optional) - For running verification scripts

## 📦 What's Included

\`\`\`
executable-verification/
├── SKILL.md                      # Main skill definition
├── README.md                     # This file
├── USAGE.md                      # Detailed usage guide
├── research-phase.md             # Research methodology
├── planning-phase.md             # Planning methodology
├── implementation-phase.md       # Implementation methodology
├── scripts/
│   └── init-verification.sh      # Bootstrap script
└── templates/
    ├── research-typescript.ts    # TypeScript research template
    ├── research-javascript.js    # JavaScript research template
    ├── planning-template.ts      # Planning template
    ├── package.json              # NPM scripts
    └── README.md                 # Template guide
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Ideas for Contributions

- Python templates (using \`ast\` module)
- Go templates (using \`go/parser\`)
- Rust templates (using \`syn\`)
- Additional verification patterns
- More comprehensive examples
- Integration with CI/CD

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Credits

Created by [Andrue Anderson](https://andrueslab.com)

Inspired by the concept of executable verification as an evolution of RPI workflows.

Shoutout to:
- [@dexhorthy](https://x.com/dexhorthy) for popularizing RPI
- [@GeoffreyHuntley](https://x.com/GeoffreyHuntley) for the "Ralph Wiggum" approach

## 🔗 Links

- [Blog Post](https://andrueslab.com/topics/artificial-intelligence/executable-verification) - Deep dive into the concept
- [Live Demo](https://andrueslab.com/conversations/executable-verification-demo) - See it in action
- [Author's Website](https://andrueslab.com)
- [Claude Code](https://claude.com/claude-code) - The CLI tool this skill is for

## ⭐ Show Your Support

If you find this skill useful, please consider:
- ⭐ Starring the repository
- 🐦 Sharing on social media
- 📝 Writing about your experience using it
- 🤝 Contributing improvements

---

**Built with ❤️ for autonomous AI development**
