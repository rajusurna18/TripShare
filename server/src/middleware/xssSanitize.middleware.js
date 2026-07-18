const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // strip script blocks
    .replace(/on\w+="[^"]*"/gi, "") // strip event handlers
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^\s]*/gi, ""); // strip javascript protocol hrefs
};

const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeString(obj[key]);
      } else {
        sanitize(obj[key]);
      }
    }
  }
};

export const xssSanitizer = (req, res, next) => {
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};
