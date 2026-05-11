export function initTutorSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!sidebar) {
    return;
  }

  const subjects = Array.from(sidebar.querySelectorAll(".tutor-sidebar__subject"));
  if (!subjects.length) {
    return;
  }

  const getDirectChild = (node, selector) => (
    Array.from(node.children).find((child) => child.matches(selector)) || null
  );

  const syncOpenPanelHeights = () => {
    sidebar.querySelectorAll(".tutor-sidebar__subfolder.is-open > .tutor-sidebar__folder-list").forEach((panel) => {
      panel.style.setProperty("--sidebar-folder-panel-height", `${panel.scrollHeight}px`);
    });
    sidebar.querySelectorAll(".tutor-sidebar__subject.is-open > .tutor-sidebar__subject-list").forEach((panel) => {
      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
    });
  };

  const scheduleHeightSync = () => {
    window.requestAnimationFrame(() => {
      syncOpenPanelHeights();
    });
  };

  const setPanelOpen = ({
    container,
    toggle,
    panel,
    isOpen,
    openClass = "is-open",
    heightVar,
    timeout = 320,
  }) => {
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    if (panel) {
      panel.style.setProperty(heightVar, `${panel.scrollHeight}px`);

      if (isOpen) {
        panel.hidden = false;
        window.requestAnimationFrame(() => {
          panel.style.setProperty(heightVar, `${panel.scrollHeight}px`);
          container.classList.add(openClass);
          scheduleHeightSync();
        });
        return;
      }

      panel.style.setProperty(heightVar, `${panel.scrollHeight}px`);
      window.requestAnimationFrame(() => {
        container.classList.remove(openClass);
        panel.style.setProperty(heightVar, "0px");
        scheduleHeightSync();
      });

      const hidePanel = (event) => {
        if (event.target !== panel || event.propertyName !== "max-height") {
          return;
        }
        panel.hidden = true;
        panel.removeEventListener("transitionend", hidePanel);
      };

      panel.addEventListener("transitionend", hidePanel);
      window.setTimeout(() => {
        if (!container.classList.contains(openClass)) {
          panel.hidden = true;
          panel.removeEventListener("transitionend", hidePanel);
          scheduleHeightSync();
        }
      }, timeout);
      return;
    }

    container.classList.toggle(openClass, isOpen);
  };

  const setSubjectOpen = (subject, isOpen) => {
    setPanelOpen({
      container: subject,
      toggle: getDirectChild(subject, ".tutor-sidebar__subject-toggle"),
      panel: getDirectChild(subject, ".tutor-sidebar__subject-list"),
      isOpen,
      heightVar: "--sidebar-subject-panel-height",
    });
  };

  const setFolderOpen = (folder, isOpen) => {
    setPanelOpen({
      container: folder,
      toggle: getDirectChild(folder, ".tutor-sidebar__folder-toggle"),
      panel: getDirectChild(folder, ".tutor-sidebar__folder-list"),
      isOpen,
      heightVar: "--sidebar-folder-panel-height",
      timeout: 260,
    });
  };

  subjects.forEach((subject) => {
    setSubjectOpen(subject, subject.classList.contains("is-open"));
  });
  sidebar.querySelectorAll(".tutor-sidebar__subfolder").forEach((folder) => {
    setFolderOpen(folder, folder.classList.contains("is-open"));
  });

  sidebar.addEventListener("click", (event) => {
    const toggle = event.target.closest(".tutor-sidebar__subject-toggle");
    if (toggle) {
      const subject = toggle.closest(".tutor-sidebar__subject");
      if (!subject) {
        return;
      }

      const shouldOpen = !subject.classList.contains("is-open");
      subjects.forEach((candidate) => {
        setSubjectOpen(candidate, candidate === subject ? shouldOpen : false);
        candidate.classList.toggle("is-active", candidate === subject);
      });
      return;
    }

    const folderToggle = event.target.closest(".tutor-sidebar__folder-toggle");
    if (folderToggle) {
      const folder = folderToggle.closest(".tutor-sidebar__subfolder");
      if (!folder) {
        return;
      }

      const shouldOpen = !folder.classList.contains("is-open");
      setFolderOpen(folder, shouldOpen);
      folder.classList.toggle("is-active", shouldOpen);

      const parentSubject = folder.closest(".tutor-sidebar__subject");
      if (parentSubject) {
        window.setTimeout(() => syncOpenPanelHeights(), 280);
      }
      return;
    }

    const topic = event.target.closest(".tutor-sidebar__note-link");
    if (!topic) {
      return;
    }

    sidebar.querySelectorAll(".tutor-sidebar__note-link.is-active").forEach((link) => {
      link.classList.remove("is-active");
    });
    topic.classList.add("is-active");

    const activeSubject = topic.closest(".tutor-sidebar__subject");
    const activeFolder = topic.closest(".tutor-sidebar__subfolder");
    subjects.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === activeSubject);
    });
    sidebar.querySelectorAll(".tutor-sidebar__subfolder.is-active").forEach((folder) => {
      folder.classList.toggle("is-active", folder === activeFolder);
    });
  });
}
