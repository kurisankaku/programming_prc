/**
 * Copy and Paste this script to browser console.
 * count is word count.
 * kigou is boolean. If kigou is true, generated word includes kigou.
 */
function rand(count, kigou) {
  var str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  if (kigou) {
  	str += '@%+/!#$^?:.(){}[]~-_';
  }
  var len = str.length;
  var result = "";
  for (var i = 0; i < count; i++) {
  	result += str[Math.floor(Math.random()*len)];
  }
  return result;
}
