/*
  Kyndil — site-data.js
  ---------------------
  Fills in content that can be edited through the /admin CMS without
  touching any HTML: sponsors (index.html), team coaches (lid.html),
  and the two org-wide coach roles (venjingartidir.html).

  Each function is a no-op if the page doesn't have the matching
  container, so this one file can safely be included on every page.
*/
(function () {
  "use strict";

  function fetchJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path + ": " + res.status);
      return res.json();
    });
  }

  // ---------- Sponsors (index.html) ----------
  function renderSponsors() {
    var featuredEl = document.getElementById("sponsorFeatured");
    var gridEl = document.getElementById("sponsorGrid");
    if (!featuredEl && !gridEl) return;

    fetchJson("data/sponsors.json")
      .then(function (data) {
        var sponsors = (data && data.sponsors) || [];
        sponsors.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

        var featuredHtml = "";
        var gridHtml = "";

        sponsors.forEach(function (s) {
          var img =
            '<img width="' + s.width + '" height="' + s.height + '" src="' +
            s.logo + '" alt="' + escapeHtml(s.name) + '">';

          if (s.featured) {
            featuredHtml += img;
          } else {
            gridHtml += '<div class="sponsor-slot">' + img + "</div>\n      ";
          }
        });

        if (featuredEl) featuredEl.innerHTML = featuredHtml;
        if (gridEl) gridEl.innerHTML = gridHtml;
      })
      .catch(function (err) {
        console.error("[site-data] sponsors:", err);
      });
  }

  // ---------- Team coaches (lid.html) ----------
  function renderTeamCoaches() {
    var nodes = document.querySelectorAll("[data-venjari-id]");
    if (!nodes.length) return;

    fetchJson("data/teams.json")
      .then(function (data) {
        var teams = (data && data.teams) || [];
        var byId = {};
        teams.forEach(function (t) { byId[t.id] = t; });

        nodes.forEach(function (el) {
          var team = byId[el.getAttribute("data-venjari-id")];
          var name = team && team.coachName ? team.coachName.trim() : "";
          if (name) {
            el.textContent = name;
            el.className = "v trainer";
          } else {
            el.textContent = "Kemur skjótt";
            el.className = "v is-soon";
          }
        });
      })
      .catch(function (err) {
        console.error("[site-data] teams:", err);
      });
  }

  // ---------- Org-wide coach roles (venjingartidir.html) ----------
  function renderOrgRoles() {
    var nameNodes = document.querySelectorAll("[data-role-name]");
    var phoneNodes = document.querySelectorAll("[data-role-phone]");
    if (!nameNodes.length && !phoneNodes.length) return;

    fetchJson("data/org_roles.json")
      .then(function (data) {
        var roles = (data && data.roles) || [];
        var byId = {};
        roles.forEach(function (r) { byId[r.id] = r; });

        nameNodes.forEach(function (el) {
          var role = byId[el.getAttribute("data-role-name")];
          if (role) el.textContent = role.name;
        });

        phoneNodes.forEach(function (el) {
          var role = byId[el.getAttribute("data-role-phone")];
          if (role) {
            el.innerHTML =
              '<a href="' + role.phoneHref + '">' + escapeHtml(role.phoneDisplay) + "</a>";
          }
        });
      })
      .catch(function (err) {
        console.error("[site-data] org_roles:", err);
      });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSponsors();
    renderTeamCoaches();
    renderOrgRoles();
  });
})();
