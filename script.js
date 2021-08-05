let output = document.getElementById("output");
output.className = 'hidden';

let backupCodeBlocks = document.getElementById("backupCodeBlocks");
let hostnameChangeCodeBlocks = document.getElementById("hostnameChangeCodeBlocks");
let protocolChangeCodeBlocks = document.getElementById("protocolChangeCodeBlocks");
let redirectCodeBlocks = document.getElementById("redirectCodeBlocks");

let protocolSlashEscapeVariations = [
  '%3A%2F%2F',
  ":\\\\\/\\\\\/",
  ':\\\/\\\/',
  '://'
];
let protocol = [ 'http', 'https' ];
let commandString = "wp search-replace '";
let commandOptions = "' --report-changed-only"

let clearCodeBlocks = function() {
  backupCodeBlocks.innerHTML = '';
  hostnameChangeCodeBlocks.innerHTML = '';
  protocolChangeCodeBlocks.innerHTML = '';
  redirectCodeBlocks.innerHTML = '';
}

function formatDate(d) {
  let year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    hours = '' + d.getHours(),
    minutes = '' + d.getMinutes();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hours.length < 2) hours = '0' + hours;
  if (minutes.length < 2) minutes = '0' + minutes;
  return year + month + day + '-' + hours + minutes;
}

let generateBackupCommand = function(hostname) {
  let now = new Date(Date.now());
  let dateStamp = formatDate(now);
  let el = document.createElement('div');
  el.innerHTML = "wp db export --add-drop-table ~/" + hostname + "-" + dateStamp + ".sql";
  el.setAttribute('onclick', 'copyText(this)');
  backupCodeBlocks.appendChild(el);
}
const generateHostnameChangeCommands = function(searchQuery, replaceQuery) {
  let el = document.createElement('div');
  el.innerHTML = commandString + searchQuery + "' '" + replaceQuery + commandOptions;
  el.setAttribute('onclick', 'copyText(this)');
  hostnameChangeCodeBlocks.appendChild(el);
}
let generateProtocolChangeCommands = function(hostname, invertProtocol, prefix) {
  if (!prefix) { prefix = ''; };
  if (invertProtocol === true) { protocol = ['https','http']; };
  for (let i = 0; i < protocolSlashEscapeVariations.length; i++) {
    let el = document.createElement('div');
    el.innerHTML = commandString + protocol[0] + protocolSlashEscapeVariations[i] + prefix + hostname + "' '" + protocol[1] + protocolSlashEscapeVariations[i] + prefix + hostname + commandOptions;
    el.setAttribute('onclick', 'copyText(this)');
    protocolChangeCodeBlocks.appendChild(el);
  }
  protocol = [ 'http', 'https' ];
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
  let invertProtocol = document.getElementById("invertProtocol").checked;
  generateBackupCommand(searchQuery);
  generateBackupCommand(replaceQuery);
  generateHostnameChangeCommands(searchQuery, replaceQuery);
  if(document.getElementById("includeWww").checked) {
    generateProtocolChangeCommands(replaceQuery, invertProtocol, "www.");
  }
  generateProtocolChangeCommands(replaceQuery, invertProtocol);
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
