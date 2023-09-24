var WEBSITE_SCRIPT_MAP = {
  BILIBILI: bilibili,
};
var LINK_REGEXP = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
var SUSPICIOUS_REGEXP = /(https:\/\/(www\.)?(youtube\.com|youtu\.be|twitter\.com)([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g;
var LINXTRACTOR_LINK_CLASSNAME = "linxtractor-forward-link";

var originalHTML = new Map();
var handledHTML = new Map();
var timeout = 1000;
var timer = -1;

function main() {
  var script = selectScriptToRun();
  if (script) {
    script();
  }

  clearTimeout(timer);
  timer = setTimeout(main, timeout);
}

function selectScriptToRun() {
  if (/bilibili\.com/.test(location.origin)) {
    return WEBSITE_SCRIPT_MAP.BILIBILI;
  }
}

function bilibili() {
  var desc = document.querySelector(".video-desc-container .desc-info-text");
  if (!desc) {
    return;
  }

  if (!originalHTML.has(desc)) {
    originalHTML.set(desc, desc.innerHTML);
  }

  // unhandled or HTML structure has changed.
  if (!handledHTML.has(desc) || desc.innerHTML !== handledHTML.get(desc)) {
    var html = transformTextToLink(desc.innerHTML);
    var links = getLinks(desc.innerHTML);

    desc.innerHTML = html;
    handledHTML.set(desc, desc.innerHTML);

    var details = document.querySelector(".video-info-detail");

    if (!details) {
      return;
    }
    var detailChildren = details.children;
    if (isJust1Link(links)) {
      for (var i = 0; i < detailChildren.length; i++) {
        if (detailChildren[i].classList.contains(LINXTRACTOR_LINK_CLASSNAME)) {
          detailChildren[i].remove();
        }
      }
      var forwardLink = createForwardLink(
        links[0],
        `${LINXTRACTOR_LINK_CLASSNAME} item`
      );
      forwardLink.style =
        "position: absolute; right: 0; font-weight: bold; font-size: 14px; color: #00AEEC; cursor: pointer;";
      details.appendChild(forwardLink);
    } else {
      for (var i = 0; i < detailChildren.length; i++) {
        if (detailChildren[i].classList.contains(LINXTRACTOR_LINK_CLASSNAME)) {
          detailChildren[i].remove();
        }
      }
    }
  }
}

function transformTextToLink(text) {
  return normalizeText(text).replace(LINK_REGEXP, (_, link) => {
    return `<a target="_blank" href="${link}" style="color: #00AEEC">${link}</a>`;
  });
}

function createForwardLink(link, className) {
  var el = document.createElement("a");
  el.href = link;
  el.title = link;
  el.target = "_blank";
  el.className = className;
  el.innerText = "疑似转载";
  return el;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function getLinks(text) {
  return normalizeText(text).match(SUSPICIOUS_REGEXP) || [];
}

/**
 * @param {string[]} links
 * @returns {boolean}
 */
function isJust1Link(links) {
  if (!links || links.length === 0) {
    return false;
  }
  return [...new Set(links)].length === 1;
}

function normalizeText(text) {
  return decodeURIComponent(text).replace(/&amp;/g, "&");
}

main();
