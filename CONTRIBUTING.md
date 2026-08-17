# Contributing to open-agent-hub

Thank you for your interest in contributing to open-agent-hub! We welcome contributions from the community to help make agents more capable and professional.

## 🚀 How to Contribute

### 1. Adding a New Skill
To contribute a new skill, please follow these steps:
1.  **Fork the repository** and create a new branch for your skill.
2.  **Use the Template**: Copy the contents of `template/SKILL.md` to a new directory under `skills/YOUR_SKILL_NAME/SKILL.md`.
3.  **Follow the Specification**: Ensure your skill follows the guidelines in `spec/Specification.md`.
4.  **Implement Logic**: Add any necessary Python scripts, JavaScript, or other resources in your skill's directory.
5.  **Test Your Skill**: Verify that the skill works as expected in a compatible environment (e.g., Claude Code, Antigravity, or Cursor).
6.  **Update the Index**: Run the indexing script or ensure your skill is added to `skills_index.json`.

### 2. Improving Documentation
We value clear documentation. You can improve existing manuals, README files, or add examples to current skills. 
- Technical manuals are located in the `docs/` directory.
- We maintain bilingual support (English/Chinese) for major documentation.

### 3. Reporting Bugs
Please use the [GitHub Issues](https://github.com/guanyang/open-agent-hub/issues) to report bugs or technical failures. Provide as much context as possible, including:
- The skill being used.
- The AI tool/Agent being used.
- Steps to reproduce the issue.

### 4. Code Quality
- Ensure scripts are well-commented and easy to read.
- Maintain consistency with the existing directory structure.
- Respect the [MIT License](LICENSE).

## 🛠 Development Workflow

1.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/antigravity-skills.git
    ```
2.  **Create a feature branch**:
    ```bash
    git checkout -b feat/my-new-skill
    ```
3.  **Commit your changes**:
    ```bash
    git commit -m "feat: add [skill-name] for [specific capability]"
    ```
4.  **Push to your fork and submit a Pull Request**.

## 🌟 Acknowledgments
By contributing, you agree that your contributions will be licensed under the project's MIT License. We look forward to your innovative skills!
