#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const repoRoot = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[90m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function format(color, text) {
  return `${colors[color] || ''}${text}${colors.reset}`;
}

const targets = {
  claude: {
    project: '.claude',
    global: path.join(os.homedir(), '.claude')
  },
  antigravity: {
    project: '.agent',
    global: path.join(os.homedir(), '.gemini', 'antigravity')
  },
  gemini: {
    project: '.gemini',
    global: path.join(os.homedir(), '.gemini')
  },
  codex: {
    project: '.codex',
    global: path.join(os.homedir(), '.codex')
  },
  cursor: {
    project: '.cursor',
    global: path.join(os.homedir(), '.cursor')
  },
  trae: {
    project: '.trae',
    global: path.join(os.homedir(), '.trae')
  },
  opencode: {
    project: '.opencode',
    global: path.join(os.homedir(), '.config', 'opencode')
  }
};

function parseArgs(args) {
  const options = {
    global: false,
    project: true,
    target: 'claude',
    positionals: []
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-g' || arg === '--global') {
      options.global = true;
      options.project = false;
    } else if (arg === '-p' || arg === '--project') {
      options.project = true;
      options.global = false;
    } else if (arg === '-t' || arg === '--target' || arg === '--assistant' || arg === '--host' || arg === '--tool') {
      const val = args[i + 1];
      if (val && !val.startsWith('-')) {
        options.target = val.toLowerCase();
        i++;
      } else {
        console.error(colors.red + `错误: ${arg} 选项缺少参数` + colors.reset);
        process.exit(1);
      }
    } else if (arg.startsWith('--target=')) {
      options.target = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--assistant=')) {
      options.target = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--host=')) {
      options.target = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--tool=')) {
      options.target = arg.split('=')[1].toLowerCase();
    } else {
      options.positionals.push(arg);
    }
  }
  return options;
}

const parsed = parseArgs(process.argv.slice(2));

if (parsed.target !== 'all' && !targets[parsed.target]) {
  console.error(format('red', `错误: 不支持的目标环境 "${parsed.target}"。`));
  console.log(`支持的目标环境列表: ${Object.keys(targets).join(', ')}, all`);
  process.exit(1);
}

function getTargetDirs(targetName, isProject) {
  const target = targets[targetName];
  if (!target) {
    console.error(format('red', `错误: 不支持的目标环境 "${targetName}"。`));
    console.log(`支持的目标环境列表: ${Object.keys(targets).join(', ')}`);
    process.exit(1);
  }

  const baseDir = isProject ? path.join(process.cwd(), target.project) : target.global;

  return {
    skills: path.join(baseDir, 'skills'),
    agents: path.join(baseDir, 'agents'),
    commands: path.join(baseDir, 'commands')
  };
}

function getTargetDirsForTarget(targetName, isProject) {
  const resolved = getTargetDirs(targetName, isProject);
  return {
    skills: process.env.OPEN_AGENT_SKILLS_DIR || resolved.skills,
    agents: process.env.OPEN_AGENT_AGENTS_DIR || resolved.agents,
    commands: process.env.OPEN_AGENT_COMMANDS_DIR || resolved.commands
  };
}

function scanComponents() {
  const components = {
    skills: [],
    agents: [],
    commands: []
  };

  const types = ['skills', 'agents', 'commands'];
  for (const type of types) {
    const dir = path.join(repoRoot, type);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.') || file.toLowerCase() === 'readme.md') {
        continue;
      }
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      
      if (type === 'skills') {
        if (stats.isDirectory()) {
          components.skills.push({
            id: file,
            path: fullPath,
            isDirectory: true
          });
        }
      } else if (type === 'agents') {
        const id = file.endsWith('.md') ? file.slice(0, -3) : file;
        components.agents.push({
          id: id,
          filename: file,
          path: fullPath,
          isDirectory: stats.isDirectory()
        });
      } else if (type === 'commands') {
        const ext = path.extname(file);
        const id = ext ? file.slice(0, -ext.length) : file;
        components.commands.push({
          id: id,
          filename: file,
          path: fullPath,
          isDirectory: stats.isDirectory()
        });
      }
    }
  }

  components.skills.sort((a, b) => a.id.localeCompare(b.id));
  components.agents.sort((a, b) => a.id.localeCompare(b.id));
  components.commands.sort((a, b) => a.id.localeCompare(b.id));

  return components;
}

