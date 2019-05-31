let output = document.getElementById("output");
output.className = 'hidden';

let backupCodeBlocks = document.getElementById("backupCodeBlocks");
let dbChangeCodeBlocks = document.getElementById("dbChangeCodeBlocks");
let redirectCodeBlocks = document.getElementById("redirectCodeBlocks");

let protocolVariations = [
  '%3A%2F%2F',
  ":\\\\\/\\\\\/",
  ':\\\/\\\/',
  '://'
];
let commandString = "wp search-replace '";
let commandOptions = "' --skip-columns=guid --report-changed-only"

let clearCodeBlocks = function() {
  backupCodeBlocks.innerHTML = '';
  dbChangeCodeBlocks.innerHTML = '';
  redirectCodeBlocks.innerHTML = '';
}

function formatDate(date) {
  let d = new Date(date),
    year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return year + month + day;
}

let generateBackupCommand = function(hostname) {
  let now = new Date(Date.now());
  let dateStamp = formatDate(now);
  let el = document.createElement('div');
  el.innerHTML = "wp db export --add-drop-table ~/" + hostname + "-" + dateStamp + ".sql";
  el.setAttribute('onclick', 'copyText(this)');
  backupCodeBlocks.appendChild(el);
}
let generateDbChangeCommands = function(searchQuery, replaceQuery, prefix) {
  if (!prefix) { prefix = '' };
  for (let i = 0; i < protocolVariations.length; i++) {
    let el = document.createElement('div');
    el.innerHTML = commandString + "http" + protocolVariations[i] + prefix + searchQuery + "' 'https" + protocolVariations[i] + prefix + replaceQuery + commandOptions;
    el.setAttribute('onclick', 'copyText(this)');
    dbChangeCodeBlocks.appendChild(el);
  }
  let el = document.createElement('div');
  el.innerHTML = commandString + prefix + searchQuery + "' '" + prefix + replaceQuery + commandOptions;
  el.setAttribute('onclick', 'copyText(this)');
  dbChangeCodeBlocks.appendChild(el);
}
let generateRedirectDirectives = function(hostname) {
  let el = document.createElement('div');
  el.innerHTML =
    "RewriteEngine On\n" +
    "RewriteCond %{SERVER_PORT} 80\n" +
    "RewriteRule ^(.*)$ https://" + hostname + "/$1 [R=301,L]";
  el.setAttribute('onclick', 'copyText(this)');
  redirectCodeBlocks.appendChild(el);
}

let generateOutput = function(searchQuery, replaceQuery) {
  output.className = '';
  clearCodeBlocks();
  generateBackupCommand(replaceQuery);
  if(document.getElementById("includeWww").checked) {
    generateDbChangeCommands(searchQuery, replaceQuery, "www.");
  }
  generateDbChangeCommands(searchQuery, replaceQuery);
  generateRedirectDirectives(replaceQuery);
}

const copyText = src => {
  src.className = "";
  const el = document.createElement('textarea');
  el.value = src.innerHTML;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  console.log('"' + src.innerHTML.substring(0,30) + '..." from element you clicked was copied to clipboard');
  src.className = "copied";
};

document.getElementById("submit").addEventListener("click", function(event) {
  event.preventDefault();
  let searchQuery = document.getElementById("searchQuery").value;
  let replaceQuery = document.getElementById("replaceQuery").value;
  generateOutput(searchQuery, replaceQuery);
});

// generateOutput("woo", "hoo");
