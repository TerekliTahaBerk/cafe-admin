import type { OpeningHoursDay } from "@/lib/types";

/**
 * Inline script that fills in the time-dependent bits of the cached /menu
 * page (greeting + "today" line) before first paint, in Istanbul time.
 * Mirrors greeting() / todayStatus() in lib/format.ts; React later hydrates
 * the same values, so nothing visibly changes (no LCP/CLS penalty).
 */
export function menuTimeScript(hours: OpeningHoursDay[]) {
  const data = JSON.stringify(hours).replace(/</g, "\\u003c");
  return `(function(){try{
var H=${data};
var parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Istanbul",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
function get(t){for(var i=0;i<parts.length;i++){if(parts[i].type===t)return parts[i].value}return""}
var day=Math.max(0,["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(get("weekday")));
var hour=Number(get("hour"))%24,now=hour*60+Number(get("minute"));
var greet=hour>=5&&hour<12?"Günaydın":hour>=12&&hour<18?"İyi günler":"İyi akşamlar";
function mins(s){var a=s.split(":");return Number(a[0])*60+Number(a[1]||0)}
var t=null;for(var i=0;i<H.length;i++){if(H[i].day===day)t=H[i]}
var open=false,label="Bugün kapalıyız";
if(t&&t.open){var r=t.from+" – "+t.to;
if(now<mins(t.from))label="Bugün "+r;else if(now>=mins(t.to))label="Bugünlük kapandık · "+r;else{open=true;label="Bugün açığız · "+r}}
document.querySelectorAll("[data-greeting]").forEach(function(e){e.textContent=greet});
document.querySelectorAll("[data-today-label]").forEach(function(e){e.textContent=label});
document.querySelectorAll("[data-today]").forEach(function(e){e.hidden=false;e.setAttribute("data-open",open?"1":"0")});
}catch(e){}})();`;
}
