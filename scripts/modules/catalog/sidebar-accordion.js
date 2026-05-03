export function initTutorSidebar() {
  const sidebar = document.querySelector(".tutor-sidebar");
  if (!sidebar) {
    return;
  }

  const subjects = Array.from(sidebar.querySelectorAll(".tutor-sidebar__subject"));
  if (!subjects.length) {
    return;
  }

  const setSubjectOpen = (subject, isOpen) => {
    const toggle = subject.querySelector(".tutor-sidebar__subject-toggle");
    const panel = subject.querySelector("ul");

    if (toggle) {
      toggle.setAttribute("aria-expanded", String(isOpen));
    }
    if (panel) {
      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);

      if (isOpen) {
        panel.hidden = false;
        window.requestAnimationFrame(() => {
          panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
          subject.classList.add("is-open");
        });
        return;
      }

      panel.style.setProperty("--sidebar-subject-panel-height", `${panel.scrollHeight}px`);
      window.requestAnimationFrame(() => {
        subject.classList.remove("is-open");
        panel.style.setProperty("--sidebar-subject-panel-height", "0px");
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
        if (!subject.classList.contains("is-open")) {
          panel.hidden = true;
          panel.removeEventListener("transitionend", hidePanel);
        }
      }, 320);
      return;
    }

    subject.classList.toggle("is-open", isOpen);
  };

  subjects.forEach((subject) => {
    setSubjectOpen(subject, subject.classList.contains("is-open"));
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

    const topic = event.target.closest(".tutor-sidebar li a");
    if (!topic) {
      return;
    }

    sidebar.querySelectorAll(".tutor-sidebar li a.is-active").forEach((link) => {
      link.classList.remove("is-active");
    });
    topic.classList.add("is-active");

    const activeSubject = topic.closest(".tutor-sidebar__subject");
    subjects.forEach((candidate) => {
      candidate.classList.toggle("is-active", candidate === activeSubject);
    });
  });
}
