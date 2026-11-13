// c:\Users\Carlos\Downloads\New folder (79)\app.js
// javascript / app.js / browser / se client controller

(() => {
  'use strict';

  let soundEnabled = true;
  let audioCtx = null;

  function playTone(freq = 460, duration = 0.04, type = 'sine', gainLevel = 0.025) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainLevel, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  // --- Notifications ---
  const toastStack = document.getElementById('toastStack');
  const notifHistoryList = document.getElementById('notifHistoryList');
  const notifCountEl = document.getElementById('notifCount');
  const notifDrawer = document.getElementById('notifDrawer');
  let totalNotifications = 0;

  function notify(title, message, variant = 'success') {
    totalNotifications += 1;
    if (notifCountEl) notifCountEl.textContent = String(totalNotifications);

    playTone(variant === 'danger' ? 300 : 500, 0.045, 'sine', 0.025);

    const toast = document.createElement('div');
    toast.className = `toast-item ${variant}`;
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;
    toastStack.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 220);
    }, 3200);

    if (notifHistoryList) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const entry = document.createElement('div');
      entry.className = 'notif-log-entry';
      entry.innerHTML = `
        <strong style="color: var(--text-primary); display:block;">${title}</strong>
        <span style="color: var(--text-secondary);">${message}</span>
        <time>${timeStr}</time>
      `;
      notifHistoryList.prepend(entry);
    }
  }

  notify('shark tweaks ready', 'Shark Tweaks suite initialized.', 'info');

  // --- Login Window (License Key Only) ---
  const authScreen = document.getElementById('authScreen');
  const loginForm = document.getElementById('loginForm');
  const loginKey = document.getElementById('loginKey');
  const chkRememberKey = document.getElementById('chkRememberKey');
  const loginHwidTag = document.getElementById('loginHwidTag');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');
  const btnLoginText = document.getElementById('btnLoginText');
  const btnLoginIcon = document.getElementById('btnLoginIcon');
  const btnLockSession = document.getElementById('btnLockSession');
  const activeUserName = document.getElementById('activeUserName');
  const activeUserInitials = document.getElementById('activeUserInitials');
  const activeUserPlan = document.getElementById('activeUserPlan');

  let isAuthenticating = false;

  function setLoginButtonState(loading, text = 'Enter Workspace') {
    isAuthenticating = loading;
    if (btnLoginSubmit) btnLoginSubmit.disabled = loading;
    if (loginKey) loginKey.disabled = loading;
    if (btnLoginText) btnLoginText.textContent = text;
    if (btnLoginIcon) {
      if (loading) {
        btnLoginIcon.className = 'ri-loader-4-line ri-spin';
      } else {
        btnLoginIcon.className = 'ri-arrow-right-line';
      }
    }
  }

  function handleLoginSubmit() {
    if (isAuthenticating) return;
    const key = (loginKey?.value || '').trim();
    if (!key) {
      notify('Missing License Key', 'Please enter your license key to continue.', 'warn');
      if (loginKey) {
        loginKey.focus();
        loginKey.classList.add('input-error-shake');
        setTimeout(() => loginKey.classList.remove('input-error-shake'), 600);
      }
      return;
    }
    const remember = chkRememberKey ? chkRememberKey.checked : true;
    setLoginButtonState(true, 'Verifying License...');
    if (window.chrome?.webview) {
      window.chrome.webview.postMessage(JSON.stringify({
        action: 'auth-login',
        key: key,
        remember: remember
      }));
    } else {
      setTimeout(() => {
        setLoginButtonState(false);
        if (authScreen) authScreen.classList.add('hidden');
        notify('License Activated', 'Welcome to shark tweaks (Dev Mode).', 'success');
      }, 800);
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLoginSubmit();
    });
  }

  if (btnLockSession) {
    btnLockSession.addEventListener('click', () => {
      if (window.chrome?.webview) {
        window.chrome.webview.postMessage(JSON.stringify({ action: 'auth-logout' }));
      }
      if (authScreen) authScreen.classList.remove('hidden');
      if (loginKey) {
        loginKey.value = '';
        loginKey.focus();
      }
      setLoginButtonState(false);
      notify('Signed Out', 'Returned to license verification screen.', 'info');
    });
  }

  // --- Navigation ---
  const navItems = document.querySelectorAll('#mainNav .nav-item');
  const viewPanes = document.querySelectorAll('.view-pane');
  const currentViewTitle = document.getElementById('currentViewTitle');
  const currentViewSub = document.getElementById('currentViewSub');

  const viewMeta = {
    'view-home': {
      title: 'Home',
      sub: 'System hardware performance, GPU wattage draw, and CPU load.'
    },
    'view-gfx': {
      title: 'GFX',
      sub: 'PUBG graphics configuration and emulator actions.'
    },
    'view-tweaks': {
      title: 'Tweaks',
      sub: 'Light system optimizations. Click any text to edit.'
    },
    'view-clean': {
      title: 'System Cleaner',
      sub: 'Clean temporary cache, network sockets, GPU shader cache, and emulator remnants.'
    },
    'view-norecoil': {
      title: 'No Recoil',
      sub: 'Select weapon and adjust vertical & horizontal recoil values.'
    },
    'view-aim': {
      title: 'Aim Assist',
      sub: 'AI Neural Target Tracking with real-time DirectML hardware inference & customizable FOV.'
    },
    'view-gameloop': {
      title: 'GameLoop',
      sub: 'Rendering Engine, Engine Hooks, Game Resolution, and FPS Settings.'
    },
    'view-opengl': {
      title: 'OPEN GL Fixer',
      sub: 'Start or remove the OpenGL rendering fix.'
    }
  };

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      playTone(480, 0.035);
      const targetId = item.getAttribute('data-target');
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      viewPanes.forEach((pane) => {
        pane.classList.toggle('active', pane.id === targetId);
      });

      if (viewMeta[targetId]) {
        currentViewTitle.textContent = viewMeta[targetId].title;
        currentViewSub.textContent = viewMeta[targetId].sub;
      }

      if (targetId === 'view-gameloop') {
        window.chrome?.webview?.postMessage(JSON.stringify({ type: 'get-gameloop-config' }));
      }
      if (targetId === 'view-aim') {
        window.chrome?.webview?.postMessage(JSON.stringify({ action: 'get_aim_settings' }));
      }
    });
  });

  // --- Header Sound, Theme Gallery & Notification Drawer ---
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const btnNotifDrawer = document.getElementById('btnNotifDrawer');
  const btnClearNotifs = document.getElementById('btnClearNotifs');

  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeDropdownPanel = document.getElementById('themeDropdownPanel');
  const btnCloseThemePanel = document.getElementById('btnCloseThemePanel');
  const themeCardOptions = document.querySelectorAll('.theme-card-option');
  const themeActiveIndicator = document.getElementById('themeActiveIndicator');

  const THEME_NAMES = {
    shark: 'Shark Cyber Cyan (اللوجو الرسمي - سايبر سيان)',
    bw: 'Monochrome Obsidian',
    gold: 'Champagne Gold',
    ice: 'Deep Royal Navy',
    emerald: 'Phantom Emerald',
    crimson: 'Bloodline Crimson',
    violet: 'Amethyst Violet'
  };

  function applyTheme(themeId, triggerNotify = false) {
    if (!THEME_NAMES[themeId]) themeId = 'shark';
    document.body.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('shark_theme', themeId);
    } catch (_) {}

    themeCardOptions.forEach((card) => {
      card.classList.toggle('active', card.getAttribute('data-theme-id') === themeId);
    });

    if (triggerNotify) {
      playTone(560, 0.04, 'triangle', 0.03);
      notify('Theme Applied', `Switched aesthetic to ${THEME_NAMES[themeId]}.`, 'info');
    }
  }

  // Restore saved theme or default to Shark Electric Blue 'shark'
  const savedTheme = (() => {
    try {
      return localStorage.getItem('shark_theme') || 'shark';
    } catch (_) {
      return 'shark';
    }
  })();
  applyTheme(savedTheme, false);

  if (btnThemeToggle && themeDropdownPanel) {
    btnThemeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      playTone(460, 0.03);
      if (notifDrawer) notifDrawer.classList.remove('open');
      themeDropdownPanel.classList.toggle('open');
    });
  }

  if (btnCloseThemePanel && themeDropdownPanel) {
    btnCloseThemePanel.addEventListener('click', () => {
      themeDropdownPanel.classList.remove('open');
    });
  }

  themeCardOptions.forEach((card) => {
    card.addEventListener('click', () => {
      const themeId = card.getAttribute('data-theme-id');
      applyTheme(themeId, true);
    });
  });

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      btnSoundToggle.style.opacity = soundEnabled ? '1' : '0.4';
      notify(soundEnabled ? 'Sound On' : 'Sound Muted', 'Audio feedback updated.', 'info');
    });
  }

  if (btnNotifDrawer) {
    btnNotifDrawer.addEventListener('click', (e) => {
      e.stopPropagation();
      playTone(460, 0.03);
      if (themeDropdownPanel) themeDropdownPanel.classList.remove('open');
      notifDrawer.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (notifDrawer && !notifDrawer.contains(e.target) && e.target !== btnNotifDrawer) {
      notifDrawer.classList.remove('open');
    }
    if (themeDropdownPanel && !themeDropdownPanel.contains(e.target) && !btnThemeToggle.contains(e.target)) {
      themeDropdownPanel.classList.remove('open');
    }
  });

  if (btnClearNotifs) {
    btnClearNotifs.addEventListener('click', () => {
      notifHistoryList.innerHTML = '';
      totalNotifications = 0;
      notifCountEl.textContent = '0';
    });
  }

  // --- REAL Hardware Telemetry (Home Page) ---
  const gpuHistory = Array.from({ length: 28 }, () => 0);
  const cpuHistory = Array.from({ length: 28 }, () => 0);

  function buildSparklinePaths(data, width = 300, height = 48) {
    const step = width / (data.length - 1);
    const points = data.map((val, idx) => {
      const x = (idx * step).toFixed(1);
      const y = (height - (val / 100) * (height - 10) - 5).toFixed(1);
      return `${x},${y}`;
    });
    const lineD = `M ${points.join(' L ')}`;
    const areaD = `${lineD} L ${width},${height} L 0,${height} Z`;
    return { lineD, areaD };
  }

  const setTxt = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  function applyRealTelemetry(data) {
    if (!data) return;

    // 1. GPU Telemetry
    if (data.gpu) {
      if (data.gpu.name) setTxt('gpuName', data.gpu.name);
      if (data.gpu.vramTotalGB) setTxt('gpuChip', `${data.gpu.vramTotalGB} GB GDDR6`);
      setTxt('gpuUtilVal', String(data.gpu.load ?? 0));
      setTxt('gpuWattVal', `${data.gpu.watt ?? 0} W`);
      setTxt('gpuClockVal', `${data.gpu.clock ?? 0} MHz`);
      setTxt('gpuTempVal', `${data.gpu.temp ?? 0}°C`);
      setTxt('gpuTdpPercent', `${data.gpu.tdpPct ?? 0}%`);

      const maxWatt = data.gpu.maxWatt || 100;
      setTxt('gpuWattBarLabel', `${Math.round(data.gpu.watt ?? 0)} W / ${maxWatt} W`);
      setTxt('topGpuWatt', `${Math.round(data.gpu.watt ?? 0)} W`);

      const gpuBar = document.getElementById('gpuWattBar');
      if (gpuBar) gpuBar.style.width = `${Math.min(100, Math.max(0, data.gpu.tdpPct ?? 0))}%`;

      if (data.gpu.vramUsedGB !== undefined && data.gpu.vramTotalGB !== undefined) {
        setTxt('gpuVramVal', `${data.gpu.vramUsedGB} / ${data.gpu.vramTotalGB} GB`);
      }

      gpuHistory.push(data.gpu.load ?? 0);
      gpuHistory.shift();

      const gpuPaths = buildSparklinePaths(gpuHistory);
      const gpuLineEl = document.getElementById('gpuLinePath');
      const gpuAreaEl = document.getElementById('gpuAreaPath');
      if (gpuLineEl && gpuAreaEl) {
        gpuLineEl.setAttribute('d', gpuPaths.lineD);
        gpuAreaEl.setAttribute('d', gpuPaths.areaD);
      }
    }

    // 2. CPU Telemetry
    if (data.cpu) {
      if (data.cpu.name) setTxt('cpuName', data.cpu.name);
      if (data.cpu.clock) setTxt('cpuClockChip', data.cpu.clock);
      setTxt('cpuUtilVal', String(data.cpu.load ?? 0));
      if (data.cpu.threads) setTxt('cpuThreadsVal', `${data.cpu.threads} Active`);
      setTxt('cpuWattVal', `${data.cpu.power ?? 0} W`);
      setTxt('cpuTempVal', `${data.cpu.temp ?? 0}°C`);
      if (data.cpu.cores && data.cpu.threads) {
        setTxt('cpuArchVal', `${data.cpu.cores}C / ${data.cpu.threads}T`);
      }
      setTxt('cpuVoltVal', `${data.cpu.volt ?? '1.15'} V`);

      const cpuTdp = data.cpu.tdp || 65;
      setTxt('cpuWattBarLabel', `${Math.round(data.cpu.power ?? 0)} W / ${cpuTdp} W`);
      setTxt('topCpuLoad', `${data.cpu.load ?? 0}%`);

      const cpuBar = document.getElementById('cpuWattBar');
      if (cpuBar) cpuBar.style.width = `${Math.min(100, Math.max(0, data.cpu.load ?? 0))}%`;

      cpuHistory.push(data.cpu.load ?? 0);
      cpuHistory.shift();

      const cpuPaths = buildSparklinePaths(cpuHistory);
      const cpuLineEl = document.getElementById('cpuLinePath');
      const cpuAreaEl = document.getElementById('cpuAreaPath');
      if (cpuLineEl && cpuAreaEl) {
        cpuLineEl.setAttribute('d', cpuPaths.lineD);
        cpuAreaEl.setAttribute('d', cpuPaths.areaD);
      }
    }

    // 3. RAM Telemetry
    if (data.ram) {
      setTxt('ramTotalChip', `${data.ram.totalGB} GB`);
      setTxt('ramUsedVal', `${data.ram.usedGB} GB`);
      setTxt('ramPctVal', `${data.ram.percent}% Used`);
      setTxt('ramSub', `${data.ram.freeGB} GB Available`);

      const ramBar = document.getElementById('ramBar');
      if (ramBar) ramBar.style.width = `${data.ram.percent}%`;
    }

    // 4. System Timer Telemetry
    if (data.timer) {
      setTxt('timerChip', `${data.timer.resMs} ms`);
      setTxt('timerVal', `${data.timer.resMs} ms`);
      setTxt('timerStatus', data.timer.status || 'Optimal');

      const timerBar = document.getElementById('timerBar');
      if (timerBar) {
        const pct = Math.min(100, Math.round((data.timer.resMs / 1.0) * 100));
        timerBar.style.width = `${pct}%`;
      }
    }

    // 5. Storage Telemetry
    if (data.storage) {
      setTxt('storageSub', `Drive ${data.storage.drive} (System)`);
      setTxt('storageTotalChip', `${data.storage.totalGB} GB`);
      setTxt('storageUsedVal', `${data.storage.usedGB} GB Used`);
      setTxt('storageFreeVal', `${data.storage.freeGB} GB Free (${data.storage.percent}% Used)`);

      const storageBar = document.getElementById('storageBar');
      if (storageBar) storageBar.style.width = `${data.storage.percent}%`;
    }
  }

  // Query authentication state from C++ backend first
  if (window.chrome?.webview) {
    window.chrome.webview.postMessage(JSON.stringify({ action: 'get-auth-state' }));
  }

  // --- Pill & Style Selectors ---
  function updateGfxSummary() {
    const getActiveText = (g) => {
      const activeBtn = document.querySelector(`[data-gfx-group="${g}"] .active`);
      return activeBtn ? activeBtn.textContent.trim() : '';
    };
    const summaryEl = document.getElementById('gfxSelectedSummary');
    if (summaryEl) {
      summaryEl.textContent = `${getActiveText('quality')} · ${getActiveText('fps')} · ${getActiveText('style')}`;
    }
  }

  document.querySelectorAll('.pill-selector-grid, .pubg-style-grid').forEach((grid) => {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn, .pubg-style-card');
      if (!btn) return;
      playTone(500, 0.03);

      grid.querySelectorAll('.seg-btn, .pubg-style-card').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const groupName = grid.getAttribute('data-gfx-group');
      if (['quality', 'fps', 'style', 'msaa', 'shadows'].includes(groupName)) {
        updateGfxSummary();
      } else if (groupName === 'version' && isGfxConnected) {
        const verVal = btn.getAttribute('data-val');
        window.chrome?.webview?.postMessage(JSON.stringify({
          type: 'get-gfx-settings',
          version: verVal
        }));
      }
    });
  });

  // --- GFX 4 Side Buttons ---
  const btnGfxConnect = document.getElementById('btnGfxConnect');
  const btnGfxBoostGameLoop = document.getElementById('btnGfxBoostGameLoop');
  const btnGfxResetGuest = document.getElementById('btnGfxResetGuest');
  const btnGfxKillEmulator = document.getElementById('btnGfxKillEmulator');
  const btnGfxApply = document.getElementById('btnGfxApply');
  const gfxConnectTag = document.getElementById('gfxConnectTag');
  const gfxResetGuestTag = document.getElementById('gfxResetGuestTag');
  const sidebarBridgeStatus = document.getElementById('sidebarBridgeStatus');
  const gfxApplyStatusText = document.getElementById('gfxApplyStatusText');
  const gfxApplyProgressBar = document.getElementById('gfxApplyProgressBar');

  let isGfxConnected = false;

  // 1. Start & Connect GameLoop (Registry lookup + AndroidEmulatorEn.exe -vm 100)
  if (btnGfxConnect) {
    btnGfxConnect.addEventListener('click', () => {
      playTone(520, 0.04);
      if (gfxConnectTag) {
        gfxConnectTag.textContent = isGfxConnected ? 'Syncing...' : 'Connecting...';
        gfxConnectTag.style.color = '#eab308';
        gfxConnectTag.style.borderColor = 'rgba(234, 179, 8, 0.3)';
      }
      notify(isGfxConnected ? 'Syncing GFX' : 'Connecting to GameLoop',
             isGfxConnected ? 'Reading current graphics settings from PUBG Mobile...' : 'Searching GameLoop in registry & waiting for ADB interface...',
             'info');

      // Signal C++ to find GameLoop in Registry, launch AndroidEmulatorEn.exe -vm 100 and connect ADB
      window.chrome?.webview?.postMessage('launch-gameloop');
    });
  }

  // Boost GameLoop (NXTweaks Turbo ADB & Android Kernel Acceleration)
  if (btnGfxBoostGameLoop) {
    btnGfxBoostGameLoop.addEventListener('click', () => {
      playTone(520, 0.04);
      updateBoostModal(
        5,
        'Connecting to GameLoop ADB...',
        'Establishing socket connection to 127.0.0.1:5555...',
        'Connecting',
        'loading',
        'GAMELOOP ULTRA BOOST',
        'ri-rocket-2-line'
      );
      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(JSON.stringify({ action: 'gameloop-boost' }));
      }
    });
  }

  // 2. Reset Guest Account
  if (btnGfxResetGuest) {
    btnGfxResetGuest.addEventListener('click', () => {
      playTone(500, 0.04);
      if (gfxResetGuestTag) {
        gfxResetGuestTag.textContent = 'Resetting...';
        gfxResetGuestTag.style.color = '#eab308';
      }

      // Signal C++ backend
      window.chrome?.webview?.postMessage('reset_guest');
    });
  }

  // 3. Kill Emulator
  if (btnGfxKillEmulator) {
    btnGfxKillEmulator.addEventListener('click', () => {
      playTone(360, 0.06);
      if (gfxConnectTag) {
        gfxConnectTag.textContent = 'Stopping...';
        gfxConnectTag.style.color = '#eab308';
      }
      window.chrome?.webview?.postMessage('kill-emulator');
    });
  }

  // 4. Apply Combat Profile
  if (btnGfxApply) {
    btnGfxApply.addEventListener('click', () => {
      playTone(560, 0.04);
      if (gfxApplyStatusText) gfxApplyStatusText.textContent = 'Applying...';
      if (gfxApplyProgressBar) gfxApplyProgressBar.style.width = '35%';

      const activeVersion = document.querySelector('[data-gfx-group="version"] .seg-btn.active')?.getAttribute('data-val') || 'Global';
      const activeQuality = document.querySelector('[data-gfx-group="quality"] .seg-btn.active')?.getAttribute('data-val') || 'Smooth';
      const activeFps = document.querySelector('[data-gfx-group="fps"] .seg-btn.active')?.getAttribute('data-val') || '120 fps';
      const activeStyle = document.querySelector('[data-gfx-group="style"] .pubg-style-card.active')?.getAttribute('data-style') || 'Colorful';
      const activeShadow = document.querySelector('[data-gfx-group="shadows"] .seg-btn.active')?.getAttribute('data-val') || 'Disable Shadows';

      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'gfx-apply',
        version: activeVersion,
        quality: activeQuality,
        fps: activeFps,
        style: activeStyle,
        shadows: activeShadow
      }));
    });
  }

  // --- Tweaks Engine & Interactive Modal ---
  const tweaksGrid = document.getElementById('tweaksGrid');
  const tweaksCountBadge = document.getElementById('tweaksCountBadge');
  const btnToggleSelectAll = document.getElementById('btnToggleSelectAll');
  const selectAllIcon = document.getElementById('selectAllIcon');
  const selectAllText = document.getElementById('selectAllText');
  const btnApplyAllTweaks = document.getElementById('btnApplyAllTweaks');

  const tweakModalOverlay = document.getElementById('tweakModalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalSpinner = document.getElementById('modalSpinner');
  const modalStatusBadge = document.getElementById('modalStatusBadge');
  const modalProgressBar = document.getElementById('modalProgressBar');
  const modalConsoleLog = document.getElementById('modalConsoleLog');
  const modalFooter = document.getElementById('modalFooter');
  const modalBtnClose = document.getElementById('modalBtnClose');

  function updateTweaksCount() {
    const allCheckboxes = document.querySelectorAll('.tweak-toggle');
    const checkedCount = document.querySelectorAll('.tweak-toggle:checked').length;
    if (tweaksCountBadge) tweaksCountBadge.textContent = String(checkedCount);

    if (btnToggleSelectAll && selectAllText && selectAllIcon) {
      if (checkedCount === allCheckboxes.length && allCheckboxes.length > 0) {
        selectAllText.textContent = 'Deselect All';
        selectAllIcon.className = 'ri-checkbox-line';
      } else {
        selectAllText.textContent = 'Select All';
        selectAllIcon.className = 'ri-checkbox-blank-line';
      }
    }
  }

  if (tweaksGrid) {
    tweaksGrid.addEventListener('change', (e) => {
      if (e.target.classList.contains('tweak-toggle')) {
        updateTweaksCount();
        const card = e.target.closest('.tweak-card');
        const title = card ? card.querySelector('h4')?.textContent.trim() : 'Tweak';
        notify(title, e.target.checked ? 'Selected' : 'Deselected', 'info');
      }
    });
  }

  // Select All / Deselect All Toggle Button
  if (btnToggleSelectAll) {
    btnToggleSelectAll.addEventListener('click', () => {
      playTone(480, 0.03);
      const allCheckboxes = document.querySelectorAll('.tweak-toggle');
      const checkedCount = document.querySelectorAll('.tweak-toggle:checked').length;
      const shouldSelectAll = checkedCount < allCheckboxes.length;

      allCheckboxes.forEach((cb) => {
        cb.checked = shouldSelectAll;
      });

      updateTweaksCount();
      notify(
        shouldSelectAll ? 'All Tweaks Selected' : 'All Tweaks Deselected',
        shouldSelectAll ? `Marked all ${allCheckboxes.length} tweaks for execution.` : 'Cleared all selections.',
        'info'
      );
    });
  }

  // Run Selected Tweaks -> Popup Modal Execution with Progress
  if (btnApplyAllTweaks) {
    btnApplyAllTweaks.addEventListener('click', async () => {
      const activeCards = Array.from(document.querySelectorAll('.tweak-card')).filter((card) =>
        card.querySelector('.tweak-toggle:checked')
      );

      if (activeCards.length === 0) {
        notify('No Tweaks Selected', 'Please select at least one tweak to run.', 'warn');
        return;
      }

      // Open Modal
      playTone(560, 0.05);
      tweakModalOverlay.classList.add('active');
      modalSpinner.className = 'modal-spinner';
      modalSpinner.innerHTML = '';
      modalTitle.textContent = 'Applying System Tweaks...';
      modalSubtitle.textContent = `Executing ${activeCards.length} optimizations in kernel space`;
      modalStatusBadge.textContent = '0%';
      modalProgressBar.style.width = '0%';
      modalFooter.style.display = 'none';
      modalConsoleLog.innerHTML = `<span class="log-dim">// shark engine starting batch queue (${activeCards.length} tweaks selected)...</span>`;

      if (window.chrome?.webview) {
        // Send real batch execution request to C++ native engine (100% native kernel tweaks)
        const tweakIds = activeCards.map((c) => parseInt(c.getAttribute('data-tweak') || '0', 10)).filter((id) => id > 0);
        window.chrome.webview.postMessage(JSON.stringify({
          type: 'apply-tweaks',
          tweaks: tweakIds
        }));
      } else {
        // Dev browser simulation fallback
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i < activeCards.length; i++) {
          const card = activeCards[i];
          const title = card.querySelector('h4')?.textContent.trim() || `Tweak ${i + 1}`;
          const tweakId = card.getAttribute('data-tweak') || (i + 1);

          const logEntry = document.createElement('div');
          logEntry.innerHTML = `
            <div class="log-cmd">> Optimizing [Tweak ${tweakId}]...</div>
            <div class="log-ok">  [OK] ${title} committed.</div>
          `;
          modalConsoleLog.appendChild(logEntry);
          modalConsoleLog.scrollTop = modalConsoleLog.scrollHeight;

          const pct = Math.round(((i + 1) / activeCards.length) * 100);
          modalProgressBar.style.width = `${pct}%`;
          modalStatusBadge.textContent = `${pct}%`;

          playTone(420 + i * 15, 0.02, 'sine', 0.015);
          await sleep(140);
        }

        // Completion state
        const summaryEntry = document.createElement('div');
        summaryEntry.innerHTML = `
          <div class="log-dim" style="margin-top:6px;">// ============================================</div>
          <div class="log-ok" style="font-weight:700;">[SUCCESS] All ${activeCards.length} tweaks successfully executed!</div>
          <div class="log-dim">// Kernel priorities, GPU scheduling & timer flags active.</div>
        `;
        modalConsoleLog.appendChild(summaryEntry);
        modalConsoleLog.scrollTop = modalConsoleLog.scrollHeight;

        modalTitle.textContent = 'Optimization Complete!';
        modalSubtitle.textContent = `Successfully applied ${activeCards.length} system tweaks`;
        modalStatusBadge.textContent = '100%';
        modalSpinner.className = 'modal-spinner done';
        modalSpinner.innerHTML = '<i class="ri-check-line"></i>';
        modalFooter.style.display = 'block';

        playTone(720, 0.08, 'triangle', 0.04);
        notify('Optimization Complete', `${activeCards.length} tweaks executed and applied successfully.`, 'success');
      }
    });
  }

  // Close Modal
  if (modalBtnClose) {
    modalBtnClose.addEventListener('click', () => {
      playTone(480, 0.03);
      tweakModalOverlay.classList.remove('active');
    });
  }

  if (tweakModalOverlay) {
    tweakModalOverlay.addEventListener('click', (e) => {
      if (e.target === tweakModalOverlay && modalFooter.style.display !== 'none') {
        tweakModalOverlay.classList.remove('active');
      }
    });
  }

  // --- Verified Armory & Scope Recoil Profiles (Matched to Engine\WeaponTemplates) ---
  const WEAPON_ARMORY = [
    {
      id: 'm416',
      name: 'M416',
      cat: 'AR',
      cal: '5.56mm',
      rpm: 857,
      pull: 25,
      img: 'Item_Weapon_HK416_C.png',
      scopes: { 'Red Dot': 25, '2x Scope': 30, '3x Scope': 37, '4x Scope': 45, '6x Scope': 55, '8x Scope': 62 }
    },
    {
      id: 'akm',
      name: 'AKM',
      cat: 'AR',
      cal: '7.62mm',
      rpm: 600,
      pull: 32,
      img: 'Item_Weapon_AK47_C.png',
      scopes: { 'Red Dot': 32, '2x Scope': 38, '3x Scope': 48, '4x Scope': 57, '6x Scope': 70, '8x Scope': 80 }
    },
    {
      id: 'm762',
      name: 'Beryl M762',
      cat: 'AR',
      cal: '7.62mm',
      rpm: 700,
      pull: 30,
      img: 'Item_Weapon_BerylM762_C.png',
      scopes: { 'Red Dot': 30, '2x Scope': 36, '3x Scope': 45, '4x Scope': 54, '6x Scope': 66, '8x Scope': 75 }
    },
    {
      id: 'scarl',
      name: 'SCAR-L',
      cat: 'AR',
      cal: '5.56mm',
      rpm: 625,
      pull: 24,
      img: 'Item_Weapon_SCAR-L_C.png',
      scopes: { 'Red Dot': 24, '2x Scope': 28, '3x Scope': 36, '4x Scope': 43, '6x Scope': 52, '8x Scope': 60 }
    },
    {
      id: 'groza',
      name: 'Groza',
      cat: 'AR',
      cal: '7.62mm',
      rpm: 750,
      pull: 28,
      img: 'Item_Weapon_Groza_C.png',
      scopes: { 'Red Dot': 28, '2x Scope': 33, '3x Scope': 42, '4x Scope': 50, '6x Scope': 61, '8x Scope': 70 }
    },
    {
      id: 'aug',
      name: 'AUG A3',
      cat: 'AR',
      cal: '5.56mm',
      rpm: 750,
      pull: 26,
      img: 'Item_Weapon_AUG_C.png',
      scopes: { 'Red Dot': 26, '2x Scope': 31, '3x Scope': 39, '4x Scope': 46, '6x Scope': 57, '8x Scope': 65 }
    },
    {
      id: 'mg3',
      name: 'MG3',
      cat: 'LMG',
      cal: '7.62mm',
      rpm: 990,
      pull: 22,
      img: 'Item_Weapon_MG3_C.png',
      scopes: { 'Red Dot': 22, '2x Scope': 26, '3x Scope': 33, '4x Scope': 39, '6x Scope': 48, '8x Scope': 55 }
    }
  ];

  // =========================================================================
  // --- 43-Weapon Armory & Scope Precision No Recoil Engine ---
  // =========================================================================
  const weaponCatTabs = document.getElementById('weaponCatTabs');
  const weaponSearchInput = document.getElementById('weaponSearchInput');
  const weaponArmoryGrid = document.getElementById('weaponArmoryGrid');
  const recoilMasterToggle = document.getElementById('recoilMasterToggle');
  const recoilActiveBadge = document.getElementById('recoilActiveBadge');

  const selWeaponImg = document.getElementById('selWeaponImg');
  const selWeaponTitle = document.getElementById('selWeaponTitle');
  const selWeaponSpecs = document.getElementById('selWeaponSpecs');
  const activeScopeLabel = document.getElementById('activeScopeLabel');
  const scopeSelectorGrid = document.getElementById('scopeSelectorGrid');
  const singleSliderTitle = document.getElementById('singleSliderTitle');
  const recoilSingleSlider = document.getElementById('recoilSingleSlider');
  const recoilSingleVal = document.getElementById('recoilSingleVal');
  const btnSaveRecoilProfile = document.getElementById('btnSaveRecoilProfile');

  let currentCategory = 'ALL';
  let currentSearchQuery = '';
  let currentWeaponId = 'm416';
  let currentScope = 'Red Dot';

  // Load custom profiles from localStorage or compute defaults per weapon & scope
  const SCOPES_LIST = ['Red Dot', '2x Scope', '3x Scope', '4x Scope', '6x Scope', '8x Scope'];
  const SCOPE_MULTIPLIERS = {
    'Red Dot': 1.0,
    '2x Scope': 1.35,
    '3x Scope': 1.7,
    '4x Scope': 2.2,
    '6x Scope': 2.85,
    '8x Scope': 3.5
  };

  let weaponRecoilStore = {};
  try {
    const saved = localStorage.getItem('shark_recoil_profiles');
    if (saved) weaponRecoilStore = JSON.parse(saved);
  } catch (e) {
    weaponRecoilStore = {};
  }

  WEAPON_ARMORY.forEach((w) => {
    if (!weaponRecoilStore[w.id]) {
      weaponRecoilStore[w.id] = {};
    }
    SCOPES_LIST.forEach((sc) => {
      if (weaponRecoilStore[w.id][sc] === undefined || (w.id === 'm416' && sc === 'Red Dot' && weaponRecoilStore[w.id][sc] === 19)) {
        if (w.scopes && w.scopes[sc] !== undefined) {
          weaponRecoilStore[w.id][sc] = w.scopes[sc];
        } else {
          const mult = SCOPE_MULTIPLIERS[sc] || 1.0;
          weaponRecoilStore[w.id][sc] = Math.min(100, Math.round(w.pull * mult));
        }
      }
    });
  });

  function getWeapon(id) {
    return WEAPON_ARMORY.find((w) => w.id === id) || WEAPON_ARMORY[0];
  }

  function renderWeaponArmory() {
    if (!weaponArmoryGrid) return;
    weaponArmoryGrid.innerHTML = '';

    const q = currentSearchQuery.toLowerCase();
    const filtered = WEAPON_ARMORY.filter((w) => {
      const matchCat = currentCategory === 'ALL' || w.cat === currentCategory;
      const matchSearch = !q || w.name.toLowerCase().includes(q) || w.cal.toLowerCase().includes(q) || w.cat.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      weaponArmoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 36px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          <i class="ri-search-line" style="font-size: 24px; opacity: 0.5; display: block; margin-bottom: 8px;"></i>
          No weapons match the current filter
        </div>`;
      return;
    }

    filtered.forEach((w) => {
      const card = document.createElement('div');
      card.className = `weapon-card ${w.id === currentWeaponId ? 'active' : ''}`;
      card.setAttribute('data-weapon-id', w.id);

      const pullVal = weaponRecoilStore[w.id]?.[currentScope] ?? w.pull;

      card.innerHTML = `
        <div class="weapon-card-top">
          <span class="w-caliber">${w.cal}</span>
          <span>${w.cat}</span>
        </div>
        <div class="weapon-thumb-wrap">
          <img src="assets/weapons/${w.img}" alt="${w.name}" loading="lazy" />
        </div>
        <div class="weapon-card-bottom">
          <span class="weapon-name">${w.name}</span>
          <span class="weapon-pull-tag">${pullVal}%</span>
        </div>
      `;

      card.addEventListener('click', () => {
        selectWeapon(w.id);
      });

      weaponArmoryGrid.appendChild(card);
    });
  }

  function selectWeapon(id) {
    currentWeaponId = id;
    const w = getWeapon(id);

    // Update active class on cards
    if (weaponArmoryGrid) {
      weaponArmoryGrid.querySelectorAll('.weapon-card').forEach((card) => {
        if (card.getAttribute('data-weapon-id') === id) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    // Update preview banner
    if (selWeaponImg) {
      selWeaponImg.src = `assets/weapons/${w.img}`;
      selWeaponImg.alt = w.name;
    }
    if (selWeaponTitle) selWeaponTitle.textContent = w.name;
    if (selWeaponSpecs) selWeaponSpecs.textContent = `${w.cal} ${w.cat} • ${w.rpm} RPM`;

    // Update slider for current scope
    syncScopeSlider();
    playTone(520, 0.025);

    // Live sync to HUD overlay & C++ engine
    window.chrome?.webview?.postMessage(JSON.stringify({
      type: 'recoil-update',
      weapon: w.name,
      scope: currentScope,
      pull: weaponRecoilStore[w.id]?.[currentScope] ?? w.pull
    }));
  }

  function syncScopeSlider() {
    const w = getWeapon(currentWeaponId);
    const pullVal = weaponRecoilStore[w.id]?.[currentScope] ?? w.pull;

    if (activeScopeLabel) activeScopeLabel.textContent = currentScope;
    if (singleSliderTitle) singleSliderTitle.textContent = `${currentScope} Pull Strength`;
    if (recoilSingleSlider) recoilSingleSlider.value = pullVal;
    if (recoilSingleVal) recoilSingleVal.textContent = `${pullVal} %`;
  }

  // Category filter tabs
  if (weaponCatTabs) {
    weaponCatTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      playTone(480, 0.02);

      weaponCatTabs.querySelectorAll('.cat-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-cat') || 'ALL';
      renderWeaponArmory();
    });
  }

  // Search filter
  if (weaponSearchInput) {
    weaponSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderWeaponArmory();
    });
  }

  // Scope pill selector
  if (scopeSelectorGrid) {
    scopeSelectorGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.scope-btn');
      if (!btn) return;
      playTone(540, 0.025);

      scopeSelectorGrid.querySelectorAll('.scope-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentScope = btn.getAttribute('data-scope') || 'Red Dot';
      syncScopeSlider();

      // Live sync to HUD overlay & C++ engine
      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'recoil-update',
        weapon: getWeapon(currentWeaponId).name,
        scope: currentScope,
        pull: weaponRecoilStore[currentWeaponId]?.[currentScope] ?? getWeapon(currentWeaponId).pull
      }));

      // Update pull tags on all visible weapon cards for this scope
      if (weaponArmoryGrid) {
        weaponArmoryGrid.querySelectorAll('.weapon-card').forEach((card) => {
          const wId = card.getAttribute('data-weapon-id');
          const pullTag = card.querySelector('.weapon-pull-tag');
          if (pullTag && weaponRecoilStore[wId]) {
            pullTag.textContent = `${weaponRecoilStore[wId][currentScope]}%`;
          }
        });
      }
    });
  }

  // Precision Slider Input
  if (recoilSingleSlider) {
    recoilSingleSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (recoilSingleVal) recoilSingleVal.textContent = `${val} %`;

      if (!weaponRecoilStore[currentWeaponId]) weaponRecoilStore[currentWeaponId] = {};
      weaponRecoilStore[currentWeaponId][currentScope] = val;

      // Update active weapon card tag
      const activeCard = weaponArmoryGrid?.querySelector(`.weapon-card[data-weapon-id="${currentWeaponId}"]`);
      if (activeCard) {
        const pullTag = activeCard.querySelector('.weapon-pull-tag');
        if (pullTag) pullTag.textContent = `${val}%`;
      }

      // Live stream to C++ backend
      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'recoil-update',
        weapon: getWeapon(currentWeaponId).name,
        scope: currentScope,
        pull: val
      }));
    });
  }

  // Master Recoil Toggle
  function setRecoilState(enabled, showToast = true) {
    if (recoilMasterToggle) recoilMasterToggle.checked = enabled;
    if (recoilActiveBadge) {
      recoilActiveBadge.textContent = enabled ? 'Active' : 'Disabled';
      recoilActiveBadge.style.background = enabled ? 'var(--accent-dim)' : 'rgba(255, 255, 255, 0.05)';
      recoilActiveBadge.style.color = enabled ? 'var(--accent)' : 'var(--text-muted)';
      recoilActiveBadge.style.borderColor = enabled ? 'var(--accent-border)' : 'var(--border-base)';
    }
    const navRecoilBadge = document.getElementById('recoilStateBadge');
    if (navRecoilBadge) {
      navRecoilBadge.textContent = enabled ? 'ON' : 'OFF';
      navRecoilBadge.style.color = enabled ? 'var(--status-ok)' : 'var(--text-muted)';
    }

    if (showToast) {
      playTone(enabled ? 640 : 360, 0.06);
      notify('No Recoil Stabilizer', enabled ? 'Stabilizer activated [F9]' : 'Stabilizer deactivated [F9]', enabled ? 'success' : 'warn');
    }

    window.chrome?.webview?.postMessage(JSON.stringify({
      type: 'recoil-master',
      enabled: enabled
    }));
  }

  if (recoilMasterToggle) {
    recoilMasterToggle.addEventListener('change', () => {
      setRecoilState(recoilMasterToggle.checked);
    });
  }

  // Global F9 Hotkey for No Recoil toggle
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F9') {
      e.preventDefault();
      const newState = !recoilMasterToggle.checked;
      setRecoilState(newState);
    }
  });

  // Save Recoil Profile Button
  if (btnSaveRecoilProfile) {
    btnSaveRecoilProfile.addEventListener('click', () => {
      try {
        localStorage.setItem('shark_recoil_profiles', JSON.stringify(weaponRecoilStore));
      } catch (err) {}

      const w = getWeapon(currentWeaponId);
      playTone(660, 0.08, 'triangle', 0.04);
      notify('Profile Saved', `Calibrated profile for ${w.name} stored and active.`, 'success');

      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'recoil-save',
        weapon: w.name,
        profiles: weaponRecoilStore[currentWeaponId]
      }));
    });
  }

  // Initial render of armory (Default state: OFF)
  renderWeaponArmory();
  selectWeapon('m416');
  setRecoilState(false, false);

  // Floating In-Game HUD Overlay Controls
  const switchHudOverlay = document.getElementById('switch-hud-overlay');
  const btnHudLock = document.getElementById('btn-hud-lock');
  const iconHudLock = document.getElementById('iconHudLock');
  const textHudLock = document.getElementById('textHudLock');
  let isHudLocked = true;
  if (switchHudOverlay) switchHudOverlay.checked = false;

  function updateHudLockUI(locked) {
    isHudLocked = locked;
    if (iconHudLock) iconHudLock.className = locked ? 'ri-lock-line' : 'ri-lock-unlock-line';
    if (textHudLock) textHudLock.textContent = locked ? 'HUD Position Locked' : 'HUD Position Unlocked (Draggable)';
    if (btnHudLock) {
      btnHudLock.style.borderColor = locked ? 'var(--border-base)' : 'var(--accent)';
      btnHudLock.style.color = locked ? 'var(--text-secondary)' : 'var(--accent)';
      btnHudLock.style.background = locked ? 'rgba(255, 255, 255, 0.04)' : 'var(--accent-dim)';
    }
  }

  if (switchHudOverlay) {
    switchHudOverlay.addEventListener('change', () => {
      const enabled = switchHudOverlay.checked;
      playTone(enabled ? 600 : 380, 0.04);
      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'toggle_hud_overlay',
        enabled: enabled ? 1 : 0
      }));
      notify('HUD Overlay', enabled ? 'In-Game Floating HUD enabled' : 'In-Game Floating HUD hidden', enabled ? 'success' : 'warn');
    });
  }

  if (btnHudLock) {
    btnHudLock.addEventListener('click', () => {
      isHudLocked = !isHudLocked;
      playTone(520, 0.03);
      window.chrome?.webview?.postMessage(JSON.stringify({
        type: 'toggle_hud_lock',
        locked: isHudLocked ? 1 : 0
      }));
      updateHudLockUI(isHudLocked);
      notify('HUD Overlay', isHudLocked ? 'Position locked (Click-through mode)' : 'Position unlocked (Drag to move)', 'info');
    });
  }

  // Fetch saved HUD overlay config on startup
  window.chrome?.webview?.postMessage('get-hud-config');
  window.chrome?.webview?.postMessage(JSON.stringify({ type: 'get-gameloop-config' }));

  // =========================================================================
  // --- GameLoop Engine Suite Controller ---
  // =========================================================================
  const btnApplyGameLoop = document.getElementById('btnApplyGameLoop');

  function syncGameLoopConfigUI(cfg) {
    if (!cfg) return;
    const selectPill = (group, val) => {
      if (val === undefined || val === null) return;
      const row = document.querySelector(`[data-gl-group="${group}"]`);
      if (!row) return;
      const valStr = String(val).toLowerCase();
      row.querySelectorAll('.seg-btn').forEach((b) => {
        const bVal = (b.getAttribute('data-val') || '').toLowerCase();
        if (bVal === valStr) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    };

    if (cfg.renderApi || cfg.renderMode) selectPill('render-api', cfg.renderApi || cfg.renderMode);
    if (cfg.resolution) selectPill('resolution', cfg.resolution);
    if (cfg.quality) selectPill('quality', cfg.quality);
    if (cfg.fps) selectPill('fps', cfg.fps);

    if (cfg.hooks) {
      const setChk = (id, val) => {
        const el = document.getElementById(id);
        if (el && typeof val === 'boolean') el.checked = val;
      };
      setChk('glHookCache', cfg.hooks.cache);
      setChk('glHookGlobalCache', cfg.hooks.globalCache);
      setChk('glHookGpu', cfg.hooks.gpu);
      setChk('glHookOpt', cfg.hooks.opt);
      setChk('glHookRoot', cfg.hooks.root);
      setChk('glHookAdb', cfg.hooks.adb);
    }
  }

  // Interactive pill selection in GameLoop
  document.querySelectorAll('.gameloop-pill-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      playTone(500, 0.03);

      row.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Play click sound on GameLoop performance hook toggles
  document.querySelectorAll('.gameloop-hooks-list .switch input').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      playTone(toggle.checked ? 580 : 420, 0.02);
    });
  });

  if (btnApplyGameLoop) {
    btnApplyGameLoop.addEventListener('click', () => {
      const getActiveVal = (group) => {
        const el = document.querySelector(`[data-gl-group="${group}"] .seg-btn.active`);
        return el ? el.getAttribute('data-val') : '';
      };

      const config = {
        type: 'save-gameloop-config',
        renderApi: getActiveVal('render-api') || getActiveVal('render-mode') || 'DirectX+',
        resolution: getActiveVal('resolution') || '1080P',
        quality: getActiveVal('quality') || 'Balanced',
        fps: getActiveVal('fps') || 'Default',
        hooks: {
          cache: document.getElementById('glHookCache')?.checked ?? true,
          globalCache: document.getElementById('glHookGlobalCache')?.checked ?? true,
          gpu: document.getElementById('glHookGpu')?.checked ?? true,
          opt: document.getElementById('glHookOpt')?.checked ?? true,
          root: document.getElementById('glHookRoot')?.checked ?? false,
          adb: document.getElementById('glHookAdb')?.checked ?? true
        }
      };

      try {
        localStorage.setItem('shark_gameloop_config', JSON.stringify(config));
      } catch (e) {}

      playTone(680, 0.09, 'triangle', 0.04);
      notify(
        'GameLoop Config Saving...',
        `Applying: ${config.renderApi} • ${config.resolution} • ${config.quality} Quality • ${config.fps} FPS`,
        'info'
      );

      window.chrome?.webview?.postMessage(JSON.stringify(config));
    });
  }


  // --- OPEN GL Fixer (Live Execution Matching OpenGL Test) ---
  const btnOpenGlStart = document.getElementById('btnOpenGlStart');
  const btnOpenGlRemove = document.getElementById('btnOpenGlRemove');
  const openglStateBadge = document.getElementById('openglStateBadge');
  const openglPipelineText = document.getElementById('openglPipelineText');
  const openglProgressTrack = document.getElementById('openglProgressTrack');
  const openglProgressBar = document.getElementById('openglProgressBar');
  const openglConsoleLog = document.getElementById('openglConsoleLog');
  const btnClearOpenGlLog = document.getElementById('btnClearOpenGlLog');

  function appendOpenGlLog(line, tag = '[OPENGL]') {
    if (!openglConsoleLog) return;
    const entry = document.createElement('div');
    entry.style.fontFamily = 'var(--font-mono)';
    entry.style.fontSize = '11px';
    entry.style.lineHeight = '1.6';

    let color = 'var(--text-secondary)';
    if (line.includes('[+]') || line.includes('[SUCCESS]') || line.includes('Successfully') || line.includes('applied successfully')) {
      color = 'var(--status-ok)';
    } else if (line.includes('[!]') || line.includes('Error') || line.includes('fail') || line.includes('denied')) {
      color = '#ef4444';
    } else if (line.includes('[*]') || line.includes('Step')) {
      color = '#f59e0b';
    }

    const tagColor = tag.includes('FIX-VT') ? '#a855f7' : 'var(--accent)';
    entry.innerHTML = `<span style="color:${tagColor}; font-weight:700;">${tag}</span> <span style="color:${color};">${line}</span>`;
    openglConsoleLog.appendChild(entry);
    openglConsoleLog.scrollTop = openglConsoleLog.scrollHeight;
  }

  if (btnClearOpenGlLog) {
    btnClearOpenGlLog.addEventListener('click', () => {
      if (openglConsoleLog) {
        openglConsoleLog.innerHTML = '<span class="log-dim">[NX CORE] Log cleared. Ready.</span>';
      }
    });
  }

  // --- GameLoop Boost & OpenGL Turbo Modal Popup Controller ---
  const boostOverlay = document.getElementById('boostOverlay');
  const boostModal = document.getElementById('boostModal');
  const boostModalTitle = document.getElementById('boostModalTitle');
  const boostHeaderIcon = document.getElementById('boostHeaderIcon');
  const boostCloseBtn = document.getElementById('boostCloseBtn');
  const boostIconCircle = document.getElementById('boostIconCircle');
  const boostVisualIcon = document.getElementById('boostVisualIcon');
  const boostPercentNumber = document.getElementById('boostPercentNumber');
  const boostStatusTitle = document.getElementById('boostStatusTitle');
  const boostStatusDesc = document.getElementById('boostStatusDesc');
  const boostStepBadge = document.getElementById('boostStepBadge');
  const boostProgressBar = document.getElementById('boostProgressBar');
  const boostFooter = document.getElementById('boostFooter');
  const boostFinishBtn = document.getElementById('boostFinishBtn');

  function openBoostModal(headerTitle, headerIcon) {
    if (boostModalTitle && headerTitle) boostModalTitle.textContent = headerTitle;
    if (boostHeaderIcon && headerIcon) boostHeaderIcon.className = `${headerIcon} boost-header-icon`;
    if (boostFooter) boostFooter.style.display = 'none';
    if (boostCloseBtn) boostCloseBtn.style.display = 'none';
    if (boostIconCircle) {
      boostIconCircle.classList.remove('success', 'error');
      boostIconCircle.classList.add('active');
    }
    if (boostOverlay) boostOverlay.classList.add('active');
    if (boostModal) boostModal.classList.add('active');
  }

  function updateBoostModal(percent, title, desc, step, status, headerTitle, headerIcon) {
    openBoostModal(headerTitle, headerIcon);

    if (boostPercentNumber && percent !== undefined) boostPercentNumber.textContent = percent;
    if (boostStatusTitle && title) boostStatusTitle.textContent = title;
    if (boostStatusDesc && desc) boostStatusDesc.textContent = desc;
    if (boostStepBadge && step) boostStepBadge.textContent = step;
    if (boostProgressBar && percent !== undefined) boostProgressBar.style.width = `${percent}%`;

    if (status === 'completed' || status === 'success') {
      if (boostFooter) boostFooter.style.display = 'block';
      if (boostCloseBtn) boostCloseBtn.style.display = 'flex';
      if (boostIconCircle) {
        boostIconCircle.classList.remove('active', 'error');
        boostIconCircle.classList.add('success');
      }
      if (boostVisualIcon) boostVisualIcon.className = 'ri-check-line';
    } else if (status === 'error' || status === 'failed') {
      if (boostFooter) boostFooter.style.display = 'block';
      if (boostCloseBtn) boostCloseBtn.style.display = 'flex';
      if (boostIconCircle) {
        boostIconCircle.classList.remove('active', 'success');
        boostIconCircle.classList.add('error');
      }
      if (boostVisualIcon) boostVisualIcon.className = 'ri-error-warning-line';
    } else {
      if (boostVisualIcon && headerIcon) boostVisualIcon.className = headerIcon;
    }
  }

  function closeBoostModal() {
    if (boostOverlay) boostOverlay.classList.remove('active');
    if (boostModal) boostModal.classList.remove('active');
  }

  window.openBoostModal = openBoostModal;
  window.updateBoostModal = updateBoostModal;
  window.closeBoostModal = closeBoostModal;

  if (boostCloseBtn) boostCloseBtn.addEventListener('click', closeBoostModal);
  if (boostFinishBtn) boostFinishBtn.addEventListener('click', closeBoostModal);
  if (boostOverlay) boostOverlay.addEventListener('click', () => {
    if (boostFooter && boostFooter.style.display === 'block') {
      closeBoostModal();
    }
  });

  let isGlRunning = false;

  if (btnOpenGlStart) {
    btnOpenGlStart.addEventListener('click', () => {
      if (isGlRunning) {
        notify('OpenGL Engine', 'Optimization already running, please wait...', 'warn');
        return;
      }
      isGlRunning = true;
      btnOpenGlStart.disabled = true;
      btnOpenGlRemove.disabled = true;
      if (openglStateBadge) {
        openglStateBadge.textContent = 'Applying...';
        openglStateBadge.style.color = '#f59e0b';
      }
      if (openglPipelineText) openglPipelineText.textContent = 'Configuring OpenGL...';
      if (openglProgressTrack) openglProgressTrack.style.display = 'block';
      if (openglProgressBar) openglProgressBar.style.width = '10%';

      appendOpenGlLog('Initializing GameLoop OpenGL Engine...', '[OPENGL]');
      updateBoostModal(5, 'Detecting GameLoop Installation...', 'Searching Windows registry and default drive paths for TxGameAssistant UI...', 'Step 1/9', 'loading', 'GAMELOOP FIX OPEN GL', 'ri-cube-line');

      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(JSON.stringify({ action: 'fix_opengl' }));
      }
    });
  }

  if (btnOpenGlRemove) {
    btnOpenGlRemove.addEventListener('click', () => {
      if (isGlRunning) {
        notify('OpenGL Engine', 'Operation in progress, please wait...', 'warn');
        return;
      }
      isGlRunning = true;
      btnOpenGlStart.disabled = true;
      btnOpenGlRemove.disabled = true;
      if (openglStateBadge) {
        openglStateBadge.textContent = 'Restoring...';
        openglStateBadge.style.color = '#f59e0b';
      }
      if (openglPipelineText) openglPipelineText.textContent = 'Restoring DirectX...';
      if (openglProgressTrack) openglProgressTrack.style.display = 'block';
      if (openglProgressBar) openglProgressBar.style.width = '10%';

      appendOpenGlLog('Initializing GameLoop System Restore...', '[FIX-VT]');
      updateBoostModal(10, 'Detecting GameLoop Installation...', 'Searching for GameLoop UI path to restore settings...', 'Step 1/6', 'loading', 'GAMELOOP FIX VT', 'ri-restart-line');

      if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(JSON.stringify({ action: 'restore_settings' }));
      }
    });
  }

  // =========================================================================
  // --- System Cleaner Controller (Ported from NXTweaksC) ---
  // =========================================================================
  const deleteGameloopModalOverlay = document.getElementById('deleteGameloopModalOverlay');
  const btnConfirmDeleteGameloop = document.getElementById('btnConfirmDeleteGameloop');
  const btnCancelDeleteGameloop = document.getElementById('btnCancelDeleteGameloop');
  const btnCancelDeleteGameloopX = document.getElementById('btnCancelDeleteGameloopX');
  const cleanConsoleLog = document.getElementById('cleanConsoleLog');
  const btnClearCleanLog = document.getElementById('btnClearCleanLog');

  function showDeleteGameloopModal() {
    playTone(320, 0.05, 'sawtooth', 0.03);
    if (deleteGameloopModalOverlay) {
      deleteGameloopModalOverlay.classList.add('active');
    }
  }

  function hideDeleteGameloopModal() {
    playTone(450, 0.03);
    if (deleteGameloopModalOverlay) {
      deleteGameloopModalOverlay.classList.remove('active');
    }
  }

  if (btnCancelDeleteGameloop) {
    btnCancelDeleteGameloop.addEventListener('click', hideDeleteGameloopModal);
  }
  if (btnCancelDeleteGameloopX) {
    btnCancelDeleteGameloopX.addEventListener('click', hideDeleteGameloopModal);
  }
  if (deleteGameloopModalOverlay) {
    deleteGameloopModalOverlay.addEventListener('click', (e) => {
      if (e.target === deleteGameloopModalOverlay) {
        hideDeleteGameloopModal();
      }
    });
  }

  if (btnConfirmDeleteGameloop) {
    btnConfirmDeleteGameloop.addEventListener('click', () => {
      hideDeleteGameloopModal();
      executeCleanAction('delete-gameloop');
    });
  }

  if (btnClearCleanLog) {
    btnClearCleanLog.addEventListener('click', () => {
      if (cleanConsoleLog) {
        cleanConsoleLog.innerHTML = `<span class="log-dim">// system cleaner engine ready... waiting for clean action.</span>`;
      }
    });
  }

  function executeCleanAction(action) {
    playTone(540, 0.04);

    // Find trigger button to animate
    const btns = document.querySelectorAll(`[data-action="${action}"]`);
    btns.forEach(btn => {
      btn.classList.add('loading');
      const icon = btn.querySelector('i');
      if (icon) {
        if (!btn.dataset.origIcon) btn.dataset.origIcon = icon.className;
        icon.className = 'ri-loader-4-line ri-spin';
      }
    });

    // Append to live log
    if (cleanConsoleLog) {
      const time = new Date().toLocaleTimeString();
      const line = document.createElement('div');
      line.innerHTML = `<span class="log-dim">[${time}] ></span> <span style="color:#00d2ff; font-weight:600;">Dispatching [${action}]...</span>`;
      cleanConsoleLog.appendChild(line);
      cleanConsoleLog.scrollTop = cleanConsoleLog.scrollHeight;
    }

    // Post to C++ WebView2 host
    if (window.chrome?.webview) {
      window.chrome.webview.postMessage(action);
    } else {
      // Dev mode fallback
      setTimeout(() => {
        notify('System Cleaner', `Executed [${action}] in dev simulation.`, 'success');
        btns.forEach(btn => {
          btn.classList.remove('loading');
          const icon = btn.querySelector('i');
          if (icon && btn.dataset.origIcon) icon.className = btn.dataset.origIcon;
        });
      }, 700);
    }
  }

  // Universal Click Handler for Clean Actions
  document.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.getAttribute('data-action');
    if (!action) return;

    const cleanActions = ['full-clean', 'ip-flush', 'clear-temp', 'clean-gpu', 'delete-gameloop'];
    if (cleanActions.includes(action)) {
      if (action === 'delete-gameloop') {
        showDeleteGameloopModal();
      } else {
        executeCleanAction(action);
      }
    }
  });

  // --- Native Frameless Window Controls Bridge ---
  const btnWinMin = document.getElementById('btnWinMin');
  const btnWinMax = document.getElementById('btnWinMax');
  const btnWinClose = document.getElementById('btnWinClose');
  const iconWinMax = document.getElementById('iconWinMax');
  const titlebarDragRegion = document.getElementById('titlebarDragRegion');

  if (btnWinMin) {
    btnWinMin.addEventListener('click', (e) => {
      e.stopPropagation();
      window.chrome?.webview?.postMessage('window-action:min');
    });
  }

  if (btnWinMax) {
    btnWinMax.addEventListener('click', (e) => {
      e.stopPropagation();
      window.chrome?.webview?.postMessage('window-action:max');
    });
  }

  if (btnWinClose) {
    btnWinClose.addEventListener('click', (e) => {
      e.stopPropagation();
      window.chrome?.webview?.postMessage('window-action:close');
    });
  }

  if (titlebarDragRegion) {
    titlebarDragRegion.addEventListener('mousedown', (e) => {
      if (e.button === 0 && !e.target.closest('.titlebar-window-controls')) {
        window.chrome?.webview?.postMessage('window-action:drag');
      }
    });

    titlebarDragRegion.addEventListener('dblclick', (e) => {
      if (!e.target.closest('.titlebar-window-controls')) {
        window.chrome?.webview?.postMessage('window-action:max');
      }
    });
  }

  if (window.chrome?.webview) {
    window.chrome.webview.addEventListener('message', (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        if (data === 'window-state:maximized') {
          if (iconWinMax) iconWinMax.className = 'ri-file-copy-line';
          return;
        } else if (data === 'window-state:restored') {
          if (iconWinMax) iconWinMax.className = 'ri-checkbox-blank-line';
          return;
        }
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }
      if (data && data.type === 'auth-state-result') {
        if (loginHwidTag && data.hwid) {
          const shortHwid = data.hwid.length > 18 ? (data.hwid.substring(0, 8) + '...' + data.hwid.substring(data.hwid.length - 6)) : data.hwid;
          loginHwidTag.textContent = `HWID: ${shortHwid}`;
          loginHwidTag.title = data.hwid;
        }
        if (data.savedKey && loginKey) {
          loginKey.value = data.savedKey;
        }
        if (data.authenticated) {
          if (authScreen) authScreen.classList.add('hidden');
          window.chrome?.webview?.postMessage('get-telemetry');
          window.chrome?.webview?.postMessage('check-gameloop');
          window.chrome?.webview?.postMessage('get-hud-config');
          window.chrome?.webview?.postMessage('get-gameloop-config');
        } else if (data.autoLogin && data.savedKey) {
          setLoginButtonState(true, 'Authenticating...');
          window.chrome?.webview?.postMessage(JSON.stringify({
            action: 'auth-login',
            key: data.savedKey,
            remember: true
          }));
        }
      } else if (data && data.type === 'auth-login-result') {
        setLoginButtonState(false);
        if (data.success) {
          if (authScreen) authScreen.classList.add('hidden');
          const keyStr = data.key || loginKey?.value || '';
          if (activeUserName) {
            const userDisplay = keyStr.length > 10 ? keyStr.substring(0, 10).toUpperCase() : (keyStr || 'Shark VIP');
            activeUserName.textContent = userDisplay;
          }
          if (activeUserInitials) {
            const keyStr = data.key || loginKey?.value || 'SH';
            activeUserInitials.textContent = (keyStr.substring(0, 2) || 'SH').toUpperCase();
          }
          if (activeUserPlan) {
            let planText = 'VIP LICENSE';
            if (data.expiry) {
              if (/^\d+$/.test(data.expiry)) {
                const expDate = new Date(parseInt(data.expiry, 10) * 1000);
                const daysLeft = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
                if (daysLeft > 0) planText = `VIP (${daysLeft}d left)`;
                else planText = 'VIP (Lifetime)';
              } else if (data.expiry.toLowerCase().includes('lifetime')) {
                planText = 'VIP (Lifetime)';
              } else {
                planText = `VIP (${data.expiry})`;
              }
            }
            activeUserPlan.textContent = planText;
          }
          playTone(680, 0.08, 'triangle', 0.05);
          notify('License Verified', data.message || 'Access granted to Shark Tweaks Suite.', 'success');
          window.chrome?.webview?.postMessage('get-telemetry');
          window.chrome?.webview?.postMessage('check-gameloop');
          window.chrome?.webview?.postMessage('get-hud-config');
          window.chrome?.webview?.postMessage('get-gameloop-config');
        } else {
          playTone(240, 0.12, 'sawtooth', 0.08);
          notify('Authentication Failed', data.message || 'Invalid or expired license key.', 'danger');
          if (loginKey) {
            loginKey.focus();
            loginKey.classList.add('input-error-shake');
            setTimeout(() => loginKey.classList.remove('input-error-shake'), 600);
          }
        }
      } else if (data && data.type === 'auth-logout-result') {
        if (authScreen) authScreen.classList.remove('hidden');
      } else if (data && data.type === 'auth-error') {
        if (authScreen) authScreen.classList.remove('hidden');
        setLoginButtonState(false);
        notify('Authentication Required', data.message || 'Please sign in with a valid license key.', 'danger');
      } else if (data && data.type === 'telemetry') {
        applyRealTelemetry(data);
      } else if (data && data.type === 'gfx-connect-result') {
        if (data.connected) {
          isGfxConnected = true;
          if (gfxConnectTag) {
            gfxConnectTag.innerHTML = '● Connected';
            gfxConnectTag.style.color = 'var(--status-ok)';
            gfxConnectTag.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          }
          if (sidebarBridgeStatus) {
            sidebarBridgeStatus.textContent = '● Connected';
            sidebarBridgeStatus.style.color = 'var(--status-ok)';
          }

          // Auto-select package version in UI if detected
          if (data.package) {
            const pkgMap = {
              'com.tencent.ig': 'Global',
              'com.pubg.krmobile': 'Korea',
              'com.vng.pubgmobile': 'Vietnam',
              'com.rekoo.pubgm': 'Taiwan',
              'com.pubg.imobile': 'India'
            };
            const verName = pkgMap[data.package];
            if (verName) {
              document.querySelectorAll('[data-gfx-group="version"] .seg-btn').forEach(btn => {
                if (btn.getAttribute('data-val') === verName) btn.classList.add('active');
                else btn.classList.remove('active');
              });
            }
          }

          // Auto-sync current GFX settings read from Active.sav
          if (data.quality && data.quality !== -1) {
            const qMap = { 1: 'Smooth', 2: 'Smooth', 3: 'Balanced', 4: 'HD', 5: 'HDR', 6: 'Ultra HDR' };
            const qName = qMap[data.quality];
            if (qName) {
              document.querySelectorAll('[data-gfx-group="quality"] .seg-btn').forEach(btn => {
                if (btn.getAttribute('data-val') === qName) btn.classList.add('active');
                else btn.classList.remove('active');
              });
            }
          }
          if (data.fps && data.fps !== -1) {
            const fMap = { 1: '30 fps', 2: '30 fps', 3: '40 fps', 4: '60 fps', 5: '60 fps', 6: '90 fps', 7: '90 fps', 8: '120 fps' };
            const fName = fMap[data.fps];
            if (fName) {
              document.querySelectorAll('[data-gfx-group="fps"] .seg-btn').forEach(btn => {
                if (btn.getAttribute('data-val') === fName) btn.classList.add('active');
                else btn.classList.remove('active');
              });
            }
          }
          if (data.style && data.style !== -1) {
            const sMap = { 1: 'Classic', 2: 'Colorful', 3: 'Realistic', 4: 'Soft', 5: 'Movie', 6: 'Movie' };
            const sName = sMap[data.style];
            if (sName) {
              document.querySelectorAll('[data-gfx-group="style"] .pubg-style-card').forEach(card => {
                if (card.getAttribute('data-style') === sName) card.classList.add('active');
                else card.classList.remove('active');
              });
            }
          }
          if (data.shadow !== undefined && data.shadow !== -1) {
            const sVal = (data.shadow === 49) ? 'Enable Shadows' : 'Disable Shadows';
            document.querySelectorAll('[data-gfx-group="shadows"] .seg-btn').forEach(btn => {
              const val = btn.getAttribute('data-val');
              if (val === 'Enable Shadows' || val === 'Disable Shadows') {
                if (val === sVal) btn.classList.add('active');
                else btn.classList.remove('active');
              }
            });
          }

          updateGfxSummary();
          playTone(660, 0.06);
          notify('GameLoop Connected', `Connected via ADB (${data.package || 'PUBG Mobile detected'}).`, 'success');
        } else {
          isGfxConnected = false;
          if (gfxConnectTag) {
            gfxConnectTag.textContent = 'Offline';
            gfxConnectTag.style.color = 'var(--status-err)';
            gfxConnectTag.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }
          if (sidebarBridgeStatus) {
            sidebarBridgeStatus.textContent = '○ Disconnected';
            sidebarBridgeStatus.style.color = 'var(--status-err)';
          }
          playTone(280, 0.08);
          notify('Connection Failed', data.message || 'Could not connect to GameLoop via ADB.', 'danger');
        }
      } else if (data && data.type === 'gfx-apply-result') {
        if (data.success) {
          if (gfxApplyProgressBar) gfxApplyProgressBar.style.width = '100%';
          if (gfxApplyStatusText) gfxApplyStatusText.textContent = 'Applied';
          const summary = document.getElementById('gfxSelectedSummary')?.textContent || 'GFX';
          playTone(700, 0.08, 'triangle', 0.04);
          notify('Combat Profile Applied', data.message || `Settings applied: ${summary}`, 'success');
        } else {
          if (gfxApplyProgressBar) gfxApplyProgressBar.style.width = '0%';
          if (gfxApplyStatusText) gfxApplyStatusText.textContent = 'Failed';
          playTone(260, 0.1);
          notify('Apply Failed', data.message || 'Error applying graphics settings to emulator.', 'danger');
        }
      } else if (data && data.type === 'gfx-reset-guest-result') {
        if (data.success) {
          if (gfxResetGuestTag) {
            gfxResetGuestTag.textContent = 'Cleared!';
            gfxResetGuestTag.style.color = '#10b981';
          }
          playTone(680, 0.08, 'triangle', 0.04);
          notify('Guest Account Reset', data.message || 'Guest cache, MMKV tokens & device ID cleared successfully.', 'success');
          setTimeout(() => {
            if (gfxResetGuestTag) {
              gfxResetGuestTag.textContent = 'Reset';
              gfxResetGuestTag.style.color = '#f59e0b';
            }
          }, 2500);
        } else {
          if (gfxResetGuestTag) {
            gfxResetGuestTag.textContent = 'Failed';
            gfxResetGuestTag.style.color = '#ef4444';
          }
          playTone(280, 0.08);
          notify('Reset Failed', data.message || 'Could not clear guest account.', 'danger');
        }
      } else if (data && data.type === 'gfx-kill-result') {
        isGfxConnected = false;
        if (gfxConnectTag) {
          gfxConnectTag.textContent = 'Connect';
          gfxConnectTag.style.color = 'var(--text-muted)';
          gfxConnectTag.style.borderColor = 'var(--border-base)';
        }
        if (sidebarBridgeStatus) {
          sidebarBridgeStatus.textContent = '○ Offline';
          sidebarBridgeStatus.style.color = 'var(--status-err)';
        }
        playTone(360, 0.06);
        notify('Emulator Terminated', 'All GameLoop & emulator processes stopped.', 'warn');
      } else if (data && data.type === 'clean-status') {
        const title = data.title || 'System Cleaner';
        const msg = data.message || '';
        const status = data.status || 'info';

        let variant = 'info';
        if (status === 'success') variant = 'success';
        else if (status === 'error') variant = 'danger';
        else if (status === 'loading') variant = 'info';

        notify(title, msg, variant);

        if (cleanConsoleLog) {
          const entry = document.createElement('div');
          const time = new Date().toLocaleTimeString();
          if (status === 'loading') {
            entry.innerHTML = `<span class="log-dim">[${time}] > ${title}:</span> <span style="color:#fbbf24;">${msg}</span>`;
          } else if (status === 'success') {
            entry.innerHTML = `<span class="log-dim">[${time}] > ${title}:</span> <span class="log-ok">[OK] ${msg}</span>`;
          } else {
            entry.innerHTML = `<span class="log-dim">[${time}] > ${title}:</span> <span style="color:#ef4444;">[FAIL] ${msg}</span>`;
          }
          cleanConsoleLog.appendChild(entry);
          cleanConsoleLog.scrollTop = cleanConsoleLog.scrollHeight;
        }

        // Reset any loading buttons
        if (status !== 'loading') {
          document.querySelectorAll(`[data-action="${data.action}"]`).forEach(btn => {
            btn.classList.remove('loading');
            const icon = btn.querySelector('i');
            if (icon && btn.dataset.origIcon) {
              icon.className = btn.dataset.origIcon;
            }
          });
        }
      } else if (data && data.type === 'tweak-progress') {
        const tweakId = data.id || data.step || 0;
        const name = data.name || data.file || `Tweak ${tweakId}`;
        const step = data.step || 0;
        const total = data.total || 1;
        const status = data.status || 'running';
        
        // Find matching tweak card to get human title
        const card = document.querySelector(`.tweak-card[data-tweak="${tweakId}"]`);
        const title = card ? card.querySelector('h4')?.textContent.trim() : name;

        if (modalConsoleLog) {
          if (status === 'running') {
            const entry = document.createElement('div');
            entry.innerHTML = `<div class="log-cmd">> Optimizing [${name}]...</div>`;
            modalConsoleLog.appendChild(entry);
          } else {
            const entry = document.createElement('div');
            entry.innerHTML = `<div class="log-ok">  [OK] ${title} committed.</div>`;
            modalConsoleLog.appendChild(entry);
          }
          modalConsoleLog.scrollTop = modalConsoleLog.scrollHeight;
        }

        const pct = Math.round((step / total) * 100);
        if (modalProgressBar) modalProgressBar.style.width = `${pct}%`;
        if (modalStatusBadge) modalStatusBadge.textContent = `${pct}%`;
        playTone(420 + (step % 10) * 16, 0.02, 'sine', 0.015);

      } else if (data && data.type === 'tweak-complete') {
        if (modalConsoleLog) {
          const summaryEntry = document.createElement('div');
          summaryEntry.innerHTML = `
            <div class="log-dim" style="margin-top:6px;">// ============================================</div>
            <div class="log-ok" style="font-weight:700;">[SUCCESS] All ${data.total} tweaks successfully executed & applied!</div>
            <div class="log-dim">// Kernel priorities, GPU scheduling, timer resolution & system flags active.</div>
          `;
          modalConsoleLog.appendChild(summaryEntry);
          modalConsoleLog.scrollTop = modalConsoleLog.scrollHeight;
        }

        if (modalTitle) modalTitle.textContent = 'Optimization Complete!';
        if (modalSubtitle) modalSubtitle.textContent = `Successfully applied ${data.total} system tweaks`;
        if (modalStatusBadge) modalStatusBadge.textContent = '100%';
        if (modalProgressBar) modalProgressBar.style.width = '100%';
        if (modalSpinner) {
          modalSpinner.className = 'modal-spinner done';
          modalSpinner.innerHTML = '<i class="ri-check-line"></i>';
        }
        if (modalFooter) modalFooter.style.display = 'block';

        playTone(720, 0.08, 'triangle', 0.04);
        notify('Optimization Complete', `${data.total} tweaks executed and applied successfully.`, 'success');
      } else if (data && data.type === 'tweak-error') {
        notify('Tweak Execution Error', data.message || 'Error occurred while applying tweaks.', 'danger');
        if (modalTitle) modalTitle.textContent = 'Optimization Error';
        if (modalSubtitle) modalSubtitle.textContent = data.message || 'Execution error';
        if (modalFooter) modalFooter.style.display = 'block';
      } else if (data && data.type === 'boost_modal_update') {
        updateBoostModal(
          data.percent,
          data.title,
          data.desc,
          data.step,
          data.status,
          data.headerTitle,
          data.headerIcon
        );
      } else if (data && (data.type === 'opengl-log' || data.event === 'script_log')) {
        const tag = data.tag || '[OPENGL]';
        const line = data.line || '';
        appendOpenGlLog(line, tag);
        if (openglProgressBar) {
          if (line.includes('Step 1')) openglProgressBar.style.width = '20%';
          else if (line.includes('Step 2')) openglProgressBar.style.width = '35%';
          else if (line.includes('Step 3')) openglProgressBar.style.width = '50%';
          else if (line.includes('Step 4')) openglProgressBar.style.width = '65%';
          else if (line.includes('Step 5') || line.includes('Step 6')) openglProgressBar.style.width = '80%';
          else if (line.includes('Step 7') || line.includes('Step 8')) openglProgressBar.style.width = '90%';
          else if (line.includes('[SUCCESS]') || line.includes('Successfully')) openglProgressBar.style.width = '100%';
        }
      } else if (data && (data.type === 'opengl-status' || data.event === 'server_status')) {
        isGlRunning = false;
        if (btnOpenGlStart) btnOpenGlStart.disabled = false;
        if (btnOpenGlRemove) btnOpenGlRemove.disabled = false;
        if (openglProgressBar) openglProgressBar.style.width = '100%';
        setTimeout(() => {
          if (openglProgressTrack && !isGlRunning) openglProgressTrack.style.display = 'none';
        }, 1200);

        if (data.success) {
          playTone(660, 0.08, 'triangle', 0.04);
          if (data.action === 'fix_opengl') {
            if (openglStateBadge) {
              openglStateBadge.textContent = 'Active (OpenGL+)';
              openglStateBadge.style.color = 'var(--status-ok)';
            }
            if (openglPipelineText) openglPipelineText.textContent = 'Applied (Adreno 750 / ES 3.2)';
            notify('OpenGL Engine Active', data.message || 'GameLoop Local OpenGL Engine Configured Successfully!', 'success');
            updateBoostModal(100, 'GameLoop Local OpenGL Fixed!', data.message || 'All 9 OpenGL optimization steps applied cleanly with backups preserved!', 'Completed (9/9)', 'success', 'GAMELOOP FIX OPEN GL', 'ri-checkbox-circle-fill');
          } else {
            if (openglStateBadge) {
              openglStateBadge.textContent = 'Restored (DirectX+)';
              openglStateBadge.style.color = 'var(--text-secondary)';
            }
            if (openglPipelineText) openglPipelineText.textContent = 'Default (DirectX)';
            notify('GameLoop Restored', data.message || 'GameLoop settings restored successfully!', 'success');
            updateBoostModal(100, 'GameLoop Original Settings Restored!', data.message || 'All GameLoop settings and DirectX+ defaults have been successfully restored!', 'Completed (6/6)', 'success', 'GAMELOOP FIX VT', 'ri-checkbox-circle-fill');
          }
        } else {
          playTone(280, 0.1);
          if (openglStateBadge) {
            openglStateBadge.textContent = 'Error';
            openglStateBadge.style.color = '#ef4444';
          }
          notify('OpenGL Error', data.message || 'Error occurred while configuring OpenGL.', 'danger');
          updateBoostModal(100, 'Operation Failed', data.message || 'An error occurred during execution.', 'Error', 'error', data.action === 'fix_opengl' ? 'GAMELOOP FIX OPEN GL' : 'GAMELOOP FIX VT', 'ri-error-warning-fill');
        }
      } else if (data && data.type === 'gameloop-config-result') {
        syncGameLoopConfigUI(data);
      } else if (data && data.type === 'gameloop-save-result') {
        if (data.success) {
          notify('GameLoop Updated', 'GameLoop registry settings applied successfully.', 'success');
        }
      } else if (data && data.type === 'hud-init') {
        if (switchHudOverlay) switchHudOverlay.checked = !!data.enabled;
        updateHudLockUI(!!data.locked);
      } else if (data && data.type === 'recoil-toggled') {
        setRecoilState(!!data.enabled, true);
      } else if (data && data.type === 'weapon-detected') {
        if (data.weaponName) {
          const wName = data.weaponName.toLowerCase().replace(/[\s\-_]/g, '');
          const match = WEAPON_ARMORY.find(w => {
            const id = w.id.toLowerCase().replace(/[\s\-_]/g, '');
            const nm = w.name.toLowerCase().replace(/[\s\-_]/g, '');
            return id === wName || nm === wName || nm.includes(wName) || wName.includes(nm) ||
                   (wName.includes('762') && id === 'm762') ||
                   (wName.includes('scar') && id === 'scarl') ||
                   (wName.includes('416') && id === 'm416');
          });
          if (match) {
            if (match.id !== currentWeaponId) {
              selectWeapon(match.id);
              notify('Weapon Detected', `Auto-detected: ${match.name}`, 'info');
            } else {
              syncScopeSlider();
            }
          }
        }
      } else if (data && data.type === 'scope-detected') {
        if (data.scope) {
          const scMatch = SCOPES_LIST.find(sc => sc.toLowerCase().replace(/\s/g, '') === data.scope.toLowerCase().replace(/\s/g, '') || data.scope.toLowerCase().includes(sc.toLowerCase()) || (data.scope.toLowerCase().includes('red') && sc.toLowerCase().includes('red')));
          if (scMatch) {
            currentScope = scMatch;
            if (scopeSelectorGrid) {
              scopeSelectorGrid.querySelectorAll('.scope-btn').forEach((b) => {
                if (b.getAttribute('data-scope') === currentScope) b.classList.add('active');
                else b.classList.remove('active');
              });
            }
            syncScopeSlider();
            notify('Scope Detected', `Auto-detected: ${scMatch}`, 'info');
            // Inform C++ of user calibrated pull for this newly detected scope
            const activeW = getWeapon(currentWeaponId);
            window.chrome?.webview?.postMessage(JSON.stringify({
              type: 'recoil-update',
              weapon: activeW.name,
              scope: currentScope,
              pull: weaponRecoilStore[currentWeaponId]?.[currentScope] ?? activeW.pull
            }));
          }
        }
      }
    });
  }

  // =========================================================================
  // AIM ASSIST MODULE (DIRECTML YOLOv8s NEURAL TARGET TRACKING & FOV RADAR)
  // =========================================================================
  const aimState = {
    aimMaster: false,
    fovOverlay: true,
    aimWindow: false,
    sens: 1.8,
    smooth: 15.0,
    fov: 44,
    stepSpeed: 60,
    fovOffsetX: 0,
    fovOffsetY: -4,
    pitchRatio: 2.5,
    maxSpeed: 70,
    targetBone: 'chest',
    preset: 'balanced',
    device: 'gpu',
    targetFps: 40
  };

  function sendAimBridge(action, payload = {}) {
    if (window.chrome && window.chrome.webview) {
      const msg = { action: action, ...payload };
      window.chrome.webview.postMessage(JSON.stringify(msg));
    }
  }

  function saveCachedAimSettings() {
    try {
      localStorage.setItem('shark_aim_settings', JSON.stringify(aimState));
    } catch (e) {}
  }

  function loadCachedAimSettings() {
    try {
      const raw = localStorage.getItem('shark_aim_settings');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (typeof saved.fov === 'number') aimState.fov = saved.fov;
          if (typeof saved.fovOffsetX === 'number') aimState.fovOffsetX = saved.fovOffsetX;
          if (typeof saved.fovOffsetY === 'number') aimState.fovOffsetY = saved.fovOffsetY;
          if (typeof saved.sens === 'number') aimState.sens = saved.sens;
          if (typeof saved.smooth === 'number') aimState.smooth = saved.smooth;
          if (typeof saved.stepSpeed === 'number') aimState.stepSpeed = saved.stepSpeed;
          if (typeof saved.targetBone === 'string') aimState.targetBone = saved.targetBone;
          if (typeof saved.preset === 'string') aimState.preset = saved.preset;
          if (typeof saved.pitchRatio === 'number') aimState.pitchRatio = saved.pitchRatio;
          if (typeof saved.maxSpeed === 'number') aimState.maxSpeed = saved.maxSpeed;
          if (typeof saved.fovOverlay === 'boolean') aimState.fovOverlay = saved.fovOverlay;
          if (typeof saved.aimWindow === 'boolean') aimState.aimWindow = saved.aimWindow;
          if (typeof saved.device === 'string') aimState.device = saved.device;
          if (typeof saved.targetFps === 'number') aimState.targetFps = saved.targetFps;
        }
      }
    } catch (e) {}
  }

  function updateAimRadarPreview() {
    const radarCircle = document.getElementById('fovRadarCircle');
    if (!radarCircle) return;
    const r = Math.max(10, aimState.fov);
    radarCircle.style.width = `${r * 2}px`;
    radarCircle.style.height = `${r * 2}px`;
    const offX = Math.round(aimState.fovOffsetX * 0.7);
    const offY = Math.round(aimState.fovOffsetY * 0.7);
    radarCircle.style.transform = `translate(${offX}px, ${offY}px)`;
    radarCircle.style.borderColor = aimState.aimMaster ? '#10b981' : '#00ffcc';
    radarCircle.style.boxShadow = aimState.aimMaster ? '0 0 14px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(0, 255, 204, 0.4)';
  }

  function renderAimUI() {
    // 1. Master toggle button & badge
    const btnMaster = document.getElementById('btn-master-aim');
    const lblMaster = document.getElementById('lbl-master-aim-status');
    const badgeSidebar = document.getElementById('aimStateBadge');
    if (btnMaster) btnMaster.className = `aim-toggle-btn aim-master-btn ${aimState.aimMaster ? 'active' : ''}`;
    if (lblMaster) lblMaster.textContent = aimState.aimMaster ? 'ON' : 'OFF';
    if (badgeSidebar) {
      badgeSidebar.textContent = aimState.aimMaster ? 'ON' : 'OFF';
      badgeSidebar.style.background = aimState.aimMaster ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255, 255, 255, 0.08)';
      badgeSidebar.style.color = aimState.aimMaster ? '#ffffff' : 'var(--text-muted)';
    }

    // 2. Screen FOV toggle button
    const btnFov = document.getElementById('btn-toggle-fov-overlay');
    const lblFov = document.getElementById('lbl-fov-overlay-status');
    if (btnFov) btnFov.className = `aim-toggle-btn ${aimState.fovOverlay ? 'active' : ''}`;
    if (lblFov) {
      lblFov.textContent = aimState.fovOverlay ? 'VISIBLE' : 'HIDDEN';
      lblFov.style.color = aimState.fovOverlay ? '#10b981' : 'var(--text-muted)';
    }

    // 3. AI Window toggle button
    const btnWin = document.getElementById('btn-toggle-aim-window');
    const lblWin = document.getElementById('lbl-aim-window-status');
    if (btnWin) btnWin.className = `aim-toggle-btn ${aimState.aimWindow ? 'active' : ''}`;
    if (lblWin) lblWin.textContent = aimState.aimWindow ? 'ON' : 'OFF';

    // 4. Presets cards
    document.querySelectorAll('.preset-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-preset') === aimState.preset);
    });
    const presetTag = document.getElementById('aimActivePresetTag');
    if (presetTag) {
      presetTag.textContent = aimState.preset === 'smooth' ? 'Legit Smooth' :
                              aimState.preset === 'snappy' ? 'Tactical Snappy' : 'Balanced Profile';
    }

    // 5. Sliders values and inputs
    const elSens = document.getElementById('val-sens');
    const slSens = document.getElementById('slider-sens');
    if (elSens) elSens.textContent = `${aimState.sens.toFixed(1)}x`;
    if (slSens) slSens.value = aimState.sens;

    const elSmooth = document.getElementById('val-smooth');
    const slSmooth = document.getElementById('slider-smooth');
    if (elSmooth) elSmooth.textContent = aimState.smooth.toFixed(1);
    if (slSmooth) slSmooth.value = aimState.smooth;

    const elFov = document.getElementById('val-fov');
    const slFov = document.getElementById('slider-fov');
    if (elFov) elFov.textContent = `${aimState.fov} px`;
    if (slFov) slFov.value = aimState.fov;

    const elStep = document.getElementById('val-step');
    const slStep = document.getElementById('slider-step');
    if (elStep) elStep.textContent = `${aimState.stepSpeed} ms`;
    if (slStep) slStep.value = aimState.stepSpeed;

    const elFovX = document.getElementById('val-fov-x');
    const slFovX = document.getElementById('slider-fov-x');
    const px = aimState.fovOffsetX > 0 ? '+' : '';
    if (elFovX) elFovX.textContent = `${px}${aimState.fovOffsetX} px`;
    if (slFovX) slFovX.value = aimState.fovOffsetX;

    const elFovY = document.getElementById('val-fov-y');
    const slFovY = document.getElementById('slider-fov-y');
    const py = aimState.fovOffsetY > 0 ? '+' : '';
    if (elFovY) elFovY.textContent = `${py}${aimState.fovOffsetY} px`;
    if (slFovY) slFovY.value = aimState.fovOffsetY;

    const elPitch = document.getElementById('val-pitch');
    const slPitch = document.getElementById('slider-pitch');
    if (elPitch) elPitch.textContent = `${aimState.pitchRatio.toFixed(1)}x`;
    if (slPitch) slPitch.value = aimState.pitchRatio;

    const elMaxSpeed = document.getElementById('val-max-speed');
    const slMaxSpeed = document.getElementById('slider-max-speed');
    if (elMaxSpeed) elMaxSpeed.textContent = aimState.maxSpeed;
    if (slMaxSpeed) slMaxSpeed.value = aimState.maxSpeed;

    // 6. Target Locking Bone
    document.querySelectorAll('.bone-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-bone') === aimState.targetBone);
    });
    const boneTag = document.getElementById('activeBoneTag');
    if (boneTag) boneTag.textContent = aimState.targetBone.toUpperCase();

    // 7. Radar preview
    updateAimRadarPreview();

    // 7.5. FPS Target buttons
    document.querySelectorAll('.fps-btn').forEach(btn => {
      const fpsVal = parseInt(btn.getAttribute('data-fps'), 10);
      btn.classList.toggle('active', fpsVal === aimState.targetFps);
    });

    // 8. Hardware Engine device switcher
    const btnDevGpu = document.getElementById('btn-device-gpu');
    const btnDevCpu = document.getElementById('btn-device-cpu');
    const isGpu = aimState.device !== 'cpu';
    if (btnDevGpu) btnDevGpu.classList.toggle('active', isGpu);
    if (btnDevCpu) btnDevCpu.classList.toggle('active', !isGpu);

    const chipEngine = document.getElementById('chip-aim-engine-badge');
    if (chipEngine) {
      if (isGpu) {
        chipEngine.innerHTML = '<i class="ri-dashboard-3-line"></i> DirectML GPU Active';
        chipEngine.style.background = 'rgba(16, 185, 129, 0.12)';
        chipEngine.style.color = '#10b981';
        chipEngine.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      } else {
        chipEngine.innerHTML = '<i class="ri-cpu-line"></i> Multi-Core CPU Active';
        chipEngine.style.background = 'rgba(56, 189, 248, 0.12)';
        chipEngine.style.color = '#38bdf8';
        chipEngine.style.borderColor = 'rgba(56, 189, 248, 0.3)';
      }
    }
  }

  function initAimAssist() {
    loadCachedAimSettings();
    renderAimUI();

    // Hardware Engine device buttons (DirectML GPU vs CPU)
    const btnDevGpu = document.getElementById('btn-device-gpu');
    if (btnDevGpu) {
      btnDevGpu.addEventListener('click', () => {
        aimState.device = 'gpu';
        renderAimUI();
        saveCachedAimSettings();
        notify('Hardware Engine', 'DirectML GPU tensor acceleration enabled', 'success');
        sendAimBridge('set_aim_device', { device: 'gpu' });
      });
    }

    const btnDevCpu = document.getElementById('btn-device-cpu');
    if (btnDevCpu) {
      btnDevCpu.addEventListener('click', () => {
        aimState.device = 'cpu';
        renderAimUI();
        saveCachedAimSettings();
        notify('Hardware Engine', 'Multi-Core CPU inference selected', 'info');
        sendAimBridge('set_aim_device', { device: 'cpu' });
      });
    }

    // FPS Target pill buttons (30, 40, 60, 90, Max)
    document.querySelectorAll('.fps-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fpsVal = parseInt(btn.getAttribute('data-fps'), 10);
        aimState.targetFps = fpsVal;
        renderAimUI();
        saveCachedAimSettings();
        const lbl = fpsVal === 0 ? 'Max (Unlimited)' : `${fpsVal} FPS`;
        notify('FPS Target', `Aim Assist frame rate locked to ${lbl}`, 'info');
        sendAimBridge('set_aim_fps', { fps: fpsVal });
      });
    });

    // Master Aim button
    const btnMaster = document.getElementById('btn-master-aim');
    if (btnMaster) {
      btnMaster.addEventListener('click', () => {
        aimState.aimMaster = !aimState.aimMaster;
        renderAimUI();
        saveCachedAimSettings();
        notify(
          aimState.aimMaster ? 'Aim Assist Armed' : 'Aim Assist Standby',
          aimState.aimMaster ? 'DirectML neural tracking active on right click' : 'Inference paused',
          aimState.aimMaster ? 'success' : 'info'
        );
        sendAimBridge('toggle_aim_master', { active: aimState.aimMaster });
      });
    }

    // Screen FOV toggle button
    const btnFov = document.getElementById('btn-toggle-fov-overlay');
    if (btnFov) {
      btnFov.addEventListener('click', () => {
        aimState.fovOverlay = !aimState.fovOverlay;
        renderAimUI();
        saveCachedAimSettings();
        notify('Screen FOV Ring', aimState.fovOverlay ? 'Visible on display' : 'Hidden', 'info');
        sendAimBridge('toggle_fov_overlay', { show: aimState.fovOverlay });
      });
    }

    // AI Window toggle button
    const btnWin = document.getElementById('btn-toggle-aim-window');
    if (btnWin) {
      btnWin.addEventListener('click', () => {
        aimState.aimWindow = !aimState.aimWindow;
        renderAimUI();
        saveCachedAimSettings();
        notify('AI Vision Window', aimState.aimWindow ? 'Debug window shown' : 'Debug window hidden', 'info');
        sendAimBridge('toggle_aim_window', { show: aimState.aimWindow });
      });
    }

    // Presets
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const preset = card.getAttribute('data-preset');
        aimState.preset = preset;
        if (preset === 'smooth') {
          aimState.sens = 1.2;
          aimState.smooth = 24.0;
          aimState.stepSpeed = 35;
          aimState.maxSpeed = 50;
        } else if (preset === 'balanced') {
          aimState.sens = 1.8;
          aimState.smooth = 15.0;
          aimState.stepSpeed = 60;
          aimState.maxSpeed = 70;
        } else if (preset === 'snappy') {
          aimState.sens = 2.4;
          aimState.smooth = 8.0;
          aimState.stepSpeed = 90;
          aimState.maxSpeed = 110;
        }
        renderAimUI();
        saveCachedAimSettings();
        notify('Preset Selected', `Applied ${preset.toUpperCase()} configuration`, 'info');
        sendAimBridge('select_aim_preset', { preset: preset });
        sendAimBridge('update_aim_settings', {
          sens: aimState.sens,
          smooth: aimState.smooth,
          step: aimState.stepSpeed,
          preset: preset
        });
      });
    });

    // Sliders
    const slSens = document.getElementById('slider-sens');
    if (slSens) {
      slSens.addEventListener('input', (e) => {
        aimState.sens = parseFloat(e.target.value);
        document.getElementById('val-sens').textContent = `${aimState.sens.toFixed(1)}x`;
        saveCachedAimSettings();
        sendAimBridge('aim_sens', { sens: aimState.sens, data: aimState.sens });
      });
    }

    const slSmooth = document.getElementById('slider-smooth');
    if (slSmooth) {
      slSmooth.addEventListener('input', (e) => {
        aimState.smooth = parseFloat(e.target.value);
        document.getElementById('val-smooth').textContent = aimState.smooth.toFixed(1);
        saveCachedAimSettings();
        sendAimBridge('aim_smooth', { smooth: aimState.smooth, data: aimState.smooth });
      });
    }

    const slFov = document.getElementById('slider-fov');
    if (slFov) {
      slFov.addEventListener('input', (e) => {
        aimState.fov = parseInt(e.target.value, 10);
        document.getElementById('val-fov').textContent = `${aimState.fov} px`;
        updateAimRadarPreview();
        saveCachedAimSettings();
        sendAimBridge('aim_fov', { fov: aimState.fov, data: aimState.fov });
      });
    }

    const slStep = document.getElementById('slider-step');
    if (slStep) {
      slStep.addEventListener('input', (e) => {
        aimState.stepSpeed = parseInt(e.target.value, 10);
        document.getElementById('val-step').textContent = `${aimState.stepSpeed} ms`;
        saveCachedAimSettings();
        sendAimBridge('aim_step', { step: aimState.stepSpeed, data: aimState.stepSpeed });
      });
    }

    const slFovX = document.getElementById('slider-fov-x');
    if (slFovX) {
      slFovX.addEventListener('input', (e) => {
        aimState.fovOffsetX = parseInt(e.target.value, 10);
        const px = aimState.fovOffsetX > 0 ? '+' : '';
        document.getElementById('val-fov-x').textContent = `${px}${aimState.fovOffsetX} px`;
        updateAimRadarPreview();
        saveCachedAimSettings();
        sendAimBridge('aim_fov_offset_x', { offset: aimState.fovOffsetX, value: aimState.fovOffsetX, data: aimState.fovOffsetX });
      });
    }

    const slFovY = document.getElementById('slider-fov-y');
    if (slFovY) {
      slFovY.addEventListener('input', (e) => {
        aimState.fovOffsetY = parseInt(e.target.value, 10);
        const py = aimState.fovOffsetY > 0 ? '+' : '';
        document.getElementById('val-fov-y').textContent = `${py}${aimState.fovOffsetY} px`;
        updateAimRadarPreview();
        saveCachedAimSettings();
        sendAimBridge('aim_fov_offset_y', { offset: aimState.fovOffsetY, value: aimState.fovOffsetY, data: aimState.fovOffsetY });
      });
    }

    const slPitch = document.getElementById('slider-pitch');
    if (slPitch) {
      slPitch.addEventListener('input', (e) => {
        aimState.pitchRatio = parseFloat(e.target.value);
        document.getElementById('val-pitch').textContent = `${aimState.pitchRatio.toFixed(1)}x`;
        saveCachedAimSettings();
        sendAimBridge('update_aim_settings', {
          sens: aimState.sens,
          smooth: aimState.smooth,
          step: aimState.stepSpeed,
          preset: aimState.preset
        });
      });
    }

    const slMaxSpeed = document.getElementById('slider-max-speed');
    if (slMaxSpeed) {
      slMaxSpeed.addEventListener('input', (e) => {
        aimState.maxSpeed = parseInt(e.target.value, 10);
        document.getElementById('val-max-speed').textContent = aimState.maxSpeed;
        saveCachedAimSettings();
        sendAimBridge('aim_step', { step: aimState.maxSpeed, data: aimState.maxSpeed });
      });
    }

    // Bone Selection
    document.querySelectorAll('.bone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bone = btn.getAttribute('data-bone');
        aimState.targetBone = bone;
        renderAimUI();
        saveCachedAimSettings();
        notify('Target Locking Bone', `Locked to: ${bone.toUpperCase()}`, 'info');
        sendAimBridge('target_bone', { bone: bone, data: bone });
      });
    });

    // D-Pad and FOV Nudging
    function nudgeFov(dx, dy) {
      aimState.fovOffsetX = Math.max(-100, Math.min(100, (aimState.fovOffsetX || 0) + dx));
      aimState.fovOffsetY = Math.max(-100, Math.min(100, (aimState.fovOffsetY || 0) + dy));
      renderAimUI();
      saveCachedAimSettings();
      sendAimBridge('aim_fov_offset_x', { offset: aimState.fovOffsetX, value: aimState.fovOffsetX, data: aimState.fovOffsetX });
      sendAimBridge('aim_fov_offset_y', { offset: aimState.fovOffsetY, value: aimState.fovOffsetY, data: aimState.fovOffsetY });
      const px = aimState.fovOffsetX > 0 ? '+' : '';
      const py = aimState.fovOffsetY > 0 ? '+' : '';
      notify('FOV Repositioned', `Position: (${px}${aimState.fovOffsetX}, ${py}${aimState.fovOffsetY}) px`, 'info');
    }

    const btnUp = document.getElementById('btn-nudge-up');
    if (btnUp) btnUp.addEventListener('click', () => nudgeFov(0, -20));
    const btnDown = document.getElementById('btn-nudge-down');
    if (btnDown) btnDown.addEventListener('click', () => nudgeFov(0, 20));
    const btnLeft = document.getElementById('btn-nudge-left');
    if (btnLeft) btnLeft.addEventListener('click', () => nudgeFov(-20, 0));
    const btnRight = document.getElementById('btn-nudge-right');
    if (btnRight) btnRight.addEventListener('click', () => nudgeFov(20, 0));
    const btnCenter = document.getElementById('btn-nudge-center');
    if (btnCenter) {
      btnCenter.addEventListener('click', () => {
        aimState.fovOffsetX = 0;
        aimState.fovOffsetY = 0;
        renderAimUI();
        saveCachedAimSettings();
        sendAimBridge('aim_fov_offset_x', { offset: 0, value: 0, data: 0 });
        sendAimBridge('aim_fov_offset_y', { offset: 0, value: 0, data: 0 });
        notify('FOV Reset', 'Position centered at (0, 0)', 'info');
      });
    }
    const btnResetFov = document.getElementById('btn-reset-fov');
    if (btnResetFov) {
      btnResetFov.addEventListener('click', () => {
        aimState.fovOffsetX = 0;
        aimState.fovOffsetY = -4;
        renderAimUI();
        saveCachedAimSettings();
        sendAimBridge('aim_fov_offset_x', { offset: 0, value: 0, data: 0 });
        sendAimBridge('aim_fov_offset_y', { offset: -4, value: -4, data: -4 });
        notify('FOV Reset', 'Default center applied', 'info');
      });
    }
    const btnJumpLeft = document.getElementById('btn-jump-left');
    if (btnJumpLeft) btnJumpLeft.addEventListener('click', () => nudgeFov(-50, 0));
    const btnJumpRight = document.getElementById('btn-jump-right');
    if (btnJumpRight) btnJumpRight.addEventListener('click', () => nudgeFov(50, 0));

    // Global hook for C++ updates
    window.applyAimSettings = function(data) {
      if (!data || typeof data !== 'object') return;
      if (typeof data.active === 'boolean') aimState.aimMaster = data.active;
      if (typeof data.fov === 'number') aimState.fov = data.fov;
      if (typeof data.offsetX === 'number') aimState.fovOffsetX = data.offsetX;
      if (typeof data.offsetY === 'number') aimState.fovOffsetY = data.offsetY;
      if (typeof data.sens === 'number') aimState.sens = data.sens;
      if (typeof data.smooth === 'number') aimState.smooth = data.smooth;
      if (typeof data.stepSpeed === 'number') aimState.stepSpeed = data.stepSpeed;
      if (typeof data.targetBone === 'string' && data.targetBone) aimState.targetBone = data.targetBone;
      if (typeof data.preset === 'string' && data.preset) aimState.preset = data.preset;
      if (typeof data.showFovOverlay === 'boolean') aimState.fovOverlay = data.showFovOverlay;
      if (typeof data.showWindow === 'boolean') aimState.aimWindow = data.showWindow;
      if (typeof data.device === 'string' && data.device) aimState.device = data.device;
      if (typeof data.targetFps === 'number') aimState.targetFps = data.targetFps;
      renderAimUI();
    };
  }

  // Initialize Aim Assist on document load
  initAimAssist();
})();