function findComponent(name) {
  const components = scanComponents();
  const found = [];
  for (const type of ['skills', 'agents', 'commands']) {
    const match = components[type].find(c => c.id === name);
    if (match) {
      found.push({ type, ...match });
    }
  }
  return found;
}

function getLstatSafe(p) {
  try {
    return fs.lstatSync(p);
  } catch (err) {
    return null;
  }
}

function checkLinkStatus(srcPath, destPath) {
  const lstat = getLstatSafe(destPath);
  if (!lstat) {
    return { status: 'none', message: '未连接' };
  }
  if (lstat.isSymbolicLink()) {
    try {
      const existingTarget = fs.readlinkSync(destPath);
      const destDir = path.dirname(destPath);
      const resolvedExisting = path.resolve(destDir, existingTarget);
      const resolvedSrc = path.resolve(srcPath);
      if (resolvedExisting === resolvedSrc) {
        return { status: 'linked', message: '已连接' };
      } else {
        return { status: 'mismatch', message: `指向其他位置: ${resolvedExisting}` };
      }
    } catch (e) {
      return { status: 'broken', message: '损坏的软链接' };
    }
  }
  return { status: 'physical', message: '存在物理文件/目录' };
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createSymlink(srcPath, destPath) {
  const destDir = path.dirname(destPath);
  ensureDirSync(destDir);

  const statusInfo = checkLinkStatus(srcPath, destPath);

  if (statusInfo.status === 'linked') {
    return { status: 'exists', message: '已是正确软链接' };
  }

  if (statusInfo.status === 'physical') {
    return { status: 'error', message: '目标路径已存在物理文件/目录，未覆盖' };
  }

  if (statusInfo.status === 'broken' || statusInfo.status === 'mismatch') {
    fs.unlinkSync(destPath);
  }

  const stats = fs.statSync(srcPath);
  const type = stats.isDirectory() ? 'dir' : 'file';
  fs.symlinkSync(srcPath, destPath, type);
  return { status: 'created', message: '已创建软链接' };
}

function removeSymlink(srcPath, destPath) {
  const statusInfo = checkLinkStatus(srcPath, destPath);
  if (statusInfo.status === 'linked' || statusInfo.status === 'broken') {
    fs.unlinkSync(destPath);
    return { status: 'removed', message: '已成功移除软链接' };
  } else if (statusInfo.status === 'mismatch') {
    return { status: 'skipped', message: `跳过 (指向外部位置: ${statusInfo.message})` };
  } else if (statusInfo.status === 'physical') {
    return { status: 'skipped', message: '跳过 (目标是物理文件/目录)' };
  }
  return { status: 'none', message: '无需移除 (未连接)' };
}

function listComponents() {
  const components = scanComponents();
  console.log(format('bold', `=== ${format('cyan', 'open-agent-hub')} 可用组件列表 ===\n`));

  const types = ['skills', 'agents', 'commands'];
  for (const type of types) {
    const items = components[type];
    console.log(`${format('bold', type.toUpperCase())} ${format('dim', `(${items.length} 个可用):`)}`);
    if (items.length === 0) {
      console.log(`  ${format('dim', '(无)')}`);
    } else {
      const lineLimit = 4;
      let line = [];
      for (const item of items) {
        line.push(format('cyan', item.id));
        if (line.length === lineLimit) {
          console.log(`  ${line.join(', ')}`);
          line = [];
        }
      }
      if (line.length > 0) {
        console.log(`  ${line.join(', ')}`);
      }
    }
    console.log();
  }
}

function statusComponents() {
  const components = scanComponents();
  const activeTargets = parsed.target === 'all' 
    ? Object.keys(targets) 
    : [parsed.target];

  console.log(format('bold', `=== ${format('cyan', 'open-agent-hub')} 本地环境激活状态 ===\n`));

  for (const targetName of activeTargets) {
    const tDirs = getTargetDirsForTarget(targetName, parsed.project);
    console.log(format('bold', `--- 目标环境: ${targetName.toUpperCase()} (${parsed.project ? '项目级' : '全局'}) ---`));
    
    let totalCount = 0;
    let activeCount = 0;

    const types = ['skills', 'agents', 'commands'];
    for (const type of types) {
      const items = components[type];
      console.log(`  ${format('bold', type.toUpperCase())} ${format('dim', `(${items.length} 个):`)}`);
      if (items.length === 0) {
        console.log(`    ${format('dim', '(无)')}`);
        console.log();
        continue;
      }

      for (const item of items) {
        totalCount++;
        const filename = item.filename || item.id;
        const destPath = path.join(tDirs[type], filename);
        const linkStatus = checkLinkStatus(item.path, destPath);

        let statusStr = '';
        if (linkStatus.status === 'linked') {
          statusStr = format('green', '🟢 已激活');
          activeCount++;
        } else if (linkStatus.status === 'physical') {
          statusStr = format('yellow', '⚠ 冲突(物理文件)');
        } else if (linkStatus.status === 'broken') {
          statusStr = format('red', '✕ 损坏的软链接');
        } else if (linkStatus.status === 'mismatch') {
          statusStr = format('yellow', '⚠ 指向其他位置');
        } else {
          statusStr = format('dim', '⚪ 未激活');
        }

        if (parsed.target !== 'all' || linkStatus.status === 'linked' || linkStatus.status === 'physical' || linkStatus.status === 'broken') {
          console.log(`    - ${item.id.padEnd(35)} [${statusStr}]`);
        }
      }
      console.log();
    }

    console.log(`  ${format('bold', '统计摘要:')} 共 ${totalCount} 个组件，已激活 ${activeCount} 个。`);
    console.log(`  软链接路径:`);
    console.log(`    - Skills:   ${format('dim', tDirs.skills)}`);
    console.log(`    - Agents:   ${format('dim', tDirs.agents)}`);
    console.log(`    - Commands: ${format('dim', tDirs.commands)}\n`);
  }
}

function enableComponent(name) {
  const isAll = name === '--all' || name === '-a';
  const isSkills = name === '--skills';
  const isAgents = name === '--agents';
  const isCommands = name === '--commands';

  const activeTargets = parsed.target === 'all' 
    ? Object.keys(targets) 
    : [parsed.target];

  if (isAll || isSkills || isAgents || isCommands) {
    const components = scanComponents();
    const typesToProcess = [];
    if (isAll || isSkills) typesToProcess.push('skills');
    if (isAll || isAgents) typesToProcess.push('agents');
    if (isAll || isCommands) typesToProcess.push('commands');

    const counts = typesToProcess.map(t => `${components[t].length} 个 ${t.toUpperCase()}`).join(', ');
    console.log(format('bold', `正在激活指定类型的全部组件 (${counts}) 至目标环境 [${activeTargets.join(', ')}]...`));
    
    let totalSuccess = 0;
    let totalError = 0;

    for (const targetName of activeTargets) {
      const tDirs = getTargetDirsForTarget(targetName, parsed.project);
      console.log(`\n--- 激活至 ${targetName.toUpperCase()} (${parsed.project ? '项目级' : '全局'}) ---`);

      for (const type of typesToProcess) {
        const items = components[type];
        if (items.length === 0) continue;
        console.log(`  处理 ${format('blue', type.toUpperCase())}:`);
        for (const item of items) {
          const filename = item.filename || item.id;
          const destPath = path.join(tDirs[type], filename);
          const result = createSymlink(item.path, destPath);
          if (result.status === 'created' || result.status === 'recreated' || result.status === 'exists') {
            if (result.status !== 'exists') {
              console.log(`    - ${format('green', '✓')} ${item.id} -> ${result.message}`);
            }
            totalSuccess++;
          } else {
            console.error(`    - ${format('red', '✕')} ${item.id} -> ${result.message}`);
            totalError++;
          }
        }
      }
    }
    console.log(`\n${format('bold', '批量激活完成:')} 累计成功 ${totalSuccess} 次，失败 ${totalError} 次。`);
    return;
  }

  const found = findComponent(name);
  if (found.length === 0) {
    console.error(format('red', `错误: 找不到组件 "${name}"。`));
    console.log(`运行 ${format('cyan', 'open-agent list')} 查看所有可用的组件。`);
    process.exit(1);
  }

  console.log(format('bold', `正在激活组件 "${name}" 至目标环境 [${activeTargets.join(', ')}]...`));
  for (const targetName of activeTargets) {
    const tDirs = getTargetDirsForTarget(targetName, parsed.project);
    console.log(`\n--- 激活至 ${targetName.toUpperCase()} (${parsed.project ? '项目级' : '全局'}) ---`);
    for (const comp of found) {
      const filename = comp.filename || comp.id;
      const destPath = path.join(tDirs[comp.type], filename);
      try {
        const result = createSymlink(comp.path, destPath);
        const color = result.status === 'error' ? 'red' : (result.status === 'exists' ? 'dim' : 'green');
        const char = result.status === 'error' ? '✕' : (result.status === 'exists' ? '○' : '✓');
        console.log(`  - ${format(color, char)} [${comp.type.toUpperCase()}] ${filename} -> ${result.message}`);
      } catch (err) {
        console.error(`  - ${format('red', '✕')} [${comp.type.toUpperCase()}] ${filename} -> 发生错误: ${err.message}`);
      }
    }
  }
}

function disableComponent(name) {
  const isAll = name === '--all' || name === '-a';
  const isSkills = name === '--skills';
  const isAgents = name === '--agents';
  const isCommands = name === '--commands';

  const activeTargets = parsed.target === 'all' 
    ? Object.keys(targets) 
    : [parsed.target];

  if (isAll || isSkills || isAgents || isCommands) {
    const components = scanComponents();
    const typesToProcess = [];
    if (isAll || isSkills) typesToProcess.push('skills');
    if (isAll || isAgents) typesToProcess.push('agents');
    if (isAll || isCommands) typesToProcess.push('commands');

    const counts = typesToProcess.map(t => `${components[t].length} 个 ${t.toUpperCase()}`).join(', ');
    console.log(format('bold', `正在禁用指定类型的全部组件 (${counts}) 从目标环境 [${activeTargets.join(', ')}]...`));
    
    let totalSuccess = 0;
    let totalError = 0;

    for (const targetName of activeTargets) {
      const tDirs = getTargetDirsForTarget(targetName, parsed.project);
      console.log(`\n--- 从 ${targetName.toUpperCase()} 清理 (${parsed.project ? '项目级' : '全局'}) ---`);

      for (const type of typesToProcess) {
        const items = components[type];
        if (items.length === 0) continue;
        console.log(`  清理 ${format('blue', type.toUpperCase())}:`);
        for (const item of items) {
          const filename = item.filename || item.id;
          const destPath = path.join(tDirs[type], filename);
          const result = removeSymlink(item.path, destPath);
          if (result.status === 'removed') {
            console.log(`    - ${format('green', '✓')} ${item.id} -> ${result.message}`);
            totalSuccess++;
          } else if (result.status === 'none') {
            // Bulk mode: skip logging unlinked ones to keep terminal clean
          } else {
            console.warn(`    - ${format('yellow', '⚠')} ${item.id} -> ${result.message}`);
            totalError++;
          }
        }
      }
    }
    console.log(`\n${format('bold', '批量禁用/清理完成:')} 累计清理 ${totalSuccess} 次，忽略/失败 ${totalError} 次。`);
    return;
  }

  const found = findComponent(name);
  if (found.length === 0) {
    console.log(format('bold', `源组件不存在，尝试从 [${activeTargets.join(', ')}] 清理残留链接...`));
    let cleaned = false;
    for (const targetName of activeTargets) {
      const tDirs = getTargetDirsForTarget(targetName, parsed.project);
      for (const type of ['skills', 'agents', 'commands']) {
        const guessedFilename = type === 'skills' ? name : (type === 'agents' ? `${name}.md` : name);
        const destPath = path.join(tDirs[type], guessedFilename);
        const lstat = getLstatSafe(destPath);
        if (lstat && lstat.isSymbolicLink()) {
          fs.unlinkSync(destPath);
          console.log(`  - ${format('green', '✓')} [${targetName.toUpperCase()}][${type.toUpperCase()}] ${guessedFilename} -> 已成功清理残留软链接`);
          cleaned = true;
        }
      }
    }
    if (!cleaned) {
      console.error(format('red', `错误: 未在任何指定的本地环境找到关于 "${name}" 的激活链接。`));
    }
    return;
  }

  console.log(format('bold', `正在禁用组件 "${name}" 从目标环境 [${activeTargets.join(', ')}]...`));
  for (const targetName of activeTargets) {
    const tDirs = getTargetDirsForTarget(targetName, parsed.project);
    console.log(`\n--- 从 ${targetName.toUpperCase()} 清理 (${parsed.project ? '项目级' : '全局'}) ---`);
    for (const comp of found) {
      const filename = comp.filename || comp.id;
      const destPath = path.join(tDirs[comp.type], filename);
      try {
        const result = removeSymlink(comp.path, destPath);
        const color = result.status === 'removed' ? 'green' : (result.status === 'none' ? 'dim' : 'yellow');
        const char = result.status === 'removed' ? '✓' : (result.status === 'none' ? '○' : '⚠');
        console.log(`  - ${format(color, char)} [${comp.type.toUpperCase()}] ${filename} -> ${result.message}`);
      } catch (err) {
        console.error(`  - ${format('red', '✕')} [${comp.type.toUpperCase()}] ${filename} -> 发生错误: ${err.message}`);
      }
    }
  }
}

function syncSkills(targetSource) {
  const { spawn } = require('child_process');
  const scriptPath = path.join(repoRoot, 'scripts', 'sync_skills.sh');
  const args = targetSource ? [targetSource] : [];

  try {
    fs.chmodSync(scriptPath, '755');
  } catch (err) {
    // ignore
  }

  console.log(format('bold', `正在调用同步脚本: scripts/sync_skills.sh ${args.join(' ')}\n`));
  const child = spawn('/bin/bash', [scriptPath, ...args], {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error(format('red', `启动同步脚本失败: ${err.message}`));
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(format('red', `\n同步脚本执行失败 (退出码: ${code})`));
      process.exit(code);
    } else {
      console.log(format('green', `\n同步成功！`));
      process.exit(0);
    }
  });
}

