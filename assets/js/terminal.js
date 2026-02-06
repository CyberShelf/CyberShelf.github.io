function initHomeTerminal() {
  const terminalOutput = document.getElementById('terminal-output');
  if (!terminalOutput) return;

  const commands = [
    { cmd: "whoami", output: "User: Hacker" },
    { cmd: "ls", output: "Windows-API-Introduction.pdf, AVEDR-Evasion-Practical-Techniques.pdf, Malware-Analysis-Introduction.pdf, Offensive-Development-Introduction.pdf" },
    { cmd: "pwd", output: "/home/hacker/CyberShelf" },
    { cmd: "cat Windows-API-Introduction.pdf", output: "مجموعه کتاب‌های امنیت و توسعه آفنسیو برای هکرهای واقعی" },
    { cmd: "echo 'Happy Hacking!'", output: "Happy Hacking!" }
  ];

  let currentCommand = 0;

  function typeCommand(command, callback) {
    let i = 0;
    const line = document.createElement('div');
    line.style.direction = 'ltr';
    terminalOutput.appendChild(line);

    function typeChar() {
      if (i < command.length) {
        line.textContent += command[i];
        i++;
        setTimeout(typeChar, 100);
      } else callback();
    }
    typeChar();
  }

  function executeNextCommand() {
    if (currentCommand >= commands.length) return;
    const { cmd, output } = commands[currentCommand];

    typeCommand(`$ ${cmd}`, () => {
      if (output) {
        const outputLine = document.createElement('div');
        outputLine.style.direction = 'ltr';
        outputLine.textContent = output;
        terminalOutput.appendChild(outputLine);
      }
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      currentCommand++;
      setTimeout(executeNextCommand, 800);
    });
  }

  setTimeout(executeNextCommand, 1000);
}

// 🔄 تغییر hash