function printHelp() {
  console.log(`
${format('bold', 'open-agent-hub 能力管理中心 CLI (动态扫描版)')}

${format('bold', '用法:')}
  open-agent <command> [arguments]

${format('bold', '支持的别名:')}
  open-agent-hub, oah, ahub

${format('bold', '命令列表:')}
  ${format('cyan', 'list')}                     列出本地目录中所有可用的 Skills、Agents 和 Commands
  ${format('cyan', 'status')}                   检查当前本地环境的组件激活状态
  ${format('cyan', 'enable [name]')}             启用指定组件 (不指定组件名时默认启用全部。可选过滤参数: --skills, --agents, --commands)
  ${format('cyan', 'disable [name]')}            禁用指定组件 (不指定组件名时默认禁用全部。可选过滤参数: --skills, --agents, --commands)
  ${format('cyan', 'sync [source]')}             同步配置了上游源的技能 (可选指定特定源)
  ${format('cyan', 'help')}                     显示此帮助信息

${format('bold', '通用参数选项 (Options):')}
  -p, --project                  项目工作区级别激活 (软链接至当前项目目录下，默认行为)
  -g, --global                   系统全局级别激活 (软链接至家目录系统目录下)
  -t, --target <name>            指定目标环境 (可选值: claude, antigravity, gemini, codex, cursor, trae, opencode, all。默认: claude) (别名: --assistant, --host, --tool)

${format('bold', '环境变量配置 (可选/优先级最高):')}
  ${format('yellow', 'OPEN_AGENT_SKILLS_DIR')}   自定义 Skills 软链接目标目录 (默认: ~/.claude/skills)
  ${format('yellow', 'OPEN_AGENT_AGENTS_DIR')}   自定义 Agents 软链接目标目录 (默认: ~/.claude/agents)
  ${format('yellow', 'OPEN_AGENT_COMMANDS_DIR')} 自定义 Commands 软链接目标目录 (默认: ~/.claude/commands)
`);
}

const cmd = parsed.positionals[0];
const arg = parsed.positionals[1];

switch (cmd) {
  case 'list':
    listComponents();
    break;
  case 'status':
    statusComponents();
    break;
  case 'enable':
    enableComponent(arg || '--all');
    break;
  case 'disable':
    disableComponent(arg || '--all');
    break;
  case 'sync':
    syncSkills(arg);
    break;
  case 'help':
  case '-h':
  case '--help':
  case undefined:
    printHelp();
    break;
  default:
    console.error(format('red', `错误: 未知命令 "${cmd}"`));
    printHelp();
    process.exit(1);
}
